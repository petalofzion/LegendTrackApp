Alright, time to unleash Legend-Track Π.
This is the “I want literally *all* the math, physics, and engineering” map, not a cute minor.

I’ll give you:

* The overall **shape** (epochs, depth levels, tracks).
* A **big topic map**: IDs, names, where they sit, and what they’re for.
* Enough structure that you can zoom in later and write proper curricula per topic, just like the CS track.

---

## 0. Legend-Track Π: Overview

**Name:** **Legend-Track Π: Pure Math, Physics, and Engineering**
**Goal:** From zero → capable of reading research papers and doing postgrad-level work in pure math, theoretical physics, and “real” engineering (mechanical/structural/fluids/control/etc.).

You’ll eventually have **three grand tracks** in your life:

* CS Legend Track (systems/PL/infra)
* Φ Legend Track (philosophy/theology/logic/metaphysics)
* Π Legend Track (math/physics/engineering)

They cross-link, but each stands on its own.

### Epochs (same idea as CS)

Epochs are **bands of conceptual maturity**, not years:

* **E1 – Foundations & Intuition**
* **E2 – Solid Undergrad Core**
* **E3 – Deep Undergrad / Early Grad**
* **E4 – Graduate Core**
* **E5 – Advanced Grad / Early Research**
* **E6 – Research Frontier / Postdoc-ish**

### Depth levels (L1–L4, same as CS)

Per topic:

* **L1:** Survey familiarity
* **L2:** Can solve normal textbook problems
* **L3:** Can read serious texts / grad courses
* **L4:** Can read/understand research and write expository work

---

## 1. Math Core

Math is the **spine** of Π. Physics and engineering hang off it via clear prerequisites.

### 1.1 Track M-AN – Analysis & Topology

**M-AN-1 – Foundations: Precalculus & Single-Variable Calculus**

* **Epoch:** E1
* **Depth target:** L2
* Limits, derivatives, integrals, Taylor series, basic differential equations.
* Focus on intuition, but already nudging toward proof.
* **Prereqs:** High-school algebra.
* **Feeds:** M-AN-2, M-AP-1, PHY-C-1, ENG-M-1.

---

**M-AN-2 – Multivariable & Vector Calculus**

* **Epoch:** E1–E2
* **Depth:** L2
* Partial derivatives, gradients, multiple integrals, line/surface integrals, Green/Gauss/Stokes.
* **Prereqs:** M-AN-1.
* **Feeds:** M-AP-1/2, M-GD-2, PHY-C-1/2, PHY-F-1, ENG-F-1, ENG-C-1.

---

**M-AN-3 – Intro Real Analysis (ℝ)**

* **Epoch:** E2
* **Depth:** L2–L3
* Rigorous treatment of limits, continuity, sequences, series, differentiation, Riemann integration.
* Epsilon–delta, completeness of ℝ.
* **Prereqs:** M-AN-2, basic proofs.
* **Feeds:** M-AN-4, M-AN-7, M-AP-2, deeper physics.

---

**M-AN-4 – Measure Theory & Lebesgue Integration**

* **Epoch:** E3–E4
* **Depth:** L3
* Sigma-algebras, measures, Lebesgue integral, convergence theorems.
* **Prereqs:** M-AN-3.
* **Feeds:** M-P-2, M-AN-6, functional analysis, probability theory, QFT/stat mech.

---

**M-AN-5 – Metric & Topological Spaces (Point-Set Topology)**

* **Epoch:** E3–E4
* **Depth:** L3
* Metrics, open/closed sets, continuity, compactness, connectedness, product and quotient spaces.
* **Prereqs:** M-AN-3.
* **Feeds:** M-GD, functional analysis, modern physics spaces.

---

**M-AN-6 – Functional Analysis I (Banach Spaces)**

* **Epoch:** E4
* **Depth:** L3–L4
* Normed/Banach spaces, bounded linear operators, Hahn–Banach, Banach–Steinhaus, open mapping/closed graph.
* **Prereqs:** M-AN-4, some linear algebra depth.
* **Feeds:** PDE, QM, numerical analysis, control theory.

---

**M-AN-7 – Functional Analysis II (Hilbert Spaces & Operators)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Inner product spaces, orthonormal bases, spectral theorem, unbounded operators basics.
* **Prereqs:** M-AN-6.
* **Feeds:** QM, QFT, signal processing, control.

---

**M-AN-8 – Complex Analysis**

* **Epoch:** E3–E4
* **Depth:** L3
* Holomorphic functions, Cauchy’s theorem, residues, conformal maps, analytic continuation.
* **Prereqs:** M-AN-3.
* **Feeds:** fluid dynamics (potential flow), QFT, analytic number theory.

---

**M-AN-9 – Advanced Analysis / Distributions / Sobolev Spaces**

* **Epoch:** E5
* **Depth:** L4
* Schwartz distributions, Sobolev spaces, embedding theorems, variational formulations.
* **Prereqs:** M-AN-6, M-AP-2.
* **Feeds:** modern PDE, elasticity, GR, advanced physics.

---

### 1.2 Track M-A – Algebra & Number Theory

**M-A-1 – Linear Algebra: Deep Version**

* **Epoch:** E1–E2
* **Depth:** L2–L3
* Vector spaces, linear maps, eigenvalues/eigenvectors, spectral theorem, Jordan forms.
* **Prereqs:** basic algebra.
* **Feeds:** basically everything.

---

**M-A-2 – Elementary Number Theory**

* **Epoch:** E1–E2
* **Depth:** L2
* Divisibility, primes, congruences, Chinese remainder, multiplicative functions.
* **Prereqs:** high-school algebra.
* **Feeds:** cryptography, algebra, analytic NT (optional).

---

**M-A-3 – Abstract Algebra I (Groups)**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* Groups, homomorphisms, quotient groups, isomorphism theorems, group actions.
* **Prereqs:** M-A-1, basic proof skills.
* **Feeds:** symmetry in physics, representation theory, advanced geometry.

---

**M-A-4 – Abstract Algebra II (Rings, Fields, Modules)**

