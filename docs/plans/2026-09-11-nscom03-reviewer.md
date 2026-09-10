# NSCOM03 Interactive Reviewer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy to GitHub Pages a static, interactive NSCOM03 study reviewer covering all 10 source documents, with deep lessons, flashcards, quizzes, and interactive simulators.

**Architecture:** A zero-build static site: one `index.html` shell, vanilla-JS modules for rendering/routing/state, and per-module content files exposing `window.NSCOM_MODULES.push({...})`. 285 real slide figures ship as WebP assets referenced by content. Each module has a fixed `id`/`num`/`icon`/`accent`. Routing is hash-based; progress persists in `localStorage`.

**Tech Stack:** HTML5, CSS (custom properties, no framework), vanilla ES2020 JS, Node `node:test` for the validator, Python (pymupdf) for figure extraction, `gh` CLI for Pages deploy.

**Spec:** `PRODUCT.md` (this repo, written from confirmed user answers) — the plan argues from it.

## Global Constraints

- No build step, no bundler, no npm runtime dependencies. Everything shipped must run by opening `index.html` or from Pages directly.
- Every JS file must pass `node --check` before commit.
- Content must be accurate to `~/academics/nscom_txt/*.txt`. Depth beyond slides uses standard Forouzan data-communications theory and must be labelled as such, never attributed to the professor.
- Never fabricate exam questions, quiz answers, grades, professor quotes, or student data.
- Content JS files build their payload in **one buffer** and call `write_file` **once**. No append loops. After writing, `grep -c 'window.NSCOM_MODULES' file` must be exactly 1.
- All HTML strings inside content JS use **backtick template literals**, never double quotes (SVG attributes contain raw `"`).
- Module ids: `m01`…`m09` plus `m10` for Microwave Interference. Accents/icons must be unique across modules.
- Figures are referenced as `assets/figs/<module>/<slug>.webp`; every referenced figure must exist on disk and be asserted by the test suite.
- Site must remain usable with JS-only navigation (no server), and readable at 390px wide.

---

## Phase 0 — Direction and Design Contract (impeccable)

### Task 0: Establish the visual world

**Files:**
- Create: `PRODUCT.md` (DONE)
- Create: `.impeccable/surface-briefs/index.md` (direction contract)
- Create: `DESIGN.md` + `.impeccable/design.json` (at finish, via documenter)

- [ ] **Step 1: Run the direction seed**

Run: `~/.hermes/profiles/dev/skills/creative/impeccable/scripts/impeccable concept-seed --scope direction --mode read`
Expected: prints an assigned direction plus challengers. Record the seed key.

- [ ] **Step 2: Derive 7 candidate visual worlds** from the subject's actual cultural world — data-communications engineering: (1) Bell Labs technical memoranda, (2) Tektronix/oscilloscope phosphor display, (3) circuit schematic blueprints, (4) ITU/CCITT standards documents, (5) signal-generator front panels, (6) punch-card / teletype data sheets, (7) shaded-pole "signal as weather" visualization. Note why each carries the mechanism. Ensure ≥3 material families.

- [ ] **Step 3: Fuse challengers, verdict each** (wins / competitive / declined) on audience identification and product clarity. Name the discipline each declined challenger donates.

- [ ] **Step 4: Present the direction** and get the user's lock. Read mode = Read (comprehension + wayfinding lead).

- [ ] **Step 5: Write the direction contract** with the six blocks (THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, FINISH) via `impeccable surface-brief write index <file>`.

- [ ] **Step 6: Build phase start**

Run: `impeccable build-phase start --direction <seed key> --kind assigned`
Expected: creates `.impeccable/build/state.json`.

---

## Phase 1 — Asset Pipeline

### Task 1: Convert rendered slide pages into shipping WebP figures

