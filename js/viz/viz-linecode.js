/* viz-linecode.js — the line-encoding schemes, drawn as real waveforms.
 *
 * Line encoding is taught as a table of names and rules, and the rules only make
 * sense once you can see the waveform for the SAME bit stream under each scheme.
 * Students are asked to identify a scheme from a trace, or to say which of the
 * five design criteria a scheme fails -- both are impossible from prose.
 *
 * This draws one fixed bit pattern under whichever scheme is chosen, with the
 * bit cells marked, so the differences (where the transitions fall, whether the
 * signal returns to zero, whether the baseline drifts) are directly comparable.
 *
 * Student-driven: pick a scheme and a bit pattern. Nothing animates.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    // A fixed default pattern that exposes the interesting cases: a run of
    // identical bits (where NRZ loses sync and AMI gets interesting), and
    // alternating bits (where the clock is easy).
    var PATTERNS = [
      { id: "runs",  label: "0 0 0 0 1 1 0 1", bits: "00001101" },
      { id: "alt",   label: "1 0 1 0 1 0 1 0", bits: "10101010" },
      { id: "mixed", label: "1 1 0 0 0 1 1 0", bits: "11000110" }
    ];

    // Each scheme supplies a `levels` function: given the bit array and an index,
    // return the y-fraction (0 = top rail, 1 = bottom rail) for that bit cell,
    // plus an optional mid-cell transition (Manchester). Keeping the geometry in
    // one place means every scheme is drawn by the same code path.
    // Each scheme maps the bit array to a level fraction per cell, computed from
    // scratch on every call -- no carried state, because a stateful version made
    // NRZ-I and AMI disagree with themselves across redraws.
    // Level convention: 0 = top rail (+V), 0.5 = middle (0 V), 1 = bottom (-V).
    function pre(bits) {
      // For every index, the count of 1s (or 0s) strictly before it, which is
      // what the alternating schemes need.
      var ones = 0, zeros = 0, out = [];
      for (var i = 0; i < bits.length; i++) {
        out.push({ ones: ones, zeros: zeros });
        if (bits[i]) ones++; else zeros++;
      }
      return out;
    }

    var SCHEMES = [
      { id: "unipolar", label: "Unipolar NRZ",
        note: "A positive voltage for 1, zero for 0. The average is non-zero, so the signal carries a DC component — the flaw the exam asks about.",
        levels: function (b, i) { return b[i] ? 0 : 0.5; }, mid: null },
      { id: "nrzl", label: "Polar NRZ-L",
        note: "The level itself carries the bit: one polarity for 1, the other for 0. A run of the same bit produces no transitions, so the receiver's clock has nothing to lock onto.",
        levels: function (b, i) { return b[i] ? 0 : 1; }, mid: null },
      { id: "nrzi", label: "Polar NRZ-I",
        note: "The bit is carried by a CHANGE rather than a level: a 1 inverts the signal, a 0 leaves it alone. Runs of 1s still give transitions; runs of 0s do not.",
        levels: function (b, i, pre) {
          // start at the top rail, then flip once per preceding 1
          return (pre[i].ones % 2 === 0) ? 0 : 1;
        }, mid: null },
      { id: "manchester", label: "Manchester",
        note: "Every cell has a transition in the middle: low-to-high for 1, high-to-low for 0. Self-clocking and DC-free, at the cost of a signal rate twice the bit rate.",
        levels: function (b, i) { return b[i] ? 0 : 1; },
        mid:    function (b, i) { return b[i] ? 1 : 0; } },
      { id: "diffman", label: "Differential Manchester",
        note: "Always a mid-cell transition; the bit is read from whether an ADDITIONAL transition occurs at the cell boundary. A 1 has no extra transition, a 0 does. Used by token ring.",
        levels: function (b, i) { return b[i] ? 0 : 1; },
        mid:    function (b, i) { return b[i] ? 1 : 0; } },
      { id: "ami", label: "Bipolar AMI",
        note: "Zero is the middle level and a 1 alternates between the two polarities. DC-free, and the alternating 1s let the receiver verify it is still in sync — but a run of 0s still has no transitions.",
        levels: function (b, i, pre) {
          if (!b[i]) return 0.5;
          return (pre[i].ones % 2 === 0) ? 0 : 1;   // first 1 goes to +V
        }, mid: null },
      { id: "pseudo", label: "Pseudoternary",
        note: "The mirror of AMI: a 1 is the middle level and a 0 alternates between the two polarities. Same properties, with the assignments swapped.",
        levels: function (b, i, pre) {
          if (b[i]) return 0.5;
          return (pre[i].zeros % 2 === 0) ? 0 : 1;
        }, mid: null },
      { id: "mlt3", label: "MLT-3",
        note: "Three levels, and every 1 steps to the next level in the cycle +V, 0, -V; every 0 stays put. It concentrates the energy below the cable's cutoff, which is why 100Base-TX uses it.",
        levels: function (b, i, pre) {
          // count preceding 1s; the level cycles +V -> 0 -> -V on each 1
          var step = pre[i].ones % 3;
          return step === 0 ? 0 : (step === 1 ? 0.5 : 1);
        }, mid: null }
    ];

    root.innerHTML = `
      <canvas data-lc-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-lc-out aria-live="polite"></div>
      <div class="viz__ctl">
        <label for="lc-scheme">Line-encoding scheme</label>
        <select id="lc-scheme" data-lc-scheme></select>
      </div>
      <div class="viz__ctl">
        <label for="lc-bits">Bit pattern</label>
        <select id="lc-bits" data-lc-bits></select>
      </div>
      <p class="viz__note">
        The same bit stream under each scheme. Watch <b>where the transitions
        fall</b> — that is what decides whether a receiver can stay
        synchronised, and it is the whole content of the design criteria.
      </p>`;

    var cv = root.querySelector("[data-lc-cv]");
    var out = root.querySelector("[data-lc-out]");
    var schemeEl = root.querySelector("[data-lc-scheme]");
    var bitsEl = root.querySelector("[data-lc-bits]");
    var scheme = "nrzl";
    var bits = PATTERNS[0].bits;

    schemeEl.innerHTML = SCHEMES.map(function (s) {
      return `<option value="${s.id}">${s.label}</option>`;
    }).join("");
    bitsEl.innerHTML = PATTERNS.map(function (p) {
      return `<option value="${p.bits}">${p.label}</option>`;
    }).join("");
    schemeEl.value = scheme;

    function draw() {
      var S = SCHEMES.filter(function (s) { return s.id === scheme; })[0];
      var W = H.measure(cv);
      var nbits = bits.length;
      // Fixed geometry: the bit labels row, the waveform band, and the axis
      // label row. Height does not depend on the scheme or pattern, so nothing
      // can be pushed off the canvas.
      var PADL = 54, PADR = 16, PADT = 44;
      var bandH = 96;
      var Hh = PADT + bandH + 58;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      var span = W - PADL - PADR;
      var cell = span / nbits;
      var top = PADT, bot = PADT + bandH, midY = (top + bot) / 2;

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";

      // The three rails, drawn faintly so the level a sample sits on is legible.
      [["+V", top], ["0", midY], ["-V", bot]].forEach(function (r) {
        ctx.strokeStyle = p.ruleSoft; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PADL, r[1] + .5); ctx.lineTo(W - PADR, r[1] + .5); ctx.stroke();
        ctx.fillStyle = p.faint;
        ctx.textAlign = "right";
        ctx.fillText(r[0], PADL - 8, r[1]);
      });

      // Bit labels above the band, one per cell, with the cell dividers.
      ctx.textAlign = "center";
      for (var i = 0; i < nbits; i++) {
        var cx = PADL + i * cell;
        ctx.strokeStyle = p.ruleSoft; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx + .5, top - 14); ctx.lineTo(cx + .5, bot + 14); ctx.stroke();
        ctx.fillStyle = p.inkDim;
        ctx.fillText(bits[i], cx + cell / 2, top - 24);
      }
      ctx.beginPath(); ctx.moveTo(W - PADR + .5, top - 14); ctx.lineTo(W - PADR + .5, bot + 14); ctx.stroke();

      // The waveform. `y(v)` maps a level fraction to a pixel row: 0 = top rail,
      // 1 = bottom rail, .5 = middle.
      function y(v) { return top + v * bandH; }

      var bArr = bits.split("").map(Number);
      var preArr = pre(bArr);
      ctx.strokeStyle = p.trace; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var i = 0; i < nbits; i++) {
        var x0 = PADL + i * cell, x1 = x0 + cell;
        var lv = S.levels(bArr, i, preArr);
        if (i === 0) ctx.moveTo(x0, y(lv));
        else ctx.lineTo(x0, y(lv));         // vertical step at the cell edge
        if (S.mid) {
          // Manchester family: a transition at the middle of the cell.
          var mv = S.mid(bArr, i, preArr);
          ctx.lineTo(x0 + cell / 2, y(lv));
          ctx.lineTo(x0 + cell / 2, y(mv));
          ctx.lineTo(x1, y(mv));
        } else {
          ctx.lineTo(x1, y(lv));
        }
      }
      ctx.stroke();

      // The verdict: the scheme's rule and its trade-off.
      out.classList.remove("is-bad", "is-good");
      out.classList.add("is-good");
      out.innerHTML =
        `<b>${S.label}</b><span>${S.note}</span>`;

      // Mark the criteria this scheme fails, since that is the exam question.
      var fails = [];
      if (scheme === "unipolar") fails.push("a DC component");
      if (scheme === "nrzl" || scheme === "nrzi" || scheme === "ami" || scheme === "pseudo")
        fails.push("synchronisation on long runs of the same bit");
      if (scheme === "manchester" || scheme === "diffman")
        fails.push("nothing — it pays for self-clocking with double the bandwidth");
      out.innerHTML += `<span class="viz__why"><i>Design criteria:</i> ${fails.join("; ")}.</span>`;
      ctx.textAlign = "left";
    }

    schemeEl.addEventListener("change", function () { scheme = schemeEl.value; draw(); });
    bitsEl.addEventListener("change", function () { bits = bitsEl.value; draw(); });
    w.addEventListener("resize", draw);

    draw();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("line-encoding", {
    title: "Line-encoding schemes, side by side",
    note: "One bit pattern drawn under each scheme, so you can see where transitions fall and why the design criteria exist.",
    mount: mount
  });
})(window);