* **Epoch:** E3
* **Depth:** L3
* Rings/ideals, modules, PID, field extensions.
* **Prereqs:** M-A-3.
* **Feeds:** Galois theory, algebraic number theory, algebraic geometry.

---

**M-A-5 – Galois Theory**

* **Epoch:** E3–E4
* **Depth:** L3–L4
* Field extensions, splitting fields, solvability by radicals, fundamental theorem of Galois theory.
* **Prereqs:** M-A-4.
* **Feeds:** conceptual firepower, cryptic joy; not strictly needed for physics but huge for pure math maturity.

---

**M-A-6 – Representation Theory (Finite Groups & Lie Algebras intro)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Group representations, characters, basic Lie algebras.
* **Prereqs:** M-A-3, M-AN-1, some M-GD.
* **Feeds:** particle physics, condensed matter, symmetry methods.

---

**M-A-7 – Algebraic Number Theory**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Number fields, rings of integers, ideals, class groups, local fields (maybe).
* **Prereqs:** M-A-4, M-AN-4 helpful.
* **Feeds:** advanced crypto, pure math.

---

**M-A-8 – Commutative Algebra & Intro Algebraic Geometry**

* **Epoch:** E5–E6
* **Depth:** L3–L4
* Noetherian rings, primary decomposition, spectra of rings, affine varieties.
* **Prereqs:** M-A-4, M-A-6.
* **Feeds:** geometric approaches, gauge theories, stringy physics (if you go there).

---

### 1.3 Track M-GD – Geometry & Differential Geometry

**M-GD-1 – Classical Euclidean & Affine Geometry**

* **Epoch:** E1–E2
* **Depth:** L1–L2
* Coordinate geometry, conics, transformations, basic symmetry.
* **Prereqs:** M-A-1, M-AN-1.
* **Feeds:** mechanics, optics, graphics.

---

**M-GD-2 – Vector Calculus & Differential Geometry Lite**

* **Epoch:** E2
* **Depth:** L2
* Curves, surfaces in ℝ³, curvature, Frenet–Serret, surface integrals.
* **Prereqs:** M-AN-2.
* **Feeds:** PHY-C-2, ENG-F-2, M-GD-3.

---

**M-GD-3 – Manifolds & Differential Forms**

* **Epoch:** E3–E4
* **Depth:** L3
* Smooth manifolds, tangent bundles, differential forms, integrals, Stokes theorem in full glory.
* **Prereqs:** M-AN-3, M-GD-2.
* **Feeds:** GR, advanced mechanics, gauge theories.

---

**M-GD-4 – Riemannian Geometry**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Metrics, connections, geodesics, curvature, comparison theorems.
* **Prereqs:** M-GD-3.
* **Feeds:** GR, advanced geometry, geometric analysis.

---

**M-GD-5 – Lie Groups & Lie Algebras**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Lie groups, Lie algebras, exponential map, representation basics.
* **Prereqs:** M-A-3, M-GD-3.
* **Feeds:** particle physics, QFT, symmetry in mechanics.

---

**M-GD-6 – Symplectic & Hamiltonian Geometry**

* **Epoch:** E5
* **Depth:** L3–L4
* Symplectic manifolds, canonical transformations, moment maps.
* **Prereqs:** M-GD-3, M-AN-6.
* **Feeds:** Hamiltonian mechanics, integrable systems, advanced classical/quantum physics.

---

### 1.4 Track M-P – Probability & Stochastic Processes

**M-P-1 – Probability Theory (Elementary)**

* **Epoch:** E2
* **Depth:** L2
* Random variables, distributions, expectation, variance, common distributions, LLN/CLT at heuristic level.
* **Prereqs:** M-AN-1, basic combinatorics.
* **Feeds:** basic stats, random processes, ML.

---

**M-P-2 – Measure-Theoretic Probability**

* **Epoch:** E3–E4
* **Depth:** L3
* Probability spaces, random variables as measurable functions, expectation as integral, convergence theorems.
* **Prereqs:** M-AN-4.
* **Feeds:** M-P-3–6, rigorous stat mech, stochastic analysis.

---

**M-P-3 – Limit Theorems & Large Deviations**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* LLN, CLT, laws of large numbers, large deviations, concentration inequalities.
* **Prereqs:** M-P-2.
* **Feeds:** stat mech, information theory, high-dimensional probability.

---

**M-P-4 – Stochastic Processes I (Discrete-Time)**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Markov chains, branching processes, martingales (discrete).
* **Prereqs:** M-P-1, M-AN-3.
* **Feeds:** queueing theory, control, RL.

---

**M-P-5 – Stochastic Processes II (Continuous-Time & Brownian Motion)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Continuous-time Markov processes, Brownian motion, continuous martingales.
* **Prereqs:** M-P-2, some M-AN-6 helpful.
* **Feeds:** SDEs, financial math, diffusion in physics.

---

**M-P-6 – Stochastic Calculus & SDEs**

* **Epoch:** E5
* **Depth:** L3–L4
* Ito calculus, SDEs, Fokker–Planck equations.
* **Prereqs:** M-P-5, M-AN-6.
* **Feeds:** stochastic control, noise modeling in physics/engineering.

---

**M-P-7 – Mathematical Statistics & Decision Theory**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Estimation, hypothesis testing, confidence intervals, Bayesian vs frequentist views.
* **Prereqs:** M-P-1.
* **Feeds:** ML, engineering reliability, experimental design.

---

### 1.5 Track M-AP – Applied Math, PDE, Dynamical Systems, Numerics

**M-AP-1 – Ordinary Differential Equations (Theory & Methods)**

* **Epoch:** E2
* **Depth:** L2–L3
* Existence/uniqueness, linear systems, phase plane, qualitative behaviour.
* **Prereqs:** M-AN-2.
* **Feeds:** all of physics and engineering.

---

**M-AP-2 – Partial Differential Equations I (Classical)**

* **Epoch:** E3
* **Depth:** L2–L3
* Heat, wave, Laplace equations; separation of variables, Fourier series, Green’s functions.
* **Prereqs:** M-AP-1, M-AN-3.
* **Feeds:** continuum mechanics, EM, QM, fluids.

---

