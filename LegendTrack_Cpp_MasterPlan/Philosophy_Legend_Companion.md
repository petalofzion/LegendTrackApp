# Legend-Track Φ - Philosophy & Theology

---

## 1. Architecture of the Philosophy/Theology Companion

Mirror the spirit of the CS roadmap:

* Same idea of **Epochs 1–6** as “depth/complexity bands,” *not* chronological.
* Same sort of **L1–L4 depth levels** per topic:

  * L1 – survey / conceptual familiarity
  * L2 – undergrad-level competence
  * L3 – grad seminar-level mastery
  * L4 – research-level / paper-writing

Define a separate document:

> **Legend-Track Φ: Philosophy, Theology, and Systems of Thought**

with **five main tracks**:

* **Track ΦL – Logic, Language, and Foundations**
  (Frege/Russell, Gödel, Tarski, Kripke, non-classical logics, philosophy of language, philosophy of math.)

* **Track ΦM – Metaphysics, Ontology, and Theology**
  (Platonism, Neoplatonism, ancient & medieval, German Idealism, analytic metaphysics, classical & modern theology.)

* **Track ΦC – Continental & Critical Traditions**
  (Phenomenology, existentialism, German Idealism in its *continental* reception, critical theory, structuralism/post-structuralism, post-continental & speculative realism, Land, etc.)

* **Track ΦS – Science, Mind, Cybernetics, and Technology**
  (Philosophy of science, epistemology, philosophy of mind, philosophy of computation, cybernetics, systems theory, STS, philosophy of AI/tech.)

* **Track ΦH – Rhetoric, Communication, and Semio-Linguistic Arts**
  (Classical rhetoric, medieval/early-modern discourse, modern linguistics & semiotics, pragmatics, hermeneutics, argumentation theory, pedagogy, media rhetoric.)

Then, just like your CS doc:

* Each module has an ID like `ΦL-3` or `ΦM-5`.
* Inside each module: subtopics, depth target, and a **“Mirrors”** field that points into the CS roadmap (e.g. “Mirrors: E4-B: Type Systems & Formal Semantics; E5-B: Model Checking”).

You’ll then spiral between:

* “Do E4-B type systems” ↔ “Deepen ΦL-4: Gödel, completeness, incompleteness & proof theory” ↔ maybe “ΦM-2: Platonism & structuralism in math.”

---

## 2. Coverage checklist: are we being exhaustive?

Before going into detail, here’s the **coverage grid** this companion should hit:

* Logic & foundations
* Philosophy of math
* Philosophy of language
* Metaphysics & ontology
* Epistemology
* Philosophy of science
* Philosophy of mind & cognitive science
* Philosophy of religion & theology
* Ethics & political philosophy
* Aesthetics & philosophy of art (at least some presence)
* Ancient / Hellenistic / Late Antique
* Medieval (Latin, Byzantine, Islamic/Jewish strands at least nods)
* Early modern (Descartes → Kant)
* 19th c. (German Idealism, Marx, etc.)
* 20th-c analytic (Frege → Carnap, Quine, Kripke, etc.)
* 20th-c continental (phenomenology, existentialism, structuralism, etc.)
* Post-continental: speculative realism, accelerationism, OOO, media theory, STS
* Cybernetics, information, computation & AI as philosophical objects

The tracks below are designed so all of that is present somewhere and can be taken to L4.

---

## 3. Tracks & modules, with mapping to CS

### Track ΦL – Logic, Language, Foundations

This is your *mirror* to CS Track B (math/theory) and the PL/formal-methods bits of Track A.

**ΦL-1: Introductory Logic and Argument (E1–E2, L1–L2)**

* Informal logic: fallacies, argument structures.
* Basic propositional & predicate logic.
* Very light intro to soundness/completeness ideas.
  **Mirrors:**
* CS E1–E2 discrete math & “reasoning about programs”.

---

**ΦL-2: Frege, Russell, and the Birth of Analytic Logic (E2–E3, L2–L3)**

