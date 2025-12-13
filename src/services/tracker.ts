import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { open, message } from '@tauri-apps/plugin-dialog';
// import { Store } from '@tauri-apps/plugin-store'; // REMOVED
import * as xlsx from 'xlsx';
import type { Topic, Project } from '../types';

const TRACKER_PATH_KEY = 'tracker_path';

// --- Type Definitions (Ported from workbook.ts) ---

type TopicRow = {
  ID?: string;
  Epoch?: number | string;
  'Epoch Theme'?: string;
  Track?: string;
  'Track Title'?: string;
  'Topic Name'?: string;
  Description?: string;
  'Depth Target (L1-L4)'?: string;
  'Current Depth'?: string;
  Status?: string;
  'Last Worked On'?: string;
  'Example Project'?: string;
  'Concept Evidence'?: string;
  'Implementation Evidence'?: string;
  'Application Evidence'?: string;
  'Related Topic IDs'?: string;
  'Notes / Questions'?: string;
  'Resources Used'?: string;
};

type ProjectRow = {
  'Project ID'?: string;
  'Project / Experiment'?: string;
  'Summary / Goal'?: string;
  'Topic IDs Covered'?: string;
  Status?: string;
  'Start Date'?: string;
  'End Date'?: string;
  'Outcomes / Next Actions'?: string;
  'Resources / Links'?: string;
};

// --- Helpers (Ported from workbook.ts) ---

function clean(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }
  return String(value).trim();
}

function topicIdSortKey(id: string) {
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
  const a = topicIdSortKey(aId);
  const b = topicIdSortKey(bId);
  if (a.epoch !== b.epoch) return a.epoch - b.epoch;
  if (a.track !== b.track) return a.track - b.track;
  if (a.index !== b.index) return a.index - b.index;
  return a.raw.localeCompare(b.raw);
}

function extractTopics(sheet: xlsx.WorkSheet): Topic[] {
  const rows = xlsx.utils.sheet_to_json<TopicRow>(sheet, { defval: '' });
  return rows
    .filter((row) => clean(row.ID))
    .map((row) => ({
      id: clean(row.ID),
      epoch: Number(row.Epoch) || null,
      epochTheme: clean(row['Epoch Theme']),
      track: clean(row.Track),
      trackTitle: clean(row['Track Title']),
      topicName: clean(row['Topic Name']),
      description: clean(row.Description),
      depthTarget: clean(row['Depth Target (L1-L4)']),
      currentDepth: clean(row['Current Depth']),
      status: clean(row.Status),
      lastWorkedOn: clean(row['Last Worked On']),
      exampleProject: clean(row['Example Project']),
      conceptEvidence: clean(row['Concept Evidence']),
      implementationEvidence: clean(row['Implementation Evidence']),
      applicationEvidence: clean(row['Application Evidence']),
      relatedTopicIds: clean(row['Related Topic IDs']),
      notes: clean(row['Notes / Questions']),
      resources: clean(row['Resources Used']),
    }))
    .sort((a, b) => compareTopicIds(a.id, b.id));
}

function extractProjects(sheet: xlsx.WorkSheet): Project[] {
  const rows = xlsx.utils.sheet_to_json<ProjectRow>(sheet, { defval: '' });
  return rows
    .filter((row) => clean(row['Project / Experiment']))
    .map((row) => ({
      id: clean(row['Project ID']) || clean(row['Project / Experiment']),
      title: clean(row['Project / Experiment']),
      summary: clean(row['Summary / Goal']),
      topicIds: clean(row['Topic IDs Covered']),
      status: clean(row.Status),
      startDate: clean(row['Start Date']),
      endDate: clean(row['End Date']),
      outcomes: clean(row['Outcomes / Next Actions']),
      resources: clean(row['Resources / Links']),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

// --- Service Logic ---

export const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export async function getTrackerPath(): Promise<string | null> {
  if (!isTauri()) return null;
  return localStorage.getItem(TRACKER_PATH_KEY);
}

export async function selectTrackerFile(): Promise<string | null> {
  if (!isTauri()) return null;
  
  try {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Excel Workbook', extensions: ['xlsx', 'xlsm'] }],
    });

    if (selected && typeof selected === 'string') {
      localStorage.setItem(TRACKER_PATH_KEY, selected);
      return selected;
    }
  } catch (err) {
    console.error('File selection error:', err);
    await message(`Error selecting file: ${err}`, { title: 'Error', kind: 'error' });
  }
  return null;
}

// Load from a File object (Browser/HTML5)
export async function loadFromFile(file: File): Promise<{ topics: Topic[]; projects: Project[] }> {
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'array', cellDates: true });
    
    const topicsSheet = workbook.Sheets['Topics'];
    const projectsSheet = workbook.Sheets['Projects & Experiments'];
    
    if (!topicsSheet) throw new Error('Sheet "Topics" not found.');
    
    const topics = extractTopics(topicsSheet);
    const projects = projectsSheet ? extractProjects(projectsSheet) : [];
    
    return { topics, projects };
}

