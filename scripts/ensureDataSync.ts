import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { resolveTrackerPath } from './config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const trackerPath = resolveTrackerPath();

const dataDir = path.resolve(__dirname, '../public/data');
const topicOutput = path.join(dataDir, 'topics.json');
const projectOutput = path.join(dataDir, 'projects.json');

function fileMtime(filePath: string) {
  return fs.statSync(filePath).mtimeMs;
}

function outputsAreMissing() {
  return !fs.existsSync(topicOutput) || !fs.existsSync(projectOutput);
}

function isTrackerNewer() {
  const trackerTime = fileMtime(trackerPath);
  const topicTime = fileMtime(topicOutput);
  const projectTime = fileMtime(projectOutput);
  return trackerTime > topicTime || trackerTime > projectTime;
}

function runExport() {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCmd, ['run', 'export:data'], {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error('Failed to export data from workbook.');
  }
}

function main() {
  if (!fs.existsSync(trackerPath)) {
    console.warn(
      'LegendTrack tracker workbook not found. Set TRACKER_PATH before syncing data.',
    );
    return;
  }

  if (outputsAreMissing()) {
    console.log('public/data/*.json missing. Running export...');
    runExport();
    return;
  }

  if (isTrackerNewer()) {
    console.log('Workbook changes detected. Running export...');
    runExport();
  } else {
    console.log('public/data/*.json already reflect the workbook. Skipping export.');
  }
}

main();