* Frege: concept-script, sense/reference, logicism.
* Russell: type theory, Russell’s paradox, “On Denoting”.
* Early set-theoretic foundations.
  **Mirrors:**
* CS: your first serious logic & set theory unit.
* Also your early PL material: variables, binding, reference vs value.

---

**ΦL-3: Formal Semantics, Model Theory, and Tarski (E3–E4, L2–L3)**

* Tarski-style truth definitions.
* Models, satisfaction, validity.
* Basic model theory: structures, homomorphisms, elementary equivalence.
  **Mirrors:**
* CS: compilers & interpreters, denotational/operational semantics, type systems.
* This is where “program as mathematical object” clicks conceptually.

---

**ΦL-4: Gödel, Completeness, Incompleteness, Proof Theory (E4, L3–L4)**

* Syntax vs semantics: completeness theorem for first-order logic.
* Gödel numbering & diagonalization.
* First and second incompleteness theorems.
* Hilbert, proof theory, the program that failed.
  **Mirrors:**
* CS:

  * Formal verification & its limits.
  * Self-hosting compilers and interpreters.
  * E4–E5-B: automata, computability, complexity.

➡️ This is one of your “anchor” answers: **Gödel sits best when you’re also doing computability, formal verification, and self-reference in CS.**

---

**ΦL-5: Modal, Temporal, and Epistemic Logic (Kripke, etc.) (E4–E5, L2–L4)**

* Kripke frames, accessibility, semantics for □ and ◇.
* Deontic, epistemic, and temporal logics.
* Applications to metaphysics (necessity), knowledge/belief, and time.
  **Mirrors:**
* CS:

  * Model checking (LTL, CTL, μ-calculus).
  * Type-and-effect systems, capability systems.
  * Distributed systems: reasoning about what agents *know* and when.

➡️ **Kripke & modal semantics line up extremely well with your E5 formal methods and distributed systems work.**

---

**ΦL-6: Non-Classical Logics and Paraconsistency (E5, L3–L4)**

* Intuitionistic logic & Curry–Howard correspondence.
* Relevance logic, many-valued logics.
* Paraconsistent logics and dialetheism (Priest etc.).
* Philosophical motivations: vagueness, inconsistency, paradox.
  **Mirrors:**
* CS:

  * Typed λ-calculus & proof assistants.
  * Designing a mini paraconsistent logic programming language (direct capstone).

➡️ Here’s your **paraconsistent programming**: implement a small interpreter or proof engine here, while reading about paraconsistency.

---

**ΦL-7: Philosophy of Mathematics and Structuralism (E4–E5, L2–L4)**

* Platonism, nominalism, structuralism about math.
* Neo-logicism revival, category-theoretic perspectives.
  **Mirrors:**
* CS: serious algebraic data types, category-flavored PL, type theory.
* Directly couples to “what kind of thing is a program/data structure?”

---

**ΦL-8: Metatheory of Computation and Foundations (E5–E6, L3–L4)**

* Computability and definability (Turing, Church, Post).
* Philosophical interpretations of Church–Turing thesis.
* Large-scale views: is the universe computable? hypercomputation debates.
  **Mirrors:**
* CS: your computability/complexity section + high-level architecture of computation itself.

---

### Track ΦM – Metaphysics, Ontology, Theology

This is where Platonism, Neoplatonism, German Idealism, and theology live. Mirrors CS math/theory, systems design, and law/ethics.

**ΦM-1: Ancient Metaphysics: Plato, Aristotle, Hellenistic Schools (E2–E3, L1–L3)**

* Plato: Forms, participation, the Good.
* Aristotle: substance, accident, potentiality/actuality, four causes.
* Stoics, Epicureans, Skeptics as alternative metaphysical shapes.
  **Mirrors:**
* CS: abstraction layers; “Form” vs “instance” as types vs objects; ontologies in knowledge representation.

➡️ **Platonism/Neoplatonism anchor here**, and you revisit them again in medieval and modern contexts.

---

**ΦM-2: Neoplatonism and Christian/Islamic/Jewish Adaptations (E3–E4, L2–L4)**

