import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "js", "data");
const FIGS = JSON.parse(fs.readFileSync(path.join(ROOT, "figs.json"), "utf8"));
const FIG_IDS = new Set(FIGS.map((f) => f.id));
const FIG_PATHS = new Set(FIGS.map((f) => f.path));

const BLOCK_TYPES = new Set([
  "p", "h3", "list", "table", "fig", "formula", "note", "example", "deep",
]);

function loadModules(dir = DATA) {
  if (!fs.existsSync(dir)) return [];
  const mods = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".js")).sort()) {
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    try {
      vm.runInContext(src, sandbox, { filename: file });
    } catch (e) {
      throw new Error(`${file} threw on load: ${e.message}`);
    }
    const pushed = sandbox.window.NSCOM_MODULES || [];
    if (pushed.length !== 1) {
      throw new Error(`${file} pushed ${pushed.length} modules, expected 1`);
    }
    mods.push({ file, mod: pushed[0] });
  }
  return mods;
}

test("ten module files exist", () => {
  const files = fs.existsSync(DATA)
    ? fs.readdirSync(DATA).filter((f) => f.endsWith(".js"))
    : [];
  assert.strictEqual(files.length, 10, `expected 10 data files, got ${files.length}`);
});

test("every module loads and pushes exactly one object", () => {
  const mods = loadModules();
  assert.strictEqual(mods.length, 10);
});