**Files:**
- Modify: `~/academics/render_pages.py` → new `tools/figures.py`
- Create: `assets/figs/<module>/<slug>.webp` (target: ~180 curated figures)
- Create: `figs.json` (manifest: module, slide page, slug, path, caption, w, h)

**Interfaces:**
- Consumes: `~/academics/nscom_pages/*.png` (285 pages), `~/academics/nscom_page_manifest.json`, `~/academics/nscom_txt/*.txt`
- Produces: `figs.json` — array of `{ id, mod, slide, slug, path, caption, w, h }`; used by every module content file.

- [ ] **Step 1: Write the figure trimmer**

Trim uniform slide borders, upscale-verify legible, export WebP quality 82, max width 1400px.

```python
import pymupdf, pathlib
def is_uniform_row(pix, y, tol=12):
    w = pix.width
    ref = pix.pixel(0, y)
    step = max(1, w // 24)
    return all(all(abs(c - r) <= tol for c, r in zip(pix.pixel(x, y), ref))
               for x in range(0, w, step))
```

- [ ] **Step 2: Curate — drop the decorative slides**

Skip title slides, agenda slides, "any questions" slides, and the cartoon-mascot corner pages that carry no teaching content. Keep every page whose text names a mechanism, a timing diagram, a frame format, a waveform, or a topology.

- [ ] **Step 3: Write caption + slug per kept figure**, derived from that page's extracted text heading (the line before the figure in the `.txt`).

- [ ] **Step 4: Verify** — `python tools/verify_figs.py` asserts every `figs.json` path exists, is WebP, is >8KB, and w/h match. Expected: PASS with count printed.

- [ ] **Step 5: Spot-check 6 figures with vision** across different modules to confirm legibility at final size.

- [ ] **Step 6: Commit**

```bash
git add assets/figs figs.json tools/verify_figs.py
git commit -m "assets: extract and curate 180 slide figures as webp"
```

---

## Phase 2 — Content Schema and Validator

### Task 2: Lock the schema and write the failing validator

**Files:**
- Create: `SCHEMA.md`
- Create: `test/test.js` (node:test)
- Create: `package.json` (`{"type":"module","scripts":{"test":"node --test test/"}}`)

**Interfaces:**
- Produces: the exact object shape every content file must satisfy:

```js
window.NSCOM_MODULES.push({
  id: "m01", num: 1, title: "Review of Physical and Data Link Layer",
  icon: "<svg…>", accent: "#hex", summary: "one paragraph",
  sections: [{ id, title, body: [ {type:"p"|"h3"|"list"|"table"|"fig"|"formula"|"note"|"example", …} ] }],
  flashcards: [{ q, a, sec }],
  quiz: [{ q, choices:[4], answer: 0-3, why, sec }],
});
```

- [ ] **Step 1: Write SCHEMA.md** documenting every field, every block `type`, and the rules (unique ids, `sec` must resolve to a section id, `answer` in 0..3, `fig` paths must appear in `figs.json`).