**M-AP-3 – Partial Differential Equations II (Advanced)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Weak solutions, Sobolev spaces, elliptic/parabolic/hyperbolic theory.
* **Prereqs:** M-AN-9, M-AP-2.
* **Feeds:** advanced physics, elasticity, GR, numerical PDE.

---

**M-AP-4 – Numerical Linear Algebra**

* **Epoch:** E3
* **Depth:** L2–L3
* Conditioning, factorizations, iterative methods, eigenvalue problems.
* **Prereqs:** M-A-1, M-AN-1.
* **Feeds:** HPC, simulation, control, finite elements.

---

**M-AP-5 – Numerical ODE/PDE & Scientific Computing**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Time-stepping schemes, stability, consistency, finite difference/volume, basics of FEM.
* **Prereqs:** M-AP-1, M-AP-2, M-AP-4.
* **Feeds:** engineering simulation, CFD, climate models.

---

**M-AP-6 – Optimization I (Convex)**

* **Epoch:** E3
* **Depth:** L2–L3
* Convex sets/functions, duality, gradient methods.
* **Prereqs:** M-AN-3, M-A-1.
* **Feeds:** ML, control, design optimization.

---

**M-AP-7 – Optimization II (Nonconvex, Variational Methods)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Calculus of variations, nonconvex landscapes, saddle-point methods.
* **Prereqs:** M-AP-6, some M-AN-6.
* **Feeds:** advanced ML, physics variational principles, inverse problems.

---

**M-AP-8 – Dynamical Systems & Chaos**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Fixed points, bifurcations, attractors, chaos, strange attractors, Lyapunov exponents.
* **Prereqs:** M-AP-1, M-AN-3.
* **Feeds:** control, climate, population dynamics, nonlinear circuits, turbulence intuition.

---

### 1.6 Track M-CAT – Category Theory & Higher Structures (optional but powerful)

**M-CAT-1 – Basic Category Theory**

* **Epoch:** E4
* **Depth:** L2–L3
* Categories, functors, natural transformations, limits/colimits, adjunctions.
* **Prereqs:** comfort with algebra & topology.
* **Feeds:** advanced algebra, type theory, theoretical physics formalisms.

---

**M-CAT-2 – Monoidal Categories & Applications**

* **Epoch:** E5
* **Depth:** L3–L4
* Monoidal/closed categories, enriched categories, string diagrams.
* **Prereqs:** M-CAT-1.
* **Feeds:** QFT, quantum information, PL semantics, topological phases.

---

**M-CAT-3 – Topos/Higher Categories (Optional Frontier)**

* **Epoch:** E6
* **Depth:** L4
* Topoi, higher categories, infinity-categories (sketch level).
* **Prereqs:** M-CAT-2, M-GD, M-AN-5.
* **Feeds:** cutting-edge math/physics and hardcore PL.

---

### 1.7 Track M-LOG – Mathematical Logic & Foundations

**M-LOG-1 – Set Theory I (ZFC Foundations)**

* **Epoch:** E3
* **Depth:** L2–L3
* Axioms of ZFC, ordinals/cardinals, transfinite induction, basic combinatorial principles (CH/GCH statements at survey level).
* **Prereqs:** M-AN-3, proof maturity.
* **Feeds:** model theory, recursion theory, philosophy of math cross-links.

---

**M-LOG-2 – Set Theory II (Forcing & Large Cardinals)**

* **Epoch:** E5
* **Depth:** L3–L4
* Constructible universe L, forcing method, independence results, large cardinals (survey depth).
* **Prereqs:** M-LOG-1.
* **Feeds:** frontier foundations, links to ΦL philosophy track.

---

**M-LOG-3 – Model Theory (Mathematical Perspective)**

* **Epoch:** E4–E5
* **Depth:** L3
* Structures, theories, compactness, types, quantifier elimination, stability (intro).
* **Prereqs:** M-LOG-1, M-A-3 helpful.
* **Feeds:** algebraic geometry, number theory, differential equations, logic/CS crossovers.

---

**M-LOG-4 – Recursion/Computability Theory**

* **Epoch:** E4
* **Depth:** L2–L3
* Turing degrees, r.e. sets, arithmetical hierarchy, descriptive set theory glimpses.
* **Prereqs:** M-AN-3, some CS logic background.
* **Feeds:** computability/complexity bridges, philosophy of computation.

---

### 1.8 Track M-DIS – Discrete Math & Combinatorics

**M-DIS-1 – Enumerative & Bijective Combinatorics**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* Generating functions, recurrence solving, inclusion–exclusion, bijective proofs.
* **Prereqs:** M-A-1, M-P-1 helpful.
* **Feeds:** algorithms, probability, analytic combinatorics.

---

**M-DIS-2 – Graph Theory I (Structure & Algorithms)**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* Connectivity, trees, matchings, flows, planarity, coloring.
* **Prereqs:** M-DIS-1.
* **Feeds:** CS algorithms, networks, optimization.

---

**M-DIS-3 – Extremal & Probabilistic Combinatorics**

* **Epoch:** E3–E4
* **Depth:** L3
* Turán-type bounds, Ramsey theory, probabilistic method, Lovász local lemma.
* **Prereqs:** M-DIS-1/2, M-P-1.
* **Feeds:** additive combinatorics, theoretical CS.

---

**M-DIS-4 – Additive Combinatorics**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Sumsets, Freiman theorems, structure vs randomness, applications to number theory.
* **Prereqs:** M-DIS-3, M-A-2.
* **Feeds:** analytic number theory, harmonic analysis, Tao-style work.

---

**M-DIS-5 – Random Graphs & Random Structures**

* **Epoch:** E4
* **Depth:** L3
* Erdős–Rényi models, thresholds, phase transitions, concentration.
* **Prereqs:** M-P-2, M-DIS-2.
* **Feeds:** network science, probabilistic method, statistical physics bridges.

---

### 1.9 Track M-TOP – Topology & Algebraic/Differential Topology

**M-TOP-1 – Algebraic Topology I (Fundamental Group & Coverings)**

