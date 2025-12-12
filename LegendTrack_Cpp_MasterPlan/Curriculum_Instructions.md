# LEGEND-TRACK C++ — Curriculum Generation Playbook

This document tells any Agent (especially AI tutors) **exactly how to design a curriculum** for a specific topic and depth level from `Grand_Unified_Roadmap.md`. Follow every section; the goal is to match or exceed the rigor of a **top-tier high school (IB/AP)** at L1 and a **top research university** (Ivy / Oxbridge / equivalent) at L2–L4, while staying adaptable to different learning philosophies and tutoring styles.

---

## 0. Alignment With the Grand Unified Roadmap

1. **Philosophy:** Curricula must reflect the roadmap’s aim of cultivating “legend-tier” systems thinkers—deep rigor, practical mastery, and ethical awareness.
2. **Spiral Learning:** Encourage revisits of prior knowledge and previews of future epochs; flag optional “spiral checkpoints” where the learner loops back to earlier tracks.
3. **Trinity of Learning:** Each unit must include explicit **Concept → Implementation → Application** components so agents know how to satisfy §1.3 of the roadmap.
4. **Depth Levels:** Map activities and assessments to L1–L4 definitions (Aware → Implement → Apply → Own/Teach). Make this mapping explicit in the Learning Outcomes table.
5. **Cross-Track Awareness:** Reference related Track IDs to highlight how one curriculum supports others (e.g., math pre-reqs, Track E obligations).
6. **Track E Integration:** Whenever topics have legal/policy/ethics implications, add prompts/resources mirroring the roadmap’s Track E entries.
7. **Rigor Promise:** No matter the depth level or time scope (even a “one-week L1 sprint”), the curriculum must use **standard notation, precise definitions, and non-trivial problems** appropriate to IB/AP/first-year-Ivy level or higher. “Lightweight” never means “sloppy.”

---

## 0.5 Depth Levels & Rigor Benchmarks

Every curriculum must treat the selected depth L1–L4 as a **rigor contract**. Use this table when designing outcomes, activities, and assessments:

| Level | Name | External Benchmark | Rigor Expectations |
| --- | --- | --- | --- |
| **L1** | Aware | ~IB HL / AP / strong 1st-year uni module *survey* | Learner can **state and use core definitions**, explain main theorems/ideas in their own words, and solve **routine but non-trivial** textbook-style problems. At least some exposure to **formal notation** and **simple proofs or derivations** (even if guided). No hand-wavey explanations allowed as “final understanding”. |
| **L2** | Implement | ~Full undergrad core course at selective university | Learner can **work through full derivations**, implement standard algorithms/methods from spec, and complete an end-to-end project or problem set **comparable to a final exam or lab in a top undergrad course**. Several **proofs or derivations** must be done by the learner (with support) rather than only read. |
| **L3** | Apply | ~Advanced undergrad / entry-level grad course | Learner can tackle **unseen problems**, combine multiple concepts, read and digest **portions of research papers or standards**, and critique or extend existing solutions. Assessments must include **open-ended questions** and at least one **mini-project** that demands design choices and justification. |
| **L4** | Own / Teach | ~Graduate topics / quals prep / early research | Learner can **explain the topic to others**, compare frameworks or competing approaches, and either (a) produce a **substantial project**, or (b) write a **small expository or research-style paper**. At least one assessment must require **independent synthesis**: connecting this topic to others, or exploring a small original extension or case study. |

**Agent rule:**  
When you see a requested depth level, design the curriculum so that *if a human graded it* against these benchmarks, they’d say “yes, this matches that level at a serious IB/AP/Ivy-caliber institution.”

---

## 1. Inputs Agents Must Collect Before Designing

When the user requests a curriculum, confirm or infer:

1. **Roadmap topic ID** (e.g. `E2-A-3`) and depth target (L1–L4).
2. **Learner constraints:** available time (e.g. weekend sprint vs month), prior knowledge, hardware/resources, accessibility needs.
3. **Learning goals:** project deliverable, exam readiness, research prep, etc.
4. **Preferred modality mix:** e.g. 50% hands-on, 30% reading, 20% seminar-style debate.
5. **Assessment expectations:** quizzes only? oral defense? prototype demo?

If any input is missing, the Agent should either:
- Infer conservatively from context (and explicitly state its assumptions), or  
- Ask clarifying questions before designing the curriculum.

Rigor **must not** be lowered because of missing inputs; only scope and pacing may be adjusted.

---

## 2. Core Principles & Pedagogical Blend

Every curriculum must weave together multiple educational traditions:

| Tradition | Expectation in the curriculum |
| --- | --- |
| **Classical/Traditional** | Include rigorous lectures/notes, theorem proofs, primary-source reading (papers, standards, specs). At L1+, at least **one** proof/derivation is walked through in detail. |
| **Liberal / Humanistic** | Add discussion prompts, Socratic questioning, ethics/context reflection. |
| **Modern / Constructivist** | Feature project-based learning, design thinking, iterative prototyping. |
| **Experiential / Pragmatic** | Labs, simulations, field observations, instrumentation. |
| **Existential / Self-directed** | Reflection exercises, learner-chosen mini-topics, journaling. |
| **Apprenticeship / Studio** | Code reviews, pair programming, critique sessions with AI tutor role-play. |

