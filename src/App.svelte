<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { 
    topics, projects, filters, selectedProjectId, focusedTopic, 
    depthStateFilter, searchTerm, collapsedEpochs, zenMode, 
    updatingTopics, raveMode, isTauri, trackerPath
  } from './stores';
  import { loadData, updateTopic, selectTrackerFile, getTrackerPath, startWatching, stopWatching, type TopicUpdatePayload } from './services/tracker';
  import { deriveDepthDelta, depthDeltaMessage, type DepthDeltaState, type DepthDelta } from './utils/depth';
  import { triggerConfetti } from './utils/confetti';
  import { kineticScroll } from './actions/kineticScroll';

  // Components
  import ActionMenu from './components/ActionMenu.svelte';
  import ClickSparkles from './components/ClickSparkles.svelte';
  import CuteSelect from './components/CuteSelect.svelte';
  import EmptyState from './components/EmptyState.svelte';
  import Mascot from './components/Mascot.svelte';
  import ProgressBar from './components/ProgressBar.svelte';
  import TopicGraph from './components/TopicGraph.svelte';

  // State
  let bubblesRef = $state<HTMLDivElement>();
  let inputSequence: string[] = [];
  const apiBase = import.meta.env.VITE_API_BASE ?? 'http://localhost:4179';
  let prevMasteredCount = 0;

  // Constants
  const statusOptions = ['All', 'Not Started', 'In Progress', 'Stable', 'Mastered'];
  const statusFilterOptions = statusOptions.filter((option) => option !== 'All');
  const depthOptions = ['All', 'L1 – Aware', 'L2 – Implement', 'L3 – Apply', 'L4 – Own / Teach'];
  const depthChoices = depthOptions.filter((option) => option !== 'All');
  const trackOptions = ['All', 'A', 'B', 'C', 'D', 'E'];
  const depthStateLabels: Record<DepthDeltaState, string> = {
    under: 'Needs Magic',
    'on-track': 'On Target',
    ahead: 'Soaring',
    unset: 'Uncharted',
  };

  // Helpers
  function canonicalStatus(value?: string | null) {
    if (!value) return 'Not Started';
    const normalized = value.trim().toLowerCase();
    const match = statusFilterOptions.find(opt => opt.toLowerCase() === normalized);
    return match ?? 'Not Started';
  }

  function extractDepthLevel(label?: string | null) {
    if (!label) return null;
    const match = label.match(/l\s*([1-4])/i);
    return match ? Number(match[1]) : null;
  }

  function topicSortKey(id: string) {
    const match = id.match(/^E(\d+)[-–]([A-Z])[-–](\d+)$/i);
    if (!match) return { epoch: Number.MAX_SAFE_INTEGER, track: Number.MAX_SAFE_INTEGER, index: Number.MAX_SAFE_INTEGER, raw: id };
    const [, epochStr, trackLetter, indexStr] = match;
    return { 
      epoch: Number(epochStr) || Number.MAX_SAFE_INTEGER, 
      track: trackLetter.toUpperCase().charCodeAt(0) - 64 || Number.MAX_SAFE_INTEGER, 
      index: Number(indexStr) || Number.MAX_SAFE_INTEGER, 
      raw: id 
    };
  }

  function compareTopicIds(aId: string, bId: string) {
    const a = topicSortKey(aId);
    const b = topicSortKey(bId);
    if (a.epoch !== b.epoch) return a.epoch - b.epoch;
    if (a.track !== b.track) return a.track - b.track;
    if (a.index !== b.index) return a.index - b.index;
    return a.raw.localeCompare(b.raw);
  }

  // Derived State
  let depthMetaById = $derived.by(() => {
    const map = new Map<string, any>();
    for (const topic of $topics) map.set(topic.id, deriveDepthDelta(topic));
    return map;
  });

  let statusCounts = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const topic of $topics) {
      const s = canonicalStatus(topic.status);
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  });

  // Filtering Logic
  let plannerFilteredTopics = $derived.by(() => {
    const rawTerm = $searchTerm.trim().toLowerCase();
    const depthLevel = $filters.depth === 'All' ? null : extractDepthLevel($filters.depth);
    const statusVal = $filters.status === 'All' ? null : canonicalStatus($filters.status);

    return $topics.filter(topic => {
       const matchesTrack = $filters.track === 'All' || (topic.track?.toUpperCase() ?? '') === $filters.track;
       const depthMeta = depthMetaById.get(topic.id);
       const matchesDepth = depthLevel === null || (depthMeta?.targetLevel ?? null) === depthLevel;
       const matchesStatus = statusVal === null || canonicalStatus(topic.status) === statusVal;
       const matchesSearch = rawTerm.length === 0 || 
         (topic.id?.toLowerCase() ?? '').includes(rawTerm) ||
         (topic.topicName?.toLowerCase() ?? '').includes(rawTerm) ||
         (topic.description?.toLowerCase() ?? '').includes(rawTerm);
       return matchesTrack && matchesStatus && matchesDepth && matchesSearch;
    });
  });

  let constellationFilteredTopics = $derived.by(() => {
    if ($depthStateFilter === 'All') return plannerFilteredTopics;
    return plannerFilteredTopics.filter(topic => {
      const meta = depthMetaById.get(topic.id);
      return meta?.state === $depthStateFilter;
    });
  });

  let highlightedIds = $derived.by(() => {
    if ($selectedProjectId === 'All') return new Set<string>();
    const proj = $projects.find(p => p.id === $selectedProjectId);
    if (!proj || !proj.topicIds) return new Set<string>();
    return new Set(proj.topicIds.split(',').map(id => id.trim()).filter(Boolean));
  });

  let groupedByEpoch = $derived.by(() => {
    const groups = new Map<number, any[]>();
    for (const topic of constellationFilteredTopics) {
      if (topic.epoch === null) continue;
      if (!groups.has(topic.epoch)) groups.set(topic.epoch, []);
      groups.get(topic.epoch)!.push(topic);
    }
    return [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([epoch, epochTopics]) => ({
        epoch,
        theme: epochTopics[0]?.epochTheme ?? '',
        topics: epochTopics.sort((a: any, b: any) => compareTopicIds(a.id, b.id))
      }));
  });

  let focusedTopicObj = $derived($topics.find(t => t.id === $focusedTopic) || null);

  // Actions
  async function fetchData() {
    try {
      const { topics: t, projects: p } = await loadData();
      $topics = t;
      $projects = p.map(project => ({ ...project, id: project.id || project.title }));
    } catch (err) {
      console.error('Failed to load roadmap data', err);
    }
  }

  async function handleSelectFile() {
    try {
      const path = await selectTrackerFile();
      if (path) {
        $trackerPath = path;
        fetchData();
        startWatching(() => {
          console.log('External change detected, reloading...');
          fetchData();
        });
      }
    } catch (err) {
      console.error('Failed to select file', err);
    }
  }

  async function persistTopicChanges(topicId: string, payload: TopicUpdatePayload) {
    $updatingTopics.add(topicId);
    $updatingTopics = $updatingTopics; // Trigger reactivity
    try {
      await updateTopic(topicId, payload);
      $topics = $topics.map(t => t.id === topicId ? { ...t, ...payload } : t);
    } catch (err) {
      console.error(err);
      alert(`Could not update ${topicId}.\n${(err as Error).message}`);
    } finally {
      $updatingTopics.delete(topicId);
      $updatingTopics = $updatingTopics;
    }
  }

  // Effects
  onMount(() => {
    // Tauri Check
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      $isTauri = true;
      getTrackerPath().then(path => {
        $trackerPath = path;
        if (path) {
          fetchData();
          startWatching(() => {
             console.log('External change detected, reloading...');
             fetchData();
          });
        }
      });
    } else {
      fetchData();
    }

    // URL Params
    const url = new URL(window.location.href);
    const tid = url.searchParams.get('topic');
    if (tid) $focusedTopic = tid;

    // Events
    const handleKeyDown = (e: KeyboardEvent) => {
      inputSequence = [...inputSequence, e.key].slice(-10);
      const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      if (JSON.stringify(inputSequence) === JSON.stringify(konami)) {
        $raveMode = !$raveMode;
        inputSequence = [];
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleMouseMove = (e: MouseEvent) => {
      if (!bubblesRef) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      bubblesRef.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      stopWatching();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });

  // SSE (Web Only)
  onMount(() => {
    if ($isTauri || typeof window === 'undefined') return;
    let eventSource: EventSource | null = null;
    let reconnectTimer: number | null = null;

    const connect = () => {
      eventSource?.close();
      try {
        eventSource = new EventSource(`${apiBase}/api/events`);
      } catch (err) {
        reconnectTimer = setTimeout(connect, 3000);
        return;
      }
      eventSource.onmessage = () => fetchData();
      eventSource.onerror = () => {
        eventSource?.close();
        reconnectTimer = setTimeout(connect, 3000);
      };
    };
    connect();
    return () => {
      eventSource?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  });

  // URL Sync
  $effect(() => {
    const url = new URL(window.location.href);
    if ($focusedTopic) {
      url.searchParams.set('topic', $focusedTopic);
    } else {
      url.searchParams.delete('topic');
    }
    window.history.replaceState(null, '', url);
  });

  // Zen Scroll Top
  $effect(() => {
    if ($zenMode) window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Confetti on Mastered Increase
  $effect(() => {
    const mastered = statusCounts['Mastered'] || 0;
    if (mastered > prevMasteredCount && prevMasteredCount > 0) {
      triggerConfetti();
    }
    prevMasteredCount = mastered;
  });

  function badgeClass(status: string) {
    if (status === 'Mastered') return 'status mastered';
    if (status === 'Stable') return 'status stable';
    if (status === 'In Progress') return 'status progress';
    return 'status default';
  }

  function renderDepthDelta(topic: any) {
    const delta = depthMetaById.get(topic.id) || deriveDepthDelta(topic);
    return {
       delta,
       message: depthDeltaMessage(delta)
    };
  }
</script>

{#if $isTauri && !$trackerPath}
  <div class="app">
    <header class="app-header" style="flex-direction: column; gap: 2rem; justify-content: center; height: 100%;">
       <h1>Welcome to LegendTrack</h1>
       <p>Please select your Tracker Excel file to begin.</p>
       <button onclick={handleSelectFile} class="epoch-toggle" style="font-size: 1.5rem; padding: 1rem 2rem;">
         📂 Select Workbook
       </button>
    </header>
  </div>
{:else}
  <div class="app" class:zen-active={$zenMode} class:rave-active={$raveMode} use:kineticScroll>
    <ClickSparkles />
    <Mascot 
      mood={$focusedTopic ? 'happy' : 'idle'} 
      triggerKey={$focusedTopic} 
      zenMode={$zenMode} 
      focusedTopic={focusedTopicObj}
    />
    
    <ActionMenu 
      zenMode={$zenMode} 
      toggleZenMode={() => $zenMode = !$zenMode} 
      isTauri={$isTauri} 
      onSelectFile={handleSelectFile} 
    />

    <div class="zen-backdrop" aria-hidden="true"></div>
    <div bind:this={bubblesRef} class="background-bubbles" aria-hidden="true"></div>
    <div class="sparkle-cluster sparkle-cluster--one" aria-hidden="true">
      <span>✦</span><span>❀</span><span>✧</span>
    </div>
    <div class="sparkle-cluster sparkle-cluster--two" aria-hidden="true">
      <span>♡</span><span>✺</span><span>✶</span>
    </div>

    <header class="app-header">
      <div class="hero-text">
        <p class="eyebrow">Legend-Track C++</p>
        <h1>Cute Systems Atlas <span>🩵🐰</span></h1>
        <p>A dreamy dashboard for exploring every Chapter, Pathway, and Side-Quest of the roadmap. Filter across vibes, spotlight magical quests, and plan your next spiral.</p>
        <ProgressBar counts={statusCounts} total={$topics.length} />
        
        <div class="status-badges">
          {#each statusOptions.slice(1) as status}
            <div class="status-pill">
              <span class="label">{status}</span>
              <span class="count">{statusCounts[status] || 0}</span>
            </div>
          {/each}
        </div>
      </div>
      <div class="hero-art">
        <div class="bunny-card"><span role="img" aria-label="bunny">🐇</span></div>
        <div class="kitty-card"><span role="img" aria-label="kitty">🐱</span></div>
        <div class="sparkle">✿</div>
        <div class="sparkle second">✧</div>
      </div>
    </header>

    <div class="controls-panel">
      <div class="filters">
        <label>
          Pathway
          <CuteSelect value={$filters.track} options={trackOptions} onChange={(v) => $filters.track = v} />
        </label>
        <label>
          Aura
          <CuteSelect value={$filters.status} options={statusOptions} onChange={(v) => $filters.status = v} />
        </label>
        <label>
          Spirit Level
          <CuteSelect value={$filters.depth} options={depthOptions} onChange={(v) => $filters.depth = v} />
        </label>
        <label>
          Crystal Scry
          <input type="search" bind:value={$searchTerm} placeholder="Find ID or topic..." />
        </label>
        <label>
          Focus Spell
          <CuteSelect 
            value={$selectedProjectId} 
            onChange={(v) => $selectedProjectId = v}
            options={[
              { label: 'All Fragments', value: 'All' },
              ...$projects.map(p => ({ label: p.title, value: p.id }))
            ]}
          />
        </label>
      </div>
      <section class="summary">
        <div>
          <p class="summary-label">Fragments Found</p>
          <p class="summary-value">{$topics.length}</p>
        </div>
        <div>
          <p class="summary-label">Visible</p>
          <p class="summary-value">{constellationFilteredTopics.length}</p>
        </div>
        <div>
          <p class="summary-label">Quests Logged</p>
          <p class="summary-value">{$projects.length}</p>
        </div>
      </section>
    </div>

    <div class="content-layout">
      <main>
        {#if plannerFilteredTopics.length === 0}
          <EmptyState />
        {:else}
          <section class="graph-section">
            <div class="graph-header">
              <div>
                <h2>Constellation Map</h2>
                <p>Nodes placed by Pathway (X) and Chapter (Y). Click for details.</p>
              </div>
              {#if $focusedTopic}<span>Focused: {$focusedTopic}</span>{/if}
            </div>
            <div class="depth-legend">
              {#each Object.keys(depthStateLabels) as state}
                 <button
                   type="button"
                   class="legend-chip"
                   class:need={state === 'under'}
                   class:on-track={state === 'on-track'}
                   class:ahead={state === 'ahead'}
                   class:unset={state === 'unset'}
                   class:active={$depthStateFilter === state}
                   onclick={() => $depthStateFilter = ($depthStateFilter === state ? 'All' : state)}
                 >
                   {depthStateLabels[state as DepthDeltaState]}
                 </button>
              {/each}
              <button
                type="button"
                class="legend-chip reset"
                class:active={$depthStateFilter === 'All'}
                onclick={() => $depthStateFilter = 'All'}
              >
                Clear
              </button>
            </div>
            <TopicGraph
              topics={constellationFilteredTopics}
              highlightedIds={highlightedIds}
              focusedTopicId={$focusedTopic}
              onSelectTopic={(id) => $focusedTopic = id}
              searchTerm={$searchTerm}
            />
          </section>

          {#if constellationFilteredTopics.length === 0}
             <EmptyState />
          {:else}
             {#each groupedByEpoch as epoch (epoch.epoch)}
               <section class="epoch">
                 <div class="epoch-heading">
                   <div>
                     <h2>Chapter {epoch.epoch}: {epoch.theme}</h2>
                     <p class="epoch-subtitle">Spiral deeper by pairing this chapter with neighboring pathways.</p>
                   </div>
                   <div class="epoch-actions">
                     <span>{epoch.topics.length} stars</span>
                     <button
                       type="button"
                       class="epoch-toggle"
                       onclick={() => {
                         if ($collapsedEpochs.has(epoch.epoch)) $collapsedEpochs.delete(epoch.epoch);
                         else $collapsedEpochs.add(epoch.epoch);
                         $collapsedEpochs = $collapsedEpochs;
                       }}
                     >
                       {$collapsedEpochs.has(epoch.epoch) ? 'Expand' : 'Collapse'}
                     </button>
                   </div>
                 </div>
                 
                 {#if !$collapsedEpochs.has(epoch.epoch)}
                   <div class="topic-grid">
                     {#each epoch.topics as topic (topic.id)}
                       {@const delta = renderDepthDelta(topic)}
                       <!-- svelte-ignore a11y_click_events_have_key_events -->
                       <article
                         class="topic-card"
                         class:highlighted={highlightedIds.has(topic.id)}
                         class:focused={$focusedTopic === topic.id}
                         role="button"
                         tabindex="0"
                         onclick={() => $focusedTopic = topic.id}
                       >
                         <header>
                           <p class="topic-id">{topic.id}</p>
                           <h3>{topic.topicName}</h3>
                           <p class="topic-track">Pathway {topic.track} · {topic.trackTitle}</p>
                         </header>
                         <p class="topic-description">{topic.description}</p>
                         
                         <dl class="topic-meta">
                           <div>
                             <dt>Spirit Level</dt>
                             <dd>
                               <CuteSelect
                                 value={topic.depthTarget || ''}
                                 disabled={$updatingTopics.has(topic.id)}
                                 options={['', ...depthChoices]}
                                 onChange={(val) => persistTopicChanges(topic.id, { depthTarget: val })}
                               />
                             </dd>
                           </div>
                           <div>
                             <dt>Current Depth</dt>
                             <dd>
                               <CuteSelect
                                 value={topic.currentDepth || ''}
                                 disabled={$updatingTopics.has(topic.id)}
                                 options={['', ...depthChoices]}
                                 onChange={(val) => persistTopicChanges(topic.id, { currentDepth: val })}
                               />
                             </dd>
                           </div>
                           <div>
                             <dt>Aura</dt>
                             <dd class={badgeClass(topic.status)}>
                               <CuteSelect
                                 value={topic.status || ''}
                                 disabled={$updatingTopics.has(topic.id)}
                                 options={['', ...statusFilterOptions]}
                                 onChange={(val) => persistTopicChanges(topic.id, { status: val })}
                               />
                             </dd>
                           </div>
                           <div>
                             <dt>Last Worked</dt>
                             <dd>{topic.lastWorkedOn || '—'}</dd>
                           </div>
                         </dl>

                         <div class={`depth-delta depth-delta--${delta.delta.state}`}>
                           <div>
                             <p class="delta-label">Spirit Level</p>
                             <p class="delta-message">{delta.message}</p>
                           </div>
                           <p class="delta-trail">
                             {delta.delta.currentLabel || '—'} → {delta.delta.targetLabel || '—'}
                           </p>
                         </div>

                         <p class="topic-notes">
                           {topic.notes || topic.exampleProject || 'No notes yet. Add concept / implementation / application evidence!'}
                         </p>

                         <div class="trinity-row">
                           <span class="trinity-badge" class:done={Boolean(topic.conceptEvidence)}>
                             <span class="dot"></span><span>Concept</span>
                           </span>
                           <span class="trinity-badge" class:done={Boolean(topic.implementationEvidence)}>
                             <span class="dot"></span><span>Impl</span>
                           </span>
                           <span class="trinity-badge" class:done={Boolean(topic.applicationEvidence)}>
                             <span class="dot"></span><span>App</span>
                           </span>
                         </div>
                       </article>
                     {/each}
                   </div>
                 {/if}
               </section>
             {/each}
          {/if}
        {/if}
      </main>

      <div class="projects-column">
        <aside class="projects-panel">
          <div class="anime-deco" aria-hidden="true">
              <img src="https://media1.tenor.com/m/pzr3FSTdbQUAAAAC/sayuri-kurata-sayuri.gif" alt="" class="anime-deco__sticker anime-deco__sticker--one"/>
              <img src="https://media1.tenor.com/m/skB1uPxXQegAAAAC/study-notes.gif" alt="" class="anime-deco__sticker anime-deco__sticker--two"/>
              <img src="https://media1.tenor.com/m/etfl8OlhPIYAAAAC/studying-anime-girl.gif" alt="" class="anime-deco__sticker anime-deco__sticker--three"/>
              <img src="https://media1.tenor.com/m/UuRXcO214jwAAAAC/purringle-purringles.gif" alt="" class="anime-deco__sticker anime-deco__sticker--four"/>
          </div>
          <h3>Magical Quests & Cozy Crafts</h3>
          <p class="projects-glitter">｡ﾟ☆ record all your magical builds ☆ﾟ｡</p>
          <p class="projects-hint">Click a sticker to highlight every topic the quest touches.</p>
          
          <div class="panel-sparkles" aria-hidden="true">
            <span>✧</span><span>❀</span><span>✦</span><span>♡</span>
          </div>

          <div class="project-list">
            <button class="project-pill" class:active={$selectedProjectId === 'All'} onclick={() => $selectedProjectId = 'All'}>
              🌸 All Fragments
            </button>
            {#each $projects as project (project.id)}
              <button class="project-pill" class:active={$selectedProjectId === project.id} onclick={() => $selectedProjectId = project.id}>
                🐾 {project.title}
              </button>
            {/each}
          </div>
          
          {#if $selectedProjectId !== 'All'}
             <div class="project-details">
                {#each $projects.filter(p => p.id === $selectedProjectId) as project}
                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.summary || 'No summary yet.'}</p>
                    <dl>
                      <div><dt>Status</dt><dd>{project.status || '—'}</dd></div>
                      <div><dt>Timeline</dt><dd>{project.startDate || '—'} → {project.endDate || '—'}</dd></div>
                    </dl>
                    <p class="project-outcome">{project.outcomes || 'Log outcomes or next steps here.'}</p>
                    <p class="project-links">{project.resources || 'Link notes, repos, or docs.'}</p>
                  </div>
                {/each}
             </div>
          {/if}
        </aside>

        <div class="side-decor" aria-hidden="true">
          <div class="side-decor__column">
             <img src="https://media.tenor.com/N6oKsx0tXf0AAAAi/kanon-kurata-sayuri.gif" alt="" class="side-decor__gif"/>
             <div class="side-decor__sparkles"><span>✧</span><span>✿</span><span>♡</span></div>
             <img src="https://media1.tenor.com/m/7VgtgX2qDEMAAAAC/anime-hoodie.gif" alt="" class="side-decor__gif"/>
          </div>
        </div>
      </div>
    </div>

    <div class="floating-charms" aria-hidden="true">
      <img src="https://media.tenor.com/ZbWenQG7CL8AAAAj/mythikore-anime-girl.gif" alt="" class="floating-charms__gif"/>
      <span>☆彡 kawaii energy 彡☆</span>
      <img src="https://media1.tenor.com/m/0IudfCinoWgAAAAC/study-anime.gif" alt="" class="floating-charms__gif"/>
    </div>
  </div>
{/if}
