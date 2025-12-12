import { useEffect, useMemo, useState, useRef } from 'react';
import type { Project, Topic } from './types';
import { TopicGraph } from './components/TopicGraph';
import './App.css';
import {
  deriveDepthDelta,
  depthDeltaMessage,
  type DepthDelta,
  type DepthDeltaState,
} from './utils/depth';
import { Mascot } from './components/Mascot';
import { ClickSparkles } from './components/ClickSparkles';
import { ProgressBar } from './components/ProgressBar';
import { EmptyState } from './components/EmptyState';
import { triggerConfetti } from './utils/confetti';

type FilterState = {
  track: string;
  status: string;
  depth: string;
};

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

function canonicalStatus(value?: string | null) {
  if (!value) return 'Not Started';
  const normalized = value.trim().toLowerCase();
  const match = statusFilterOptions.find(
    (option) => option.toLowerCase() === normalized,
  );
  return match ?? 'Not Started';
}

function extractDepthLevel(label?: string | null) {
  if (!label) return null;
  const match = label.match(/l\s*([1-4])/i);
  if (!match) return null;
  return Number(match[1]) || null;
}

function topicSortKey(id: string) {
  const match = id.match(/^E(\d+)[-–]([A-Z])[-–](\d+)$/i);
  if (!match) {
    return {
      epoch: Number.MAX_SAFE_INTEGER,
      track: Number.MAX_SAFE_INTEGER,
      index: Number.MAX_SAFE_INTEGER,
      raw: id,
    };
  }
  const [, epochStr, trackLetter, indexStr] = match;
  const epoch = Number(epochStr) || Number.MAX_SAFE_INTEGER;
  const track = trackLetter.toUpperCase().charCodeAt(0) - 64 || Number.MAX_SAFE_INTEGER;
  const index = Number(indexStr) || Number.MAX_SAFE_INTEGER;
  return { epoch, track, index, raw: id };
}

function compareTopicIds(aId: string, bId: string) {
  const a = topicSortKey(aId);
  const b = topicSortKey(bId);
  if (a.epoch !== b.epoch) return a.epoch - b.epoch;
  if (a.track !== b.track) return a.track - b.track;
  if (a.index !== b.index) return a.index - b.index;
  return a.raw.localeCompare(b.raw);
}

function TrinityBadge({ label, value }: { label: string; value: string }) {
  const achieved = Boolean(value);
  return (
    <span className={`trinity-badge ${achieved ? 'done' : ''}`}>
      <span className="dot" />
      <span>{label}</span>
    </span>
  );
}

type TopicUpdatePayload = Partial<
  Pick<Topic, 'depthTarget' | 'currentDepth' | 'status'>