* **Epoch:** E3
* **Depth:** L2–L3
* Fundamental group, covering spaces, applications (Brouwer fixed-point, etc.).
* **Prereqs:** M-AN-5.
* **Feeds:** manifold theory, robotics (configuration spaces), physics.

---

**M-TOP-2 – Homology & Cohomology**

* **Epoch:** E4
* **Depth:** L3–L4
* Singular/simplicial homology, cohomology, cup products, Poincaré duality (intro).
* **Prereqs:** M-TOP-1, M-A-3 helpful.
* **Feeds:** differential geometry, characteristic classes, physics (gauge theories).

---

**M-TOP-3 – Differential Topology**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Sard’s theorem, transversality, degree theory, Morse theory.
* **Prereqs:** M-GD-3, M-TOP-1.
* **Feeds:** GR, symplectic geometry, advanced mechanics.

---

**M-TOP-4 – Characteristic Classes & Spectral Sequences (Survey)**

* **Epoch:** E5–E6
* **Depth:** L3–L4
* Vector bundles, characteristic classes (Chern, Pontryagin), spectral sequence glimpses.
* **Prereqs:** M-TOP-2/3, M-GD-4.
* **Feeds:** gauge theory, stringy physics, advanced geometry research.

---

### 1.10 Track M-HA – Harmonic & Geometric Analysis

**M-HA-1 – Fourier Analysis on ℝⁿ**

* **Epoch:** E3–E4
* **Depth:** L3
* Fourier transform, Plancherel, convolution, Littlewood–Paley (intro), restriction problems (glimpses).
* **Prereqs:** M-AN-3, M-AP-2.
* **Feeds:** PDE, signal processing, probability limit theorems.

---

**M-HA-2 – Harmonic Analysis on Groups & Representation Methods**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Fourier analysis on tori/groups, characters, Peter–Weyl theorem.
* **Prereqs:** M-HA-1, M-A-6.
* **Feeds:** QM, QFT, condensed matter.

---

**M-HA-3 – Geometric Measure Theory**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Hausdorff measure, rectifiability, coarea formula, minimal surfaces.
* **Prereqs:** M-AN-9, M-GD-3.
* **Feeds:** minimal surface PDE, material science, image processing.

---

**M-HA-4 – Ergodic Theory & Dynamical Systems (Measure Perspective)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Measure-preserving transformations, ergodic theorems, entropy, mixing, recurrence.
* **Prereqs:** M-P-2, M-AP-8.
* **Feeds:** statistical mechanics, number theory (equidistribution), chaos theory.

---

### 1.11 Track M-NT – Advanced Number Theory & Random Matrices

**M-NT-1 – Analytic Number Theory I**

* **Epoch:** E3–E4
* **Depth:** L3
* Dirichlet series, prime number theorem ideas, Riemann zeta, Dirichlet characters, primes in AP.
* **Prereqs:** M-A-2, M-AN-3.
* **Feeds:** cryptography, combinatorics, harmonic analysis.

---

**M-NT-2 – Analytic Number Theory II / Automorphic Forms (Survey)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Modular forms, L-functions, spectral theory (intro).
* **Prereqs:** M-NT-1, M-A-6 helpful.
* **Feeds:** modern number theory, QFT connections.

---

**M-NT-3 – Additive & Combinatorial Number Theory**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Sumset structure, Szemerédi, sum-product, Hardy–Littlewood circle method (intro).
* **Prereqs:** M-DIS-4, M-NT-1.
* **Feeds:** harmonic analysis, ergodic theory crossover (Tao-style work).

---

**M-NT-4 – Random Matrix Theory (Mathematical)**

* **Epoch:** E4–E5
* **Depth:** L3
* Wigner ensembles, semicircle law, universality, connections to number theory and statistics.
* **Prereqs:** M-P-3, M-AN-6.
* **Feeds:** quantum chaos, statistics, analytic number theory.

---
## 2. Physics Core

Built on the math spine. I’ll keep things modular so you can dive deep where you want.

### 2.1 Track PHY-C – Classical & Continuum Mechanics

**PHY-C-1 – Newtonian Mechanics**

* **Epoch:** E1–E2
* **Depth:** L2
* Particles, forces, conservation laws, central forces, small oscillations.
* **Prereqs:** M-AN-1, basic vectors.
* **Feeds:** everything else in physics & engineering.

---

**PHY-C-2 – Lagrangian Mechanics**

* **Epoch:** E2–E3
* **Depth:** L3
* Principle of least action, generalized coordinates, constraints, Euler–Lagrange equations.
* **Prereqs:** PHY-C-1, M-AN-2.
* **Feeds:** PHY-C-3, PHY-Q-1, M-GD-6.

---

**PHY-C-3 – Hamiltonian Mechanics & Canonical Transformations**

* **Epoch:** E3–E4
* **Depth:** L3–L4
* Hamilton’s equations, Poisson brackets, canonical transformations, action-angle variables.
* **Prereqs:** PHY-C-2, some M-GD-2.
* **Feeds:** quantum theory foundations, symplectic geometry.

---

**PHY-C-4 – Rigid Body Dynamics**

* **Epoch:** E3
* **Depth:** L2–L3
* Rotation, inertia tensor, Euler equations, gyroscopic effects.
* **Prereqs:** PHY-C-1, M-A-1.
* **Feeds:** ENG-M-2, robotics.

---

**PHY-C-5 – Continuum Mechanics & Elasticity (Intro)**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Stress/strain, constitutive relations, basic elasticity PDEs.
* **Prereqs:** M-AP-2, M-GD-2, PHY-C-1.
* **Feeds:** ENG-M-1/3, finite elements, materials engineering.

---

### 2.2 Track PHY-F – Fields, Waves, and Electromagnetism

**PHY-F-1 – Classical Electromagnetism I (Maxwell)**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* Maxwell’s equations, electrostatics, magnetostatics, EM waves in vacuum.
* **Prereqs:** M-AN-2, M-A-1, PHY-C-1.
* **Feeds:** PHY-F-2, optics, relativity.

---

**PHY-F-2 – Classical Electromagnetism II (Radiation & Matter)**