* Plotinus: the One, Nous, Soul, emanation.
* Proclus & late antique systems.
* Augustine, Pseudo-Dionysius, early Christian Neoplatonism.
* Islamic falasifa (Al-Farabi, Avicenna), Jewish philosophy (Maimonides) as rationalist–Neoplatonic fusions.
  **Mirrors:**
* CS:

  * Hierarchical models, dependency graphs, layered architectures.
  * “Emanation” as metaphor for abstraction/pipeline flows.
* Math: Platonist vs formalist readings of mathematical existence.

---

**ΦM-3: Medieval Scholastic Metaphysics and Theology (E3–E4, L2–L3)**

* Aquinas: act/potency, essence/existence, analogy of being, proofs of God.
* Debates on universals, individuation, causality.
* Natural law, participation metaphysics.
  **Mirrors:**
* CS: design of layered norms, constraints, and “law-like” invariants in systems.
* Ethics/gov track: how “natural law” vs “positive law” maps to protocol design vs policy overlays.

---

**ΦM-4: Early Modern Metaphysics and Philosophy of Religion (E3–E4, L2–L3)**

* Descartes, Spinoza, Leibniz (substance, monads, rationalist systems).
* Hume & empiricist critiques of causation.
* Early philosophy of religion (ontological & cosmological arguments, problem of evil).
  **Mirrors:**
* CS:

  * Deterministic vs probabilistic systems.
  * State vs event ontology (Spinoza’s single substance vs microservice swarms…).

---

**ΦM-5: German Idealism and Its Metaphysics (E4–E5, L3–L4)**

* Kant: transcendental idealism, synthetic a priori, conditions of experience.
* Fichte, Schelling, Hegel: system, Spirit, dialectical development.
  **Mirrors:**
* CS:

  * Complex state systems where categories/structures are themselves evolving.
  * Self-interpreting systems (compilers compiling themselves, bootstrapping interpreters).

➡️ **German Idealism is best paired with your mid/advanced systems + architecture work**, when you can feel “system-of-systems” and recursive self-structure.

---

**ΦM-6: Contemporary Analytic Metaphysics (E4–E6, L2–L4)**

* Grounding, dependence, mereology, properties, universals.
* Metaphysics of time (presentism, eternalism) and modality (Lewis, Plantinga, etc.).
* Metaphysics of laws, causation, dispositions.
  **Mirrors:**
* CS:

  * Causality in distributed systems, event sourcing.
  * Specifying “what really exists” in a system: resources, capabilities, processes.

---

**ΦM-7: Systematic Theology & Philosophy of Religion (E3–E6, L1–L4)**
Split into submodules if needed, but at this level:

* Doctrine of God: classical theism, theistic personalism, attributes, Trinity.
* Creation, providence, freedom, grace, problem of evil.
* Revelation, faith/reason, miracles.
* Modern theology interactions with science and secular thought.
  **Mirrors:**
* CS & Law/Gov: authority structures, normativity, “source of rules.”
* Ethics & AI: imaging moral order and telos into algorithmic systems.

---

### Track ΦC – Continental Traditions & Critical Theory

This is the mirror for your large-scale systems, networks, institutions, and governance. It gives you conceptual tools for power, subjectivity, and historical structure.

**ΦC-1: Phenomenology (E3–E4, L2–L3)**

* Husserl: intentionality, noesis/noema, epoché.
* Heidegger: being-in-the-world, equipment, technology as enframing.
* Merleau-Ponty: embodied perception.
  **Mirrors:**
* CS: human–computer interaction, UX, embodiment in robotics, “ready-to-hand” vs “present-at-hand” tools.

---

**ΦC-2: Existentialism and Hermeneutics (E3–E4, L1–L3)**

* Kierkegaard, Nietzsche, Sartre, de Beauvoir.
* Gadamer, Ricoeur: interpretation, tradition, narrative.
  **Mirrors:**
* CS: error, failure, decision under uncertainty, meaning-making in socio-technical systems.

---

