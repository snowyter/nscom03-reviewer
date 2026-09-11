/* viz-csma.js — why a radio cannot use collision detection.
 *
 * The section says a wireless station cannot hear a collision while it is
 * transmitting, so CSMA/CA replaces detection with avoidance. That sentence is
 * easy to read and hard to picture. This runs the same scenario twice and lets
 * the student drive the moment of the collision:
 *
 *   Wired   -- both stations hear the clash on the shared cable, abort at once,
 *              and the wasted time is bounded by the collision window.
 *   Radio   -- A is transmitting, so its own transmit energy drowns B's signal.
 *              It cannot tell a clash from its own output, finishes the whole
 *              frame, and only finds out when the ACK fails to arrive.
 *
 * Student-driven: the student selects which lane to run and presses step, so the
 * comparison is something they assembled rather than something they watched.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;
    var T = 100;                       // frame duration in "time units"

    root.innerHTML = `
      <div class="ctlrow">
        <label for="cs-mode">Medium</label>
        <span class="seg" data-cs-mode>
          <button type="button" class="is-on" data-cs-wired id="cs-wired">Wired — CSMA/CD</button>
          <button type="button" data-cs-radio>Radio — CSMA/CA</button>
        </span>
      </div>
      <div class="ctlrow">
        <label for="cs-when">Collision happens at</label>
        <input id="cs-when" data-cs-when type="range" min="5" max="90" value="35" step="5">
        <span class="val" data-cs-when-val>t = 35</span>
      </div>
      <canvas data-cs-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-cs-out aria-live="polite"></div>
      <div class="viz__steps">
        <button type="button" data-cs-step>Step the second station</button>
        <button type="button" data-cs-reset>Reset</button>
      </div>
      <p class="viz__note">
        The slider is where the other station starts talking. Step forward to see
        how long each medium takes to notice — and how much airtime is wasted.
      </p>`;

    // Resolve a control by any of the three forms the markup might use:
    // the selector as given, "#foo" -> id="foo", and "#foo" -> data-foo.
    var $ = function (s) {
      if (!s) return null;
      var el = root.querySelector(s);
      if (el) return el;
      if (s.charAt(0) === "#") {
        var k = s.slice(1);
        return root.querySelector("#" + k) || root.querySelector("[data-" + k + "]");
      }
      return null;
    };
    var cv = $("[data-cs-cv]"), out = $("[data-cs-out]");
    var wired = true, advanced = false;

    $("[data-cs-wired]").addEventListener("click", function () {
      wired = true; syncMode(); draw();
    });
    $("[data-cs-radio]").addEventListener("click", function () {
      wired = false; syncMode(); draw();
    });
    function syncMode() {
      $("[data-cs-wired]").classList.toggle("is-on", wired);
      $("[data-cs-radio]").classList.toggle("is-on", !wired);
    }

    function draw() {
      var start = +$("[data-cs-when]").value;
      $("[data-cs-when-val]").textContent = "t = " + start;

      var W = Math.max(280, cv.parentNode.clientWidth - 2);
      var Hh = 286;
      var ctx = H.fitCanvas(cv, W, Hh);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      var padL = 66, padR = 18, span = W - padL - padR;
      var x = function (t) { return padL + (t / 130) * span; };
      var yA = 40, yB = 104, ySense = 176;

      function lane(y, colour, label, a, b, dim) {
        ctx.globalAlpha = dim ? .38 : 1;
        ctx.fillStyle = colour;
        ctx.fillRect(x(a), y, Math.max(2, x(b) - x(a)), 26);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colour; ctx.lineWidth = 1;
        ctx.strokeRect(x(a) + .5, y + .5, Math.max(2, x(b) - x(a)) - 1, 25);
        ctx.fillStyle = p.ink;
        ctx.font = "600 10px ui-monospace, monospace";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 6, y + 13);
      }

      // A transmits its whole frame in both cases.
      lane(yA, p.trace, "STATION A", 0, T, false);
      ctx.fillStyle = p.faint;
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("frame: 0 → 100", x(0), yA - 10);

      // B starts at `start`.
      if (!advanced) {
        out.classList.remove("is-bad","is-good");
        out.innerHTML = `<b>Ready</b><span>Station B is about to transmit. Press <b>Step</b> to see how each medium reacts.</span>`;
        ctx.fillStyle = p.faint;
        ctx.fillText("STATION B", 6, yB + 13);
        ctx.strokeStyle = p.rule;
        ctx.strokeRect(x(start) + .5, yB + .5, Math.max(2, x(T + start) - x(start)) - 1, 25);
        ctx.fillStyle = p.faint;
        ctx.fillText("would start here →", x(start), yB - 10);
      } else if (wired) {
        // Both abort almost immediately.
        var abort = start + 6;                    // one collision window
        lane(yA, p.trace, "STATION A", 0, abort, false);
        lane(yB, p.amber, "STATION B", start, abort, false);
        ctx.fillStyle = p.warn;
        ctx.fillRect(x(abort) - 1, yA - 6, 2, 84);
        ctx.fillText("both detect & abort at t≈" + abort, x(abort) + 6, yA - 12);
        ctx.fillStyle = p.trace;
        ctx.fillText("A sent " + abort + " units then stopped", x(0), ySense - 16);
        out.classList.remove("is-bad"); out.classList.add("is-good");
        out.innerHTML = `<b style="color:${p.trace}">✓ Wired wins</b><span>The cable carries both signals, so each station sees the clash at once. A wastes only ${abort} units of airtime — and CSMA/CD is why Ethernet frames must be at least 64 bytes: a sender has to still be talking when the collision comes back.</span>`;
      } else {
        // Radio: A cannot hear the clash, so it finishes the whole frame.
        lane(yA, p.trace, "STATION A", 0, T, false);
        lane(yB, p.warn, "STATION B", start, Math.min(T + start, 130), true);
        // the region where A is deaf
        ctx.fillStyle = "rgba(224,90,111,.14)";
        ctx.fillRect(x(start), yA - 4, x(T) - x(start), 44);
        ctx.fillStyle = p.warn;
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText("A cannot hear B through its own signal", x(start) + 4, yA + 24);

        // A keeps going, then waits for an ACK that never comes
        ctx.strokeStyle = p.amber; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(x(T), ySense); ctx.lineTo(x(T + 30), ySense); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = p.amber;
        ctx.fillText("ACK never arrives", x(T) + 3, ySense - 9);
        ctx.fillStyle = p.faint;
        ctx.fillText("A finishes all " + T + " units", x(0), ySense + 14);
        out.classList.remove("is-good"); out.classList.add("is-bad");
        out.innerHTML = `<b style="color:${p.warn}">✕ Radio loses</b><span>A is transmitting, so its own energy drowns B. It cannot tell a clash from its own output, so it sends the whole frame — ${T} units, not ${Math.round(start + 6)} — and learns of the failure only when no ACK comes back. That is why 802.11 avoids rather than detects, and why it needs an ACK plus a time-out.</span>`;
      }
    }

    $("[data-cs-step]").addEventListener("click", function () { advanced = true; draw(); });
    $("[data-cs-reset]").addEventListener("click", function () { advanced = false; draw(); });
    root.addEventListener("input", draw);
    w.addEventListener("resize", draw);
    syncMode();
    draw();

    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("csma-cd-vs-ca", {
    title: "Why radio cannot detect collisions",
    note: "Same clash, two media. Wired aborts in a few units; radio cannot hear it and wastes the whole frame, then waits for an ACK that never comes.",
    mount: mount
  });
})(window);
