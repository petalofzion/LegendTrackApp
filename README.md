## LegendTrack Map

An experimental React + TypeScript front-end for visualizing the **Legend-Track C++** roadmap.  
This repo scaffolds the UI layer plus a Node-based extraction script that converts the canonical Excel tracker (`LegendTrack_Cpp_Tracker.xlsx`) into JSON the UI can consume.

### Structure

```
LegendTrack_Map/
├─ public/data/              # JSON produced from the Excel tracker
├─ sample-data/              # Tiny sample workbook so the app works out of the box
├─ scripts/exportTopics.ts   # Reads the tracker and exports topics + projects
├─ server/index.ts           # Tiny Express API that writes back to the workbook
├─ src/                      # React UI (filters, topic cards, layout)
└─ README.md
```

### Getting Started

```bash
npm install
npm run setup:hooks        # optional: installs pre-commit sync hook
cp .env.example .env.local # set TRACKER_PATH inside this file
npm run export:data        # exports sample data by default (or real tracker if configured)
npm run dev                # runs data:watch + API server + Vite
```

The development server will load `public/data/topics.json` and `public/data/projects.json`.  
While `npm run dev` is running you can edit topics inline (Spirit Level, Current Depth, Aura); changes are written directly back to the Excel tracker via the bundled API.

### Exporting Real Data

1. Copy the official tracker spreadsheet (`LegendTrack_Cpp_Tracker.xlsx`) into a secure location.
2. Run the export script with the workbook path:

   ```bash
   TRACKER_PATH=\"/path/to/LegendTrack_Cpp_Tracker.xlsx\" npm run export:data
   ```

3. Commit the generated JSON if you want the UI to display the latest roadmap on deploy.

### Local Tracker Setup

- Only ever store your real workbook outside the repo; reference it via `.env.local`.
- `cp .env.example .env.local` and edit `TRACKER_PATH=/absolute/path/to/LegendTrack_Cpp_Tracker.xlsx`.
- `npm run dev` automatically starts the watcher, the write-back API, and Vite. If you prefer to update JSON without the UI, run `npm run data:watch` alone; any save (manual or by AI agents) triggers `npm run export:data`.

### Editing Topics from the UI

- Leave `npm run dev` running (or run `npm run api` + `npm run data:watch` + `npm run preview` separately). The API listens on `http://localhost:4179` by default; override with `VITE_API_BASE` if needed.
- The topic cards now render dropdowns for Spirit Level, Current Depth, and Aura. Changing a value writes the update back to the Excel workbook and re-runs `export:data`.
- If the API is unreachable you’ll see an alert; double-check `npm run api` is running and that `TRACKER_PATH` points to the workbook.

### Data Sync Automation

- `npm run ensure:data` compares the workbook timestamp to `public/data/*.json` and only runs the exporter when needed.
- `npm run dev` and `npm run build` automatically invoke that check through npm’s `predev` / `prebuild` hooks, so local work always targets the freshest JSON.
- `npm run setup:hooks` copies `scripts/git-hooks/pre-commit` into `.git/hooks`. The hook runs `npm run ensure:data` before every commit, ensuring changes to the Excel tracker always regenerate JSON before code lands.
- `.github/workflows/sync-data.yml` runs on every push to `main` (and on manual trigger). It installs deps, optionally restores the private workbook, executes `npm run ensure:data`, and uploads the regenerated JSON as the `legendtrack-roadmap-json` artifact.
- To feed the real tracker into CI, base64-encode `LegendTrack_Cpp_Tracker.xlsx`, store it as the `TRACKER_XLSX_B64` repository secret, and the workflow will decode it into `secure/LegendTrack_Cpp_Tracker.xlsx` and export against that path. Without the secret, the action falls back to the sample workbook.

### Bundle Analysis

- Run `npm run build:analyze` to generate `dist/bundle-stats.html` (treemap from `rollup-plugin-visualizer`) plus the usual production bundles.
- The build already warns once a chunk exceeds 900 kB uncompressed; use the treemap to spot heavy dependencies (Cytoscape, XLSX, etc.) and decide whether to code-split further.
- When contributing sizable UI/graph changes, attach or reference the generated treemap so reviewers can confirm bundle size stays under control.

### Future Ideas

- Replace the list/grid view with a true interactive map (Cytoscape.js, D3, or Canvas).
- Add a projects layer that highlights all topics referenced by a selected project.
- Visualize “depth delta” (Current vs Target) with per-node color coding, matching the spreadsheet’s conditional formatting.

### Current UI Features

- Filter panel + summary stats, pastel hero art, and projects sidebar with sticky controls. Inline selects on each topic card update the tracker spreadsheet directly.
- Cytoscape-based “Spiral View” graph: nodes positioned by track vs epoch, with project-driven highlights and click-to-focus state.
- Depth delta halos + card badges visualize gaps between current vs target levels, mirroring the spreadsheet’s L1–L4 vocabulary.
- Depth legend doubles as a filter, plus quick-search + collapsible epoch sections make it easier to zero in on slices of the roadmap (focused topic is synced to the URL for easy sharing).
- Topic cards mirror spreadsheet columns, including Trinity badges (Concept/Impl/Application evidence) that glow once evidence is logged.

### Visual Direction

The eventual UI should lean into a playful, cozy aesthetic: pastel pinks, soft baby blues, gentle gradients, and whimsical accents. Think chibi computers, bunnies, cats, flowers, lacy frames, rounded panels, floating stickers—anything that makes the map feel friendly and adorable without sacrificing readability. Components should feel like stickers on a bullet journal: soft drop shadows, rounded corners, gentle motion, maybe even tiny sparkle icons. Keep that “cute uwu” energy in mind for future design passes so the map feels welcoming and fun to explore.

### Notes

- The repo ships with a small anonymized sample workbook (`sample-data/LegendTrack_Cpp_Tracker.sample.xlsx`) purely so the app renders without the private data.
- All styling is vanilla CSS today; feel free to swap in Tailwind, Chakra, or any design system.