**ΦC-3: Marxism and Critical Theory (E3–E5, L2–L4)**

* Marx: capital, alienation, commodity fetishism.
* Frankfurt School: Adorno, Horkheimer, Marcuse.
* Later critical theory: Habermas, Honneth.
  **Mirrors:**
* CS: critique of platforms, labor in software development, “who benefits from this system?”

---

**ΦC-4: Structuralism and Post-Structuralism (E4–E5, L2–L4)**

* Saussure, Lévi-Strauss.
* Foucault: power/knowledge, discipline, biopolitics, governmentality.
* Derrida: deconstruction, différance.
  **Mirrors:**
* CS:

  * Protocols and standards as “structures” that shape behavior.
  * Surveillance, logging, and observability as disciplinary technologies.
  * APIs as sign-systems and differences.

---

**ΦC-5: Postmodernism and Deconstruction (E4–E5, L2–L3)**

* Lyotard, Baudrillard, postmodern critique of meta-narratives, simulation and hyperreality.
  **Mirrors:**
* CS: simulations, virtual environments, media systems, deepfakes and representational crisis.

---

**ΦC-6: Post-Continental Currents & Speculative Realism (E5–E6, L3–L4)**

* Meillassoux, Brassier, Harman, Negarestani, object-oriented ontology, correlationism critique.
* Media and technology theory (Kittler, Stiegler, etc.).
  **Mirrors:**
* CS:

  * Systems and infrastructures as quasi-autonomous objects.
  * Materiality of computation (hardware, cables, data centers).

---

**ΦC-7: Accelerationism and Nick Land (E5–E6, L3–L4)**

* Land’s cybernetic capitalism and meltdown.
* Left/right accelerationism debates.
* Connections to technocapitalist dynamics and AI.
  **Mirrors:**
* CS:

  * RL and feedback-driven systems that “optimize themselves.”
  * Financial algorithms, high-frequency trading, runaway feedback in networks.

➡️ **Land & accelerationism map cleanly onto your most advanced modules on distributed systems, RL, and system governance**—when you can see feedback loops in detail.

---

### Track ΦS – Science, Mind, Cybernetics, Technology

This track hooks into *almost all* of your CS tracks and will be the bridge to a future Physics/Engineering companion.

**ΦS-1: Epistemology and Justification (E2–E3, L1–L3)**

* Classical analysis of knowledge (JTB), Gettier, reliabilism, virtue epistemology.
* Skepticism, sources of knowledge (perception, memory, testimony).
  **Mirrors:**
* CS: trust in data, reliability of sensors/logs, epistemic uncertainty in systems.

---

**ΦS-2: Philosophy of Science (E3–E4, L2–L3)**

* Hempel, Popper, Kuhn, Lakatos, Feyerabend.
* Models, laws, explanation.
  **Mirrors:**
* CS: experiment design, benchmarking, evaluation of systems and models.

---

**ΦS-3: Philosophy of Probability and Statistics (E3–E4, L2–L3)**

* Frequentist vs Bayesian interpretations.
* Induction, confirmation, decision theory.
  **Mirrors:**
* CS: machine learning, RL, statistical inference modules.

---

**ΦS-4: Philosophy of Mind and Cognitive Science (E3–E5, L2–L4)**

* Dualism, physicalism, functionalism.
* Representation, intentionality, consciousness.
* Extended mind, embodied cognition, enactivism.
  **Mirrors:**
* CS: AI, agent models, robotics, human–AI interaction.

---

**ΦS-5: Philosophy of Information and Computation (E3–E5, L2–L4)**

* Floridi-style information ontology.
* Is the universe digital? analog? pancomputationalism.
* Information, entropy, and complexity.
  **Mirrors:**
* CS: info theory, compression, algorithmic complexity, network design.

---

**ΦS-6: Cybernetics and Systems Theory (E3–E5, L2–L4)**

* First-order cybernetics (Wiener, Ashby): feedback, control, homeostasis.
* Second-order cybernetics (von Foerster, Maturana/Varela): observer, self-reference.
* Luhmann’s systems theory: communication systems, social systems as autopoietic.
  **Mirrors:**
