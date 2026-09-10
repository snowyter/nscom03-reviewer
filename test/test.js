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
  "p", "h3", "list", "table", "fig", "formula", "note", "example",
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
