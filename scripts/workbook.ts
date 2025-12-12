import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { resolveTrackerPath } from './config.ts';
import type { Topic, Project } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const trackerPath = resolveTrackerPath();

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

function ensureTrackerExists() {
  if (!fs.existsSync(trackerPath)) {
    throw new Error(
      `Tracker workbook not found at ${trackerPath}. Set TRACKER_PATH to point to your LegendTrack workbook.`,
    );
  }
}

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

function extractTopics(sheetName: string, wb: xlsx.WorkBook): Topic[] {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in ${trackerPath}`);
  }
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

function extractProjects(sheetName: string, wb: xlsx.WorkBook): Project[] {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) {
    return [];
  }
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

export function loadWorkbookData() {
  ensureTrackerExists();
  const workbook = xlsx.readFile(trackerPath, { cellDates: true });
  const topics = extractTopics('Topics', workbook);
  const projects = extractProjects('Projects & Experiments', workbook);
  return { topics, projects };
}

export function getTrackerPath() {
  return trackerPath;
}