* CS: control theory, RL, distributed systems’ feedback loops, microservice/ecosystem modelling.

➡️ **This is where you attach Land & speculative realists later**, once the cybernetic base is there.

---

**ΦS-7: STS, Media, and Technology Studies (E4–E6, L2–L4)**

* Actor-network theory (Latour), SCOT, infrastructure studies.
* Media theory: McLuhan, Kittler, Stiegler.
  **Mirrors:**
* CS: networking, internet history, protocol design, cloud/infrastructure as socio-technical systems.

---

**ΦS-8: Philosophy of AI and Emerging Tech (E4–E6, L2–L4)**

* Classic AI debates: symbol vs connectionism, strong AI, alignment.
* Ethics of AI, surveillance, autonomy, responsibility.
  **Mirrors:**
* CS: your RL/AI systems, distributed decision-making, security & policy.

---

### Track ΦH – Rhetoric, Communication, and Semio-Linguistic Arts

This track keeps the “legend” skillset communicative, tying persuasion, meaning-making, and language craft back to your technical and philosophical work.

**ΦH-1: Classical Rhetoric & Oratory (E1–E3, L1–L3)**

* Sophists, Aristotle’s *Rhetoric*, Isocrates, Cicero, Quintilian, the progymnasmata.
* Invention, arrangement, style, memory, delivery; ethos/pathos/logos.
  **Mirrors:**
* CS: design docs, architecture reviews, persuasive pitches for systems choices.
* Track C (CS) presentation skills; Track E law/policy advocacy.

---

**ΦH-2: Patristic, Medieval, and Scholastic Discourse (E2–E4, L2–L3)**

* Augustine, Chrysostom, Aquinas, Bernard of Clairvaux, Islamic khutbah traditions.
* Sermon structures, disputatio, scholastic quaestio method, lectio divina as interpretive/rhetorical practice.
  **Mirrors:**
* CS: structured debates, RFC reviews, policy deliberations.
* Track ΦM theology modules; Track E governance/ethics argumentation.

---

**ΦH-3: Renaissance Humanism & Early-Modern Rhetoric (E3–E4, L2–L3)**

* Petrarch, Erasmus, Bacon, Blair; rhetoric vs dialectic; civic humanism.
* Scientific prose emerging from rhetorical craft.
  **Mirrors:**
* CS: technical writing for research, bridging empirical findings with persuasive framing.
* Track ΦS philosophy of science & experimental reporting.

---

**ΦH-4: Modern Linguistics & Semiotics (E3–E5, L2–L4)**

* Saussurean structural linguistics, Peircean semiotics, Jakobson’s communication model.
* Barthes, Eco, structuralist semiology; signifier/signified, codes, mythologies.
  **Mirrors:**
* CS: language design, protocol semantics, UX/content design.
* Track ΦC structuralism/post-structuralism; Track ΦL philosophy of language.

---

**ΦH-5: Pragmatics, Speech-Act Theory, and Discourse Analysis (E4–E5, L2–L4)**

* Austin, Searle, Grice, Stalnaker, Habermas; implicature, performatives, deliberative discourse.
* Conversation analysis, critical discourse analysis, rhetoric of science/tech.
  **Mirrors:**
* CS: API/contract communication, collaborative tooling, human-in-the-loop systems.
* Track C (CS) collaboration & leadership topics; Track ΦS epistemology.

---

**ΦH-6: Hermeneutics, Deconstruction, and Rhetoric of Interpretation (E4–E5, L2–L4)**

* Gadamer, Ricoeur, Derrida, Kristeva; interpretation, différance, intertextuality.
* Rhetoric of reading, writing, and code-commentary analogies.
  **Mirrors:**
* CS: interpreting legacy systems, reverse engineering, narrative design for documentation.
* Track ΦC structuralism/postmodernism.

---

**ΦH-7: Argumentation Theory & Technical Communication (E3–E6, L2–L4)**

