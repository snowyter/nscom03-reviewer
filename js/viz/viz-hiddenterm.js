/* viz-hiddenterm.js — hidden and exposed terminals, by geometry.
 *
 * "Hidden terminal" is defined by range, not by distance, so a static picture
 * with arrows makes it look like a fact to memorise. Here the student moves the
 * stations and watches the range circles meet or fail to meet. The two failure
 * modes are the same picture with the middle station in a different place.
 *
 * Student-driven: drag the sliders. Nothing moves on its own.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;
    // The radio range as a fraction of the A–C separation. The phenomenon only
    // exists when A and C are out of earshot of each other but each can reach the
    // middle station, so the range has to scale with the width rather than being
    // a fixed pixel radius. A fixed 150px radius against a 779px gap left B in a
    // dead zone for most of the slider, where neither station was audible and the
    // two named cases were unreachable.
    var RANGE_FRAC = 0.30;

    root.innerHTML = `
      <canvas data-ht-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-ht-out aria-live="polite"></div>
      <div class="viz__ctl">
        <label for="ht-b">Move station B</label>
        <input type="range" id="ht-b" data-ht-b min="0" max="100" value="50"
               aria-label="Move station B between A and C">
      </div>
      <div class="viz__steps">
        <button type="button" data-ht-hidden>Hidden terminal</button>
        <button type="button" data-ht-exposed>Exposed terminal</button>
      </div>
      <p class="viz__note">
        Drag <b>B</b> between <b>A</b> and <b>C</b>. A station can only hear
        another if it is inside its range circle. Whether B's transmission
        protects A and C is decided entirely by that.
      </p>`;

    var cv = root.querySelector("[data-ht-cv]");
    var out = root.querySelector("[data-ht-out]");
    var slider = root.querySelector("[data-ht-b]");
    var t = 0.5;      // B's position as a fraction of the A–C gap

    var A = { x: 110, y: 0, id: "A" };
    var C = { x: 110, y: 0, id: "C" };

    function geom() {
      var W = cv.clientWidth || 600;
      A.x = 40; C.x = W - 40;
      var mid = 78 - 66;
      var y = 118;
      A.y = C.y = y;
      // B slides between A and C.
      var B = { x: A.x + 40 + t * (C.x - A.x - 80), y: y, id: "B" };
      return { W: W, y: y, B: B };
    }

    function draw() {
      var W = Math.max(320, cv.parentNode.clientWidth - 2);
      // Fixed height: the status lines at the top, then the stations row with the
      // range circles (radius 150) and their captions below. The circles must NOT
      // reach the status block, or their strokes run through the text and merge
      // every line into one unreadable band -- which is what an earlier version
      // did. Status needs ~76px; the circles need 2R below that.
      var STATUS_H = 76;
      var ctx = H.fitCanvas(cv, W, 0);          // sized below, once R is known
      var p = H.palette(root);

      A.x = 46; C.x = W - 46;
      // The range is a fixed fraction of the A–C gap, so the middle station can
      // always reach exactly one of the two outer stations and the slider spans
      // both phenomena at any canvas width.
      // R scales with the gap but is capped, so the picture stays compact on a
      // wide canvas. The cap keeps 2R below the A-C separation, which is the
      // condition that makes hidden/exposed terminals exist at all.
      var R = Math.min(120, Math.max(48, (C.x - A.x) * RANGE_FRAC));
      var Hh = STATUS_H + R * 2 + 74;
      ctx = H.fitCanvas(cv, W, Hh);
      ctx.clearRect(0, 0, W, Hh);

      // Place the station row so the circles sit fully below the status block.
      var y = STATUS_H + R;
      A.y = C.y = y;
      // B slides across the full A–C span, inset so it clears both markers.
      var B = { x: A.x + 30 + t * Math.max(0, C.x - A.x - 60), y: y, id: "B" };

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      var ab = Math.abs(A.x - B.x), bc = Math.abs(B.x - C.x), ac = Math.abs(A.x - C.x);
      var hearsAB = ab <= R, hearsBC = bc <= R, hearsAC = ac <= R;

      // Range circles first, so the stations sit on top.
      [["A", A], ["C", C]].forEach(function (pair) {
        var col = (pair[0] === "A") ? p.trace : p.amber;
        ctx.beginPath(); ctx.arc(pair[1].x, pair[1].y, R, 0, Math.PI * 2);
        ctx.fillStyle = (pair[0] === "A") ? "rgba(125,255,178,.07)" : "rgba(255,209,102,.07)";
        ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke();
        ctx.setLineDash([]);
      });

      // Stations. A and C are the fixed endpoints, so they are drawn as neutral
      // markers; only the middle station's colour carries information, and it
      // says whether B currently hears anyone. Colouring A and C green made the
      // picture assert audibility the geometry had not established.
      function node(x, yy, id, state) {
        var col = state === "trace" ? p.trace : (state === "warn" ? p.warn : p.inkDim);
        ctx.beginPath(); ctx.arc(x, yy, 15, 0, Math.PI * 2);
        ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.fillStyle = "rgba(255,255,255,.04)"; ctx.fill(); ctx.stroke();
        ctx.fillStyle = col;
        ctx.font = "12px ui-monospace, monospace";
        ctx.fillText(id, x, yy + .5);
        ctx.font = "10px ui-monospace, monospace";
      }
      node(A.x, A.y, "A", "dim");
      node(C.x, C.y, "C", "dim");
      node(B.x, B.y, "B", (hearsAB || hearsBC) ? "trace" : "warn");

      // The rule that matters: can B hear A, and can B hear C?
      ctx.textAlign = "left";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillStyle = hearsAB ? p.trace : p.warn;
      ctx.fillText((hearsAB ? "✓" : "✕") + " B hears A", 12, 26);
      ctx.fillStyle = hearsBC ? p.trace : p.warn;
      ctx.fillText((hearsBC ? "✓" : "✕") + " B hears C", 12, 44);
      ctx.fillStyle = hearsAC ? p.trace : p.warn;
      ctx.fillText((hearsAC ? "✓" : "✕") + " A hears C", 12, 62);
      ctx.textAlign = "center";

      // The verdict, named by the geometry rather than asserted.
      out.classList.remove("is-bad", "is-good");
      if (!hearsAB && hearsBC) {
        out.classList.add("is-bad");
        out.innerHTML = `<b>✕ Hidden terminals</b><span>B can hear C but <b>not</b> A. So when A transmits, B's carrier sense says the channel is clear — because B genuinely cannot hear A — and B transmits straight into A's frame at C. A's signal is too weak at B to sense; B's is strong enough at C to destroy. This is the failure CSMA/CD cannot fix, because B never detected a collision either.</span>`;
      } else if (hearsAB && !hearsBC) {
        out.classList.add("is-bad");
        out.innerHTML = `<b>✕ Exposed terminal</b><span>B can hear A but <b>not</b> C. So when B wants to transmit to C it senses A's activity, decides the channel is busy, and waits — even though B's transmission would reach only C, and would not interfere with A's receiver at all. The channel is being kept idle for no reason: wasted capacity.</span>`;
      } else if (hearsAB && hearsBC && !hearsAC) {
        out.classList.add("is-good");
        out.innerHTML = `<b>✓ Neither problem</b><span>B hears both, and A and C cannot hear each other. B's carrier sense therefore works: if B hears A it waits, and its transmission is the only one reaching C. This is the case where plain carrier sensing is enough.</span>`;
      } else if (hearsAC) {
        out.classList.add("is-good");
        out.innerHTML = `<b>All in range</b><span>A, B and C all hear each other, so sensing genuinely reflects the medium. Wired CSMA/CD reasoning applies — move B outward to see the wireless cases appear.</span>`;
      } else {
        out.classList.add("is-bad");
        out.innerHTML = `<b>✕ Hidden terminals</b><span>Neither terminal can hear the other through B. Both will sense a clear channel and transmit together at C. Move B closer to A or C to separate the two phenomena.</span>`;
      }
    }

    slider.addEventListener("input", function () {
      t = Number(slider.value) / 100;
      draw();
    });
    // The two buttons put B where the named phenomenon actually occurs, so the
    // student can jump to it rather than hunting for the threshold. The geometry
    // decides these: B must be INSIDE one circle and OUTSIDE the other, so the
    // hidden case sits near C and the exposed case near A. Values chosen from the
    // measured distances, not guessed.
    root.querySelector("[data-ht-hidden]").addEventListener("click", function () {
      slider.value = "95"; t = 0.95; draw();
    });
    root.querySelector("[data-ht-exposed]").addEventListener("click", function () {
      slider.value = "4"; t = 0.04; draw();
    });
    w.addEventListener("resize", draw);

    draw();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("hidden-terminal", {
    title: "Hidden and exposed terminals, by range",
    note: "Move B between A and C. Whether B can hear each of them is decided purely by distance, and that decides which failure mode you are in.",
    mount: mount
  });
})(window);