* **Epoch:** E3–E4
* **Depth:** L3
* EM waves in media, waveguides, radiation, scattering.
* **Prereqs:** PHY-F-1, M-AP-2.
* **Feeds:** RF/microwave engineering, photonics.

---

**PHY-F-3 – Waves & Optics**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* Wave equation, interference, diffraction, polarization, geometric optics.
* **Prereqs:** M-AN-2, PHY-C-1 helpful.
* **Feeds:** lasers, optical engineering, signal processing intuition.

---

**PHY-F-4 – Plasma Physics (Intro)**

* **Epoch:** E4–E5
* **Depth:** L3
* Plasma as a fluid, Debye shielding, waves in plasma, instabilities (intro).
* **Prereqs:** PHY-F-1, ENG-F-2, M-AP-2.
* **Feeds:** fusion, space physics.

---

### 2.3 Track PHY-Q – Quantum & Statistical Physics

**PHY-Q-1 – Quantum Mechanics I (Foundations)**

* **Epoch:** E3
* **Depth:** L2–L3
* Wavefunctions, Schrödinger equation, 1D problems, operators, measurement postulates.
* **Prereqs:** M-AN-2, M-A-1, PHY-C-2.
* **Feeds:** PHY-Q-2/3, PHY-S-2.

---

**PHY-Q-2 – Quantum Mechanics II (Angular Momentum & Many-Body)**

* **Epoch:** E3–E4
* **Depth:** L3
* Angular momentum, spin, harmonic oscillator, hydrogen, identical particles, basic many-body.
* **Prereqs:** PHY-Q-1, M-AN-3.
* **Feeds:** condensed matter, atomic physics, QFT prep.

---

**PHY-Q-3 – Approximation Methods & Scattering**

* **Epoch:** E4
* **Depth:** L3
* Time-independent and time-dependent perturbation theory, WKB, variational methods, scattering theory.
* **Prereqs:** PHY-Q-2, M-AN-3, M-AP-6/7 helpful.
* **Feeds:** QFT, nuclear physics, advanced QM.

---

**PHY-Q-4 – Statistical Mechanics**

* **Epoch:** E3–E4
* **Depth:** L3
* Microcanonical/canonical/grand-canonical ensembles, partition functions, phase transitions (intro).
* **Prereqs:** M-P-1, M-AP-2, PHY-C-1.
* **Feeds:** condensed matter, thermodynamics, complex systems.

---

**PHY-Q-5 – Quantum Field Theory I (Basics)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Scalar fields, path integrals, propagators, Feynman diagrams, renormalization (basic).
* **Prereqs:** M-AN-6/7, PHY-Q-3, some M-A-6 helpful.
* **Feeds:** particle physics, advanced condensed matter.

---

**PHY-Q-6 – Quantum Field Theory II (Gauge & Advanced Topics)**

* **Epoch:** E5–E6
* **Depth:** L4
* Gauge theories, non-Abelian fields, anomalies, renormalization group.
* **Prereqs:** PHY-Q-5, M-GD-5, M-AN-9.
* **Feeds:** high-energy theory, advanced condensed matter.

---

**PHY-Q-7 – Quantum Information & Quantum Computation**

* **Epoch:** E4–E5
* **Depth:** L3
* Qubits, entanglement, quantum channels, algorithms (Shor, Grover), error correction.
* **Prereqs:** PHY-Q-1, M-A-1, M-P-1.
* **Feeds:** quantum tech, CS/Φ crossovers.

---

### 2.4 Track PHY-R – Relativity & Gravitation

**PHY-R-1 – Special Relativity**

* **Epoch:** E2–E3
* **Depth:** L2
* Lorentz transformations, spacetime diagrams, relativistic dynamics, EM connection.
* **Prereqs:** M-AN-2, PHY-C-1.
* **Feeds:** GR, high-energy physics.

---

**PHY-R-2 – General Relativity I (Geometric Foundations)**

* **Epoch:** E4
* **Depth:** L3
* Manifolds, metrics, geodesics, curvature, Einstein field equations basics.
* **Prereqs:** M-GD-3, M-GD-4, PHY-R-1.
* **Feeds:** cosmology, gravitational waves, advanced geometry.

---

**PHY-R-3 – Black Holes & Gravitational Waves**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Schwarzschild/Kerr solutions, horizons, Penrose diagrams, wave solutions.
* **Prereqs:** PHY-R-2.
* **Feeds:** gravitational physics, astrophysics.

---

**PHY-R-4 – Cosmology**

* **Epoch:** E4–E5
* **Depth:** L3
* FLRW models, expansion, cosmic microwave background, structure formation (intro).
* **Prereqs:** PHY-R-2, PHY-Q-4 helpful.
* **Feeds:** astrophysics, large-scale structure.

---

### 2.5 Track PHY-S – Specialized Domains (Electives)

**PHY-S-1 – Condensed Matter Physics**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Crystals, band theory, Fermi surfaces, superconductivity (intro).
* **Prereqs:** PHY-Q-2, PHY-Q-4, M-A-6 useful.

**PHY-S-2 – Nuclear & Particle Physics**

* **Epoch:** E4–E5
* **Depth:** L3
* Nuclear models, scattering, Standard Model basics.
* **Prereqs:** PHY-Q-3, PHY-Q-5.

**PHY-S-3 – Astrophysics & Stellar Structure**

**PHY-S-4 – String Theory & Quantum Gravity (Intro)**

* **Epoch:** E5–E6
* **Depth:** L3–L4
* Worldsheet/path-integral formulations, supersymmetry (survey), AdS/CFT intuition, loop quantum gravity glimpses.
* **Prereqs:** PHY-Q-5/6, PHY-R-2, M-GD-4.
* **Feeds:** high-energy theory, advanced geometry/Φ metaphysics crossovers.

---

**PHY-S-5 – Conformal Field Theory & Bootstrap**

* **Epoch:** E5
* **Depth:** L3–L4
* 2D CFT, Virasoro/W-algebras, operator product expansions, conformal bootstrap techniques.
* **Prereqs:** PHY-Q-5, M-HA-1/2, M-CAT-1 helpful.
* **Feeds:** statistical field theory, string theory, condensed matter critical phenomena.

---