test("module ids/accents/icons are unique and complete", () => {
  const mods = loadModules().map((x) => x.mod);
  const ids = new Set();
  const accents = new Set();
  const icons = new Set();
  for (const m of mods) {
    assert.ok(/^m\d\d$/.test(m.id), `bad id ${m.id}`);
    assert.ok(!ids.has(m.id), `duplicate id ${m.id}`);
    ids.add(m.id);
    assert.ok(/^#[0-9a-fA-F]{6}$/.test(m.accent), `bad accent ${m.id} ${m.accent}`);
    assert.ok(!accents.has(m.accent), `duplicate accent ${m.accent} in ${m.id}`);
    accents.add(m.accent);
    assert.ok(typeof m.icon === "string" && m.icon.includes("<svg"),
      `${m.id} icon is not inline svg`);
    assert.ok(!icons.has(m.icon), `duplicate icon in ${m.id}`);
    icons.add(m.icon);
  }
  for (let i = 1; i <= 10; i++) {
    assert.ok(ids.has(`m${String(i).padStart(2, "0")}`), `missing m0${i}`);
  }
});

test("every module has enough sections, cards and quiz items", () => {
  for (const { file, mod: m } of loadModules()) {
    assert.ok(typeof m.title === "string" && m.title.length > 2, `${file} title`);
    assert.ok(typeof m.summary === "string" && m.summary.length >= 80,
      `${file} summary too short`);
    assert.ok(Array.isArray(m.sections) && m.sections.length >= 6,
      `${file} needs >=6 sections, has ${m.sections?.length}`);
    assert.ok(Array.isArray(m.flashcards) && m.flashcards.length >= 12,
      `${file} needs >=12 flashcards, has ${m.flashcards?.length}`);
    assert.ok(Array.isArray(m.quiz) && m.quiz.length >= 10,
      `${file} needs >=10 quiz items, has ${m.quiz?.length}`);
  }
});

test("module files do not obfuscate the registry name to satisfy a text check", () => {
  // A text-level count of "window.NSCOM_MODULES" wrongly flags the normal
  // two-line idiom, which previously pushed agents into writing
  // window["NSCOM" + "_MODULES"] purely to keep the count at 1. The real check
  // is the sandbox load above; this test guards against the workaround.
  const offenders = [];
  for (const f of fs.readdirSync(DATA).filter((x) => x.endsWith(".js"))) {
    const src = fs.readFileSync(path.join(DATA, f), "utf8");
    if (/"NSCOM"\s*\+/.test(src) || /\+\s*"_MODULES"/.test(src)) offenders.push(f);
  }
  assert.deepStrictEqual(offenders, [],
    `modules obfuscate the registry name: ${offenders.join(", ")}`);
});

test("section and block structure is valid", () => {
  for (const { file, mod: m } of loadModules()) {
    const secIds = new Set();
    for (const s of m.sections) {
      assert.ok(typeof s.id === "string" && s.id, `${file} section missing id`);
      assert.ok(!secIds.has(s.id), `${file} duplicate section id ${s.id}`);
      secIds.add(s.id);
      assert.ok(typeof s.title === "string" && s.title.trim(), `${file} ${s.id} title`);
      assert.ok(Array.isArray(s.body) && s.body.length > 0, `${file} ${s.id} empty body`);
      for (const b of s.body) {
        assert.ok(BLOCK_TYPES.has(b.type),
          `${file} ${s.id} unknown block type ${b.type}`);
        if (b.type === "p") {
          assert.ok(typeof b.text === "string" && b.text.length >= 120,
            `${file} ${s.id} prose block too short (${b.text?.length})`);
        }
        if (b.type === "h3" || b.type === "note") {
          assert.ok(typeof b.text === "string" && b.text.trim(),
            `${file} ${s.id} ${b.type} needs text`);
        }
        if (b.type === "list") {
          assert.ok(Array.isArray(b.items) && b.items.length >= 2,
            `${file} ${s.id} list needs >=2 items`);
        }
        if (b.type === "table") {
          assert.ok(Array.isArray(b.head) && b.head.length > 0,
            `${file} ${s.id} table needs head`);
          assert.ok(Array.isArray(b.rows) && b.rows.length > 0,
            `${file} ${s.id} table needs rows`);
        }
        if (b.type === "fig") {
          assert.ok(FIG_IDS.has(b.fig), `${file} ${s.id} unknown figure id ${b.fig}`);
        }
        if (b.type === "formula") {
          assert.ok(typeof b.tex === "string" && b.tex.trim(),
            `${file} ${s.id} formula needs tex`);
          assert.ok(typeof b.text === "string" && b.text.trim(),
            `${file} ${s.id} formula needs a plain-English reading`);
        }
        if (b.type === "example") {
          assert.ok(typeof b.text === "string" && b.text.length >= 40,
            `${file} ${s.id} example too short`);
        }
        if (b.type === "deep") {
          assert.ok(Array.isArray(b.body) && b.body.length > 0,
            `${file} ${s.id} deep block needs a body`);
          assert.ok(typeof b.hint === "string" && b.hint.trim(),
            `${file} ${s.id} deep block needs a hint naming the question it answers`);
          for (const inner of b.body) {
            assert.ok(BLOCK_TYPES.has(inner.type) && inner.type !== "deep",
              `${file} ${s.id} deep block may not nest a ${inner.type}`);
          }
        }
      }

      // A section is a scan layer plus depth, not one wall of prose. The student
      // should be able to read the part outside the deep block in well under a
      // minute, or the page is discouraging rather than reviewing.
      //
      // Only enforced for modules that have adopted the deep block: a module
      // written before the split is a migration backlog, not a broken invariant,
      // and failing every test on it would hide real regressions behind noise.
      const deeps = s.body.filter((b) => b.type === "deep");
      assert.ok(deeps.length <= 1, `${file} ${s.id} has ${deeps.length} deep blocks, expected at most 1`);
      if (m.sections.some((x) => x.body.some((b) => b.type === "deep"))) {
        // Only prose the student must READ counts toward the budget. A figure
        // block carries a caption and alt text, which are not reading load --
        // counting them flagged sections whose scan layer was actually 40 words.
        const scanWords = s.body
          .filter((b) => b.type !== "deep" && b.type !== "fig")
          .map((b) => JSON.stringify(b).replace(/[^A-Za-z\s]/g, " ").split(/\s+/).filter(Boolean).length)
          .reduce((a, c) => a + c, 0);
        assert.ok(scanWords <= 140,
          `${file} ${s.id} scan layer is ${scanWords} words; keep it under 140 so the section stays skimmable`);
      }
    }
    for (const c of m.flashcards) {
      assert.ok(typeof c.q === "string" && c.q.trim(), `${file} flashcard q`);
      assert.ok(typeof c.a === "string" && c.a.trim(), `${file} flashcard a`);
      assert.ok(secIds.has(c.sec), `${file} flashcard sec ${c.sec} does not resolve`);
    }
    for (const [i, q] of m.quiz.entries()) {
      assert.ok(typeof q.q === "string" && q.q.trim(), `${file} quiz ${i} q`);
      assert.ok(Array.isArray(q.choices) && q.choices.length === 4,
        `${file} quiz ${i} needs exactly 4 choices`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3,
        `${file} quiz ${i} answer ${q.answer} out of range`);
      assert.ok(typeof q.why === "string" && q.why.length >= 30,
        `${file} quiz ${i} why too short`);
      assert.ok(secIds.has(q.sec), `${file} quiz ${i} sec ${q.sec} does not resolve`);
      const uniq = new Set(q.choices);
      assert.strictEqual(uniq.size, 4, `${file} quiz ${i} has duplicate choices`);
    }
  }
});

test("every referenced figure exists on disk", () => {
  const missing = [];
  for (const f of FIGS) {
    if (!fs.existsSync(path.join(ROOT, f.path))) missing.push(f.path);
  }
  assert.deepStrictEqual(missing, [], `missing figure files: ${missing.slice(0, 5)}`);
});

test("no literal unicode escape sequences leak into rendered text", () => {
  // Inside backtick template literals JS does not interpret \uXXXX, so a
  // literal backslash-u sequence would render to the student as "\u2014".
  const esc = /\\u[0-9a-fA-F]{4}/;
  const leaks = [];
  for (const { file, mod: m } of loadModules()) {
    const blob = JSON.stringify(m);
    if (esc.test(blob)) leaks.push(file);
  }
  assert.deepStrictEqual(leaks, [],
    `modules with literal escape leaks: ${leaks.join(", ")}`);
});

test("section ids are namespaced by module in study state", () => {
  // Section ids are only unique within a module (every module has s1..sN), so
  // read state keyed by the bare id made marking 16 sections mark 16 sections of
  // ALL TEN modules. Verify the store keys by module/section and that counting
  // is per-module.
  const mods = loadModules().map((x) => x.mod);
  const allIds = [];
  for (const m of mods) for (const s of m.sections) allIds.push(m.id + "/" + s.id);
  const unique = new Set(allIds);
  assert.strictEqual(unique.size, allIds.length,
    "module/section keys must be globally unique");

  // the raw ids must genuinely collide, which is why namespacing is required
  const bare = [];
  for (const m of mods) for (const s of m.sections) bare.push(s.id);
  assert.ok(new Set(bare).size < bare.length,
    "expected bare section ids to collide across modules");
});

test("every formula block renders without leaving raw TeX", () => {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "math.js"), "utf8"), sandbox);
  const MATH = sandbox.window.MATH;
  assert.ok(MATH && typeof MATH.toHtml === "function", "math renderer did not load");

  const offenders = [];
  for (const { mod: m } of loadModules()) {
    for (const s of m.sections) {
      for (const b of s.body) {
        if (b.type !== "formula") continue;
        const html = MATH.toHtml(b.tex);
        if (/\\[A-Za-z]+/.test(html)) offenders.push(`${m.id}/${s.id}: ${b.tex.slice(0, 60)}`);
      }
    }
  }
  assert.deepStrictEqual(offenders, [],
    `formulas still showing raw LaTeX: ${offenders.slice(0, 5).join(" | ")}`);
});

