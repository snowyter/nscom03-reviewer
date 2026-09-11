/* viz-constellation.js — ASK, FSK, PSK and QAM as points in the signal space.
 *
 * A constellation diagram is the single most useful picture in this module and
 * the one students are least able to read, because the diagram is usually shown
 * without saying what the axes mean or where the points come from. The axes are
 * the two carriers: in-phase (I) and quadrature (Q), and a point's distance from
 * the origin is its amplitude while its angle is its phase.
 *
 * Student-driven: pick a scheme and see its constellation, the number of bits
 * per symbol, and how the minimum distance between points shrinks as you pack
 * more in — which is exactly why higher-order QAM needs a better SNR.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    // Each scheme: the points in normalised I/Q coordinates, the bits per symbol,
    // and the note. Points are given on a -1..1 grid.
    var SCHEMES = [
      { id: "ask", label: "ASK (2 levels)", bits: 1,
        pts: [[1, 0], [0.5, 0]],
        note: "Only the amplitude varies; the phase is fixed. The two points differ in distance from the origin, so the receiver decides by signal strength — which is why ASK is fragile against fading and attenuation.",
        axes: "Distance from centre = amplitude" },
      { id: "bpsk", label: "BPSK", bits: 1,
        pts: [[-1, 0], [1, 0]],
        note: "One bit per symbol, carried purely by phase: two points opposite each other, 180° apart, at the same amplitude. The separation is the largest any two-point scheme can have, which makes BPSK the most noise-tolerant of these.",
        axes: "Angle = phase, 180° apart" },
      { id: "qpsk", label: "QPSK", bits: 2,
        pts: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
        note: "Four points, 90° apart, so two bits per symbol at the same amplitude. The points are √2 apart, versus 2 for BPSK — the first trade: twice the rate for a smaller margin.",
        axes: "Four phases, 90° apart" },
      { id: "qam16", label: "16-QAM", bits: 4,
        pts: (function () {
          var a = [-1, -1 / 3, 1 / 3, 1], out = [];
          a.forEach(function (i) { a.forEach(function (q) { out.push([i, q]); }); });
          return out;
        })(),
        note: "Amplitude AND phase both vary: a 4×4 grid, four bits per symbol. The nearest points are only 2/3 apart, so the receiver must distinguish much smaller differences — this needs a markedly better SNR than QPSK.",
        axes: "4 amplitudes × 4 phases" },
      { id: "qam64", label: "64-QAM", bits: 6,
        pts: (function () {
          var a = [-1, -5 / 7, -3 / 7, -1 / 7, 1 / 7, 3 / 7, 5 / 7, 1], out = [];
          a.forEach(function (i) { a.forEach(function (q) { out.push([i, q]); }); });
          return out;
        })(),
        note: "An 8×8 grid, six bits per symbol. The points are now 2/7 apart — about a fifth of the QPSK spacing — so this only works on a clean channel with high SNR. The rate is bought directly with noise margin.",
        axes: "8 amplitudes × 8 phases" }
    ];

    root.innerHTML = `
      <div class="viz__tabs" role="tablist" aria-label="Modulation schemes"></div>
      <canvas data-cs-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-cs-out aria-live="polite"></div>
      <p class="viz__note">
        The axes are the two carriers, <b>I</b> (in-phase) and <b>Q</b>
        (quadrature). Distance from the origin is <b>amplitude</b>; angle is
        <b>phase</b>. Watch the nearest-neighbour spacing shrink as more bits
        are packed into the same square.
      </p>`;

    var tabsEl = root.querySelector(".viz__tabs");
    var cv = root.querySelector("[data-cs-cv]");
    var out = root.querySelector("[data-cs-out]");
    var active = 2;

    function renderTabs() {
      tabsEl.innerHTML = SCHEMES.map(function (s, k) {
        return `<button type="button" role="tab" class="viz__tab${k === active ? " is-on" : ""}"
                  aria-selected="${k === active}" data-cs="${k}">${s.label}</button>`;
      }).join("");
      tabsEl.querySelectorAll("[data-cs]").forEach(function (b) {
        b.addEventListener("click", function () {
          active = Number(b.getAttribute("data-cs"));
          renderTabs(); draw();
        });
      });
    }

    function draw() {
      var S = SCHEMES[active];
      var W = H.measure(cv);
      var Hh = 268;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      // The plot is square so the I/Q axes are honest: equal scale on both.
      var size = Math.min(190, Hh - 60);
      var cx = W / 2, cy = Hh / 2 - 6;
      var half = size / 2;

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Axes.
      ctx.strokeStyle = p.ruleSoft; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - half - 14, cy); ctx.lineTo(cx + half + 14, cy);
      ctx.moveTo(cx, cy - half - 14); ctx.lineTo(cx, cy + half + 14);
      ctx.stroke();
      ctx.fillStyle = p.faint;
      ctx.fillText("I", cx + half + 20, cy);
      ctx.fillText("Q", cx, cy - half - 22);

      // Unit circle guide, so amplitude is readable as a radius.
      ctx.strokeStyle = p.rule; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.arc(cx, cy, half, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      // Nearest-neighbour distance, computed from the actual points so the
      // readout is measured rather than asserted.
      var minD = Infinity;
      for (var i = 0; i < S.pts.length; i++)
        for (var j = i + 1; j < S.pts.length; j++) {
          var di = S.pts[i][0] - S.pts[j][0], dq = S.pts[i][1] - S.pts[j][1];
          var d = Math.sqrt(di * di + dq * dq);
          if (d < minD) minD = d;
        }

      // The points.
      var r = S.pts.length > 16 ? 3 : (S.pts.length > 4 ? 5 : 7);
      S.pts.forEach(function (pt) {
        var x = cx + pt[0] * half, y = cy - pt[1] * half;   // Q grows upward
        ctx.fillStyle = p.trace;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      });

      // The readout, which is the part that matters.
      out.classList.remove("is-bad", "is-good");
      out.classList.add("is-good");
      out.innerHTML =
        `<b>${S.label} — ${S.bits} bit${S.bits === 1 ? "" : "s"} per symbol, ${S.pts.length} points</b>` +
        `<span>${S.note}</span>` +
        `<span class="viz__why"><i>Axes:</i> ${S.axes}. ` +
        `<i>Measured nearest-neighbour spacing:</i> ${minD.toFixed(2)} on a unit grid` +
        (active >= 3 ? ` — compare with 2.00 for BPSK.` : `.`) + `</span>`;
    }

    renderTabs();
    draw();
    w.addEventListener("resize", draw);
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("constellation", {
    title: "Constellation diagrams: ASK, PSK and QAM",
    note: "Distance from the origin is amplitude and angle is phase. More bits per symbol means points packed closer, which needs a better SNR.",
    mount: mount
  });
})(window);