**PHY-S-6 – Topological Quantum Field Theory & Topological Phases**

* **Epoch:** E5
* **Depth:** L3–L4
* Chern–Simons theory, anyons, TQFT axioms, links to topological order and quantum computing.
* **Prereqs:** M-TOP-2/3, PHY-Q-5, PHY-S-1 helpful.
* **Feeds:** quantum information, condensed matter, category theory bridges.

---

**PHY-S-7 – Integrable Systems & Exactly Solvable Models**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Bethe ansatz, Yang–Baxter equation, integrable spin chains, classical soliton systems.
* **Prereqs:** M-AP-8, PHY-Q-2/3.
* **Feeds:** statistical mechanics, quantum many-body, mathematical physics research.

---
* **Epoch:** E4–E5
* **Depth:** L3
* Stellar evolution, compact objects, galactic structure.
* **Prereqs:** PHY-C-1, PHY-Q-4, PHY-R-1 helpful.

…and more elective modules as you like; these are examples.

---

## 3. Engineering Core

Non-software engineering, tightly tied to the math and physics tracks.

### 3.1 Track ENG-M – Mechanical & Structural

**ENG-M-1 – Statics & Strength of Materials**

* **Epoch:** E2
* **Depth:** L2
* Forces, moments, trusses, beams, stress/strain, basic failure criteria.
* **Prereqs:** M-AN-1, PHY-C-1.
* **Feeds:** mechanical, civil-ish structures.

---

**ENG-M-2 – Dynamics & Vibrations**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* Newtonian dynamics of rigid bodies, single/multi-DOF vibrations, resonance.
* **Prereqs:** ENG-M-1, PHY-C-1.
* **Feeds:** machine design, robotics, control.

---

**ENG-M-3 – Materials Science & Engineering**

* **Epoch:** E2–E3
* **Depth:** L2
* Crystal structures, defects, mechanical properties, phase diagrams.
* **Prereqs:** basic chemistry/physics.
* **Feeds:** ENG-M-1/4, failure and reliability.

---

**ENG-M-4 – Machine Design**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Gears, bearings, shafts, fasteners, fatigue, safety factors.
* **Prereqs:** ENG-M-1/2/3.
* **Feeds:** robotics, mechatronics.

---

**ENG-M-5 – Finite Element Methods (Structural)**

* **Epoch:** E4
* **Depth:** L3
* Variational basis, element formulations, assembling stiffness matrices, solving structural problems.
* **Prereqs:** M-AP-4/5, ENG-M-1/5.
* **Feeds:** structural simulation, multi-physics.

---

### 3.2 Track ENG-F – Fluids & Thermo

**ENG-F-1 – Fluid Statics & Kinematics**

* **Epoch:** E2–E3
* **Depth:** L2
* Pressure, buoyancy, conservation laws, streamline vs pathline.
* **Prereqs:** M-AN-2, PHY-C-1.
* **Feeds:** ENG-F-2/3, PHY-F-3.

---

**ENG-F-2 – Inviscid Flow & Potential Theory**

* **Epoch:** E3
* **Depth:** L2–L3
* Euler equations, potential flow, lift/drag basics.
* **Prereqs:** ENG-F-1, M-AP-2, M-AN-8 helpful.
* **Feeds:** aero, PHY-F-4.

---

**ENG-F-3 – Viscous Flow & Boundary Layers**

* **Epoch:** E3–E4
* **Depth:** L3
* Navier–Stokes, laminar flow, boundary layer theory.
* **Prereqs:** ENG-F-1, M-AP-2/3.
* **Feeds:** CFD, turbulence studies.

---

**ENG-F-4 – Turbulence (Intro)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Statistical description, energy cascade, modeling approaches (LES/RANS).
* **Prereqs:** ENG-F-3, M-P-3, M-AP-8.
* **Feeds:** high-end fluid simulation, environmental flows.

---

**ENG-F-5 – Thermodynamics & Heat Transfer**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* First/second laws, cycles, conduction, convection, radiation.
* **Prereqs:** M-AN-2, PHY-C-1.
* **Feeds:** engines, energy systems, stat mech bridge.

---

### 3.3 Track ENG-C – Control, Signals, and Systems

**ENG-C-1 – Signals & Systems (LTI)**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* LTI systems, convolution, Fourier/Laplace transforms, frequency response.
* **Prereqs:** M-AN-2, M-A-1.
* **Feeds:** control, signal processing, communications.

---

**ENG-C-2 – Classical Control (Frequency-Domain)**

* **Epoch:** E3
* **Depth:** L2–L3
* Feedback, stability, root locus, Bode/Nyquist plots.
* **Prereqs:** ENG-C-1, PHY-C-1.
* **Feeds:** robotics, mechatronics.

---

**ENG-C-3 – State-Space & Modern Control**

* **Epoch:** E3–E4
* **Depth:** L3
* State-space models, controllability/observability, LQR, observers.
* **Prereqs:** ENG-C-2, M-A-1, M-AP-1.
* **Feeds:** aerospace, robotics, systems engineering.

---

**ENG-C-4 – Nonlinear & Robust Control**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Lyapunov methods, feedback linearization, H∞, μ-synthesis (intro).
* **Prereqs:** ENG-C-3, M-AP-8, M-P-2 helpful.
* **Feeds:** advanced robotics, complex systems control.

---

**ENG-C-5 – Optimal & Stochastic Control**

* **Epoch:** E5
* **Depth:** L3–L4
* Pontryagin’s maximum principle, dynamic programming, stochastic control.
* **Prereqs:** ENG-C-3, M-AP-6/7, M-P-6.
* **Feeds:** guidance systems, financial engineering, RL theory.

---

### 3.4 Track ENG-A – Applied Systems, Robotics, and Design

**ENG-A-1 – Mechatronics & Sensors/Actuators**

* **Epoch:** E3
* **Depth:** L2
* Basic electronics, actuators (motors, hydraulics), sensors, microcontrollers.
* **Prereqs:** PHY-F-1 basics, ENG-M-1 helpful.
* **Feeds:** robotics, automation.

---

**ENG-A-2 – Robotics: Kinematics & Dynamics**