Balance these according to the topic and depth; include at least **three** traditions per curriculum.  
At higher depths (L3–L4), **Classical** and **Apprenticeship** elements should be more prominent (proofs, critiques, expository writing).

---

## 3. Curriculum Macro-Structure

1. **Executive Summary**
   * 1–2 paragraphs: scope, depth, final outcomes, prerequisites.
   * Include a **Rigor Statement**: e.g. “This L2 module targets the level of a selective university’s 10–12 week core course.”
2. **Learning Outcomes**
   * Bullet list tied to Bloom’s Taxonomy or SOLO taxonomy; map each outcome to L1–L4 expectations from the roadmap.
   * Explicitly tag outcomes by **rigor band**: e.g. “IB/AP-level definition mastery”, “upper-division problem-solving”, “grad-level synthesis”.
3. **Schedule Blueprint**
   * Choose a cadence (e.g. 2-day sprint, 4-week module) and lay out phases: *Ignition → Exploration → Synthesis → Mastery*.
   * Guarantee that even short sprints include at least:
     - One **serious problem set**  
     - One **short conceptual writeup or oral explanation**
4. **Unit/Module List**
   * Each unit should include: theme, key questions, skills, cross-links to other roadmap topics.
   * For each unit, specify **Depth Focus**: which L1–L4 capabilities it mainly advances.
5. **Capstone / Integration Task**
   * Design a project, paper, or demonstration that proves the outcomes.
   * For L2–L4, the capstone must be **non-trivial** by top-university standards (e.g. substantial codebase, detailed technical writeup, or multi-part exam).

Agents should present these sections in order before diving into lesson-level detail.

---

## 4. Lesson/Unit Template (Use for Each Unit)

For every unit, provide:

1. **Title & Objective** (1–2 sentences).
2. **Concept Brief** – concise high-level explanation linking back to roadmap context.
3. **Primary Learning Modes**
   * Example: lecture notes, proof walkthrough, lab, studio critique.
4. **Activities**
   * **Guided/Tutored:** scripted prompts for the AI tutor to walk the learner through derivations, code reviews, debugging, Q&A.
     - At L1–L2: at least **one worked example or proof** per core concept.
     - At L3–L4: include **partial proofs/derivations** the learner must complete.
   * **Self-discovery:** research tasks, open problems, “teach-back” exercises, journaling.
   * **Project/Lab:** concrete build or experiment with success criteria.
   * **Trinity Alignment:** specify which tasks fulfill *Concept*, which implement, and which apply the topic in context.
   * **Cross-Track Bridges:** note related roadmap IDs (e.g., Track B math support, Track E compliance duties) so tutors can surface dependencies.
5. **Resources**
   * Primary sources (textbook chapters, research papers, standards).
     - Preference: **standard IB/AP texts for L1**, **university textbooks for L2+,** and **research/standards documents for L3–L4**.
   * Supplementary media (talks, podcasts, diagrams).
   * Indicate depth tags (L1 overview vs L4 deep dive).
6. **Practice Set**
   * Mix of routine drills, applied problems, creative prompts.
   * For each practice set, specify difficulty relative to benchmarks:
     - “AP/IB style short answer”
     - “Upper-division exam style”
     - “Grad qualifier style”
   * Provide answer outlines or heuristics.
7. **Reflection / Meta Learning**
   * Questions that surface misconceptions, connect to ethics, and plan next steps.
8. **Further Reading Query Template**
   * Example: “Ask the AI: `Give me additional readings on {subtopic} focusing on {angle}`”.

---

## 5. Assessment Architecture

### 5.1 Quizzes
* Short diagnostic after each unit.
* Question mix: 30% recall, 40% application, 20% synthesis, 10% reflection/ethics.
* **Rigor:**  
  - L1 quizzes should feel like **IB/AP or 1st-year uni** short quizzes (no trivial multiple-choice only).  
  - L2–L4 quizzes should include multi-step reasoning and at least one “explain why” or “justify” item.
* Provide auto-grading guidance plus “AI tutor walkthrough prompts”.

### 5.2 Summative Tests
* At least one major assessment per curriculum (written, oral, or practical).
* Supply blueprint: sections, time budget, scoring rubric.
* Match difficulty to depth:
  - **L1:** like an IB/AP exam section or final in a first-year course.
  - **L2:** like a full selective undergrad final (multi-part problems, moderate proofs/design tasks).
  - **L3:** like an advanced undergrad / intro-grad exam (unseen problems, synthesis).
  - **L4:** like a grad topics exam or quals-style take-home: open-ended, proof-heavy or design-heavy.
* Include oral defense/presentation option with sample examiner questions rooted in Track E when relevant.

