/* sim-modulation.js — ASK / FSK / PSK / QAM with carrier, data and result.
   One carrier cycle count per bit is fixed so the picture stays readable; the
   point is the relationship between bit pattern and resulting waveform. */

(function (w) {
  "use strict";

  var MODES = {
    ask: { label: "ASK", mb: 1 },
    fsk: { label: "FSK", mb: 1 },
    psk: { label: "PSK (BPSK)", mb: 1 },
    qpsk: { label: "QPSK (4-PSK)", mb: 2 },
    "qam16": { label: "16-QAM", mb: 4 }
  };

  /* Return the signal samples for a bit string in the given mode. */
  function signal(bits, mode, opts) {
    opts = opts || {};
    var cyc = opts.cyclesPerBit || 3;
    var pts = [];
    var step = 1 / 40;                     // 40 samples per carrier cycle

    if (mode === "qpsk" || mode === "qam16") {
      var mb = MODES[mode].mb;
      for (var i = 0; i + mb - 1 < bits.length; i += mb) {
        var sym = bits.slice(i, i + mb).join("");
        var v = symbol(mode, sym);
        for (var t = 0; t < cyc; t += step) {
          var ph = 2 * Math.PI * t + v.phase;
          pts.push(v.amp * Math.cos(ph));   // combined ASK (amp) + PSK (phase)
        }
      }
      return pts;
    }

    bits.forEach(function (b) {
      for (var t = 0; t < cyc; t += step) {
        var val;
        if (mode === "ask") {
          val = b === "1" ? Math.cos(2 * Math.PI * t) : 0;
        } else if (mode === "fsk") {
          var f = b === "1" ? 2 : 1;
          val = Math.cos(2 * Math.PI * f * t);
        } else {                            // psk
          val = Math.cos(2 * Math.PI * t + (b === "1" ? 0 : Math.PI));
        }
        pts.push(val);
      }
    });
    return pts;
  }

  function symbol(mode, sym) {
    if (mode === "qpsk") {
      return { "00": { amp: 1, phase: Math.PI * 0.25 }, "01": { amp: 1, phase: Math.PI * 0.75 },
               "11": { amp: 1, phase: Math.PI * 1.25 }, "10": { amp: 1, phase: Math.PI * 1.75 } }[sym]
             || { amp: 1, phase: 0 };
    }
    if (mode === "qam16") {
      var a = { "00": .4, "01": .8, "10": 1.2, "11": 1.6 };
      return { amp: a[sym.slice(0, 2)] || 1, phase: (sym.slice(2) === "00" ? 0
             : sym.slice(2) === "01" ? Math.PI / 2
             : sym.slice(2) === "10" ? Math.PI : Math.PI * 1.5) };
    }
    return { amp: 1, phase: 0 };
  }

  function svgFor(pts, opts) {
    opts = opts || {};
    var W = 900, H = 180, pad = 26;
    if (!pts.length) return "";
    var min = Math.min.apply(null, pts), max = Math.max.apply(null, pts);
    var lo = Math.min(min, -1), hi = Math.max(max, 1);
    var scaleY = function (v) { return H / 2 - (v / hi) * (H / 2 - pad) * (hi === 0 ? 1 : 1); };
    var step = (W - pad * 2) / pts.length;
    var d = "";
    for (var i = 0; i < pts.length; i++) {
      d += (i === 0 ? "M" : "L") + (pad + i * step).toFixed(2) + " " + scaleY(pts[i]).toFixed(2);
    }
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Modulated signal">
      <line x1="${pad}" y1="${H / 2}" x2="${W - pad}" y2="${H / 2}"
            stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 3"/>
      <path d="${d}" fill="none" stroke="var(--trace)" stroke-width="1.8"
            vector-effect="non-scaling-stroke"/></svg>`;
  }

  function bitsSvg(bits, mode) {
    var W = 900, pad = 26, n = bits.length;
    var per = (mode === "qpsk" || mode === "qam16") ? MODES[mode].mb : 1;
    var groups = Math.ceil(n / per);
    var span = (W - pad * 2) / groups;
    var out = "";
    bits.forEach(function (b, i) {
      var g = Math.floor(i / per);
      var cx = pad + (g + 0.5) * span;
      out += `<text x="${cx.toFixed(1)}" y="26" fill="var(--ink-dim)"
        font-size="13" font-family="var(--mono)" text-anchor="middle">${b}</text>`;
    });
    return out;
  }

  function mount(root) {
    root.innerHTML = `
      <div class="ctlrow">
        <label for="md-bits">Bits</label>
        <input id="md-bits" type="text" value="10110010" spellcheck="false" style="min-width:12rem">
        <button class="btn" type="button" data-md-rand>Random</button>
      </div>
      <div class="ctlrow">
        <label for="md-mode">Modulation</label>
        <select id="md-mode">
          ${Object.keys(MODES).map(function (k) {
            return `<option value="${k}">${MODES[k].label}</option>`;
          }).join("")}
        </select>
      </div>
      <div class="wave" data-md-wave></div>
      <div class="wave__legend">
        <i><span class="sw" style="background:var(--trace)"></span>modulated carrier</i>
        <i>bits shown above the waveform</i>
      </div>
      <div class="readout" data-md-out></div>
      <p class="sim__desc" style="padding:.7rem 0 0" data-md-note></p>`;

    var $ = function (sel) {
      // resolve both "#foo" and "[data-foo]" lookup conventions
      var byData = sel.charAt(0) === "#" ? "[data-" + sel.slice(1) + "]" : sel;
      return root.querySelector(sel) || root.querySelector(byData);
    };
    var bitsEl = $("#md-bits"), modeEl = $("#md-mode");
    var waveEl = $("#md-wave"), outEl = $("#md-out"), noteEl = $("#md-note");

    var NOTES = {
      ask: "ASK varies amplitude only: 1 = carrier on, 0 = carrier off. Cheap and simple, but the least noise-resistant of the four, because noise is itself amplitude.",
      fsk: "FSK varies frequency: 1 = high tone, 0 = low tone. Robust against amplitude noise, which is why it suited early low-speed modems. Costs more bandwidth.",
      psk: "PSK varies phase: 1 and 0 are 180° apart. More noise-resistant than ASK, because the receiver looks for phase, not level.",
      qpsk: "QPSK carries 2 bits per symbol using four phases 90° apart, so the bit rate is twice the baud rate.",
      qam16: "16-QAM combines ASK and PSK — four amplitudes × four phases = 16 points, 4 bits per symbol. Higher throughput at the cost of a smaller margin between points, so it needs a clean channel."
    };

    function bits() {
      var v = (bitsEl.value || "").replace(/[^01]/g, "");
      if (!v) v = "1";
      var per = (modeEl.value === "qpsk" || modeEl.value === "qam16") ? MODES[modeEl.value].mb : 1;
      var maxBits = 16 * per;
      if (v.length > maxBits) v = v.slice(0, maxBits);
      if (modeEl.value === "qpsk" || modeEl.value === "qam16") {
        while (v.length % per !== 0) v += "0";      // keep whole symbols
      }
      return v.split("");
    }

    function draw() {
      var b = bits();
      var mode = modeEl.value;
      var pts = signal(b, mode);
      var per = (mode === "qpsk" || mode === "qam16") ? MODES[mode].mb : 1;
      var symCount = Math.ceil(b.length / per);

      waveEl.innerHTML = svgFor(pts)
        .replace("</svg>", bitsSvg(b, mode) + "</svg>");
      noteEl.textContent = NOTES[mode] || "";

      outEl.innerHTML = [
        ["Modulation", MODES[mode].label],
        ["Bits", b.join("")],
        ["Bits per symbol", per],
        ["Symbols sent", symCount],
        ["Baud rate vs bit rate", "Ba = N / " + per + "  (N = " + b.length + " → Ba = " +
          (b.length / per) + ")"]
      ].map(function (r) {
        return `<div><dt>${w.RENDER.esc(r[0])}</dt><dd>${w.RENDER.esc(r[1])}</dd></div>`;
      }).join("");
    }

    root.addEventListener("input", draw);
    root.addEventListener("change", draw);
    root.addEventListener("click", function (e) {
      if (!e.target.closest("[data-md-rand]")) return;
      var n = 8, out = "";
      for (var i = 0; i < n; i++) out += Math.random() < 0.5 ? "0" : "1";
      bitsEl.value = out;
      draw();
    });

    draw();
  }

  w.SIMS.push({
    id: "sim-modulation", mod: "m04",
    title: "ASK · FSK · PSK · QAM bench",
    desc: "Switch modulation schemes on the same bit string and watch what changes — amplitude, frequency, phase, or a combined constellation — and how many bits each symbol carries.",
    mount: mount,
    _signal: signal, _modes: MODES
  });
})(window);
