/* viz-switch.js — the transparent bridge's forwarding table, learned frame by
 * frame.
 *
 * The forwarding table is taught as a finished thing, but its whole content comes
 * from one rule: read the SOURCE address of every arriving frame and record the
 * port it came in on. The destination address is what the table is USED for, not
 * what fills it. That asymmetry is the confusing part.
 *
 * Student-driven: send one frame at a time and watch the table grow. The first
 * frame to an unknown destination is flooded, which is why a switch is
 * "transparent" — it works before it knows anything.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    // Four stations on four ports. Each frame is a (from, to) pair.
    var FRAMES = [
      { from: "A", to: "B", port: 1 },
      { from: "B", to: "A", port: 2 },
      { from: "C", to: "A", port: 3 },
      { from: "A", to: "C", port: 1 },
      { from: "D", to: "A", port: 4 }
    ];
    var PORTS = { A: 1, B: 2, C: 3, D: 4 };

    root.innerHTML = `
      <canvas data-sw-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-sw-out aria-live="polite"></div>
      <div class="viz__steps">
        <button type="button" data-sw-step>Send next frame</button>
        <button type="button" data-sw-reset>Reset</button>
      </div>
      <p class="viz__note">
        A switch learns from the <b>source</b> address of every frame and looks up
        the <b>destination</b>. Send frames and watch the table fill. Until a
        destination is known the frame must be <b>flooded</b> out of every other
        port.
      </p>`;

    var cv = root.querySelector("[data-sw-cv]");
    var out = root.querySelector("[data-sw-out]");
    var i = 0;
    var table = {};      // MAC -> port
    var lastAction = null;

    function step() {
      if (i >= FRAMES.length) return;
      var f = FRAMES[i];
      // The learning rule, in the order the bridge does it: LEARN from source,
      // then FORWARD by looking up destination.
      var learned = !table[f.from];
      table[f.from] = f.port;
      var known = table[f.to] !== undefined;
      lastAction = { f: f, learned: learned, known: known, toPort: table[f.to] };
      i += 1;
      draw();
    }

    function reset() { i = 0; table = {}; lastAction = null; draw(); }

    function draw() {
      var W = Math.max(320, cv.parentNode.clientWidth - 2);
      // Fixed height: the diagram row plus the table rows. Only the table grows,
      // and it is bounded by the four known stations, so the height is computed
      // from that bound rather than from the running count -- no clipping.
      var tableRows = Object.keys(table).length;
      var Hh = 150 + Math.max(4, tableRows) * 22 + 34;
      var ctx = H.fitCanvas(cv, W, Hh);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // The switch in the middle with four ports.
      var midX = W / 2, midY = 62;
      var devW = 118, devH = 32;
      ctx.strokeStyle = p.rule; ctx.lineWidth = 1;
      ctx.strokeRect(midX - devW / 2 + .5, midY - devH / 2 + .5, devW, devH);
      ctx.fillStyle = p.ink;
      ctx.fillText("SWITCH", midX, midY);

      // Station boxes, A and B above the switch, C and D below, each with its
      // port number. Positions are fixed so nothing shifts between frames.
      var NODES = [
        { id: "A", x: midX - 150, y: midY },
        { id: "B", x: midX + 150, y: midY },
        { id: "C", x: midX - 150, y: midY + 74 },
        { id: "D", x: midX + 150, y: midY + 74 }
      ];
      ctx.font = "10px ui-monospace, monospace";
      NODES.forEach(function (n) {
        var isFrom = lastAction && lastAction.f.from === n.id;
        var isTo = lastAction && lastAction.f.to === n.id;
        var flooded = isTo && lastAction && !lastAction.known;
        var col = isFrom ? p.trace : (isTo ? (flooded ? p.amber : p.trace) : p.faint);
        ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.strokeRect(n.x - 34 + .5, n.y - 14 + .5, 68, 28);
        ctx.fillStyle = col;
        ctx.fillText(n.id + "  (port " + PORTS[n.id] + ")", n.x, n.y);
        // Link to the switch, lit while it carries this frame.
        if (isFrom || isTo) {
          ctx.strokeStyle = col; ctx.lineWidth = flooded ? 2 : 1.5;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y + (n.y > midY ? -14 : 14));
          ctx.lineTo(midX, midY + (n.y > midY ? devH / 2 : -devH / 2));
          ctx.stroke();
        }
      });

      // The forwarding table, drawn on its own background so it reads as data.
      var ty = 150;
      ctx.textAlign = "left";
      ctx.fillStyle = p.faint;
      ctx.fillText("FORWARDING TABLE", 6, ty - 12);
      ctx.font = "10px ui-monospace, monospace";
      var entries = Object.keys(table).sort();
      if (!entries.length) {
        ctx.fillStyle = p.faint;
        ctx.fillText("empty — nothing learned yet", 6, ty + 6);
      } else {
        entries.forEach(function (mac, k) {
          var y = ty + k * 22;
          var fresh = lastAction && lastAction.learned && lastAction.f.from === mac;
          ctx.fillStyle = fresh ? p.trace : p.inkDim;
          ctx.fillText(mac, 6, y);
          ctx.fillStyle = p.faint;
          ctx.fillText("→", 46, y);
          ctx.fillStyle = fresh ? p.trace : p.inkDim;
          ctx.fillText("port " + table[mac], 66, y);
          if (fresh) {
            ctx.fillStyle = p.faint;
            ctx.fillText("← learned from this frame's source", 140, y);
          }
        });
      }
      ctx.textAlign = "center";

      // The verdict.
      out.classList.remove("is-bad", "is-good");
      if (!lastAction) {
        out.innerHTML = `<b>Ready</b><span>The table is empty. A switch starts knowing nothing and builds the table from traffic.</span>`;
      } else {
        var a = lastAction;
        if (a.known) {
          out.classList.add("is-good");
          out.innerHTML = `<b>✓ Forwarded</b><span>${a.f.from} → ${a.f.to}: the source was recorded on port ${a.f.port}, then the destination ${a.f.to} was found in the table on port ${a.toPort}, so the frame went out that port <i>only</i>. The other stations never saw it.</span>`;
        } else {
          out.classList.add("is-bad");
          out.innerHTML = `<b>≈ Flooded</b><span>${a.f.from} → ${a.f.to}: the source was recorded on port ${a.f.port}, but ${a.f.to} is not in the table yet, so the frame was flooded out of every port except the one it arrived on. ${a.f.to} will answer, and that reply is what teaches the switch where it lives.</span>`;
        }
      }
    }

    root.querySelector("[data-sw-step]").addEventListener("click", step);
    root.querySelector("[data-sw-reset]").addEventListener("click", reset);
    w.addEventListener("resize", draw);

    draw();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("switch-table", {
    title: "Switch forwarding table, learned frame by frame",
    note: "A switch learns from the source address and forwards by the destination. Send frames and watch unknown destinations get flooded.",
    mount: mount
  });
})(window);