- [ ] **Step 2: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert";
test("every module file loads and satisfies the schema", async () => {
  const mods = await loadAllModules();
  assert.ok(mods.length === 10, `expected 10 modules, got ${mods.length}`);
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `node --test test/` — Expected: FAIL, no content files exist.

- [ ] **Step 4: Implement the validator's real checks** — required fields present; ids/accents/icons unique; ≥6 sections per module; every block `type` known; `fig` paths exist on disk and are in `figs.json`; flashcard `sec` resolves; quiz `answer` integer in 0..3; ≥12 flashcards and ≥10 quiz items per module; prose block ≥120 chars.

- [ ] **Step 5: Run again** — Expected: still FAIL on missing files (correct), but the validator itself must not throw. Confirm with a fixture module written to `test/fixtures/`.

- [ ] **Step 6: Commit**

```bash
git add SCHEMA.md test/ package.json && git commit -m "test: add content schema validator with fixtures"
```

---

## Phase 3 — Content Generation (10 modules, parallel)

### Task 3: Generate module content

**Files:**
- Create: `js/data/m01.js` … `js/data/m10.js` (written to `/tmp/nscom-gen/` first, then copied in)

**Interfaces:**
- Consumes: `SCHEMA.md`, `figs.json`, the module's own `.txt` extraction, its rendered figures
- Produces: `window.NSCOM_MODULES.push({...})` per the schema, one object per file

- [ ] **Step 1: Write the per-module brief** — dispatch to subagents with: the module's full extracted text, its figure list from `figs.json`, `SCHEMA.md`, and the user's depth answer (slides + deep textbook expansion: derivations, worked examples, extra examples beyond the slides).

- [ ] **Step 2: Dispatch up to 4 subagents at a time** (10 modules total), each writing to `/tmp/nscom-gen/<mod>.js` with these non-negotiables stated in the prompt: single `write_file`, never append; backtick template literals only; `node --check` must pass; report exact section/flashcard/quiz counts.

- [ ] **Step 3: Validate each file as it lands** — `node --check /tmp/nscom-gen/<mod>.js`, then `grep -c 'window.NSCOM_MODULES' → 1`.

- [ ] **Step 4: Copy validated files into `js/data/`** only after all pass; never overwrite a good file with an unvalidated one.

- [ ] **Step 5: Run the full suite** — `node --test test/` Expected: PASS, 10 modules.

- [ ] **Step 6: Cross-check 3 formulas against an independent implementation** in Python (Nyquist/Shannon, CRC, Hamming). Fix content if they disagree.

- [ ] **Step 7: Commit**

```bash
git add js/data && git commit -m "content: add detailed lessons, flashcards, quizzes for m01-m10"
```

---

## Phase 4 — Application Shell

### Task 4: Build the shell, router, and renderer

**Files:**
- Create: `index.html`, `css/app.css`, `js/app.js`, `js/render.js`, `js/store.js`, `js/srs.js`

**Interfaces:**
- Consumes: `window.NSCOM_MODULES`, `figs.json`
- Produces: hash routes `#/` (home), `#/m/<id>` (lesson), `#/m/<id>/cards` (flashcards), `#/m/<id>/quiz`, `#/sims`; `store.get/set` wrapping localStorage; `srs.due()` returning due flashcards

- [ ] **Step 1: Build `index.html`** — semantic shell, module list, lesson/flashcard/quiz containers, nav, theme toggle. `data-*` hooks only; no direction-contract text in markup.

- [ ] **Step 2: Build the router** — hash-based, updates nav active state, restores scroll, deep-linkable, works on hard refresh on Pages.

- [ ] **Step 3: Build the lesson renderer** — maps each block `type` to markup: `p`, `h3`, `list`, `table`, `fig` (figure + caption + lightbox), `formula` (rendered), `note`, `example`.

- [ ] **Step 4: Build the flashcard engine** — flip, keyboard nav, "got it / again" grading, Leitner-style scheduling persisted in localStorage.

- [ ] **Step 5: Build the quiz engine** — per-question feedback citing `why` and `sec`, score summary, retry-wrong-only, progress persisted.

- [ ] **Step 6: Build the progress/overview view** — per-module completion, quiz best score, cards seen.

- [ ] **Step 7: Verify in a real browser** — load each route, confirm no console errors, confirm hard refresh on a deep link works.

- [ ] **Step 8: Commit**

```bash
git add index.html css js/app.js js/render.js js/store.js js/srs.js && git commit -m "feat: app shell, router, lesson/flashcard/quiz engines"
```

---

## Phase 5 — Simulators

### Task 5: Build five interactive simulators

**Files:**
- Create: `js/sims/sim-crc.js`, `sim-line-coding.js`, `sim-modulation.js`, `sim-nyquist-shannon.js`, `sim-multiplexing.js`

**Interfaces:**
- Produces: `window.SIMS.push({ id, mod, title, desc, mount(root) })` — app filters by `mod`; `mount` wrapped in try/catch surfacing the error into the DOM.

- [ ] **Step 1: CRC calculator (m06)** — enter data + generator, show modulo-2 long division step by step, show transmitted codeword, and verify by dividing the whole codeword (never stripping the CRC first). Keep leading zeros.

- [ ] **Step 2: Line coding (m03)** — NRZ-L, NRZ-I, Manchester, Differential Manchester, AMI, pseudoternary waveforms as SVG. Insert `(next.x, current.y)` before each level change so edges are square, and extend the final level to the right edge.

- [ ] **Step 3: Modulation (m04)** — ASK/FSK/PSK/QAM with adjustable bit rate and carrier; show carrier, data, and result.

- [ ] **Step 4: Nyquist/Shannon (m02)** — sliders for bandwidth, levels, SNR; live max data rate for both formulas with the arithmetic shown.

- [ ] **Step 5: Multiplexing (m05)** — FDM/TDM/WDM channel diagram with a play control showing frames interleaving.

- [ ] **Step 6: Unit-test the maths** against independent Python implementations (CRC especially) and confirm equality before commit.

- [ ] **Step 7: Commit**

```bash
git add js/sims && git commit -m "feat: add crc, line-coding, modulation, nyquist-shannon, multiplexing sims"
```

---

## Phase 6 — Design Pass, Finish Review, Deploy

### Task 6: Finish, verify, and ship

**Files:**
- Create: `DESIGN.md`, `.impeccable/design.json`, `.nojekyll`, `README.md`
- Create: `.impeccable/review/desktop.png`, `.impeccable/review/mobile.png`

- [ ] **Step 1: Build phases to completion** — `impeccable build-phase` through hero → sections → motion → responsive.

- [ ] **Step 2: Capture evidence** — full-page desktop (1440) and mobile (390) screenshots from document top, motion settled. Open each file once to confirm it shows what its name claims.

- [ ] **Step 3: Run the detector** — `impeccable detect --json index.html css js` and fix what is mechanical.

- [ ] **Step 4: Spawn the finish reviewer** with the request, PRODUCT.md, artifact path, screenshots, direction contract, detector findings. Act on the single disposition word: recapture / rebuild / ship / fix.

- [ ] **Step 5: Document** — spawn the documenter; verify DESIGN.md + `.impeccable/design.json` exist with real tokens.

- [ ] **Step 6: Final test run** — `node --test test/` Expected: PASS.

- [ ] **Step 7: Create the repo and push**

```bash
cd ~/nscom03-reviewer
gh repo create nscom03-reviewer --public --source=. --remote=origin --push
```

- [ ] **Step 8: Enable Pages**

```bash
gh api repos/snowyter/nscom03-reviewer/pages -X POST \
  -f source[branch]=main -f source[path]=/
```

- [ ] **Step 9: Poll until built, then verify in a real browser**

```bash
gh api repos/snowyter/nscom03-reviewer/pages --jq .status
```

Expected: `built`. Then load the live URL in the browser, check the console is clean, and click through every module and route on the deployed site.

---

## Self-Review

**Spec coverage:** lessons → Task 3+4; flashcards → Task 4 Step 4; quizzes → Task 4 Step 5; simulators → Task 5; all 10 PDFs incl. microwave → Task 3 (`m01`–`m10`); real figures → Task 1; GitHub Pages → Task 6; "not AI slop" → Task 0 + Task 6; phone-readable/a11y → Task 4 Step 7, Task 6 Step 2.

**Placeholder scan:** no TBD/TODO; every step names its file, command, or code.

**Type consistency:** `window.NSCOM_MODULES.push` and `window.SIMS.push` are used identically in Tasks 2–5; `figs.json` shape is defined once in Task 1 and consumed in Tasks 2–4; block `type` vocabulary is frozen in Task 2 and consumed in Task 4 Step 3.
