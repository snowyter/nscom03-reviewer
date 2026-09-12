/* viz.js — the shared runtime for inline visual aids.
 *
 * A "viz" is an interactive figure that lives INSIDE a section, under the
 * explanation that needs it. It is deliberately not a simulator: a simulator is
 * a bench you visit to explore, a viz is what you look at the moment you got
 * stuck. So every viz here is student-driven -- the student drags a control or
 * steps forward and watches the thing change. Nothing animates on its own while
 * they are reading, because motion in a study tool competes with the text.
 *
 * A viz registers itself the way a sim does:
 *
 *   window.VIZ.register("aloha-collision", {
 *     title:  "Pure vs slotted ALOHA",
 *     note:   "Drag the frame and watch the vulnerable window.",
 *     mount:  function (root) { ... }
 *   });
 *
 * mount() receives an element inside the frame and builds its own controls and
 * canvas. It may return a teardown function. The runtime handles the frame, the
 * caption, the INTERACTIVE tag, and lazy mounting: a viz mounts only when its
 * section panel is first opened, so a module with several aids does not start
 * a pile of timers on page load.
 */

(function (w) {
  "use strict";

  var REG = {};

  function register(id, def) {
    if (!id || !def || typeof def.mount !== "function") return;
    REG[id] = def;
  }

  function get(id) { return REG[id] || null; }

  /* ── helpers the viz modules share ──────────────────────────────────── */

  // A viz measures its container to decide how wide to draw.
  //
  // The width an aid must draw at is the width of the plate it sits in -- its
  // PARENT'S CONTENT BOX. Measuring the canvas itself is circular, and that is
  // not theoretical: before the first draw a canvas with no inline width
  // reports the HTML default of 300px, so `measure` returned 300, `fitCanvas`
  // then wrote 300px as the canvas's inline width, and every aid on the site
  // drew a 300px picture inside an 894px plate. The old "inline width equals
  // rendered width" check passed the whole time, because a 300px canvas really
  // is 300px wide -- the drawing was simply a third of the size it should be.
  //
  // The parent is only unreliable when it is not laid out yet, and that shows
  // up as a zero or absurd reading, which the fallbacks handle. There is
  // deliberately NO large minimum width: a floor above the real width makes the
  // canvas wider than its plate, and the browser then scales it down
  // non-uniformly, which is the distortion this function exists to prevent.
  // Drawing simply reflows at narrow sizes -- every aid clamps its own labels.
  function measure(cv) {
    var plate = cv.parentNode;
    if (plate && typeof w.getComputedStyle === "function") {
      var cs = w.getComputedStyle(plate);
      var pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      var bor = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
      var inner = plate.getBoundingClientRect().width - pad - bor;
      if (inner >= 40) return Math.round(inner);
    }
    var own = cv.getBoundingClientRect().width;
    if (own >= 40) return Math.round(own);
    if (plate && plate.clientWidth >= 40) return Math.round(plate.clientWidth);
    return 600;                                // last-resort sane default
  }

  // Device-pixel-ratio aware canvas sizing. Returns a 2D context already scaled
  // so drawing code can work in CSS pixels, which is what keeps the strokes
  // crisp on a phone without every viz repeating the same arithmetic.
  //
  // It also installs a ResizeObserver on the canvas, because a window resize
  // listener is not enough: the canvas can change width without the window
  // changing at all (a sidebar collapsing, a phone rotating, a section
  // expanding). When that happened the drawing kept its old width and the
  // browser scaled it non-uniformly, which distorted the aid. The observer
  // redraws at the true size instead.
  var observers = (typeof WeakMap === "function") ? new WeakMap() : null;

  function fitCanvas(cv, cssW, cssH, redraw) {
    var dpr = w.devicePixelRatio || 1;
    cv.width = Math.round(cssW * dpr);
    cv.height = Math.round(cssH * dpr);
    cv.style.width = cssW + "px";
    cv.style.height = cssH + "px";
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (redraw && observers && typeof w.ResizeObserver === "function") {
      // Observe the PLATE, not the canvas. The canvas is `max-width:100%`, so
      // when the plate SHRINKS the canvas is clamped and its own box changes --
      // but when the plate GROWS the canvas keeps its old inline width and its
      // own box does not change at all. An observer on the canvas therefore
      // never fires on a widening window, and the aid would stay stuck at its
      // old size. Watching the plate catches both directions.
      var plate = cv.parentNode || cv;
      var prev = observers.get(cv);
      if (!prev) {
        var ob = new w.ResizeObserver(function () {
          var want = measure(cv);
          var have = Math.round(parseFloat(cv.style.width) || 0);
          if (want > 0 && Math.abs(want - have) > 2) {
            // Redraw on the next frame, not inside the observer callback: the
            // redraw resizes the canvas, which would re-enter the observer and
            // produce "ResizeObserver loop completed with undelivered
            // notifications". Deferring breaks that cycle.
            (w.requestAnimationFrame || function (fn) { setTimeout(fn, 16); })(redraw);
          }
        });
        ob.observe(plate);
        observers.set(cv, ob);
      }
    }
    return ctx;
  }

  // The palette, read from CSS custom properties so a viz can never drift from
  // the site's world. Falls back to the dark-bench values if the vars are absent.
  function palette(el) {
    var cs = w.getComputedStyle(el || w.document.documentElement);
    function v(n, d) {
      var x = cs.getPropertyValue(n);
      return (x && x.trim()) || d;
    }
    // Read the real token names from base.css. An earlier version read --flag,
    // which does not exist anywhere, so every caller silently got a hard-coded
    // hex that ignored the light theme entirely.
    return {
      trace: v("--trace", "#7dffb2"),
      traceDim: v("--trace-dim", "#3d8f66"),
      amber: v("--amber", "#ffd166"),
      rule: v("--rule", "#1c4a3a"),
      ruleSoft: v("--rule-soft", "#143127"),
      ink: v("--ink", "#cfe8dc"),
      inkDim: v("--ink-dim", "#7e9d90"),
      faint: v("--ink-faint", "#4d6b5e"),
      ground: v("--ground", "#0a1410"),
      ground2: v("--ground-2", "#0d1a15"),
      warn: v("--warn", "#ff7b6b")
    };
  }

  function reducedMotion() {
    return !!(w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  // A labelled slider row, matching the control styling the sims already use so
  // a viz and a simulator look like the same surface.
  function slider(id, label, min, max, value, step, unit) {
    return `<div class="ctlrow">
      <label for="${id}">${label}</label>
      <input id="${id}" type="range" min="${min}" max="${max}" value="${value}" step="${step}">
      <span class="val" data-${id}-val>${value}${unit || ""}</span>
    </div>`;
  }

  /* ── lazy mounting ──────────────────────────────────────────────────── */

  var mounted = new WeakMap();

  function mountInto(host) {
    var id = host.getAttribute("data-viz");
    if (!id || mounted.has(host)) return;
    var def = REG[id];
    if (!def) return;
    mounted.set(host, true);
    var body = host.querySelector(".viz__body");
    if (!body) return;
    try {
      var teardown = def.mount(body, { helpers: api });
      if (typeof teardown === "function") host._teardown = teardown;
    } catch (e) {
      body.innerHTML = `<p class="viz__err">This visual aid failed to start.</p>`;
      if (w.console && w.console.warn) w.console.warn("viz " + id + " failed:", e);
    }
  }

  // Mount the visual aids in a freshly rendered view.
  //
  // An aid in the SCAN LAYER is visible the moment the section is expanded, so it
  // mounts then. An aid inside a Go deeper panel would only be visible once that
  // panel opens, so it waits. Anything else would start timers for content the
  // student cannot see.
  function scan(root) {
    var hosts = (root || w.document).querySelectorAll("[data-viz]");
    Array.prototype.forEach.call(hosts, function (h) {
      var panel = h.closest(".deep");
      if (panel && !panel.classList.contains("is-open")) return;
      var sec = h.closest(".sec");
      if (!panel && sec && sec.classList.contains("is-collapsed")) return;
      mountInto(h);
    });
  }

  function unmountAll(root) {
    var hosts = (root || w.document).querySelectorAll("[data-viz]");
    Array.prototype.forEach.call(hosts, function (h) {
      if (typeof h._teardown === "function") {
        try { h._teardown(); } catch (e) {}
        h._teardown = null;
      }
      mounted["delete"] ? mounted["delete"](h) : null;
    });
  }

  var api = {
    register: register, get: get,
    fitCanvas: fitCanvas, palette: palette, measure: measure,
    reducedMotion: reducedMotion, slider: slider,
    scan: scan, mountInto: mountInto, unmountAll: unmountAll
  };

  w.VIZ = api;
})(window);