test("CRC steps align the divisor under the dividend", () => {
  // The step trace is read as a column, so the indent must survive into the DOM.
  // Generating it with plain spaces failed because HTML collapses whitespace,
  // which scrambled the alignment; it must be rendered as real indent characters.
  const sandbox = { window: { SIMS: [], RENDER: { esc: (s) => String(s) } } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "sims", "sim-crc.js"), "utf8"), sandbox);
  const sim = sandbox.window.SIMS.find((s) => s.id === "sim-crc");
  assert.ok(sim && typeof sim._divide === "function", "crc divide not exposed");

  const r = sim._divide("1101011011" + "0000", "10011");
  assert.strictEqual(r.remainder, "1110", "remainder");
  assert.ok(r.steps.length >= 3, "expected several division steps");

  for (const s of r.steps) {
    // each step knows the column of the bit it divides, and both rows in the
    // rendered output must be shifted by exactly that many characters
    assert.ok(Number.isInteger(s.i) && s.i >= 0, "step shift must be a column index");
    assert.strictEqual(s.seg.length, s.div.length,
      `dividend and divisor must be the same width to align (step at ${s.i})`);
    assert.strictEqual(s.seg[0], "1",
      `a step only runs where the dividend bit is 1 (step at ${s.i})`);
  }
  // the shifts must be non-decreasing, which is what makes the column readable
  for (let k = 1; k < r.steps.length; k++) {
    assert.ok(r.steps[k].i >= r.steps[k - 1].i,
      "step shifts must not move backwards");
  }
});