* **Epoch:** E3–E4
* **Depth:** L3
* Forward & inverse kinematics, Jacobians, dynamics of manipulators.
* **Prereqs:** ENG-M-2, ENG-C-1, M-A-1.
* **Feeds:** control, motion planning.

---

**ENG-A-3 – Robotics Control & Planning**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Trajectory planning, feedback control, stability, basic motion planning algorithms.
* **Prereqs:** ENG-A-2, ENG-C-2/3.
* **Feeds:** advanced robotics systems.

---

**ENG-A-4 – CAD/CAE & Design for Manufacture**

* **Epoch:** E2–E3
* **Depth:** L2
* CAD modeling, basic FEA, design constraints, tolerances, manufacturability.
* **Prereqs:** ENG-M-1.
* **Feeds:** any physical-engineering project work.

---

**ENG-A-5 – Systems Engineering & Reliability**

* **Epoch:** E4–E5
* **Depth:** L2–L3
* Requirements, architectures, failure modes, reliability modeling, lifecycle.
* **Prereqs:** broad exposure; M-P-1 helps.
* **Feeds:** large projects, bridges to CS systems design & Φ ethics/governance.

---

### 3.5 Track ENG-E – Electrical & Electronic Engineering

**ENG-E-1 – Circuit Theory & Analog Electronics**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* Lumped-element models, nodal/mesh analysis, Thevenin/Norton equivalents, frequency response, op-amp and transistor amplifier basics.
* **Prereqs:** M-A-1, ENG-C-1 (signals), PHY-F-1 (EM essentials).
* **Feeds:** embedded systems, analog/RF design, power electronics.

---

**ENG-E-2 – Digital Logic & Digital Design**

* **Epoch:** E2–E3
* **Depth:** L2–L3
* Boolean algebra, combinational/sequential circuits, finite state machines, HDL/FPGA intro.
* **Prereqs:** basic discrete math (M-DIS-1/2).
* **Feeds:** digital hardware, embedded control, bridges to CS digital design.

---

**ENG-E-3 – Semiconductor Devices & Solid-State Fundamentals**

* **Epoch:** E3–E4
* **Depth:** L3
* Band theory, pn junctions, BJTs/MOSFETs, device physics, fabrication basics.
* **Prereqs:** PHY-S-1 (condensed matter intro), ENG-E-1.
* **Feeds:** VLSI, power devices, sensors.

---

**ENG-E-4 – Communications & Information Theory**

* **Epoch:** E3–E4
* **Depth:** L3
* Modulation/demodulation, noise, channel models, Shannon capacity, coding concepts.
* **Prereqs:** ENG-C-1, M-P-3, M-HA-1.
* **Feeds:** wireless systems, networking, signal processing, CS info theory modules.

---

**ENG-E-5 – RF, Antennas, and Microwave Engineering**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Transmission lines, S-parameters, waveguides, antenna theory, microwave components.
* **Prereqs:** ENG-E-1, PHY-F-2, M-AP-2.
* **Feeds:** radar, satellite, high-frequency design.

---

**ENG-E-6 – Power Systems & Electrical Energy (Optional)**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Power generation, transformers, transmission, load flow, stability, protection.
* **Prereqs:** ENG-E-1, ENG-C-1.
* **Feeds:** grid engineering, energy systems, reliability.

---

### 3.6 Track ENG-CH – Chemical & Process Engineering

**ENG-CH-1 – Material & Energy Balances**

* **Epoch:** E2–E3
* **Depth:** L2
* Conservation equations for batch/continuous processes, recycle/purge calculations, phase equilibrium basics.
* **Prereqs:** M-AN-1, ENG-F-5.
* **Feeds:** all process/chemical design topics.

---

**ENG-CH-2 – Transport Phenomena**

* **Epoch:** E3–E4
* **Depth:** L3
* Momentum, heat, mass transfer in laminar flow, constitutive laws, dimensionless numbers.
* **Prereqs:** ENG-F-2/3, M-AP-2.
* **Feeds:** reactor design, CFD, biomedical transport.

---

**ENG-CH-3 – Chemical Reaction Engineering**

* **Epoch:** E3–E4
* **Depth:** L3
* Reaction kinetics, rate laws, CSTR/PFR design, residence time distributions, multiple reactions and stability.
* **Prereqs:** ENG-CH-1, M-AP-8.
* **Feeds:** process design, catalysis, biochemical reactors.

---

**ENG-CH-4 – Separation Processes**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Distillation, absorption, extraction, membranes, equilibrium stage modeling.
* **Prereqs:** ENG-CH-1/2.
* **Feeds:** chemical plant design, environmental engineering.

---

**ENG-CH-5 – Process Control & Safety (Optional)**

* **Epoch:** E4–E5
* **Depth:** L3
* Control architectures for plants, hazard analysis (HAZOP), safety instrumented systems.
* **Prereqs:** ENG-C-2/3, ENG-CH-3.
* **Feeds:** industrial automation, reliability engineering.

---

### 3.7 Track ENG-GEO – Earth & Environmental Systems

**ENG-GEO-1 – Geophysics & Solid Earth**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Elastic waves, seismic inversion basics, gravitational and magnetic surveys, plate tectonics quantified.
* **Prereqs:** M-AP-2/3, PHY-C-5.
* **Feeds:** seismology, resource exploration, hazard modeling.

---

**ENG-GEO-2 – Atmospheric Physics & Climate Systems**

* **Epoch:** E3–E5
* **Depth:** L3
* Primitive equations, radiative balance, convection, simple climate models, feedbacks.
* **Prereqs:** ENG-F-3/4, M-AP-5/8, M-P-3.
* **Feeds:** climate modeling, weather prediction, environmental policy work.

---

**ENG-GEO-3 – Hydrology & Environmental Flows**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Surface/groundwater flow, transport of contaminants, watershed modeling.
* **Prereqs:** ENG-F-1/3, M-AP-2, M-P-4.
* **Feeds:** civil/environmental engineering, risk assessments.

---

**ENG-GEO-4 – Geospatial & Remote Sensing (Optional)**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* GIS fundamentals, satellite sensing, data assimilation basics.
* **Prereqs:** ENG-GEO-2/3, basic statistics.
* **Feeds:** environmental monitoring, autonomous navigation.

