const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.resolve(process.cwd(), 'sample-data/LegendTrack_Cpp_Tracker.sample.xlsx');

const TOPICS = [
  {
    id: 'E1-A-1',
    epoch: 1,
    track: 'A',
    title: 'Basic Magic',
    related: 'E1-A-2', // Unlocks B
    desc: 'The foundation of all spellcasting.'
  },
  {
    id: 'E1-A-2',
    epoch: 1,
    track: 'A',
    title: 'Intermediate Spells',
    related: 'E1-A-3, E1-B-1', // Unlocks C and D
    desc: 'Learning to control the flow.'
  },
  {
    id: 'E1-A-3',
    epoch: 1,
    track: 'A',
    title: 'Fireball',
    related: 'E1-B-2', // Unlocks E
    desc: 'Pyromancy 101.'
  },
  {
    id: 'E1-B-1',
    epoch: 1,
    track: 'B',
    title: 'Ice Shard',
    related: 'E1-B-2', // Unlocks E
    desc: 'Cryomancy 101.'
  },
  {
    id: 'E1-B-2',
    epoch: 2, // Next epoch
    track: 'B',
    title: 'Elemental Mastery',
    related: '', // Boss node
    desc: 'Combining Fire and Ice.'
  }
];

function updateFile() {
  console.log(`Reading file: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error('File not found!');
    process.exit(1);
  }

  const workbook = xlsx.readFile(filePath, { cellDates: true });
  
  // Headers matching the Rust backend expectations
  const headers = [
    'ID', 'Epoch', 'Epoch Theme', 'Track', 'Track Title', 'Topic Name', 
    'Description', 'Depth Target (L1-L4)', 'Current Depth', 'Status', 
    'Last Worked On', 'Example Project', 'Concept Evidence', 
    'Implementation Evidence', 'Application Evidence', 'Related Topic IDs', 
    'Notes / Questions', 'Resources Used'
  ];

  const rows = TOPICS.map(t => ({
    'ID': t.id,
    'Epoch': t.epoch,
    'Epoch Theme': `Chapter ${t.epoch}`,
    'Track': t.track,
    'Track Title': `Pathway ${t.track}`,
    'Topic Name': t.title,
    'Description': t.desc,
    'Depth Target (L1-L4)': 'L2',
    'Current Depth': 'L1',
    'Status': 'Not Started',
    'Related Topic IDs': t.related
  }));

  // Convert to sheet
  const newSheet = xlsx.utils.json_to_sheet(rows, { header: headers });

  // Replace in workbook
  workbook.Sheets['Topics'] = newSheet;

  // Write back
  xlsx.writeFile(workbook, filePath);
  console.log(`Updated 'Topics' sheet with ${rows.length} test nodes!`);
}

updateFile();
