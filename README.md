# ✨ UwU (LegendTrack) ✨

> *The Magical C++ Curriculum Tracker ~ (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧*

**UwU** (formerly LegendTrack Map) is a hyper-cute, gamified roadmap for mastering C++. It transforms dry curriculum data into a magical "Systems Atlas," guided by a context-aware AI Companion.

![Svelte](https://img.shields.io/badge/Svelte-5-ff3e00?style=flat-square&logo=svelte)
![Tauri](https://img.shields.io/badge/Tauri-2.0-24c8db?style=flat-square&logo=tauri)
![TypeScript](https://img.shields.io/badge/TypeScript-Lovely-3178c6?style=flat-square&logo=typescript)
![Vibe](https://img.shields.io/badge/Vibe-Max%20Kawaii-ffbadb?style=flat-square)

---

## 🌸 The Vision

We believe learning Systems Programming shouldn't be boring! **UwU** replaces spreadsheets with a **Cozy Productivity RPG**:
*   **The Map:** A spiraling galaxy of knowledge nodes (Topics) and Quest Lines (Projects).
*   **The Companion:** A "Project Grimoire" AI (embodied by the **CatBunny** mascot) that knows exactly what you're studying and helps you with an exaggerated *"anime e-girl"* personality.
*   **The Aesthetic:** Pastel pinks, soft blues, sparkles, glassmorphism, and bouncing animations. 💖

---

## 🔮 Key Features

### 1. The Spiral Graph 🌀
Visualize your journey from "Hello World" to "Game Engine Architecture."
*   **Zoomable/Pannable:** Explore the galaxy of nodes.
*   **Focus Mode:** Click a node to see details, prerequisites, and "Trinity" status (Concept, Implementation, Application).
*   **Zen Mode:** Click the 🌸 button to hide UI clutter and float in space.

### 2. Project Grimoire (AI Chat) 🧙‍♀️
Click the **CatBunny Mascot** to summon the Grimoire!
*   **Context-Aware:** It reads your current progress (Active Projects, Mastered Topics) to give personalized advice.
*   **Personality:** Highly capable technical tutor wrapped in a *very* kawaii persona. Expect lots of "UwU", "Senpai", and emojis!
*   **Model Tuning:** Click the Crystal Ball (🔮) to bring your own API Key (OpenAI/Anthropic) and even choose your specific model brain (e.g., `gpt-4o`, `claude-3-5-sonnet`).

### 3. Data Sovereignty 📂
Your progress is **yours**.
*   **Local First:** The app reads/writes directly to a local Excel file (`.xlsx`). No cloud lock-in.
*   **Desktop Native:** Built with **Tauri**, it runs as a native macOS/Windows/Linux app.

---

## 🎀 Getting Started

### Prerequisites
*   Node.js (v20+)
*   Rust (for Tauri)

### The Summoning Ritual (Installation)

1.  **Clone the Repo:**
    ```bash
    git clone https://github.com/YourUsername/LegendTrack_Svelte.git
    cd LegendTrack_Svelte
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run in Dev Mode:**
    ```bash
    npm run tauri dev
    ```
    *   This launches the desktop app with Hot Module Replacement.
    *   *Web-only mode:* `npm run dev` (Features limited without Tauri).

4.  **Build for Production:**
    ```bash
    npm run tauri build
    ```
    *   Output: `src-tauri/target/release/bundle/macos/UwU.app`
    *   *Look for the adorable CatBunny icon!* 🐰

---

## 🛠️ Configuration (Spells)

### Setting the API Key 🔮
1.  Launch the app.
2.  Hover over the **Action Menu** (bottom left).
3.  Click the **Crystal Ball** (`🔮`).
4.  Paste your **OpenAI** (`sk-...`) or **Anthropic** (`sk-ant...`) key.
5.  *(Optional)* Click **"Tune Spirit?"** to manually select a model ID.
6.  Click **"Awaken! 💖"**.

### Changing the Tracker File 📂
*   **Desktop:** Click the **Folder** (`📂`) button in the Action Menu to select your `.xlsx` file.
*   **Web:** A file picker will appear.

---

## 🎨 Visual Identity

The **"CatBunny"** aesthetic is strict!
*   **Icons:** Source is `app-icon.svg` (402px content on 512px canvas, 14px Pastel Blue stroke).
*   **Colors:**
    *   Pink: `#ff9fdc` (Primary)
    *   Blue: `#cceeff` (Borders/Accents)
    *   Purple: `#6b5b95` (Text/Contrast)
*   **Mascot:** Uses specific GIF collections for moods (Idle, Thinking, Panic, Sleepy). See `src/components/Mascot.svelte`.

---

## 📂 Project Structure

```
LegendTrack_Svelte/
├─ LegendTrack_Cpp_MasterPlan/ # 📜 The Ancient Texts (Curriculum Logic)
├─ src/
│  ├─ components/              # 🧩 Svelte 5 Components (Mascot, ActionMenu, Graph)
│  ├─ services/
│  │  ├─ ai.ts                 # 🧠 The Brain (LLM Integration)
│  │  └─ tracker.ts            # 💾 The Memory (Excel I/O)
│  ├─ stores.ts                # ⚡ Reactive State (Runes/Stores)
│  └─ App.svelte               # 🏠 Main Entry
├─ src-tauri/                  # 🦀 Rust Backend (Windowing, File System)
└─ public/                     # 🖼️ Static Assets
```

---

## 💖 Contributing

We welcome pull requests that increase the **Cute Factor** or **Technical Depth**!
*   **Code Style:** Keep it clean, use TypeScript, and respect the Svelte 5 Runes syntax.
*   **Vibe Check:** If it's not cute, it doesn't merge. >_<

---

*Made with 💖, ☕, and a lot of C++ tears.*