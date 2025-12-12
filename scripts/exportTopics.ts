import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadWorkbookData } from './workbook.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, '../public/data');
const topicOutput = path.join(outputDir, 'topics.json');
const projectOutput = path.join(outputDir, 'projects.json');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  const { topics, projects } = loadWorkbookData();
  ensureDir(outputDir);
  fs.writeFileSync(topicOutput, JSON.stringify(topics, null, 2));
  fs.writeFileSync(projectOutput, JSON.stringify(projects, null, 2));

  console.log(
    `Exported ${topics.length} topics and ${projects.length} projects to public/data/.`,
  );
}

main();