---

### 3.8 Track ENG-BIO – Biophysics & Bioengineering

**ENG-BIO-1 – Biological Physics & Soft Matter**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Random walks, polymer models, membranes, molecular motors, thermodynamic fluctuations in biology.
* **Prereqs:** M-P-4/5, PHY-Q-4.
* **Feeds:** biomaterials, nanoscale systems.

---

**ENG-BIO-2 – Systems & Mathematical Biology**

* **Epoch:** E3–E4
* **Depth:** L3
* Population dynamics, signaling networks, infectious disease modeling, nonlinear dynamical systems in biology.
* **Prereqs:** M-AP-8, M-P-4.
* **Feeds:** bioinformatics, epidemiology, synthetic biology.

---

**ENG-BIO-3 – Biomedical Engineering Fundamentals**

* **Epoch:** E3–E4
* **Depth:** L2–L3
* Biomaterials, biomechanics, medical imaging (CT/MRI), bioinstrumentation and sensors.
* **Prereqs:** ENG-M-1/2, ENG-E-1, PHY-F-1.
* **Feeds:** medical devices, assistive technologies, clinical engineering.

---

**ENG-BIO-4 – Neural Engineering & Brain-Computer Interfaces (Optional)**

* **Epoch:** E4–E5
* **Depth:** L3–L4
* Neurophysiology basics, neural signal acquisition, decoding, stimulation, closed-loop control.
* **Prereqs:** ENG-BIO-3, ENG-C-3, M-P-5.
* **Feeds:** neurotech research, advanced human-machine systems.

---

## 5. Optional Frontier Specializations (Choose-Your-Own Deep Dives)

Beyond the core tracks above, you can branch into hyper-specialized niches once you’ve built enough depth in the prerequisites. Treat these as elective waypoints—each one is its own little universe:

* **Higher Topos Theory & ∞-Categories**
  (Lurie-level higher algebra, derived categories, advanced homotopy theory.)
* **Noncommutative Geometry & Operator Algebras**
  (Connes program, C*/von Neumann algebras, quantum groups.)
* **Advanced Algebraic Topology & Homotopy Theory**
  (Spectral sequences at full power, chromatic homotopy, motivic homotopy.)
* **Derived & Arithmetic Geometry / Langlands Program**
  (Stacks, derived deformation theory, automorphic forms, Galois representations.)
* **Geometric Group Theory**
  (Hyperbolic groups, mapping class groups, large-scale geometry.)
* **Geometric Analysis Frontiers**
  (Ricci flow, minimal surfaces, gauge theory, advanced geometric measure theory.)
* **Microlocal & Semiclassical Analysis**
  (Wavefront sets, Fourier integral operators, semiclassical asymptotics.)
* **Nonlinear Dispersive PDE & Integrable Systems**
  (Solitons, inverse scattering, dispersive shock waves.)
* **Advanced Random Matrix & Integrable Probability**
  (Universality proofs, determinantal processes, KPZ universality.)
* **Mathematical Finance & Rough Paths**
  (Advanced stochastic control, fractional processes, rough path theory.)
* **Quantum Field Theory Specializations**
  (Algebraic QFT, conformal field theory, integrable QFT, topological QFT.)
* **Quantum Gravity & String Theory**
  (Loop quantum gravity, string/M-theory, AdS/CFT.)
* **Strongly Correlated & Topological Phases in Condensed Matter**
  (Topological order, anyons, tensor network methods.)
* **Plasma/Kinetic Theory & Fusion Research**
  (Magnetohydrodynamics, kinetic simulations, confinement physics.)
* **Earth & Climate Extremes**
  (Paleoclimate modeling, coupled multi-scale systems, geodesy.)
* **Advanced Bioengineering Specialties**
  (Synthetic biology, tissue engineering, neuroprosthetics, brain-inspired hardware.)

Use the main tracks to build the prerequisites, then treat this list as a menu of research frontiers to explore when you feel the pull.

## 4. Epoch Map (Very Rough)

Not a schedule, just a “density map”:

* **E1:**

  * M-AN-1, M-A-1, M-A-2, M-GD-1
  * PHY-C-1
  * ENG-M-1 (light)

* **E2:**

  * M-AN-2, M-AN-3, M-AP-1, M-P-1
  * M-A-3
  * PHY-F-3, PHY-R-1
  * ENG-M-2, ENG-F-1, ENG-F-5, ENG-C-1, ENG-A-4

* **E3:**

  * M-AN-5, M-AP-2, M-AP-4, M-AP-6, M-P-4, M-GD-2
  * PHY-C-2/4, PHY-F-1, PHY-Q-1/2, PHY-Q-4
  * ENG-M-3/4, ENG-F-2/3, ENG-C-2/3, ENG-A-1/2

* **E4:**

  * M-AN-4/6/8, M-AP-3/5/8, M-P-2/7, M-GD-3/4/5
  * PHY-Q-3, PHY-Q-5, PHY-R-2–4, PHY-F-2
  * ENG-M-5, ENG-F-4, ENG-C-4, ENG-A-3, M-CAT-1

* **E5:**

  * M-AN-7/9, M-A-5–8, M-P-3/5/6, M-AP-7, M-GD-6, M-CAT-2
  * PHY-Q-6/7, PHY-F-4, PHY-S-1/2/3
  * ENG-C-5, ENG-A-5

* **E6:**

  * Any subset at L4 + M-CAT-3; frontier topics and research specialization.

---

This is a *map*, not yet the zoomed-in lesson plans. But it’s at the same “grand design” level as your CS Legend Track: every major domain of pure math, physics, and core engineering is present; you can tag each topic with L1–L4, spiral between tracks, and cross-link them to CS and Philosophy wherever your brain wants interesting interference patterns.

From here your next step is the same as with the CS doc: for any topic like `M-AP-5` or `PHY-Q-2`, you can spawn a sub-doc:

* Learning outcomes
* Concept map
* References (texts, papers)
* Exercises / projects
* Evidence fields for your tracker

Π is now on the board.
