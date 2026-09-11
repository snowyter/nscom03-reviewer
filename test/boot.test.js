// Boot the real page in a DOM and assert the app runs and the simulator bench
// mounts. Catches load-order bugs (a registry used before it is initialised)
// that a syntax check and a content validator both miss.
//
// Scripts are injected in index.html's own order and evaluated by jsdom, so the
// page's real load sequence is what gets tested -- nothing is stubbed except
// fetch() and the figure JSON, which are served from disk.

import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function boot() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(e.message));
  vc.on("error", () => {});
  vc.on("warn", () => {});

  // Collect the script sources in document order, then strip them from the HTML
  // so jsdom does not try to fetch them over a network that is not there.
  const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const stripped = html
    .replace(/<script src="[^"]+"><\/script>/g, "")
    .replace(/<script>[\s\S]*?<\/script>/g, "");

  const dom = new JSDOM(stripped, {
    url: "http://localhost/",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(win) {
      win.fetch = (u) => {
        const rel = String(u).replace(/^\.?\//, "");
        const p = path.join(ROOT, rel);
        if (!fs.existsSync(p)) {
          return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve([]) });
        }
        const body = fs.readFileSync(p, "utf8");
        return Promise.resolve({
          ok: true, status: 200,
          text: () => Promise.resolve(body),
          json: () => Promise.resolve(JSON.parse(body))
        });
      };
    },
  });

  const w = dom.window;
  // Evaluate inline scripts first (SIMS bootstrap), then each external file.
  for (const code of inline) {
    try { w.eval(code); } catch (e) { errors.push("inline: " + e.message); }
  }
  for (const src of srcs) {
    // srcs come from index.html and may carry a ?v=<hash> cache-buster added by
    // the deploy stamping step; strip it before touching the filesystem.
    const clean = src.split("?")[0];
    const p = path.join(ROOT, clean);
    if (!fs.existsSync(p)) { errors.push("missing script: " + clean); continue; }
    try { w.eval(fs.readFileSync(p, "utf8")); }
    catch (e) { errors.push(clean + ": " + e.message); }
  }
  return { dom, w, errors, srcs };
}

test("every script in index.html loads and the app boots", () => {
  const { w, errors, srcs } = boot();

  assert.ok(srcs.length >= 20, `expected >=20 scripts, found ${srcs.length}`);
  const missing = errors.filter((e) => e.startsWith("missing script"));
  assert.deepStrictEqual(missing, [], "index.html references a file that does not exist");

  const pushErrs = errors.filter((e) => e.includes("reading 'push'"));
  assert.deepStrictEqual(pushErrs, [],
    "a registry was used before it was initialised (load-order bug)");

  const fatal = errors.filter((e) => !e.includes("m05"));
  assert.deepStrictEqual(fatal, [], `script errors: ${fatal.slice(0, 5).join(" | ")}`);

  assert.strictEqual(typeof w.RENDER, "object", "RENDER did not load");
  assert.strictEqual(typeof w.STORE, "object", "STORE did not load");
  assert.strictEqual(typeof w.SRS, "object", "SRS did not load");
  assert.strictEqual(typeof w.VIEWS, "object", "VIEWS did not load");
  assert.strictEqual(typeof w.SIMHOST, "object", "SIMHOST did not load");
  assert.strictEqual(typeof w.APP, "object", "APP did not load");
  assert.ok((w.NSCOM_MODULES || []).length >= 9,
    `expected >=9 modules, got ${(w.NSCOM_MODULES || []).length}`);

  w.close();
});

test("the simulator bench registers and mounts every simulator", () => {
  const { w, errors } = boot();

  assert.strictEqual((w.SIMS || []).length, 5,
    `expected 5 simulators registered, got ${(w.SIMS || []).length}; ` +
    `errors: ${errors.slice(0, 4).join(" | ")}`);

  const host = w.document.createElement("div");
  w.document.body.appendChild(host);
  w.SIMHOST.render(host);

  assert.strictEqual(host.querySelectorAll(".sim").length, 5, "not every sim rendered");

  const mountErrs = [...host.querySelectorAll(".sim__err")].map((e) => e.textContent);
  assert.deepStrictEqual(mountErrs, [], `simulators failed to mount: ${mountErrs.join(" | ")}`);

  assert.ok(host.querySelectorAll(".readout dd").length >= 15,
    "simulators produced no readouts");
  assert.ok(host.querySelectorAll(".wave svg").length >= 4,
    "simulators produced no diagrams");
  assert.ok(host.querySelectorAll(".steps li").length >= 3,
    "the CRC simulator produced no division steps");

  w.close();
});

test("the router renders each route without throwing", () => {
  const { w, errors } = boot();
  const mods = w.NSCOM_MODULES || [];
  assert.ok(mods.length > 0, "no modules to route to");

  const routes = ["#/", "#/sims", "#/syllabus",
                  `#/m/${mods[0].id}`, `#/m/${mods[0].id}/cards`, `#/m/${mods[0].id}/quiz`];
  for (const r of routes) {
    w.location.hash = r;
    w.APP.render();
    const v = w.document.querySelector("[data-view]");
    assert.ok(v && v.innerHTML.length > 50, `route ${r} rendered nothing`);
  }
  const fatal = errors.filter((e) => !e.includes("m05"));
  assert.deepStrictEqual(fatal, [], `route errors: ${fatal.slice(0, 3).join(" | ")}`);
  w.close();
});
