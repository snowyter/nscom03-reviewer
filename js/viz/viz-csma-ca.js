/* viz-csma-ca.js — CSMA/CA: the interframe spaces and the backoff window.
 *
 * CSMA/CA is taught as "like CSMA/CD but with acknowledgements", which hides the
 * actual mechanism: contention is resolved BEFORE the frame by waiting different
 * lengths of time, and the gaps have a strict order of precedence. SIFS beats
 * DIFS, which is why an acknowledgement can never be interrupted.
 *
 * Student-driven: choose what happens next and watch the timeline. The point is
 * the ORDER of the waiting periods, which is a rule that cannot be seen in prose.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;
    // The interframe spaces, in slot units, at the standard's relative sizes.
    // SIFS is shortest, then PIFS, then DIFS -- the order IS the priority scheme.
    var SIFS = 10, DIFS = 28, SLOT = 9;

    var state = { step: 0, cw: 15, picked: null, waiting: 0 };

    root.innerHTML = `
      <canvas data-cc-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-cc-out aria-live="polite"></div>
      <div class="viz__steps">
        <button type="button" data-cc-idle>Channel goes idle</button>
        <button type="button" data-cc-backoff>Count down backoff</button>
        <button type="button" data-cc-ack>Send + acknowledge</button>
        <button type="button" data-cc-reset>Reset</button>
      </div>
      <p class="viz__note">
        <b>SIFS</b> is shorter than <b>DIFS</b>. That single fact is the whole
        priority scheme — an acknowledgement sent after SIFS is already on the
        air before any station waiting a DIFS can begin.
      </p>`;

    var cv = root.querySelector("[data-cc-cv]");
    var out = root.querySelector("[data-cc-out]");

    function reset() { state = { step: 0, cw: 15, picked: null, waiting: 0 }; draw(); }

    function draw() {
      var W = Math.max(320, cv.parentNode.clientWidth - 2);
      // Fixed height. The timeline is a fixed 5-lane chart; the only variable
      // text is the verdict, which lives in the DOM below the canvas.
      var Hh = 250;
      var ctx = H.fitCanvas(cv, W, Hh);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      var padL = 92, padR = 20;
      var span = W - padL - padR;
      var UNIT = 14;                 // px per slot, so 28 slots fits comfortably
      var x = function (u) { return padL + Math.min(u, Math.floor(span / UNIT)) * UNIT; };
      var maxU = Math.floor(span / UNIT);

      // Lane labels in the gutter; each lane is 30px apart so the 10px labels
      // never touch. This was the bug in the earlier aid: two captions on one
      // baseline. Here every lane gets exactly one.
      var LANES = [
        { id: "busy",   label: "channel",  y: 52 },
        { id: "dif",    label: "DIFS",     y: 88 },
        { id: "back",   label: "backoff",  y: 124 },
        { id: "frame",  label: "frame",    y: 160 },
        { id: "sifs",   label: "SIFS + ACK", y: 196 }
      ];
      LANES.forEach(function (l) {
        ctx.fillStyle = p.faint;
        ctx.fillText(l.label, 6, l.y);
      });

      // The channel lane: busy for the first few units, then idle.
      var busy = state.step === 0 ? 12 : 12;
      ctx.fillStyle = "rgba(255,123,107,.22)";
      ctx.fillRect(x(0), LANES[0].y - 8, x(busy) - x(0), 16);
      ctx.fillStyle = p.warn;
      ctx.fillText("busy", x(0) + 6, LANES[0].y);
      if (state.step >= 1) {
        ctx.fillStyle = "rgba(125,255,178,.10)";
        ctx.fillRect(x(busy), LANES[0].y - 8, Math.min(span, x(maxU) - x(busy)), 16);
        ctx.fillStyle = p.trace;
        ctx.fillText("idle", x(busy) + 6, LANES[0].y);
      }

      // DIFS: always drawn once the channel is idle, since that is the rule.
      if (state.step >= 1) {
        ctx.fillStyle = "rgba(154,184,255,.18)";
        ctx.fillRect(x(busy), LANES[1].y - 8, (DIFS / SLOT) * UNIT, 16);
        ctx.strokeStyle = p.rule; ctx.strokeRect(x(busy) + .5, LANES[1].y - 7.5, (DIFS / SLOT) * UNIT, 15);
      }

      // The backoff countdown, revealed a step at a time.
      if (state.step >= 1) {
        var remaining = state.step >= 2 ? 0 : (state.picked === null ? 8 : state.picked);
        var startU = busy + DIFS / SLOT;
        var totalU = 8;
        var doneU = state.step >= 2 ? totalU : 0;
        ctx.fillStyle = "rgba(255,209,102,.18)";
        ctx.fillRect(x(startU), LANES[2].y - 8, totalU * UNIT, 16);
        if (doneU > 0) {
          ctx.fillStyle = "rgba(255,209,102,.45)";
          ctx.fillRect(x(startU), LANES[2].y - 8, doneU * UNIT, 16);
          ctx.fillStyle = p.amber;
          ctx.fillText("counts down to zero", x(startU) + 4, LANES[2].y);
        } else {
          ctx.fillStyle = p.amber;
          ctx.fillText("deferring — backoff frozen", x(startU) + 4, LANES[2].y);
        }
      }

      // The frame itself, only once the backoff reaches zero.
      if (state.step >= 2) {
        var fU = busy + DIFS / SLOT + 8;
        ctx.fillStyle = "rgba(125,255,178,.25)";
        ctx.fillRect(x(fU), LANES[3].y - 8, 10 * UNIT, 16);
        ctx.fillStyle = p.trace;
        ctx.fillText("DATA", x(fU) + 6, LANES[3].y);
      }

      // SIFS + ACK: the whole point is that it starts BEFORE a DIFS could elapse.
      if (state.step >= 3) {
        var fU2 = busy + DIFS / SLOT + 8;
        var sU = fU2 + 10;
        ctx.fillStyle = "rgba(154,184,255,.30)";
        ctx.fillRect(x(sU), LANES[4].y - 8, (SIFS / SLOT) * UNIT, 16);
        ctx.fillStyle = "rgba(192,132,252,.30)";
        ctx.fillRect(x(sU + SIFS / SLOT), LANES[4].y - 8, 6 * UNIT, 16);
        ctx.fillStyle = p.inkDim;
        ctx.fillText("ACK — no other station may start yet", x(sU) + 4, LANES[4].y);
      }
      ctx.textAlign = "left";

      // The verdict.
      out.classList.remove("is-bad", "is-good");
      if (state.step === 0) {
        out.innerHTML = `<b>Ready</b><span>The channel is busy, so every station defers. Press <b>Channel goes idle</b> to start the contention.</span>`;
      } else if (state.step === 1) {
        out.classList.add("is-bad");
        out.innerHTML = `<b>Deferring</b><span>The channel went idle. Each station now waits one <b>DIFS</b> (28 units) before it may even begin its backoff countdown. Nothing is sent during that gap — it is the settling time that stops a transmission from starting the instant the medium frees.</span>`;
      } else if (state.step === 2) {
        out.classList.add("is-good");
        out.innerHTML = `<b>✓ Won the contention</b><span>After the DIFS the backoff counter ran to zero, so this station owns the medium and sends its DATA frame. The counter only ticks while the channel is idle — if another station had started transmitting, the countdown would have <i>frozen</i> rather than reset, which is what keeps the wait fair.</span>`;
      } else {
        out.classList.add("is-good");
        out.innerHTML = `<b>✓ Acknowledged</b><span>The receiver waits only <b>SIFS</b> (10 units) — shorter than the DIFS every other station must wait — so its ACK reaches the air before anyone else's timer expires. This is why the ACK cannot be interrupted, and it is the entire priority scheme in one comparison: <b>SIFS &lt; DIFS</b>.</span>`;
      }

      root.querySelector("[data-cc-ack]").disabled = state.step < 2;
      root.querySelector("[data-cc-backoff]").disabled = state.step < 1 || state.step >= 2;
      root.querySelector("[data-cc-idle]").disabled = state.step >= 1;
    }

    root.querySelector("[data-cc-idle]").addEventListener("click", function () { state.step = 1; state.picked = 8; draw(); });
    root.querySelector("[data-cc-backoff]").addEventListener("click", function () { state.step = 2; draw(); });
    root.querySelector("[data-cc-ack]").addEventListener("click", function () { state.step = 3; draw(); });
    root.querySelector("[data-cc-reset]").addEventListener("click", reset);
    w.addEventListener("resize", draw);

    reset();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("csma-ca", {
    title: "CSMA/CA: interframe spaces and the backoff window",
    note: "Contention is resolved by waiting different lengths of time. SIFS is shorter than DIFS, and that is why an ACK is never interrupted.",
    mount: mount
  });
})(window);
