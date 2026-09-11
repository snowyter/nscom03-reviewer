/* viz-mwo.js — the microwave oven's interference signature.
 *
 * The module's whole argument is that MWO interference is not random noise: it is
 * BURSTY, PERIODIC and PREDICTABLE, because it follows the mains line cycle, and
 * that predictability is what makes it detectable and cancellable. That claim is
 * only convincing if the periodicity is visible.
 *
 * Student-driven: press play to walk the line cycle, or step it. The burst duty
 * cycle and its alignment to the 50 Hz mains are the two things to see.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;
    var MAINS = 50;          // Hz, the line frequency
    var duty = 50;           // percent of each half-cycle the magnetron conducts
    var t = 0;               // position in the line cycle, 0..1
    var timer = null;

    root.innerHTML = `
      <canvas data-mw-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-mw-out aria-live="polite"></div>
      <div class="viz__ctl"><label for="mw-d">Magnetron duty cycle <span data-mw-dv>50</span>%</label>
        <input id="mw-d" type="range" data-mw-d min="10" max="90" step="5" value="50"></div>
      <div class="viz__steps">
        <button type="button" data-mw-play>Play</button>
        <button type="button" data-mw-step>Step</button>
        <button type="button" data-mw-wifi>Show Wi-Fi traffic</button>
      </div>
      <p class="viz__note">
        The oven fires only while the mains voltage is high enough, so its
        interference arrives in <b>bursts locked to the 50 Hz line</b> — 100 bursts
        a second, each with a duty cycle set by the transformer. That regularity is
        the signal a detector can exploit.
      </p>`;

    var cv = root.querySelector("[data-mw-cv]");
    var out = root.querySelector("[data-mw-out]");
    var showWifi = false;

    var reduced = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function draw() {
      var W = H.measure(cv);
      var Hh = 280;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      var padL = 88, padR = 20, top = 54;
      var span = W - padL - padR;
      var cycles = 4;                       // four line cycles across the plot
      var bandH = 30;

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";

      // --- lane 1: the mains voltage, a clean 50 Hz sine -------------------
      var y1 = top + bandH / 2;
      ctx.fillStyle = p.faint;
      ctx.textAlign = "right";
      ctx.fillText("mains 50 Hz", padL - 10, y1);
      ctx.textAlign = "left";
      ctx.strokeStyle = p.ruleSoft; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y1); ctx.lineTo(W - padR, y1); ctx.stroke();
      ctx.strokeStyle = p.inkDim; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var x = 0; x <= span; x++) {
        var ph = x / span * cycles * 2 * Math.PI;
        var y = y1 - 12 * Math.sin(ph);
        if (x === 0) ctx.moveTo(padL + x, y); else ctx.lineTo(padL + x, y);
      }
      ctx.stroke();

      // --- lane 2: the magnetron's bursts ----------------------------------
      var y2 = top + 74;
      ctx.fillStyle = p.faint;
      ctx.textAlign = "right";
      ctx.fillText("magnetron", padL - 10, y2);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255,209,102,.20)";
      ctx.fillRect(padL, y2 - bandH / 2, span, bandH);
      // Each half-cycle is one burst slot; it conducts only while |mains| is above
      // the threshold implied by the duty cycle.
      var halfCycles = cycles * 2;
      var halfW = span / halfCycles;
      var thresh = Math.sin(Math.PI / 2 * (1 - duty / 100));
      for (var k = 0; k < halfCycles; k++) {
        var cx0 = padL + k * halfW;
        const centre = k * Math.PI + Math.PI / 2;
        const level = Math.abs(Math.sin(centre + Math.PI / 2));
        if (level >= thresh) {
          ctx.fillStyle = "rgba(255,209,102,.55)";
          ctx.fillRect(cx0 + 1, y2 - bandH / 2 + 2, halfW - 2, bandH - 4);
        }
      }

      // --- lane 3: the Wi-Fi frames that the bursts destroy ----------------
      var y3 = top + 148;
      ctx.fillStyle = p.faint;
      ctx.textAlign = "right";
      ctx.fillText("Wi-Fi frames", padL - 10, y3);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(125,255,178,.10)";
      ctx.fillRect(padL, y3 - bandH / 2, span, bandH);
      // A steady stream of frames, with the ones landing inside a burst marked
      // as corrupted.
      var nframes = 24;
      var fw = span / nframes;
      for (var f = 0; f < nframes; f++) {
        var fx = padL + f * fw;
        // which half-cycle does this frame fall in, and is it bursting?
        var hc = Math.floor((f + 0.5) / nframes * halfCycles);
        const c2 = hc * Math.PI + Math.PI / 2;
        var lvl2 = Math.abs(Math.sin(c2 + Math.PI / 2));
        var hit = lvl2 >= thresh;
        ctx.fillStyle = hit ? p.warn : p.trace;
        ctx.globalAlpha = showWifi ? 1 : .35;
        ctx.fillRect(fx + 1, y3 - 8, Math.max(2, fw - 2), 16);
        ctx.globalAlpha = 1;
        if (hit && showWifi) {
          ctx.fillStyle = p.warn;
          ctx.fillText("✕", fx + fw / 2, y3 + 22);
        }
      }

      // --- lane 4: the combined picture over time --------------------------
      var y4 = top + 196;
      ctx.fillStyle = p.faint;
      ctx.textAlign = "right";
      ctx.fillText("collisions", padL - 10, y4);
      ctx.textAlign = "left";
      var hits = 0, total = 0;
      for (var f2 = 0; f2 < nframes; f2++) {
        var hc2 = Math.floor((f2 + 0.5) / nframes * halfCycles);
        const c3 = hc2 * Math.PI + Math.PI / 2;
        var l3 = Math.abs(Math.sin(c3 + Math.PI / 2));
        total++;
        if (l3 >= thresh) hits++;
      }
      var frac = total ? hits / total : 0;
      ctx.fillStyle = "rgba(255,123,107,.15)";
      ctx.fillRect(padL, y4 - 5, span * frac, 10);
      ctx.strokeStyle = p.rule; ctx.lineWidth = 1;
      ctx.strokeRect(padL + .5, y4 - 5.5, span, 11);
      ctx.fillStyle = p.warn;
      ctx.fillText(Math.round(frac * 100) + "% of frames fall inside a burst", padL + 6, y4);

      // Time cursor, moved by play/step.
      var cxp = padL + t * span;
      ctx.strokeStyle = p.trace; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(cxp, top - 16); ctx.lineTo(cxp, y4 + 16); ctx.stroke();
      ctx.setLineDash([]);

      // The verdict.
      out.classList.remove("is-bad", "is-good");
      out.classList.add("is-good");
      out.innerHTML =
        `<b>Bursty, periodic, predictable</b>` +
        `<span>At ${duty}% duty the magnetron conducts for about ${duty}% of each half-cycle, giving <b>${MAINS * 2} bursts per second</b> — two per mains cycle, at ${MAINS} Hz. </span>` +
        `<span class="viz__why"><i>Why this is exploitable:</i> the interference is not random. ` +
        `A detector that locks onto the ${MAINS} Hz line phase knows <i>when</i> a burst is about to start` +
        `${showWifi ? `; the marked ✕ frames are the ones lost inside a burst.` : `. Turn on Wi-Fi traffic to see which frames it destroys.`}</span>`;
      ctx.textAlign = "left";
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    root.querySelector("[data-mw-play]").addEventListener("click", function () {
      if (timer) { stop(); this.textContent = "Play"; return; }
      if (reduced) { t = (t + .05) % 1; draw(); return; }
      this.textContent = "Pause";
      var self = this;
      timer = setInterval(function () {
        t = (t + .01) % 1;
        draw();
        if (t === 0) { /* wraps */ }
      }, 40);
      // store so a second press can stop it
      self.__stop = stop;
    });
    root.querySelector("[data-mw-step]").addEventListener("click", function () {
      stop();
      root.querySelector("[data-mw-play]").textContent = "Play";
      t = (t + .125) % 1; draw();
    });
    root.querySelector("[data-mw-wifi]").addEventListener("click", function () {
      showWifi = !showWifi; draw();
    });
    root.querySelector("[data-mw-d]").addEventListener("input", function () {
      duty = Number(this.value);
      root.querySelector("[data-mw-dv]").textContent = String(duty);
      draw();
    });
    w.addEventListener("resize", draw);

    draw();
    return function () { stop(); w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("mwo-signature", {
    title: "The microwave oven's interference signature",
    note: "The magnetron fires in bursts locked to the 50 Hz mains — two per cycle. That periodicity is what makes the interference detectable.",
    mount: mount
  });
})(window);