export async function loadData(): Promise<{ topics: Topic[]; projects: Project[] }> {
  if (isTauri()) {
    const path = await getTrackerPath();
    if (!path) {
      throw new Error('No tracker file selected.');
    }
    
    // Read file
    try {
        const data = await readFile(path);
        const workbook = xlsx.read(data, { type: 'array', cellDates: true });
        
        const topicsSheet = workbook.Sheets['Topics'];
        const projectsSheet = workbook.Sheets['Projects & Experiments'];
        
        if (!topicsSheet) throw new Error('Sheet "Topics" not found.');
        
        const topics = extractTopics(topicsSheet);
        const projects = projectsSheet ? extractProjects(projectsSheet) : [];
        
        return { topics, projects };
    } catch (err) {
        console.error('Failed to load data from path:', path, err);
        await message(`Failed to load data from ${path}\n\n${err}`, { title: 'Load Error', kind: 'error' });
        throw err;
    }
  } else {
    // Fallback to API for web dev
    const tRes = await fetch('/api/topics');
    if (!tRes.ok) throw new Error('Failed to fetch topics');
    const topics = await tRes.json();
    
    const pRes = await fetch('/api/projects');
    if (!pRes.ok) throw new Error('Failed to fetch projects');
    const projects = await pRes.json();
    
    return { topics, projects };
  }
}

// Update logic reused from server/index.ts but adapted
function getHeaderMap(sheet: xlsx.WorkSheet) {
  const ref = sheet['!ref'];
  if (!ref) throw new Error('Topics sheet is empty');
  const range = xlsx.utils.decode_range(ref);
  const headerRow = range.s.r;
  const headerMap = new Map<string, number>();

  for (let col = range.s.c; col <= range.e.c; col += 1) {
    const cellAddress = xlsx.utils.encode_cell({ c: col, r: headerRow });
    const cell = sheet[cellAddress];
    if (!cell) continue;
    const header = String(cell.v).trim();
    if (header.length === 0) continue;
    headerMap.set(header, col);
  }
  return { headerMap, range, headerRow };
}

function setCellValue(
  sheet: xlsx.WorkSheet,
  col: number,
  row: number,
  value: string,
) {
  const address = xlsx.utils.encode_cell({ c: col, r: row });
  if (!sheet[address]) {
    sheet[address] = { t: 's', v: value };
  } else {
    sheet[address].t = 's';
    sheet[address].v = value;
  }
}

export type TopicUpdatePayload = {
  depthTarget?: string;
  currentDepth?: string;
  status?: string;
};

export async function updateTopic(topicId: string, payload: TopicUpdatePayload): Promise<void> {
  if (isTauri()) {
    const path = await getTrackerPath();
    if (!path) throw new Error('No tracker file selected.');

    const data = await readFile(path);
    const workbook = xlsx.read(data, { type: 'array', cellDates: false });
    const sheet = workbook.Sheets['Topics'];
    if (!sheet) throw new Error('Topics sheet missing.');

    const { headerMap, range, headerRow } = getHeaderMap(sheet);
    const idCol = headerMap.get('ID');
    if (idCol === undefined) throw new Error('ID column not found.');

    const columnsToUpdate: Array<[keyof TopicUpdatePayload, string]> = [
        ['depthTarget', 'Depth Target (L1-L4)'],
        ['currentDepth', 'Current Depth'],
        ['status', 'Status'],
    ];

    const targetUpdates = columnsToUpdate
      .map(([key, header]) => {
        const col = headerMap.get(header);
        return { key, header, col };
      })
      .filter((entry) => entry.col !== undefined) as Array<{
      key: keyof TopicUpdatePayload;
      header: string;
      col: number;
    }>;

    let updated = false;
    for (let row = headerRow + 1; row <= range.e.r; row += 1) {
      const address = xlsx.utils.encode_cell({ c: idCol, r: row });
      const cell = sheet[address];
      if (!cell) continue;
      const cellValue = String(cell.v).trim();
      if (cellValue !== topicId) continue;

      for (const { key, col } of targetUpdates) {
        const newValue = payload[key];
        if (typeof newValue === 'undefined') continue;
        setCellValue(sheet, col, row, newValue);
        updated = true;
      }
      break;
    }

    if (!updated) {
        // If not found, maybe fine? But server threw error.
        throw new Error(`Topic ${topicId} not found.`);
    }

    // Write back
    const outData = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    await writeFile(path, new Uint8Array(outData));

  } else {
    // Web Fallback
    const res = await fetch(`/api/topics/${topicId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update topic');
    }
  }
}

// Keep a reference to the interval
let pollInterval: number | null = null;
let lastMtime: string | null = null; // Store as string or number

export async function startWatching(callback: () => void): Promise<void> {
  if (!isTauri()) return;

  const pathStr = await getTrackerPath();
  if (!pathStr) return;

  // Cleanup previous watcher
  stopWatching();

  console.log(`Starting polling watcher for: ${pathStr}`);

  try {
    const { stat } = await import('@tauri-apps/plugin-fs');
    
    // Initial check to set baseline
    try {
        const info = await stat(pathStr);
        // info.mtime is usually a Date object or null in JS bindings
        lastMtime = info.mtime ? info.mtime.toString() : null;
    } catch (e) {
        // File might not exist yet or be locked
        console.warn('Could not stat file initially:', e);
    }

    pollInterval = window.setInterval(async () => {
        try {
            const info = await stat(pathStr);
            const currentMtime = info.mtime ? info.mtime.toString() : null;
            
            // If mtime changed, trigger callback
            if (currentMtime !== lastMtime) {
                console.log('File changed (polling detected):', currentMtime);
                lastMtime = currentMtime;
                callback();
            }
        } catch (err) {
            // Quietly fail during polling (e.g. file locked during save)
            // We don't want to spam console
        }
    }, 2000); // Check every 2 seconds

  } catch (err) {
    console.error('Failed to initialize polling:', err);
    await message(`Failed to start file watcher: ${err}`, { title: 'Watcher Error', kind: 'warning' });
  }
}

export function stopWatching() {
  if (pollInterval !== null) {
    window.clearInterval(pollInterval);
    pollInterval = null;
  }
}
