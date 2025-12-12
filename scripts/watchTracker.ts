import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { resolveTrackerPath } from './config.ts';

const trackerPath = resolveTrackerPath();

if (!fs.existsSync(trackerPath)) {
  console.error(
    `Tracker workbook not found at ${trackerPath}. Set TRACKER_PATH or .env.local before running data:watch.`,
  );
  process.exit(1);
}

function runExport() {
  return new Promise<void>((resolve, reject) => {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(npmCmd, ['run', 'export:data'], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('export:data failed'));
      }
    });
  });
}

let exporting = false;
let rerunRequested = false;

async function runQueuedExport() {
  if (exporting) {
    rerunRequested = true;
    return;
  }
  exporting = true;
  try {
    await runExport();
    console.log('✅ Export complete.');
  } catch (err) {
    console.error('❌ Export failed:', err);
  } finally {
    exporting = false;
    if (rerunRequested) {
      rerunRequested = false;
      runQueuedExport();
    }
  }
}

async function initialExport() {
  console.log(`👀 Watching tracker at ${trackerPath}`);
  await runQueuedExport();
}

initialExport().catch((err) => {
  console.error(err);
});

const watcher = chokidar.watch(trackerPath, {
  ignoreInitial: true,
});

watcher.on('change', async (changedPath) => {
  console.log(`🔁 Tracker updated (${path.basename(changedPath)}). Re-exporting...`);
  runQueuedExport();
});