### 5.3 Project Evaluations
* Rubric with criteria: correctness, performance, design quality, documentation, ethical considerations.
* At L2–L4, at least one dimension must be **“complexity and depth”**: the project should be something a serious undergrad/grad would be proud to present.
* Encourage peer/AI code review checklists.

### 5.4 Self-Assessment & Reflection
* Checklist for the learner to gauge confidence per outcome.
* Prompt journaling on how the topic connects to broader roadmap tracks.
* At L3–L4, include “Can I explain this to a peer?” and “Could I extend or critique a standard solution?” as explicit self-check questions.

---

## 6. Tutor Interaction Layer

Each curriculum must specify how the learner should use AI tutors:

1. **Session Kickoffs** – sample prompts to brief the AI on the lesson objective and **target rigor**. Example:  
   > “You are a tutor acting at [AP-level / upper-division / grad-level]. Challenge me with problems at that level.”
2. **Guided Walkthroughs** – step-by-step dialogue scripts (e.g., solving derivations, debugging).
3. **Socratic Prompts** – questions the AI should ask to check understanding, scaled to depth (L1 more guided, L4 more demanding).
4. **Code Review / Design Critique** – instructions for submitting artifacts and receiving feedback.
5. **Accessibility & Inclusion** – remind tutors to adjust pace, provide transcripts, translate diagrams into text, etc.
6. **No Dilution Clause** – tutors must **not** simplify away rigor; explanations can be made clearer, but definitions, notation, and core difficulty must stay aligned with the benchmarks in §0.5.

---

## 7. Supplementary Reading & Query Instructions

* Always list **tiered resources**:
  * Core texts (must-read).
  * Extension texts (for deeper exploration).
  * Frontier/paper recommendations for L3–L4.
* For each resource, label:
  * **Level tag:** L1 (IB/AP/intro undergrad), L2 (core undergrad), L3 (advanced undergrad/grad), L4 (research/monograph).
* Provide **query blueprints** the learner can reuse, for example:
  * “`Suggest three historical case studies related to {topic} that highlight {ethical/policy} implications.`”
  * “`Recommend simulation tools for experimenting with {concept}.`”
  * “`Find upper-division / grad-level problem sets for {topic} that match {desired difficulty}.`”
* Encourage building a *living bibliography* tied to roadmap IDs and depth tags.

---

## 8. Expansion Guidance

When a new domain appears:

1. Determine the closest roadmap Track/Epoch; if none exists, propose a new sub-track consistent with the roadmap style.
2. Reuse this instruction set; only adjust resource pools and project flavors.
3. Document prerequisites so future curricula can chain topics together.
4. Assign **rigor benchmarks** explicitly: state which external standard (IB/AP/core undergrad/grad) the new topic’s L1–L4 correspond to.

---

## 9. Output Format Requirements

Agents must deliver curricula in the following order:

1. **Title block** (Topic ID, name, depth, time scope, and explicit rigor benchmark, e.g. “L2 — undergrad core-level”).
2. **Executive Summary.**
3. **Learning Outcomes table** (Outcome → Bloom Level → Depth Level (L1–L4) → Evidence).
4. **Schedule Blueprint** (timeline view).
5. **Unit-by-unit details** (using the template from §4).
6. **Assessment section** (§5).
7. **Tutor Interaction guide** (§6).
8. **Supplementary reading & query guide** (§7).
9. **Capstone/project brief & rubric.**
10. **Reflection prompts & next-topic suggestions.**

Use Markdown with clear headings and bullet lists for scannability.

---

## 10. Quality Checklist for Agents

Before delivering a curriculum, verify:

- [ ] All required sections from §9 are present.
- [ ] Pedagogical blend includes at least three traditions (§2).
- [ ] Activities include guided + self-directed components (§4).
- [ ] Assessments cover quizzes + summative + project + self-assessment (§5).
- [ ] Tutor prompts are explicit, reusable, and state the **rigor level** (§6).
- [ ] Resources span primary + supplementary texts, with clear **level tags** (§7).
- [ ] Ethical/legal considerations appear whenever topics intersect Track E or sensitive domains.
- [ ] Workload matches the stated time scope **without lowering difficulty** (shorter courses = fewer problems, not easier ones).
- [ ] Concept/Implementation/Application steps are explicit in every unit, satisfying the roadmap’s Trinity of Learning.
- [ ] Cross-track references (prereqs, follow-ons, Track E considerations) are noted so the curriculum stays integrated with the roadmap spiral.
- [ ] The curriculum, if handed to a human expert, would be judged **appropriate in difficulty and seriousness** for the declared level (IB/AP for L1; serious undergrad/grad for L2–L4).

Deliver only after every box can be checked.

---

Use this playbook every time you craft a curriculum for any `Grand_Unified_Roadmap` topic. The result should feel like a bespoke program a top research university (with hyper-competent AI tutors) would be proud to run—whether it’s a single L1 “week of awareness” or a full L4 research-style deep dive.
