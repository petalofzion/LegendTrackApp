import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const gitDir = path.join(repoRoot, '.git');
const hooksDir = path.join(gitDir, 'hooks');
const sourceHook = path.join(__dirname, 'git-hooks', 'pre-commit');
const targetHook = path.join(hooksDir, 'pre-commit');

function ensureGitDir() {
  if (!fs.existsSync(gitDir)) {
    throw new Error('No .git directory found. Run this after git init / clone.');
  }
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }
}

function installHook() {
  ensureGitDir();
  fs.copyFileSync(sourceHook, targetHook);
  fs.chmodSync(targetHook, 0o755);
  console.log('Installed pre-commit hook to keep JSON export in sync with workbook.');
}

installHook();
