import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const filePath = path.resolve(process.cwd(), 'sample-data/LegendTrack_Cpp_Tracker.sample.xlsx');

function update() {
  console.log(`Reading file: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error('File not found!');
    process.exit(1);
  }

  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets['Topics'];
  if (!sheet) {
    console.error('Topics sheet not found!');
    process.exit(1);
  }

  // Helper to find column index by header name
  const getHeaderIndex = (sheet: xlsx.WorkSheet, headerName: string): number => {
    const range = xlsx.utils.decode_range(sheet['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[xlsx.utils.encode_cell({ r: range.s.r, c: C })];
      if (cell && cell.v === headerName) return C;
    }
    return -1;
  };

  const statusCol = getHeaderIndex(sheet, 'Status');
  const depthCol = getHeaderIndex(sheet, 'Current Depth');
  const notesCol = getHeaderIndex(sheet, 'Notes / Questions');
  const nameCol = getHeaderIndex(sheet, 'Topic Name');
  const descCol = getHeaderIndex(sheet, 'Description');
  const idCol = getHeaderIndex(sheet, 'ID');
  
  if (idCol === -1) {
    console.error('Could not find ID column.');
    process.exit(1);
  }

  const range = xlsx.utils.decode_range(sheet['!ref']!);
  let count = 0;

  // Start from row after header
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const idCell = sheet[xlsx.utils.encode_cell({ r: R, c: idCol })];
    if (!idCell || String(idCell.v) !== 'E1-A-1') continue;

    console.log(`Updating Topic: ${idCell.v}`);

    // Update Status to "In Progress"
    if (statusCol !== -1) {
        sheet[xlsx.utils.encode_cell({ r: R, c: statusCol })] = { t: 's', v: 'In Progress' };
    }

    // Update Depth to "L2 – Implement"
    if (depthCol !== -1) {
        sheet[xlsx.utils.encode_cell({ r: R, c: depthCol })] = { t: 's', v: 'L2 – Implement' };
    }

    // Update Topic Name
    if (nameCol !== -1) {
        sheet[xlsx.utils.encode_cell({ r: R, c: nameCol })] = { t: 's', v: 'C++ Polling Verification' };
    }

    // Update Description
    if (descCol !== -1) {
        sheet[xlsx.utils.encode_cell({ r: R, c: descCol })] = { t: 's', v: 'Polling should pick this up in ~2 seconds.' };
    }

    // Update Notes
    if (notesCol !== -1) {
        sheet[xlsx.utils.encode_cell({ r: R, c: notesCol })] = { t: 's', v: `Polling test at ${new Date().toLocaleTimeString()}` };
    }
    count++;
    break; // Found it
  }

  xlsx.writeFile(workbook, filePath);
  console.log(`Updated ${count} topic(s)!`);
}

update();
