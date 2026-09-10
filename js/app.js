/* app.js — routing, chrome, and the hero trace. */

(function (w) {
  "use strict";

  var D = w.document;

  var MODS = [], BY_ID = {}, FIGS = [];
  var teardown = null;

  /* ── data ───────────────────────────────────────────────────── */

  function loadModules() {
    MODS = (w.NSCOM_MODULES || []).slice().sort(function (a, b) { return a.num - b.num; });
    BY_ID = {};
    MODS.forEach(function (m) { BY_ID[m.id] = m; });
  }

  /* ── chrome ─────────────────────────────────────────────────── */

  function paintReadouts() {
    var allSecs = [], readN = 0;
    MODS.forEach(function (m) {
      m.sections.forEach(function (s) {
        allSecs.push(s.id);
        if (w.STORE.isSectionRead(s.id)) readN++;
      });
    });
    var pct = allSecs.length ? Math.round((readN / allSecs.length) * 100) : 0;
    set("modules", MODS.length);
    set("progress", pct + "%");
    set("due", w.STORE.dueAll(MODS));
    var f = D.querySelector("[data-foot-progress]");
    if (f) f.textContent = readN + " / " + allSecs.length + " sections read · " + pct + "%";
  }

  function set(name, val) {
    var n = D.querySelector('[data-readout="' + name + '"]');
    if (n) n.textContent = val;
  }

  function paintRail(currentId) {
    var list = D.querySelector("[data-rail]");
    if (!list) return;
    list.innerHTML = MODS.map(function (m) {
      var readN = w.STORE.readCount(m.sections.map(function (s) { return s.id; }));
      var all = readN === m.sections.length;
      var cur = m.id === currentId;
      return `<li class="rail__item">
        <a class="rail__link" href="#/m/${m.id}" ${cur ? 'aria-current="page"' : ""}>
          <span class="rail__num">${String(m.num).padStart(2, "0")}</span>
          <span class="rail__name">${w.RENDER.esc(m.title)}
            ${all ? '<span class="rail__done" aria-label="complete">✓</span>' : ""}</span>
        </a></li>`;
    }).join("");
  }

  /* ── hero trace ─────────────────────────────────────────────── */

  function heroTrace() {
    var path = D.querySelector("[data-hero-trace] path");
    if (!path) return;
    // One square-edged digital waveform: bits alternating in a fixed pattern so
    // the trace reads as a signal, not decoration.
    var bits = "10110100101101001011001011010010".split("");
    var W = 1200, H = 120, step = W / bits.length;
    var lo = H - 18, hi = 18, d = "M0 " + (bits[0] === "1" ? hi : lo);
    for (var i = 0; i < bits.length; i++) {
      var y = bits[i] === "1" ? hi : lo;
      var x0 = i * step, x1 = (i + 1) * step;
      d += " L" + x0.toFixed(1) + " " + y;                       // level for this bit
      if (i < bits.length - 1) {
        var yn = bits[i + 1] === "1" ? hi : lo;
        if (yn !== y) d += " L" + x1.toFixed(1) + " " + y;        // square edge
      }
    }
    d += " L" + W + " " + (bits[bits.length - 1] === "1" ? hi : lo);
    path.setAttribute("d", d);
    path.parentNode.setAttribute("preserveAspectRatio", "none");
  }

  /* ── routes ─────────────────────────────────────────────────── */

  function parse() {
    var h = (location.hash || "#/").replace(/^#/, "");
    var bits = h.split("/").filter(Boolean);   // e.g. ["m","m01","quiz"]
    return { raw: h, bits: bits };
  }

  function view() { return D.querySelector("[data-view]"); }

  function render() {
    if (teardown) { try { teardown(); } catch (e) {} teardown = null; }
    var r = parse(), b = r.bits, v = view();
    if (!v) return;

    closeRail();

    // #/            overview
    if (b.length === 0) {
      paintRail(null);
      v.innerHTML = w.RENDER.overview(MODS, w.STORE.all(), FIGS);
      w.STORE.remember("#/");
      paintReadouts();
      return;
    }

    // #/sims
    if (b[0] === "sims") {
      paintRail(null);
      v.innerHTML = w.RENDER.simHost();
      w.SIMHOST.render(v.querySelector("[data-sim-host]"));
      w.STORE.remember("#/sims");
      paintReadouts();
      return;
    }

    // #/syllabus
    if (b[0] === "syllabus") {
      paintRail(null);
      v.innerHTML = syllabus();
      w.STORE.remember("#/syllabus");
      paintReadouts();
      return;
    }

    // #/m/<id>[/…]
    if (b[0] === "m" && b[1]) {
      var mod = BY_ID[b[1]];
      if (!mod) { v.innerHTML = missing(b[1]); paintRail(null); return; }
      paintRail(mod.id);
      var sub = b[2];

      if (!sub) {
        v.innerHTML = w.RENDER.lesson(mod, w.STORE.all());
        wireLesson(v, mod);
        w.STORE.remember("#/m/" + mod.id);
      } else if (sub === "cards") {
        v.innerHTML = `<div class="drill"></div>`;
        teardown = w.VIEWS.mountDrill(v.querySelector(".drill"), mod);
        w.STORE.remember("#/m/" + mod.id + "/cards");
      } else if (sub === "quiz") {
        v.innerHTML = `<div class="quiz"></div>`;
        teardown = w.VIEWS.mountQuiz(v.querySelector(".quiz"), mod);
        w.STORE.remember("#/m/" + mod.id + "/quiz");
      } else if (sub === "s" && b[3]) {
        // deep link to a section, used by quiz explanations
        v.innerHTML = w.RENDER.lesson(mod, w.STORE.all());
        wireLesson(v, mod);
        var node = D.getElementById(b[3]);
        if (node) node.scrollIntoView({ block: "start" });
      } else {
        v.innerHTML = missing(b.slice(2).join("/"));
      }
      paintReadouts();
      return;
    }

    v.innerHTML = missing(b.join("/"));
    paintReadouts();
  }

  function missing(what) {
    return `<div class="drill__done">
      <h3>No signal on that channel</h3>
      <p>Nothing is mapped to <code>${w.RENDER.esc(what)}</code>. Pick a module from the index.</p>
      <a class="btn btn--go" href="#/">Back to overview</a>
    </div>`;
  }

  /* ── lesson wiring ──────────────────────────────────────────── */

  function wireLesson(scope, mod) {
    scope.addEventListener("click", onClick);
    teardown = function () { scope.removeEventListener("click", onClick); };

    function onClick(e) {
      var zoom = e.target.closest("[data-zoom]");
      if (zoom) {
        openLightbox(zoom.getAttribute("data-zoom"), zoom.getAttribute("data-zoom-alt"));
        return;
      }
      var mk = e.target.closest("[data-mark]");
      if (mk) {
        var id = mk.getAttribute("data-mark");
        w.STORE.markSection(id);
        updateMark(mk, true);
        refreshSpine(mod);
        paintReadouts();
        paintRail(mod.id);
        return;
      }
      var all = e.target.closest("[data-mark-all]");
      if (all) {
        mod.sections.forEach(function (s) { w.STORE.markSection(s.id); });
        scope.querySelectorAll("[data-mark]").forEach(function (b2) { updateMark(b2, true); });
        scope.querySelectorAll(".sec").forEach(function (s2) { s2.classList.add("is-read"); });
        refreshSpine(mod);
        paintReadouts();
        paintRail(mod.id);
      }
    }
  }

  function updateMark(btn, read) {
    btn.textContent = read ? "read ✓" : "mark read";
    var sec = btn.closest(".sec");
    if (sec) sec.classList.toggle("is-read", read);
  }

  function refreshSpine(mod) {
    var st = w.STORE.all();
    var bars = D.querySelectorAll(".spine__b");
    mod.sections.forEach(function (s, i) {
      if (bars[i]) bars[i].classList.toggle("is-on", !!st.read[s.id]);
    });
    var n = w.STORE.readCount(mod.sections.map(function (s) { return s.id; }));
    var lab = D.querySelector(".spine > span");
    if (lab) lab.textContent = "Read " + n + "/" + mod.sections.length;
    var pct = D.querySelector(".spine > span:last-child");
    if (pct) pct.textContent = Math.round((n / mod.sections.length) * 100) + "%";
  }

  /* ── lightbox ───────────────────────────────────────────────── */

  var box = null;
  function openLightbox(src, alt) {
    closeLightbox();
    box = D.createElement("div");
    box.className = "lbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Enlarged figure");
    box.innerHTML = `<img src="${w.RENDER.esc(src)}" alt="${w.RENDER.esc(alt || "")}">
      <button class="lbox__x" type="button">close ✕</button>`;
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.closest(".lbox__x")) closeLightbox();
    });
    D.body.appendChild(box);
    var x = box.querySelector(".lbox__x");
    if (x) x.focus();
  }
  function closeLightbox() {
    if (box && box.parentNode) box.parentNode.removeChild(box);
    box = null;
  }

  /* ── syllabus (flat sheet index) ────────────────────────────── */

  function syllabus() {
    var rows = MODS.map(function (m) {
      return `<li class="rail__item">
        <a class="rail__link" href="#/m/${m.id}">
          <span class="rail__num">${String(m.num).padStart(2, "0")}</span>
          <span class="rail__name">${w.RENDER.esc(m.title)}
            <small style="color:var(--ink-faint)"> — ${m.sections.length} sections,
            ${m.flashcards.length} cards, ${m.quiz.length} quiz</small></span>
        </a></li>`;
    }).join("");
    return `<div class="ov__head">
      <h1 class="ov__title">Sheet index</h1>
      <p class="ov__lede">Every module in the deck, in order, with what each carries.</p>
    </div>
    <ol class="rail__list" style="border-top:1px solid var(--rule)">${rows}</ol>`;
  }

  /* ── theme ──────────────────────────────────────────────────── */

  function applyTheme(t) {
    D.documentElement.setAttribute("data-theme", t);
    var b = D.querySelector("[data-theme-toggle]");
    if (b) {
      b.setAttribute("aria-pressed", t === "beam" ? "true" : "false");
      var txt = b.querySelector(".ctl__txt");
      if (txt) txt.textContent = t === "beam" ? "Beam" : "Phosphor";
    }
  }

  function initTheme() {
    var t = w.STORE.theme();
    if (!t) t = w.matchMedia && w.matchMedia("(prefers-color-scheme: light)").matches ? "beam" : "phosphor";
    applyTheme(t);
    var b = D.querySelector("[data-theme-toggle]");
    if (b) b.addEventListener("click", function () {
      var cur = D.documentElement.getAttribute("data-theme");
      var next = cur === "beam" ? "phosphor" : "beam";
      w.STORE.setTheme(next);
      applyTheme(next);
    });
  }

  /* ── rail (mobile) ──────────────────────────────────────────── */

  function closeRail() {
    var r = D.querySelector("#rail");
    if (r) r.removeAttribute("data-open");
    var b = D.querySelector("[data-menu-toggle]");
    if (b) b.setAttribute("aria-expanded", "false");
  }

  function initRail() {
    var b = D.querySelector("[data-menu-toggle]");
    var r = D.querySelector("#rail");
    if (!b || !r) return;
    b.addEventListener("click", function () {
      var open = r.getAttribute("data-open") === "true";
      if (open) { r.removeAttribute("data-open"); b.setAttribute("aria-expanded", "false"); }
      else { r.setAttribute("data-open", "true"); b.setAttribute("aria-expanded", "true"); }
    });
  }

  /* ── boot ───────────────────────────────────────────────────── */

  function boot() {
    loadModules();
    if (!MODS.length) {
      var v = view();
      if (v) v.innerHTML = `<div class="drill__done"><h3>No content loaded</h3>
        <p>The module data files did not load. Check the console.</p></div>`;
      return;
    }
    w.RENDER.indexFigs(FIGS);
    initTheme();
    initRail();
    paintRail(null);
    heroTrace();
    w.addEventListener("hashchange", render);
    D.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });
    w.STORE.on(function () { paintReadouts(); });
    render();
  }

  // figures are fetched at boot so render.js can resolve fig ids
  function fetchFigs() {
    return fetch("figs.json")
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (j) { FIGS = j || []; });
  }

  if (D.readyState === "loading") {
    D.addEventListener("DOMContentLoaded", function () { fetchFigs().then(boot); });
  } else {
    fetchFigs().then(boot);
  }

  w.APP = { render: render, figures: function () { return FIGS; } };
})(window);