>;

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    track: 'All',
    status: 'All',
    depth: 'All',
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [focusedTopic, setFocusedTopic] = useState<string | null>(null);
  const [depthStateFilter, setDepthStateFilter] = useState<'All' | DepthDeltaState>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedEpochs, setCollapsedEpochs] = useState<Set<number>>(new Set());
  const [zenMode, setZenMode] = useState(false);
  const [updatingTopics, setUpdatingTopics] = useState<Set<string>>(new Set());
  const [raveMode, setRaveMode] = useState(false);
  const prevMasteredCount = useRef(0);
  const bubblesRef = useRef<HTMLDivElement>(null);
  const inputSequence = useRef<string[]>([]);
  const apiBase =
    import.meta.env.VITE_API_BASE ?? 'http://localhost:4179';

  async function persistTopicChanges(topicId: string, payload: TopicUpdatePayload) {
    setUpdatingTopics((prev) => {
      const next = new Set(prev);
      next.add(topicId);
      return next;
    });
    try {
      const response = await fetch(`${apiBase}/api/topics/${topicId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to update topic.');
      }
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId ? { ...topic, ...payload } : topic,
        ),
      );
    } catch (err) {
      console.error(err);
      alert(
        `Could not update ${topicId}. Make sure npm run api is running.\n${(err as Error).message}`,
      );
    } finally {
      setUpdatingTopics((prev) => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  }

  function isUpdatingTopic(id: string) {
    return updatingTopics.has(id);
  }

  useEffect(() => {
    if (zenMode) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [zenMode]);

  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    const handleKeyDown = (e: KeyboardEvent) => {
      inputSequence.current = [...inputSequence.current, e.key].slice(-10);
      if (JSON.stringify(inputSequence.current) === JSON.stringify(konamiCode)) {
        setRaveMode((prev) => !prev);
        inputSequence.current = [];
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!bubblesRef.current) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 12; // Much more subtle
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        bubblesRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadData() {
      try {
        const base = new URL(import.meta.env.BASE_URL || '/', window.location.origin);
        const topicsUrl = new URL('data/topics.json', base);
        const projectsUrl = new URL('data/projects.json', base);
        const [topicsRes, projectsRes] = await Promise.all([
          fetch(topicsUrl, { signal: controller.signal }),
          fetch(projectsUrl, { signal: controller.signal }),
        ]);
        if (!topicsRes.ok || !projectsRes.ok) {
          throw new Error('Failed to load roadmap data');
        }
        const [topicsJson, projectsJson] = await Promise.all([
          topicsRes.json(),
          projectsRes.json(),
        ]);
        if (!controller.signal.aborted) {
          setTopics(topicsJson as Topic[]);
          const normalizedProjects = (projectsJson as Project[]).map((project) => ({
            ...project,
            id: project.id || project.title,
          }));
          setProjects(normalizedProjects);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error(err);
      }
    }
    loadData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const topicId = url.searchParams.get('topic');
    if (topicId) {
      setFocusedTopic(topicId);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (focusedTopic) {
      url.searchParams.set('topic', focusedTopic);
    } else {
      url.searchParams.delete('topic');
    }
    window.history.replaceState(null, '', url);
  }, [focusedTopic]);

  const depthMetaById = useMemo(() => {
    const map = new Map<string, DepthDelta>();
    for (const topic of topics) {
      map.set(topic.id, deriveDepthDelta(topic));
    }
    return map;
  }, [topics]);

  const depthFilterLevel = useMemo(() => {
    if (filters.depth === 'All') return null;
    return extractDepthLevel(filters.depth);
  }, [filters.depth]);

  const statusFilterValue = useMemo(() => {
    if (filters.status === 'All') return null;
    return canonicalStatus(filters.status);
  }, [filters.status]);

  const filteredTopics = useMemo(() => {
    const rawTerm = searchTerm.trim().toLowerCase();
    return topics.filter((topic) => {
      const matchesTrack =
        filters.track === 'All' || (topic.track?.toUpperCase() ?? '') === filters.track;
      const depthMeta = depthMetaById.get(topic.id);
      const matchesDepth =
        depthFilterLevel === null ||
        (depthMeta?.targetLevel ?? null) === depthFilterLevel;
      const matchesStatus =
        statusFilterValue === null ||
        canonicalStatus(topic.status) === statusFilterValue;
      const matchesDepthState =
        depthStateFilter === 'All' || depthMeta?.state === depthStateFilter;
      const matchesSearch =
        rawTerm.length === 0 ||
        (topic.id?.toLowerCase() ?? '').includes(rawTerm) ||
        (topic.topicName?.toLowerCase() ?? '').includes(rawTerm) ||
        (topic.description?.toLowerCase() ?? '').includes(rawTerm);
      return matchesTrack && matchesStatus && matchesDepth && matchesDepthState && matchesSearch;
    });
  }, [
    topics,
    filters.track,
    depthFilterLevel,
    statusFilterValue,
    depthMetaById,
    depthStateFilter,
    searchTerm,
  ]);

  const highlightedIds = useMemo(() => {
    if (selectedProjectId === 'All') {
      return new Set<string>();
    }
    const project = projects.find((proj) => proj.id === selectedProjectId);
    if (!project || !project.topicIds) return new Set<string>();
    const ids = project.topicIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    return new Set(ids);
  }, [projects, selectedProjectId]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const topic of topics) {
      const status = canonicalStatus(topic.status);
      counts[status] = (counts[status] || 0) + 1;
    }
    return counts;
  }, [topics]);

  useEffect(() => {
    const mastered = statusCounts['Mastered'] || 0;
    if (mastered > prevMasteredCount.current && prevMasteredCount.current > 0) {
      triggerConfetti();
    }
    prevMasteredCount.current = mastered;
  }, [statusCounts]);

  const groupedByEpoch = useMemo(() => {
    const groups = new Map<number, Topic[]>();
    for (const topic of filteredTopics) {
      if (topic.epoch === null) continue;
      if (!groups.has(topic.epoch)) {
        groups.set(topic.epoch, []);
      }
      groups.get(topic.epoch)!.push(topic);
    }
    return [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([epoch, epochTopics]) => ({
        epoch,
        theme: epochTopics[0]?.epochTheme ?? '',
        topics: epochTopics.sort((a, b) => compareTopicIds(a.id, b.id)),
      }));
  }, [filteredTopics]);

  function badgeClass(status: string) {
    switch (status) {
      case 'Mastered':
        return 'status mastered';
      case 'Stable':
        return 'status stable';
      case 'In Progress':
        return 'status progress';
      default:
        return 'status default';
    }
  }

  function isHighlighted(id: string) {
    return highlightedIds.has(id);
  }

  function renderDepthDelta(topic: Topic) {
    const delta = depthMetaById.get(topic.id) ?? deriveDepthDelta(topic);
    const message = depthDeltaMessage(delta);
    return (
      <div className={`depth-delta depth-delta--${delta.state}`}>
        <div>
          <p className="delta-label">Spirit Level</p>
          <p className="delta-message">{message}</p>
        </div>
        <p className="delta-trail">
          {delta.currentLabel || '—'} → {delta.targetLabel || '—'}
        </p>
      </div>
    );
  }

  function toggleDepthFilter(state: DepthDeltaState) {
    setDepthStateFilter((prev) => (prev === state ? 'All' : state));
  }

  function toggleEpochCollapse(epoch: number) {
    setCollapsedEpochs((prev) => {
      const next = new Set(prev);
      if (next.has(epoch)) {
        next.delete(epoch);
      } else {
        next.add(epoch);
      }
      return next;
    });
  }

  function renderStatusBadges() {
    return (
      <div className="status-badges">
        {statusOptions.slice(1).map((status) => (
          <div className="status-pill" key={status}>
            <span className="label">{status}</span>
            <span className="count">{statusCounts[status] || 0}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`app ${zenMode ? 'zen-active' : ''} ${raveMode ? 'rave-active' : ''}`}>
      <ClickSparkles />
      <Mascot mood={focusedTopic ? 'happy' : 'idle'} triggerKey={focusedTopic} zenMode={zenMode} />
      <button 
        className="zen-toggle" 
        onClick={() => setZenMode(!zenMode)}
        title="Toggle Zen Mode"
      >
        {zenMode ? '🌸' : '🧘‍♀️'}
      </button>

      <div className="zen-backdrop" aria-hidden="true" />
      <div ref={bubblesRef} className="background-bubbles" aria-hidden="true" />
      <div className="sparkle-cluster sparkle-cluster--one" aria-hidden="true">
        <span>✦</span>
        <span>❀</span>
        <span>✧</span>
      </div>
      <div className="sparkle-cluster sparkle-cluster--two" aria-hidden="true">
        <span>♡</span>
        <span>✺</span>
        <span>✶</span>
      </div>
      <header className="app-header">
        <div className="hero-text">
          <p className="eyebrow">Legend-Track C++</p>
          <h1>
            Cute Systems Atlas <span>🩵🐰</span>
          </h1>
          <p>
            A dreamy dashboard for exploring every Chapter, Pathway, and Side-Quest
            of the roadmap. Filter across vibes, spotlight magical quests, and plan
            your next spiral.
          </p>
          <ProgressBar counts={statusCounts} total={topics.length} />
          {renderStatusBadges()}
        </div>
        <div className="hero-art">
          <div className="bunny-card">
            <span role="img" aria-label="bunny">
              🐇
            </span>
          </div>
          <div className="kitty-card">
            <span role="img" aria-label="kitty">
              🐱
            </span>
          </div>
          <div className="sparkle">✿</div>
          <div className="sparkle second">✧</div>
        </div>
      </header>

      <div className="controls-panel">
        <div className="filters">
          <label>
            Pathway
            <select
              value={filters.track}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, track: event.target.value }))
              }
            >
              {trackOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Aura
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value }))
              }
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Spirit Level
            <select
              value={filters.depth}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, depth: event.target.value }))
              }
            >
              {depthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Crystal Scry
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Find ID or topic..."
            />
          </label>
          <label>
            Focus Spell
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
            >
              <option value="All">All Fragments</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <section className="summary">
          <div>
            <p className="summary-label">Fragments Found</p>
            <p className="summary-value">{topics.length}</p>
          </div>
          <div>
            <p className="summary-label">Visible</p>
            <p className="summary-value">{filteredTopics.length}</p>
          </div>
          <div>
            <p className="summary-label">Quests Logged</p>
            <p className="summary-value">{projects.length}</p>
          </div>
        </section>
      </div>

      <div className="content-layout">
        <main>
          <section className="graph-section">
            <div className="graph-header">
              <div>
                <h2>Constellation Map</h2>
                <p>Nodes placed by Pathway (X) and Chapter (Y). Click for details.</p>
              </div>
              {focusedTopic && <span>Focused: {focusedTopic}</span>}
            </div>
            <div className="depth-legend">
              {(Object.keys(depthStateLabels) as DepthDeltaState[]).map((state) => (
                <button
                  key={state}
                  type="button"
                  className={`legend-chip ${state === 'under' ? 'need' : state} ${
                    depthStateFilter === state ? 'active' : ''
                  }`}
                  onClick={() => toggleDepthFilter(state)}
                >
                  {depthStateLabels[state]}
                </button>
              ))}
              <button
                type="button"
                className={`legend-chip reset ${depthStateFilter === 'All' ? 'active' : ''}`}
                onClick={() => setDepthStateFilter('All')}
              >
                Clear
              </button>
            </div>
            <TopicGraph
                topics={filteredTopics}
                highlightedIds={highlightedIds}
                focusedTopicId={focusedTopic}
                onSelectTopic={(id) => setFocusedTopic(id)}
                searchTerm={searchTerm}
              />
          </section>

          {filteredTopics.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {groupedByEpoch.map((epoch) => (
                <section className="epoch" key={epoch.epoch}>
                  <div className="epoch-heading">
                    <div>
                      <h2>
                        Chapter {epoch.epoch}: {epoch.theme}
                      </h2>
                      <p className="epoch-subtitle">
                        Spiral deeper by pairing this chapter with neighboring pathways.
                      </p>
                    </div>
                    <div className="epoch-actions">
                      <span>{epoch.topics.length} stars</span>
                      <button
                        type="button"
                        className="epoch-toggle"
                        onClick={() => toggleEpochCollapse(epoch.epoch)}
                      >
                        {collapsedEpochs.has(epoch.epoch) ? 'Expand' : 'Collapse'}
                      </button>
                    </div>
                  </div>
                  {!collapsedEpochs.has(epoch.epoch) && (
                    <div className="topic-grid">
                      {epoch.topics.map((topic) => (
                        <article
                          className={`topic-card ${isHighlighted(topic.id) ? 'highlighted' : ''} ${
                            focusedTopic === topic.id ? 'focused' : ''
                          }`}
                          key={topic.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setFocusedTopic(topic.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setFocusedTopic(topic.id);
                            }
                          }}
                        >
                          <header>
                            <p className="topic-id">{topic.id}</p>
                            <h3>{topic.topicName}</h3>
                            <p className="topic-track">
                              Pathway {topic.track} · {topic.trackTitle}
                            </p>
                          </header>
                          <p className="topic-description">{topic.description}</p>
                          <dl className="topic-meta">
                            <div>
                              <dt>Spirit Level</dt>
                              <dd>
                                <select
                                  value={topic.depthTarget || ''}
                                  disabled={isUpdatingTopic(topic.id)}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) =>
                                    persistTopicChanges(topic.id, {
                                      depthTarget: event.target.value || '',
                                    })
                                  }
                                >
                                  <option value="">—</option>
                                  {depthChoices.map((choice) => (
                                    <option key={choice} value={choice}>
                                      {choice}
                                    </option>
                                  ))}
                                </select>
                              </dd>
                            </div>
                            <div>
                              <dt>Current Depth</dt>
                              <dd>
                                <select
                                  value={topic.currentDepth || ''}
                                  disabled={isUpdatingTopic(topic.id)}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) =>
                                    persistTopicChanges(topic.id, {
                                      currentDepth: event.target.value || '',
                                    })
                                  }
                                >
                                  <option value="">—</option>
                                  {depthChoices.map((choice) => (
                                    <option key={choice} value={choice}>
                                      {choice}
                                    </option>
                                  ))}
                                </select>
                              </dd>
                            </div>
                            <div>
                              <dt>Aura</dt>
                              <dd className={badgeClass(topic.status)}>
                                <select
                                  value={topic.status || ''}
                                  disabled={isUpdatingTopic(topic.id)}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) =>
                                    persistTopicChanges(topic.id, {
                                      status: event.target.value || '',
                                    })
                                  }
                                >
                                  <option value="">—</option>
                                  {statusFilterOptions.map((choice) => (
                                    <option key={choice} value={choice}>
                                      {choice}
                                    </option>
                                  ))}
                                </select>
                              </dd>
                            </div>
                            <div>
                              <dt>Last Worked</dt>
                              <dd>{topic.lastWorkedOn || '—'}</dd>
                            </div>
                          </dl>
                          {renderDepthDelta(topic)}
                          <p className="topic-notes">
                            {topic.notes ||
                              topic.exampleProject ||
                              'No notes yet. Add concept / implementation / application evidence!'}
                          </p>
                          <div className="trinity-row">
                            <TrinityBadge label="Concept" value={topic.conceptEvidence} />
                            <TrinityBadge
                              label="Impl"
                              value={topic.implementationEvidence}
                            />
                            <TrinityBadge label="App" value={topic.applicationEvidence} />
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </>
          )}
        </main>

        <div className="projects-column">
          <aside className="projects-panel">
            <div className="anime-deco" aria-hidden="true">
              <img
                src="https://media1.tenor.com/m/pzr3FSTdbQUAAAAC/sayuri-kurata-sayuri.gif"
                alt=""
                loading="lazy"
                width={120}
                height={120}
                className="anime-deco__sticker anime-deco__sticker--one"
              />
            <img
              src="https://media1.tenor.com/m/skB1uPxXQegAAAAC/study-notes.gif"
              alt=""
              loading="lazy"
              width={120}
              height={120}
              className="anime-deco__sticker anime-deco__sticker--two"
            />
            <img
              src="https://media1.tenor.com/m/etfl8OlhPIYAAAAC/studying-anime-girl.gif"
              alt=""
              loading="lazy"
              width={120}
              height={120}
              className="anime-deco__sticker anime-deco__sticker--three"
            />
            <img
              src="https://media1.tenor.com/m/UuRXcO214jwAAAAC/purringle-purringles.gif"
              alt=""
              loading="lazy"
              width={120}
              height={120}
              className="anime-deco__sticker anime-deco__sticker--four"
            />
            </div>
            <h3>Magical Quests & Cozy Crafts</h3>
            <p className="projects-glitter">｡ﾟ☆ record all your magical builds ☆ﾟ｡</p>
            <p className="projects-hint">
              Click a sticker to highlight every topic the quest touches.
            </p>
            <div className="panel-sparkles" aria-hidden="true">
              <span>✧</span>
              <span>❀</span>
              <span>✦</span>
              <span>♡</span>
            </div>
            <div className="project-list">
              <button
                className={`project-pill ${selectedProjectId === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedProjectId('All')}
                type="button"
              >
                🌸 All Fragments
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  className={`project-pill ${
                    selectedProjectId === project.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedProjectId(project.id)}
                  type="button"
                >
                  🐾 {project.title}
                </button>
              ))}
            </div>
            {selectedProjectId !== 'All' && (
              <div className="project-details">
                {projects
                  .filter((proj) => proj.id === selectedProjectId)
                  .map((project) => (
                    <div key={project.id}>
                      <h4>{project.title}</h4>
                      <p>{project.summary || 'No summary yet.'}</p>
                      <dl>
                        <div>
                          <dt>Status</dt>
                          <dd>{project.status || '—'}</dd>
                        </div>
                        <div>
                          <dt>Timeline</dt>
                          <dd>
                            {project.startDate || '—'} → {project.endDate || '—'}
                          </dd>
                        </div>
                      </dl>
                      <p className="project-outcome">
                        {project.outcomes || 'Log outcomes or next steps here.'}
                      </p>
                      <p className="project-links">
                        {project.resources || 'Link notes, repos, or docs.'}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </aside>
          <div className="side-decor" aria-hidden="true">
            <div className="side-decor__column">
              <img
                src="https://media.tenor.com/N6oKsx0tXf0AAAAi/kanon-kurata-sayuri.gif"
                alt=""
                loading="lazy"
                width={130}
                height={130}
                className="side-decor__gif"
              />
              <div className="side-decor__sparkles">
                <span>✧</span>
                <span>✿</span>
                <span>♡</span>
              </div>
              <img
                src="https://media1.tenor.com/m/7VgtgX2qDEMAAAAC/anime-hoodie.gif"
                alt=""
                loading="lazy"
                width={130}
                height={130}
                className="side-decor__gif"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="floating-charms" aria-hidden="true">
        <img
          src="https://media.tenor.com/ZbWenQG7CL8AAAAj/mythikore-anime-girl.gif"
          alt=""
          loading="lazy"
          width={80}
          height={80}
          className="floating-charms__gif"
        />
        <span>☆彡 kawaii energy 彡☆</span>
        <img
          src="https://media1.tenor.com/m/0IudfCinoWgAAAAC/study-anime.gif"
          alt=""
          loading="lazy"
          width={80}
          height={80}
          className="floating-charms__gif"
        />
      </div>
    </div>
  );
}

export default App;
