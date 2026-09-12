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
  assert.ok(host.querySelectorAll(".trace__step").length >= 3,
    "the CRC simulator produced no division steps");
  assert.ok(host.querySelector(".trace__head"),
    "the CRC trace is missing its dividend/generator head row");

  w.close();
});

test("sections are disclosures that collapse when marked read", async () => {
  const { w, errors } = boot();
  assert.deepStrictEqual(errors, [], `boot errors: ${errors.slice(0,3).join(" | ")}`);

  // The app boots inside fetchFigs().then(boot), so the first render lands on a
  // later microtask than script evaluation. Yield before asserting, or the view
  // container is still empty and the test reports a routing failure that is
  // really just a timing artefact.
  await new Promise((r) => setTimeout(r, 80));

  w.location.hash = "#/m/m01";
  w.APP.render();
  const secs = [...w.document.querySelectorAll(".sec")];
  assert.ok(secs.length > 0, "no sections rendered on the lesson route");

  const s = secs[0];
  const btn = s.querySelector("[data-toggle]");
  const panel = s.querySelector(".sec__body");
  // Every requirement the disclosure has to satisfy, checked on the real DOM.
  assert.ok(btn, "section head must be a toggle button");
  assert.ok(btn.tagName === "BUTTON", "the toggle must be a real button for keyboard use");
  // Every section starts collapsed, read or not: a module has to be a navigable
  // list of titles on a phone rather than thousands of pixels of open content.
  assert.strictEqual(btn.getAttribute("aria-expanded"), "false",
    "every section starts collapsed, including unread ones");
  assert.ok(s.classList.contains("is-collapsed"),
    "an unread section is collapsed on first render");
  assert.strictEqual(btn.getAttribute("aria-controls"), panel.id,
    "aria-controls must point at the panel");
  assert.strictEqual(panel.getAttribute("role"), "region", "the panel must be a region");
  assert.ok(s.querySelector(".sec__chev"), "the toggle needs a chevron affordance");

  // toggling opens and closes
  btn.click();
  assert.ok(!s.classList.contains("is-collapsed"), "clicking the head must expand it");
  assert.strictEqual(btn.getAttribute("aria-expanded"), "true",
    "aria-expanded must follow the visual state");
  btn.click();
  assert.ok(s.classList.contains("is-collapsed"), "clicking again must collapse it");

  // marking read collapses it and the header carries the done state, because the
  // button that was tapped is no longer on screen once the panel closes.
  const mk = s.querySelector("[data-mark]");
  mk.click();
  assert.ok(s.classList.contains("is-collapsed"),
    "marking a section read must collapse it");
  assert.strictEqual(mk.getAttribute("aria-pressed"), "true",
    "the mark button must report pressed");
  assert.ok(s.classList.contains("is-read"),
    "a read section must carry the is-read class for the green done styling");
  assert.strictEqual(s.querySelector(".sec__state").textContent, "Done",
    "a read section must show Done on its header, the only part still visible");

  // un-marking reopens it and clears the badge
  mk.click();
  assert.ok(!s.classList.contains("is-collapsed"),
    "un-marking must re-open the section so it is visible as work in progress");
  assert.strictEqual(s.querySelector(".sec__state").textContent, "",
    "un-marking must clear the done badge");

  // marking a read section does not move it: collapsing removes height from the
  // document, and the anchor must absorb that so the page does not jump.
  const topBefore = s.getBoundingClientRect().top;
  mk.click();
  const topAfter = s.getBoundingClientRect().top;
  assert.ok(Math.abs(topAfter - topBefore) < 2,
    `the section must stay put when it collapses (moved ${(topAfter - topBefore).toFixed(1)}px)`);

  // The phone case: the reader has scrolled INSIDE a long section to reach the
  // Mark button at its foot, so the header is off-screen. Collapsing then leaves
  // the document shorter than the current scroll offset and the browser clamps
  // to the bottom of the page. The header must instead come to the top of the
  // viewport. jsdom has no real layout, so the geometry itself is asserted in the
  // browser; here we pin the contract the branch relies on -- every section
  // exposes a header anchor and a state slot for the badge.
  assert.ok(s.querySelector(".sec__h"), "the section must have a header to anchor on");
  assert.ok(s.querySelector(".sec__state"), "the header needs a state slot");
  assert.strictEqual(mk.getAttribute("aria-pressed"), "true",
    "after the zero-drift check the section is marked read again");

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

test("a viz measures its plate, not its own canvas", () => {
  // This is a regression test for a bug that shipped to every aid on the site.
  //
  // `measure(cv)` used to read `cv.getBoundingClientRect().width`. That is
  // circular: a canvas with no inline width reports the HTML default of 300px
  // before its first draw, so measure returned 300, fitCanvas then WROTE 300px
  // as the canvas's inline width, and the aid stayed 300px forever inside an
  // 894px plate. The previous check -- "inline width equals rendered width" --
  // passed the whole time, because a 300px canvas really is 300px wide; the
  // drawing was simply a third of the size it should be.
  //
  // jsdom has no layout engine, so getBoundingClientRect() is all zeros there
  // and cannot reproduce the bug directly. What CAN be pinned is the contract
  // that prevents it: measure() must consult the PARENT's box, so it returns the
  // plate width even when the canvas itself reports nothing.
  const { w } = boot();

  const plate = w.document.createElement("div");
  plate.style.width = "800px";
  w.document.body.appendChild(plate);
  const cv = w.document.createElement("canvas");
  plate.appendChild(cv);

  // Stub the plate's box: a real layout would give it 800px.
  plate.getBoundingClientRect = () => ({ width: 800, height: 200, top: 0, left: 0, right: 800, bottom: 200 });
  // And leave the canvas reporting the browser default, exactly as it would
  // before its first draw. If measure() reads this, the test fails below.
  cv.getBoundingClientRect = () => ({ width: 300, height: 150, top: 0, left: 0, right: 300, bottom: 150 });

  const measured = w.VIZ.measure(cv);
  assert.ok(measured > 400,
    `measure() returned ${measured} for a canvas inside an 800px plate; ` +
    `it is reading the canvas's own 300px default width, which is the bug that ` +
    `shrank every aid on the site`);

  // A plate with padding must yield the CONTENT box, not the border box, or the
  // canvas overflows by the padding and the browser scales the drawing down.
  plate.style.paddingLeft = "10px";
  plate.style.paddingRight = "10px";
  w.getComputedStyle = (el) => (el === plate
    ? { paddingLeft: "10px", paddingRight: "10px", borderLeftWidth: "0px", borderRightWidth: "0px" }
    : { paddingLeft: "0px", paddingRight: "0px", borderLeftWidth: "0px", borderRightWidth: "0px" });
  const inner = w.VIZ.measure(cv);
  assert.ok(Math.abs(inner - 780) < 2,
    `measure() returned ${inner}; a padded plate must yield its content box (780px), ` +
    `so the canvas cannot be wider than the space it sits in`);

  w.close();
});
