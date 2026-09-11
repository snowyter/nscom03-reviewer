/* viz-sine.js — amplitude, frequency and phase on one sine wave.
 *
 * The three parameters are defined in prose and then drawn once as a static
 * picture with letters on it. The confusing part is that phase and frequency
 * interact — shifting phase looks like shifting in time, and changing frequency
 * changes the period the phase is measured against.
 *
 * Student-driven: drag each of the three and watch the same wave deform.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;
    var A = 1, f = 1, ph = 0;      // amplitude (0..1), frequency (cycles), phase (0..1 of a cycle)

    root.innerHTML = `
      <canvas data-sn-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-sn-out aria-live="polite"></div>
      <div class="viz__ctl"><label for="sn-a">Amplitude <span data-sn-av>1.0</span> V</label>
        <input id="sn-a" type="range" data-sn-a min="10" max="100" value="100"></div>
      <div class="viz__ctl"><label for="sn-f">Frequency <span data-sn-fv>1</span> Hz</label>
        <input id="sn-f" type="range" data-sn-f min="1" max="4" value="1"></div>
      <div class="viz__ctl"><label for="sn-p">Phase <span data-sn-pv>0</span>°</label>
        <input id="sn-p" type="range" data-sn-p min="0" max="360" value="0"></div>
      <p class="viz__note">
        The dashed ghost is the original wave, kept for comparison. Watch how
        <b>amplitude</b> scales it, <b>frequency</b> squeezes it in time, and
        <b>phase</b> slides it sideways — a phase shift and a time shift of the
        same size look identical on a sine wave.
      </p>`;

    var cv = root.querySelector("[data-sn-cv]");
    var out = root.querySelector("[data-sn-out]");

    function draw() {
      var W = H.measure(cv);
      // Fixed geometry: one plot band with axis labels above and below.
      var Hh = 220;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      var padL = 46, padR = 16, mid = 108, amp = 62;
      var span = W - padL - padR;

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "right";

      // The axis: a zero line plus the +/- rails, drawn faintly.
      ctx.strokeStyle = p.ruleSoft; ctx.lineWidth = 1;
      [["+" + A.toFixed(1), mid - amp * A], ["0", mid], ["-" + A.toFixed(1), mid + amp * A]]
        .forEach(function (r) {
          ctx.beginPath(); ctx.moveTo(padL, r[1] + .5); ctx.lineTo(W - padR, r[1] + .5); ctx.stroke();
          ctx.fillStyle = p.faint;
          ctx.fillText(r[0], padL - 8, r[1]);
        });

      // The ghost: the unit-amplitude, 1 Hz, zero-phase wave.
      ctx.strokeStyle = p.rule; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (var x = 0; x <= span; x++) {
        var t = x / span;                                  // one second across
        var y = mid - amp * Math.sin(2 * Math.PI * t);
        if (x === 0) ctx.moveTo(padL + x, y); else ctx.lineTo(padL + x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // The live wave: y = A sin(2*pi*f*t + phase).
      ctx.strokeStyle = p.trace; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var x2 = 0; x2 <= span; x2++) {
        var t2 = x2 / span;
        var y2 = mid - amp * A * Math.sin(2 * Math.PI * f * t2 + ph * 2 * Math.PI);
        if (x2 === 0) ctx.moveTo(padL + x2, y2); else ctx.lineTo(padL + x2, y2);
      }
      ctx.stroke();

      // Time axis ticks, one per cycle, so frequency is countable.
      ctx.textAlign = "center";
      ctx.fillStyle = p.faint;
      ctx.fillText("0", padL, mid + amp + 26);
      ctx.fillText("1 s", W - padR, mid + amp + 26);

      // The verdict, in the terms the exam uses.
      out.classList.remove("is-bad", "is-good");
      out.classList.add("is-good");
      out.innerHTML =
        `<b>A = ${A.toFixed(1)} V, f = ${f} Hz, φ = ${Math.round(ph * 360)}°</b>` +
        `<span>Peak voltage ${A.toFixed(1)} V, completing ${f} cycle${f === 1 ? "" : "s"} each second, ` +
        `started ${Math.round(ph * 360)}° into the cycle. </span>` +
        `<span class="viz__why"><i>Period:</i> T = 1/f = ${(1 / f).toFixed(3)} s. ` +
        `<i>Wavelength</i> at a given speed follows from that period.</span>`;
      ctx.textAlign = "left";
    }

    function read(el, set, fmt) {
      el.addEventListener("input", function () {
        set(Number(el.value));
        root.querySelector("[data-sn-av]").textContent = A.toFixed(1);
        root.querySelector("[data-sn-fv]").textContent = String(f);
        root.querySelector("[data-sn-pv]").textContent = String(Math.round(ph * 360));
        draw();
      });
    }
    read(root.querySelector("[data-sn-a]"), function (v) { A = v / 100; });
    read(root.querySelector("[data-sn-f]"), function (v) { f = v; });
    read(root.querySelector("[data-sn-p]"), function (v) { ph = v / 360; });
    w.addEventListener("resize", draw);

    draw();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("sine-wave", {
    title: "Amplitude, frequency and phase",
    note: "Drag each parameter and watch the same wave deform. Phase and time shift look identical on a sine wave.",
    mount: mount
  });
})(window);
