/* sim-line-coding.js — line-coding waveforms as SVG.
   Square edges: a level change inserts (next.x, current.y) before moving, so
   the path never draws a diagonal. The last level extends to the right edge. */

(function (w) {
  "use strict";

  var SCHEMES = {
    "nrz-l": {
      label: "NRZ-L",
      note: "Level is the bit: 1 = high, 0 = low. Baseline wandering and no self-sync.",
      gen: function (bits) { return bits.map(function (b) { return b === "1" ? 1 : 0; }); }
    },
    "nrz-i": {
      label: "NRZ-I",
      note: "Invert on 1: a 1 causes a transition, a 0 holds the level. Self-syncing on 1s.",
      gen: function (bits) {
        var lvl = 0, out = [];
        bits.forEach(function (b) { if (b === "1") lvl = 1 - lvl; out.push(lvl); });
        return out;
      }
    },
    "manchester": {
      label: "Manchester",
      note: "A transition at the middle of every bit; 1 = high→low, 0 = low→high. Self-syncing, r = ½.",
      gen: function (bits) {
        var out = [];
        bits.forEach(function (b) { out.push(b === "1" ? 1 : 0, b === "1" ? 0 : 1); });
        return out;
      }
    },
    "diff-manchester": {
      label: "Differential Manchester",
      note: "Mid-bit transition always; a 0 adds an extra transition at the bit start. Self-syncing, r = ½.",
      gen: function (bits) {
        var out = [], lvl = 0;
        bits.forEach(function (b) {
          if (b === "0") lvl = 1 - lvl;      // transition at bit start
          out.push(lvl); lvl = 1 - lvl;       // mandatory mid-bit transition
          out.push(lvl);
        });
        return out;
      }
    },
    "ami": {
      label: "AMI",
      note: "Alternate Mark Inversion: 0 = zero level, 1 alternates +V / −V. No DC component, syncs on 1s.",
      gen: function (bits) {
        var out = [], sign = 1;
        bits.forEach(function (b) {
          if (b === "1") { out.push(sign); sign = -sign; } else out.push(0);
        });
        return out;
      }
    },
    "pseudoternary": {
      label: "Pseudoternary",
      note: "The inverse of AMI: 1 = zero level, 0 alternates +V / −V.",
      gen: function (bits) {
        var out = [], sign = 1;
        bits.forEach(function (b) {
          if (b === "0") { out.push(sign); sign = -sign; } else out.push(0);
        });
        return out;
      }
    },
    "2b1q": {
      label: "2B1Q",
      note: "Two bits per symbol, four levels (−3, −1, +1, +3): 00→−3, 01→−1, 10→+1, 11→+3.",
      gen: function (bits) {
        var map = { "00": -3, "01": -1, "10": 1, "11": 3 };
        var out = [];
        for (var i = 0; i + 1 < bits.length; i += 2) out.push(map[bits.slice(i, i + 2).join("")]);
        return out;
      }
    }
  };

  /* Build SVG path data with clean square edges. */
  function pathFor(levels, opts) {
    opts = opts || {};
    var W = opts.width || 900, H = opts.height || 200;
    var pad = 26, n = levels.length;
    if (!n) return { d: "", W: W, H: H };
    var span = (W - pad * 2) / n;
    var yFor = function (v) { return H / 2 - v * (H / 2 - pad) / 3; };

    var d = "M" + pad + " " + yFor(levels[0]);
    for (var i = 0; i < n; i++) {
      var x0 = pad + i * span, x1 = pad + (i + 1) * span;
      var y = yFor(levels[i]);
      d += " L" + x1.toFixed(1) + " " + y.toFixed(1);     // level held across the bit
      if (i < n - 1) {
        var yn = yFor(levels[i + 1]);
        if (yn !== y) d += " L" + x1.toFixed(1) + " " + yn.toFixed(1);  // square edge
      }
    }
    return { d: d, W: W, H: H, span: span, pad: pad, yFor: yFor };
  }

  function svgFor(levels, bits, opts) {
    opts = opts || {};
    var per = opts.perBit || 1;                 // levels emitted per bit
    var g = pathFor(levels, opts);
    var W = g.W, H = g.H, span = g.span, pad = g.pad;

    // graticule
    var vlines = "";
    for (var x = pad; x <= W - pad + 0.1; x += span) {
      vlines += `<line x1="${x.toFixed(1)}" y1="8" x2="${x.toFixed(1)}" y2="${H - 8}" stroke="var(--rule-soft)" stroke-width="1"/>`;
    }
    var mid = `<line x1="${pad}" y1="${H / 2}" x2="${W - pad}" y2="${H / 2}" stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 3"/>`;

    // bit labels centered over each bit
    var labels = "";
    bits.forEach(function (b, i) {
      var cx = pad + (i + 0.5) * span * per;
      labels += `<text x="${cx.toFixed(1)}" y="${H - 6}" fill="var(--ink-faint)"
        font-size="12" font-family="var(--mono)" text-anchor="middle">${b}</text>`;
    });

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Waveform">
      ${vlines}${mid}
      <line x1="${pad}" y1="8" x2="${pad}" y2="${H - 8}" stroke="var(--rule)" stroke-width="1"/>
      <path d="${g.d}" fill="none" stroke="var(--trace)" stroke-width="2.2"
            stroke-linejoin="miter" vector-effect="non-scaling-stroke"/>
      ${labels}</svg>`;
  }

  function mount(root) {
    root.innerHTML = `
      <div class="ctlrow">
        <label for="lc-bits">Bit string</label>
        <input id="lc-bits" type="text" value="10110010" spellcheck="false" style="min-width:12rem">
        <button class="btn" type="button" data-lc-rand>Random</button>
      </div>
      <div class="ctlrow">
        <label for="lc-scheme">Scheme</label>
        <select id="lc-scheme">
          ${Object.keys(SCHEMES).map(function (k) {
            return `<option value="${k}">${SCHEMES[k].label}</option>`;
          }).join("")}
        </select>
      </div>
      <div class="wave" data-lc-wave></div>
      <div class="wave__legend">
        <i><span class="sw" style="background:var(--trace)"></span>signal level</i>
        <i>bit period shown by vertical rules</i>
      </div>
      <div class="readout" data-lc-out></div>
      <p class="sim__desc" style="padding:.7rem 0 0" data-lc-note></p>`;

    var $ = function (s) { return root.querySelector(s); };
    var bitsEl = $("#lc-bits"), schemeEl = $("#lc-scheme");
    var waveEl = $("#lc-wave"), outEl = $("#lc-out"), noteEl = $("#lc-note");

    function bits() {
      var v = (bitsEl.value || "").replace(/[^01]/g, "");
      if (!v) v = "1";
      if (v.length > 24) v = v.slice(0, 24);
      return v.split("");
    }

    function draw() {
      var b = bits();
      var key = schemeEl.value;
      var s = SCHEMES[key];
      var levels = s.gen(b);
      var per = key === "manchester" || key === "diff-manchester" ? 2 : 1;

      waveEl.innerHTML = svgFor(levels, b, { perBit: per });
      noteEl.textContent = s.note;

      var nBits = b.length;
      var nLevels = levels.length;
      var r = (key === "manchester" || key === "diff-manchester") ? "1/2"
            : key === "2b1q" ? "2" : "1";
      outEl.innerHTML = [
        ["Scheme", s.label],
        ["Bits", b.join("")],
        ["Signal elements", nLevels],
        ["r (bits per element)", r],
        ["Ba = N / r (same N)", nLevels + " elements for " + nBits + " bits"]
      ].map(function (row) {
        return `<div><dt>${w.RENDER.esc(row[0])}</dt><dd>${w.RENDER.esc(row[1])}</dd></div>`;
      }).join("");
    }

    root.addEventListener("input", draw);
    root.addEventListener("change", draw);
    root.addEventListener("click", function (e) {
      if (!e.target.closest("[data-lc-rand]")) return;
      var n = 8, out = "";
      for (var i = 0; i < n; i++) out += Math.random() < 0.5 ? "0" : "1";
      bitsEl.value = out;
      draw();
    });

    draw();
  }

  w.SIMS.push({
    id: "sim-line-coding", mod: "m03",
    title: "Line-coding waveform bench",
    desc: "Type bits and switch schemes to see exactly how each encoding lays levels down — including why Manchester spends two signal elements per bit and where NRZ-I finds its clock.",
    mount: mount,
    _path: pathFor, _schemes: SCHEMES        // exposed for the maths tests
  });
})(window);
