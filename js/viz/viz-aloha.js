/* viz-aloha.js — the vulnerable-time trace for pure and slotted ALOHA.
 *
 * The exam fact is "pure ALOHA maxes at 18.4%, slotted at 36.8%", and it is
 * almost always memorised without being understood. The reason for the number is
 * geometric: a frame is safe only if no other frame starts within one frame-time
 * of it. That window is 2T for pure ALOHA (a frame can start just before you or
 * just after you) and T for slotted ALOHA (starts are forced onto slot
 * boundaries, so only the slot you occupy can clash with you).
 *
 * So the student drags a second frame's start time and watches the overlap
 * appear. The vulnerable window is drawn to scale underneath, and the readout
 * names whether the attempt survives. Nothing moves on its own: the point is the
 * student's own hand causing the collision.
 */

(function (w) {
  "use strict";

  var T = 1;             // one frame-time

  function mount(root) {
    var H = w.VIZ;

    root.innerHTML = `
      <div class="ctlrow">
        <label for="al-mode">Access method</label>
        <span class="seg" data-al-mode>
          <button type="button" class="is-on" data-al-pure>Pure</button>
          <button type="button" data-al-slot>Slotted</button>
        </span>
      </div>
      <div class="ctlrow">
        <label for="al-start">Second frame starts at</label>
        <input id="al-start" type="range" min="-150" max="250" value="70" step="1">
        <span class="val" data-al-start-val>0.70 T</span>
      </div>
      <canvas data-al-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-al-out aria-live="polite"></div>
      <p class="viz__note">
        Drag the second frame. Any start inside the shaded window destroys both
        frames — that window is the whole reason the two ceilings differ.
      </p>`;

    // Resolve both "#foo" and "[data-foo]" so markup may carry either
    // convention; the sims use the same dual lookup.
    var $ = function (s) {
      if (!s) return null;
      var el = root.querySelector(s);
      if (el) return el;
      if (s.charAt(0) === "#") return root.querySelector("[data-" + s.slice(1) + "]");
      return null;
    };
    var start = $("#al-start"), out = $("#al-out");
    var cv = $("[data-al-cv]");
    var pure = true;

    var btnPure = $("[data-al-pure]"), btnSlot = $("[data-al-slot]");
    function setMode(p) {
      pure = p;
      btnPure.classList.toggle("is-on", p);
      btnSlot.classList.toggle("is-on", !p);
      // Slotted starts are quantised, so the slider snaps onto slot boundaries.
      start.step = p ? "50" : "1";
      if (p) start.value = String(Math.round(+start.value / 50) * 50);
      draw();
    }
    btnPure.addEventListener("click", function () { setMode(true); });
    btnSlot.addEventListener("click", function () { setMode(false); });

    function collide(s) {
      // With our reference frame at [0, T):
      //   pure    -- a clash if the other frame starts in (-T, T)
      //   slotted -- starts on slot edges, so a clash only if it starts at 0
      return pure ? (s > -T && s < T) : (Math.abs(s) < 1e-9);
    }

    function draw() {
      var s = +start.value / 100;                    // slider is centi-frames
      $("[data-al-start-val]").textContent = s.toFixed(2).replace(/0$/, "") + " T";

      var W = H.measure(cv);
      var Hh = 210;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);

      ctx.clearRect(0, 0, W, Hh);

      // ── geometry: map a time range onto the canvas
      var t0 = -1.5, t1 = 2.5;                     // shown window in frame-times
      var padL = 14, padR = 14;
      var x = function (t) { return padL + (t - t0) / (t1 - t0) * (W - padL - padR); };

      // ── the vulnerable window for our reference frame
      var vA = pure ? -T : 0, vB = pure ? T : T;   // pure: (-T, T); slotted: [0, T)
      ctx.fillStyle = "rgba(224,90,111,.16)";
      ctx.fillRect(x(vA), 46, x(vB) - x(vA), 96);
      ctx.strokeStyle = p.warn; ctx.globalAlpha = .55; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x(vA), 46); ctx.lineTo(x(vA), 142);
      ctx.moveTo(x(vB), 46); ctx.lineTo(x(vB), 142); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;

      // ── the reference frame (ours, fixed at t = 0)
      var bad = collide(s);
      function bar(a, b, y, fill, label, dim) {
        var wpx = Math.max(2, x(b) - x(a));
        ctx.globalAlpha = dim ? .45 : 1;
        ctx.fillStyle = fill;
        ctx.fillRect(x(a), y, wpx, 30);
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.ground;
        ctx.font = "600 11px ui-monospace, monospace";
        ctx.textBaseline = "middle";
        if (wpx > 46) ctx.fillText(label, x(a) + 8, y + 16);
        ctx.strokeStyle = fill; ctx.lineWidth = 1;
        ctx.strokeRect(x(a) + .5, y + .5, wpx - 1, 29);
      }
      bar(0, T, 56, p.trace, "YOURS", false);
      bar(s, s + T, 104, bad ? p.warn : p.amber, "OTHER", !bad);

      // ── axis
      ctx.strokeStyle = p.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, 158); ctx.lineTo(W - padR, 158); ctx.stroke();
      ctx.fillStyle = p.faint;
      ctx.font = "10px ui-monospace, monospace";
      ctx.textAlign = "center";
      [-1, 0, 1, 2].forEach(function (t) {
        ctx.fillText(t + "T", x(t), 172);
        ctx.beginPath(); ctx.moveTo(x(t), 158); ctx.lineTo(x(t), 163); ctx.stroke();
      });
      ctx.textAlign = "left";

      // ── the axis of the vulnerable window, annotated
      ctx.fillStyle = p.faint;
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText(pure ? "vulnerable window = 2T" : "vulnerable window = T", padL, 34);

      out.classList.toggle("is-bad", bad);
      out.classList.toggle("is-good", !bad);
      out.innerHTML = bad
        ? `<b style="color:${p.warn}">✕ Collision</b><span>Both frames are destroyed, because the second frame started inside the vulnerable window. Both stations must retransmit.</span>`
        : `<b style="color:${p.trace}">✓ Both survive</b><span>The second frame started outside the vulnerable window, so the two transmissions never overlap.</span>`;
    }

    root.addEventListener("input", draw);
    w.addEventListener("resize", draw);
    draw();

    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("aloha-collision", {
    title: "Pure vs slotted ALOHA: the vulnerable window",
    note: "Drag the other frame and watch the shaded window decide its fate. Slotted ALOHA halves the window, which is exactly why its ceiling doubles.",
    mount: mount
  });
})(window);
