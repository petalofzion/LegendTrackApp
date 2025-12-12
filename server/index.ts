import express, { type Response } from 'express';
import cors from 'cors';
import xlsx from 'xlsx';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import { resolveTrackerPath } from '../scripts/config.ts';
import { getTrackerPath, loadWorkbookData } from '../scripts/workbook.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type TopicUpdatePayload = {
  depthTarget?: string;
  currentDepth?: string;
  status?: string;
};

const PORT = Number(process.env.API_PORT ?? 4179);
const trackerPath = resolveTrackerPath();

function loadWorkbook() {
  return xlsx.readFile(trackerPath, { cellDates: false });
}

function saveWorkbook(workbook: xlsx.WorkBook) {
  xlsx.writeFile(workbook, trackerPath);
}

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

function updateTopicRow(topicId: string, payload: TopicUpdatePayload) {
  const workbook = loadWorkbook();
  const sheet = workbook.Sheets.Topics;
  if (!sheet) throw new Error('Topics sheet missing in workbook.');

  const { headerMap, range, headerRow } = getHeaderMap(sheet);
  const idCol = headerMap.get('ID');
  if (idCol === undefined) {
    throw new Error('ID column not found in Topics sheet.');
  }

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
    throw new Error(`Topic ${topicId} not found or no valid fields provided.`);
  }

  saveWorkbook(workbook);
}

let exportInFlight = false;
let exportQueued = false;

type SSEPayload = {
  type: string;
  [key: string]: unknown;
};

const sseClients = new Set<Response>();
let broadcastTimeout: NodeJS.Timeout | null = null;

function broadcast(payload: SSEPayload) {
  const body = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    client.write(body);
  }
}

function scheduleBroadcast() {
  if (broadcastTimeout) return;
  broadcastTimeout = setTimeout(() => {
    broadcastTimeout = null;
    if (sseClients.size > 0) {
      broadcast({ type: 'topics-updated' });
    }
  }, 150);
}

function runExportData() {
  if (exportInFlight) {
    exportQueued = true;
    return;
  }
  exportInFlight = true;

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npmCmd, ['run', 'export:data'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: process.env,
  });

  child.on('close', (code) => {
    exportInFlight = false;
    if (code !== 0) {
      console.error('export:data failed with code', code);
    }
    if (exportQueued) {
      exportQueued = false;
      runExportData();
    }
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/topics', (_req, res) => {
  try {
    const { topics } = loadWorkbookData();
    res.json(topics);
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

app.get('/api/projects', (_req, res) => {
  try {
    const { projects } = loadWorkbookData();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(':\n\n');
  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

app.post('/api/topics/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body as TopicUpdatePayload;
  try {
    updateTopicRow(id, updates);
    runExportData();
    scheduleBroadcast();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ ok: false, error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`LegendTrack API listening on http://localhost:${PORT}`);
});

try {
  const watcher = chokidar.watch(getTrackerPath(), { ignoreInitial: true });
  watcher.on('change', () => {
    scheduleBroadcast();
  });
} catch (err) {
  console.warn('Unable to watch tracker for updates:', err);
}