* Toulmin model, Perelman/Olbrechts-Tyteca, modern informal logic, debate tactics.
* Technical presentation design, pedagogy, teaching-as-rhetoric, knowledge transfer.
  **Mirrors:**
* CS: design reviews, incident postmortems, mentorship, teaching internal workshops.
* Track C (CS) human factors; Track ΦS philosophy of science communication.

---

**ΦH-8: Media Rhetoric, Digital Semiosis, and Multimodal Expression (E4–E6, L2–L4)**

* McLuhan, Kittler, Lanham, digital rhetoric, multimodal composition, visual rhetoric.
* Narrative framing for AI/ML models, dashboards, and simulation demos.
  **Mirrors:**
* CS: HCI, visualization, storytelling in data/observability tools, persuasive dashboards.
* Track ΦS media/STS modules; Track ΦC media theory & postmodernism.

---

### Track ΦE – Ethics, Politics, Law, and Society

**ΦE-1: Normative Ethics (E2–E4, L1–L3)**

* Consequentialism, deontology, virtue ethics, contractualism, pluralist frameworks.
  **Mirrors:**
* CS/Π Track E governance topics, Track ΦM metaphysical grounding of value.

---

**ΦE-2: Metaethics & Moral Psychology (E3–E5, L2–L4)**

* Moral realism vs anti-realism, expressivism, error theory, reasons, motivation, moral psychology.
  **Mirrors:**
* CS Track E (law/policy), ΦS epistemology, AI alignment debates.

---

**ΦE-3: Political Philosophy & Social Contract Traditions (E2–E5, L2–L4)**

* Hobbes, Locke, Rousseau, Mill, Rawls, Nozick, Marx, anarchism, democratic theory.
  **Mirrors:**
* CS Track C leadership/governance, Π systems engineering & policy, ΦC critical theory.

---

**ΦE-4: Philosophy of Law & Legal Theory (E3–E5, L2–L4)**

* Natural law, legal positivism, interpretivism, rights, punishment, jurisprudence.
  **Mirrors:**
* Track E (CS) compliance, Track Π systems reliability/regulation.

---

**ΦE-5: Social & Critical Theories of Power and Justice (E3–E5, L2–L4)**

* Critical race theory, feminist political philosophy, postcolonial thought, intersectionality.
  **Mirrors:**
* ΦC structuralism/critical theory, CS/Π social impact assessments.

---

### Track ΦA – Aesthetics & Philosophy of Art

**ΦA-1: Classical & Enlightenment Aesthetics (E2–E4, L1–L3)**

* Plato, Aristotle, Plotinus, Kant, Hume, Schiller—beauty, sublimity, mimesis.
  **Mirrors:**
* Design aesthetics in CS/Π, rhetoric Track ΦH, cultural grounding for UX.

---

**ΦA-2: Modern & Contemporary Aesthetic Theory (E3–E5, L2–L4)**

* Nietzsche, Benjamin, Adorno, Danto, analytic aesthetics, phenomenology of art.
  **Mirrors:**
* ΦC continental traditions, media theory, CS visualization/storytelling.

---

**ΦA-3: Digital, Media, and Performance Aesthetics (E3–E5, L2–L3)**

* Media theory, digital art, interactive installations, ludology.
  **Mirrors:**
* CS HCI/UX, Π visualization, ΦH media rhetoric.

---

### Track ΦW – Global Philosophical Traditions

**ΦW-1: Indian Philosophical Traditions (E2–E5, L1–L4)**

* Vedic/Upanishadic thought, Vedanta schools, Buddhism, Jainism, Nyaya, Samkhya.
  **Mirrors:**
* ΦM metaphysics/theology, ΦE ethics, meditation/cognitive science bridges.

---

**ΦW-2: Chinese Philosophy (E2–E5, L1–L3)**

* Confucianism, Daoism, Mohism, Legalism, Neo-Confucianism.
  **Mirrors:**
* Governance models, ethics, systems thinking analogies.

---

**ΦW-3: Islamic, Jewish, and Other Medieval Traditions (E2–E5, L1–L3)**

