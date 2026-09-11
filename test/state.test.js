// Behavioural tests for study state and the quiz/drill engines. These exercise
// a real DOM so the store's interaction with the app is tested, not just its
// shape — the cross-module progress bug was invisible to shape tests.

import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function boot() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const stripped = html
    .replace(/<script src="[^"]+"><\/script>/g, "")
    .replace(/<script>[\s\S]*?<\/script>/g, "");
  const vc = new VirtualConsole();
  const dom = new JSDOM(stripped, {
    url: "http://localhost/", runScripts: "dangerously", pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(win) {
      win.fetch = (u) => {
        const p = path.join(ROOT, String(u).replace(/^\.?\//, ""));
        if (!fs.existsSync(p)) return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve([]) });
        const body = fs.readFileSync(p, "utf8");
        return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(body),
                                 json: () => Promise.resolve(JSON.parse(body)) });
      };
    },
  });
  const w = dom.window;
  for (const c of inline) { try { w.eval(c); } catch (e) {} }
  // app.js runs its boot lazily inside a fetch promise; evaluate data and
  // libraries first, then app.js, then force a synchronous boot so tests do not
  // depend on promise timing. srcs may carry a ?v=<hash> cache-buster from the
  // deploy stamping step, so strip it before hitting the filesystem.
  const appSrc = srcs.find((s) => s.split("?")[0].endsWith("app.js"));
  for (const s of srcs) {
    if (s === appSrc) continue;
    try { w.eval(fs.readFileSync(path.join(ROOT, s.split("?")[0]), "utf8")); } catch (e) {}
  }
  return { dom, w, appPath: appSrc };
}

/* Boot fully: run app.js and then wait for its DOMContentLoaded fetch chain. */
async function bootReady() {
  const ctx = boot();
  const { w, appPath } = ctx;
  // provide the figures synchronously so boot() finishes in this tick
  const figsPath = path.join(ROOT, "figs.json");
  w.fetch = (u) => {
    const p = path.join(ROOT, String(u).replace(/^\.?\//, ""));
    if (!fs.existsSync(p)) return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve([]) });
    const body = fs.readFileSync(p, "utf8");
    return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(body),
                             json: () => Promise.resolve(JSON.parse(body)) });
  };
  w.eval(fs.readFileSync(path.join(ROOT, appPath.split("?")[0]), "utf8"));
  await new Promise((r) => setTimeout(r, 50));
  return ctx;
}

test("marking one module's sections does not mark another module's", () => {
  const { w } = boot();
  const mods = w.NSCOM_MODULES;
  const a = mods[0], b = mods[1];

  // mark every section of module A
  for (const s of a.sections) w.STORE.markSection(a.id, s.id);

  const aIds = a.sections.map((s) => s.id);
  const bIds = b.sections.map((s) => s.id);
  assert.strictEqual(w.STORE.readCount(a.id, aIds), aIds.length,
    "module A should read fully");
  assert.strictEqual(w.STORE.readCount(b.id, bIds), 0,
    "module B must remain unread after marking only module A");

  // and the reverse direction
  w.STORE.markSection(b.id, bIds[0]);
  assert.strictEqual(w.STORE.readCount(b.id, bIds), 1, "module B now has one read");
  assert.strictEqual(w.STORE.readCount(a.id, aIds), aIds.length,
    "module A must be unaffected by marking module B");

  // the overall count must be the true sum, never saturate
  const prog = w.STORE.overall(mods);
  const expected = aIds.length + 1;
  assert.strictEqual(prog.read, expected,
    `overall read should be ${expected}, got ${prog.read}`);
  assert.ok(prog.total > prog.read, "overall total must exceed what was marked");

  w.close();
});

test("sections can be unmarked and toggled", () => {
  const { w } = boot();
  const m = w.NSCOM_MODULES[0];
  const id = m.sections[0].id;

  assert.strictEqual(w.STORE.isSectionRead(m.id, id), false);
  w.STORE.toggleSection(m.id, id);
  assert.strictEqual(w.STORE.isSectionRead(m.id, id), true, "toggle should mark");
  w.STORE.toggleSection(m.id, id);
  assert.strictEqual(w.STORE.isSectionRead(m.id, id), false, "toggle should unmark");

  w.STORE.markSection(m.id, id);
  w.STORE.unmarkSection(m.id, id);
  assert.strictEqual(w.STORE.isSectionRead(m.id, id), false, "unmark should clear");
  w.close();
});

test("quiz retry-wrong keeps correctly answered questions", async () => {
  const { w } = await bootReady();
  const mod = w.NSCOM_MODULES.find((m) => m.quiz.length >= 4);
  w.location.hash = "#/m/" + mod.id + "/quiz";
  w.APP.render();

  const doc = w.document;
  const q1 = doc.querySelector('[data-q="0"]');
  assert.ok(q1, "quiz did not render question 1");

  const correct0 = mod.quiz[0].answer;
  doc.querySelector(`[data-q="0"][data-k="${correct0}"]`).click();

  // answer every remaining question wrongly so "retry wrong" appears
  for (let i = 1; i < mod.quiz.length; i++) {
    const bad = [0, 1, 2, 3].find((k) => k !== mod.quiz[i].answer);
    const btn = doc.querySelector(`[data-q="${i}"][data-k="${bad}"]`);
    if (btn) btn.click();
  }

  const retry = doc.querySelector("[data-retry-wrong]");
  assert.ok(retry, "retry-wrong control should appear once all questions are answered");

  // the correctly answered question must still show as answered after retrying
  retry.click();
  const kept = doc.querySelector(`[data-q="0"][data-k="${correct0}"]`);
  assert.ok(kept, "question 1 should still exist after retry");
  assert.ok(kept.closest(".opt").classList.contains("is-ok"),
    "the correctly answered question must remain marked correct after retry-wrong");
  assert.ok(kept.disabled, "the correctly answered question should stay locked");

  // and a previously-wrong question must be re-answerable
  const reopened = doc.querySelector('[data-q="1"]');
  assert.ok(reopened && !reopened.disabled,
    "a missed question should be re-answerable after retry-wrong");

  w.close();
});

test("store reset clears everything", () => {
  const { w } = boot();
  const m = w.NSCOM_MODULES[0];
  w.STORE.markSection(m.id, m.sections[0].id);
  w.STORE.gradeCard(m.id, 0, true);
  w.STORE.scoreQuiz(m.id, 5, 10, [1, 2]);
  assert.ok(w.STORE.overall(w.NSCOM_MODULES).read > 0);

  w.STORE.reset();
  const prog = w.STORE.overall(w.NSCOM_MODULES);
  assert.strictEqual(prog.read, 0, "reset should clear reading progress");
  assert.strictEqual(w.STORE.cardsSeen(m.id, m.flashcards.length), 0, "reset should clear cards");
  w.close();
});
