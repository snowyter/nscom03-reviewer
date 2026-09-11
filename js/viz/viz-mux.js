/* viz-mux.js — FDM and TDM on the same link, to scale.
 *
 * Multiplexing is described as "sharing bandwidth" or "sharing time", and the
 * two are usually drawn as separate diagrams so the comparison is never made. The
 * point is that FDM gives each channel ALL the time and a SLICE of the spectrum,
 * while TDM gives each channel ALL the spectrum and a SLICE of the time — and
 * both pay the same overhead: guard bands in one case, guard times in the other.
 *
 * Student-driven: switch the method and watch the same four channels packed two
 * different ways on one link.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;
    var method = "fdm";

    root.innerHTML = `
      <canvas data-mx-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-mx-out aria-live="polite"></div>
      <div class="viz__steps">
        <button type="button" data-mx-fdm>FDM</button>
        <button type="button" data-mx-tdm>TDM</button>
        <button type="button" data-mx-guard>Guard bands / times</button>
      </div>
      <p class="viz__note">
        Four channels, one link. <b>FDM</b> slices the spectrum and gives each
        channel all the time; <b>TDM</b> slices the time and gives each channel
        all the spectrum. Both waste some capacity keeping the channels apart.
      </p>`;

    var cv = root.querySelector("[data-mx-cv]");
    var out = root.querySelector("[data-mx-out]");
    var showGuard = false;

    var CH = [
      { id: 1, colour: "trace" },
      { id: 2, colour: "amber" },
      { id: 3, colour: "warn" },
      { id: 4, colour: "inkDim" }
    ];

    function draw() {
      var W = H.measure(cv);
      var Hh = 250;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      var padL = 74, padR = 20, top = 56;
      var span = W - padL - padR;

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";

      var colOf = { trace: p.trace, amber: p.amber, warn: p.warn, inkDim: p.inkDim };

      if (method === "fdm") {
        // Four horizontal bands stacked in frequency: each channel owns a slice
        // of the spectrum for ALL of the time.
        var bandH = 34, gap = 8;
        ctx.textAlign = "left";
        ctx.fillStyle = p.faint;
        ctx.fillText("frequency", padL, top - 16);
        ctx.fillText("time →", W - padR - 46, top - 16);

        CH.forEach(function (c, k) {
          var y = top + k * (bandH + gap);
          var col = colOf[c.colour];
          ctx.fillStyle = "rgba(255,255,255,.03)";
          ctx.fillRect(padL, y, span, bandH);
          ctx.globalAlpha = .28; ctx.fillStyle = col;
          ctx.fillRect(padL, y, span, bandH);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = col; ctx.lineWidth = 1;
          ctx.strokeRect(padL + .5, y + .5, span, bandH);
          ctx.textAlign = "right";
          ctx.fillStyle = col;
          ctx.fillText("channel " + c.id, padL - 10, y + bandH / 2);
          ctx.textAlign = "left";
          ctx.fillStyle = p.faint;
          ctx.fillText("all the time", padL + 8, y + bandH / 2);
          // The guard band, drawn as the real wasted strip between channels.
          if (showGuard && k < CH.length - 1) {
            ctx.fillStyle = "rgba(255,123,107,.28)";
            ctx.fillRect(padL, y + bandH, span, gap);
            ctx.fillStyle = p.warn;
            ctx.fillText("guard band", padL + 8, y + bandH + gap / 2);
          }
        });
        ctx.textAlign = "left";
        ctx.fillStyle = p.faint;
        ctx.fillText("each channel gets a slice of the spectrum, all of the time", padL, Hh - 34);
      } else {
        // Four vertical slots repeating: each channel owns a slice of the time
        // for ALL of the spectrum.
        var slots = 8;
        var slotW = span / slots;
        ctx.textAlign = "left";
        ctx.fillStyle = p.faint;
        ctx.fillText("one full cycle", padL, top - 16);
        ctx.fillText("time →", W - padR - 46, top - 16);

        for (var s = 0; s < slots; s++) {
          var c = CH[s % CH.length];
          var col = colOf[c.colour];
          var x = padL + s * slotW;
          ctx.fillStyle = "rgba(255,255,255,.03)";
          ctx.fillRect(x, top, slotW, 96);
          ctx.globalAlpha = .28; ctx.fillStyle = col;
          ctx.fillRect(x, top, slotW, 96);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = col; ctx.lineWidth = 1;
          ctx.strokeRect(x + .5, top + .5, slotW, 96);
          ctx.textAlign = "center";
          ctx.fillStyle = p.ground;
          ctx.fillText(String(c.id), x + slotW / 2, top + 48);
          ctx.textAlign = "left";
        }
        // The guard time, shown as the thin strip between slots.
        if (showGuard) {
          for (var g = 1; g < slots; g++) {
            var gx = padL + g * slotW;
            ctx.fillStyle = "rgba(255,123,107,.28)";
            ctx.fillRect(gx - 2, top, 4, 96);
          }
          ctx.fillStyle = p.warn;
          ctx.fillText("guard time between slots", padL, top + 116);
        }
        ctx.fillStyle = p.faint;
        ctx.fillText("each channel gets all the spectrum, one slot at a time", padL, Hh - 34);
      }

      // The verdict names the trade.
      out.classList.remove("is-bad", "is-good");
      out.classList.add("is-good");
      if (method === "fdm") {
        out.innerHTML =
          `<b>Frequency-division multiplexing</b>` +
          `<span>Four channels share the link by occupying four separate bands of frequency. Each transmits continuously — no channel ever waits — but the bands cannot touch, so guard bands of unused spectrum sit between them, and the total usable bandwidth is less than the link's.</span>` +
          `<span class="viz__why"><i>The waste:</i> guard bands. <i>Best when:</i> the channels send continuously and predictably, such as broadcast radio or analog carrier systems.</span>`;
      } else {
        out.innerHTML =
          `<b>Time-division multiplexing</b>` +
          `<span>Each channel occupies the WHOLE bandwidth, but only for its own short slot in a repeating cycle. Every channel must wait its turn, so TDM needs a synchronised frame and guard times between slots to stop them bleeding into each other.</span>` +
          `<span class="viz__why"><i>The waste:</i> guard times, plus any slot left idle when a channel has nothing to send. <i>Best when:</i> the digital channels have a steady, known demand.</span>`;
      }
    }

    root.querySelector("[data-mx-fdm]").addEventListener("click", function () { method = "fdm"; draw(); });
    root.querySelector("[data-mx-tdm]").addEventListener("click", function () { method = "tdm"; draw(); });
    root.querySelector("[data-mx-guard]").addEventListener("click", function () { showGuard = !showGuard; draw(); });
    w.addEventListener("resize", draw);

    draw();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("multiplexing", {
    title: "FDM and TDM on one link",
    note: "FDM slices the spectrum and gives each channel all the time; TDM slices time and gives each channel all the spectrum. Both waste capacity separating the channels.",
    mount: mount
  });
})(window);