* Kalam, falasifa, Kabbalah, medieval Jewish/Islamic rationalism/mysticism.
  **Mirrors:**
* ΦM medieval metaphysics, Track ΦE legal thought.

---

**ΦW-4: African, Indigenous, and Latin American Philosophies (E2–E5, L1–L3)**

* Ubuntu, Akan thought, indigenous cosmologies, decolonial and liberation philosophies.
  **Mirrors:**
* ΦE social justice, ΦC postcolonial theory, CS/Π social impact frameworks.

---

### Track ΦX – Applied & Emerging Fields

**ΦX-1: Bioethics & Medical Ethics (E3–E5, L2–L4)**

* Clinical decision-making, research ethics, autonomy/consent, technology and life sciences.
  **Mirrors:**
* Π bioengineering modules, CS Track E (law/policy), ΦE normative theory.

---

**ΦX-2: Environmental Philosophy & Ethics (E3–E5, L2–L4)**

* Deep ecology, sustainability ethics, anthropocene critiques, climate justice.
  **Mirrors:**
* Π earth/climate systems, CS sustainability considerations, ΦE political theory.

---

**ΦX-3: Philosophy of Education & Pedagogy (E2–E4, L1–L3)**

* Dewey, Freire, Montessori, critical pedagogy, instructional design philosophy.
  **Mirrors:**
* Track ΦH rhetoric, CS/Π mentorship & systems education.

---

**ΦX-4: Feminist, Queer, and Gender Philosophy (E3–E5, L2–L4)**

* Beauvoir, Butler, Crenshaw, Ahmed, queer theory, intersectional frameworks.
  **Mirrors:**
* ΦE social justice modules, ΦC critical theory, CS/Π diversity and bias considerations.

---

**ΦX-5: Philosophy of Race & Decolonial Thought (E3–E5, L2–L4)**

* Du Bois, Fanon, Wynter, Lugones, decolonial epistemologies.
  **Mirrors:**
* ΦC postcolonial, ΦE social justice, CS/Π global governance.

---

**ΦX-6: Experimental Philosophy & Social Epistemology (E3–E5, L2–L3)**

* X-phi methods, testimony, epistemic injustice, collective deliberation.
  **Mirrors:**
* ΦS epistemology, CS/Π human-in-the-loop systems, data ethics.

---

## Optional Specialization Constellations (Pick When Ready)

Once the core tracks are in motion, you can branch into highly specialized philosophical constellations. Keep these on your radar for future deep dives:

* **Higher Category Theory & Structural Realism in Foundations**
  (Infinity-categorical logic, structuralist metaphysics.)
* **Noncommutative Geometry & Philosophy of Space**
  (Ontological implications of Connes-style geometry, links to physics.)
* **Advanced Continental Niches**
  (Laruelle’s non-philosophy, Stiegler’s technics, contemporary accelerationist offshoots.)
* **Hermeneutics & Textual Traditions at Research Depth**
  (Detailed exegetical schools—patristic, rabbinic, Islamic, etc.)
* **Post-Secular Theology & Comparative Theology**
  (Interfaith synthesis, radical orthodoxy, new metaphysics of religion.)
* **Phenomenology of Technology & Media Theory Frontiers**
  (Media archaeology, simulation realism, VR phenomenology.)
* **Critical Algorithm Studies & Data Justice**
  (Emerging intersections of ethics, critical theory, and AI governance.)
* **Political Ideology Special Topics (Full Spectrum)**
  (Conservative/right-wing intellectual traditions—Spengler, Evola, Schmitt, elite theory, fascist/authoritarian philosophies—studied analytically alongside other currents.)
* **Anarchist & Libertarian Thought**
  (Godwin, Proudhon, Bakunin, Kropotkin, Stirner, Goldman, contemporary libertarianism/classical liberalism and their systems critiques.)
* **Marxism, Gramsci, Liberation Theology & Radical Traditions**
  (Orthodox Marxism, Western Marxism, Gramsci’s hegemony/prison notebooks, Latin American liberation theology, Black liberation theology, Marxist-feminist syntheses.)