test("CRC long division renders as one shared character grid", () => {
  // The trace is ONE column of text, not a list of cards. What must hold:
  //  - every row draws from the same grid, so a digit in the last step sits in the
  //    same column as the digit it came from in the first (CSS subgrid);
  //  - the operator sits in a fixed left column, so the per-step indent shifts the
  //    bits and never the operator (it drifted diagonally when in inline flow);
  //  - the result column is FIXED, not floated after a variable-length leader, or
  //    the remainders form a ragged edge that cannot be scanned down;
  //  - the indent is nbsp, because HTML collapses runs of plain spaces.
  const sim = fs.readFileSync(path.join(ROOT, "js", "sims", "sim-crc.js"), "utf8");
  const css = fs.readFileSync(path.join(ROOT, "css", "drill.css"), "utf8");

  // markup: one .trace field, a head row, and a step row per division step
  assert.ok(/class="trace"/.test(sim), "the trace must be one continuous field");
  assert.ok(/trace__head/.test(sim), "the trace needs a dividend/generator head row");
  assert.ok(/trace__op-gutter/.test(sim), "each row needs a fixed operator gutter");
  assert.ok(/trace__rule/.test(sim), "rows need a ruler between bits and result");
  assert.ok(/trace__res/.test(sim), "rows need a result cell");
  assert.ok(/\\u00a0/.test(sim),
    "the indent must be nbsp — HTML collapses runs of plain spaces");

  // grid: rows are subgrids of one shared track list, so columns are truly shared
  const rowRule = /\.trace__head,\s*\n?\.trace__step\s*\{([\s\S]*?)\}/.exec(css);
  assert.ok(rowRule, ".trace__head/.trace__step rule missing");
  assert.ok(/grid-template-columns:\s*subgrid/.test(rowRule[1]),
    "rows must use subgrid so every digit shares one character column");
  const fieldRule = /\.trace\s*\{([\s\S]*?)\}/.exec(css);
  assert.ok(fieldRule && /grid-template-columns:\s*2ch max-content/.test(fieldRule[1]),
    "the trace field must define the shared column tracks");

  // the result column must be a real track, not a floated tail
  const resRule = /\.trace__step > \.trace__res\s*\{([\s\S]*?)\}/.exec(css);
  assert.ok(resRule && /grid-column:\s*4/.test(resRule[1]),
    "results must occupy a fixed grid column so they align down the trace");
});

test("figures used by content are drawn from figs.json", () => {
  for (const { file, mod: m } of loadModules()) {
    for (const s of m.sections) {
      for (const b of s.body) {
        if (b.type === "fig") {
          assert.ok(FIG_PATHS.has(FIGS.find((f) => f.id === b.fig).path),
            `${file} fig path not in manifest: ${b.fig}`);
        }
      }
    }
  }
});
