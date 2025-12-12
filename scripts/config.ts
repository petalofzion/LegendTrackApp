import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localEnvPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: localEnvPath });
dotenv.config();

export const sampleTrackerPath = path.resolve(
  __dirname,
  '../sample-data/LegendTrack_Cpp_Tracker.sample.xlsx',
);

export function resolveTrackerPath() {
  return process.env.TRACKER_PATH || sampleTrackerPath;
}

export function trackerExists() {
  const trackerPath = resolveTrackerPath();
  return fs.existsSync(trackerPath);
}

export function getRootDir() {
  return path.resolve(__dirname, '..');
}