* **Catholic Intellectual Traditions**
  (Scholastic revivals, integralism, modern Catholic social teaching, ressourcement, neo-Thomism, contrasting post–Vatican II trajectories.)
* **Philosophy of Neuroscience & Consciousness Studies**
  (Integrated information theory, predictive processing, qualia debates.)
* **Rhetoric & Narrative Theory Advanced Modules**
  (Performativity, speech-act micro-analysis, computational narratology.)
* **Political Theology & Legal Philosophy Special Topics**
  (Sovereignty, emergency power, biopolitical law, constitutional metaphysics.)

These sit at the edges of the map—note them so you can chase them later without losing the thread.
## 4. Explicit answers to the “where do X go?” questions

Let’s hit your named examples straight:

* **Platonism & Neoplatonism**

  * Core in ΦM-1 & ΦM-2; revisited in ΦL-7 (philosophy of math).
  * Pair with CS when you:

    * Start taking math abstraction seriously (E2-B).
    * Do info theory & high-level system abstraction (E3-B/C).

* **Frege / Russell**

  * ΦL-2 as soon as you do proper predicate logic & set theory in CS (E2–E3).
  * Mirror with early PL & type system notions: variables, reference, naming.

* **German Idealism**

  * ΦM-5, starting once you’ve built a mental feel for non-trivial system complexity (OS, networks, distributed systems).
  * It maps onto self-developing, recursively structured systems: compilers, interpreters, layered architectures.

* **Gödel**

  * ΦL-4 tightly coupled to computability + verification + self-hosting compilers (E4).
  * Conceptual take: any system powerful enough to represent its own syntax will have true-but-unprovable statements.

* **Modal semantics & Kripke**

  * ΦL-5 in sync with model checking, temporal logic, and epistemic reasoning in distributed systems (E4–E5).
  * You can literally treat program states or nodes in a distributed system as “worlds” in Kripke frames.

* **Programming in paraconsistent logics**

  * ΦL-6 with a cross-link to CS advanced PL/formal methods (E5).
  * Capstone idea: implement a small paraconsistent logic language and write a philosophical reflection on what it means to tolerate contradictions.

* **Nick Land, post-continental theorists, speculative realists**

  * Land in ΦC-7; speculative realism & OOO in ΦC-6.
  * Put them *late* (E5–E6), when:

    * Your cybernetics & systems theory (ΦS-6) is solid.
    * You’ve built and reasoned about complex feedback-driven systems (RL, distributed infra).

---

## 5. Where does Physics go?

Given the structure above:

* Philosophy/theology in this companion is already full-spectrum and heavy.
* A serious **Physics/Engineering super-curriculum** (mechanics, EM, QM, QFT, stat mech, GR, plus engineering disciplines) deserves its **own** Legend-Track, just like CS and Φ.

Best arrangement:

* **Keep this doc purely Philosophy/Theology.**
* Make a third companion: **Legend-Track Π: Physics and Engineering** with its own tracks (Theoretical Physics, Applied Physics/Engineering, Numerical Methods, etc.).
* Bridge them via:

  * ΦS-5/ΦS-2 (philosophy of science, information) ↔ physics track.
  * ΦM-6 (metaphysics of time, causality) ↔ relativity/quantum topics in physics track.
  * Ethics/gov tracks ↔ engineering safety, risk, reliability.

That gives you a **triangle**:

* CS / Systems – what we *build*.
* Philosophy/Theology – what it *means* and how we *understand/justify* it.
* Physics/Engineering – what the *world is like* and how we model/intervene in it.

---

This layout should be “Legend Track” level: every major philosophical/theological tradition has a home, every subfield can be taken to L4, and almost every major CS cluster has a conceptual mirror clearly marked. From here you can start writing the concrete topic-entries (IDs, outcomes, reading clusters, and projects) the same way you did for C++/systems—just now the projects might be “write a paper”, “build a toy logic language”, or “do a comparative conceptual analysis of two system architectures and two metaphysical frameworks.”
