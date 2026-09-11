/* viz-domain.js — the collision domain, and how a switch collapses it.
 *
 * The sentence "a switch breaks the collision domain" is easy to repeat and hard
 * to picture. This shows four stations wired to a hub (one domain, every frame
 * heard by everyone, only one can transmit at a time) and then the same four on
 * a switch (each port its own domain, two pairs can talk at once).
 *
 * Student-driven: the student chooses the device and then asks a station to
 * transmit. Nothing moves until they do.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    root.innerHTML = `
      <canvas data-dm-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-dm-out aria-live="polite"></div>
      <div class="viz__steps">
        <button type="button" data-dm-hub>Hub</button>
        <button type="button" data-dm-switch>Switch</button>
        <button type="button" data-dm-send>Station A sends</button>
        <button type="button" data-dm-both>A and C send</button>
      </div>
      <p class="viz__note">
        With a <b>hub</b> every frame reaches all four stations, so a second
        transmission is a collision. With a <b>switch</b> each port is its own
        domain, so A→B and C→D can run at the same time.
      </p>`;

    var cv = root.querySelector("[data-dm-cv]");
    var out = root.querySelector("[data-dm-out]");
    var device = "hub";
    var talking = [];      // station ids currently transmitting
    var verdict = null;

    // Four stations, two on the left and two on the right, with the device in
    // the middle. Fixed coordinates so the layout never wobbles.
    var ST = [
      { id: "A", x: 78,  y: 62 },
      { id: "B", x: 78,  y: 190 },
      { id: "C", x: 700, y: 62 },
      { id: "D", x: 700, y: 190 }
    ];

    function draw() {
      var W = Math.max(320, cv.parentNode.clientWidth - 2);
      // Height is fixed: four stations, two rows, with room for the labels that
      // sit above and below each node. No growing content, so no clip risk.
      var Hh = 266;
      var ctx = H.fitCanvas(cv, W, Hh);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      var midX = W / 2;
      var midY = 126;

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";

      // The device. Drawn as a box in the middle of the star.
      var devW = 96, devH = 34;
      ctx.strokeStyle = p.rule; ctx.lineWidth = 1;
      ctx.strokeRect(midX - devW / 2 + .5, midY - devH / 2 + .5, devW, devH);
      ctx.fillStyle = p.ink;
      ctx.textAlign = "center";
      ctx.fillText(device === "hub" ? "HUB" : "SWITCH", midX, midY - 2);
      ctx.fillStyle = p.faint;
      ctx.font = "9px ui-monospace, monospace";
      ctx.fillText(device === "hub" ? "one domain" : "one domain per port", midX, midY + 11);
      ctx.font = "10px ui-monospace, monospace";

      // Links from each station to the device.
      ST.forEach(function (s) {
        ctx.strokeStyle = p.ruleSoft; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(midX, midY); ctx.stroke();
      });

      // The domain shading: with a hub the whole star is one collision domain,
      // which is the point. With a switch it is per-port, so we tint each link
      // only while that link is carrying a frame.
      if (device === "hub" && talking.length) {
        ctx.fillStyle = "rgba(255,123,107,.10)";
        ctx.fillRect(0, 0, W, Hh);
      }

      // Stations.
      ST.forEach(function (s) {
        var active = talking.indexOf(s.id) >= 0;
        var col = active ? (talking.length > 1 && device === "hub" ? p.warn : p.trace) : p.inkDim;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(s.x, s.y, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.ground;
        ctx.font = "11px ui-monospace, monospace";
        ctx.fillText(s.id, s.x, s.y + .5);
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillStyle = active ? col : p.faint;
        ctx.fillText(active ? "sending" : "idle", s.x, s.y + 26);

        // A lit link while this station transmits.
        if (active) {
          ctx.strokeStyle = col; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(midX, midY); ctx.stroke();
        }
      });
      ctx.textAlign = "left";

      // The verdict, phrased in terms of what the picture shows.
      out.classList.remove("is-bad", "is-good");
      if (!talking.length) {
        out.innerHTML = `<b>Ready</b><span>${device === "hub"
          ? "One collision domain: all four stations share the channel."
          : "Four collision domains: each port is its own channel."} Ask a station to send.</span>`;
      } else if (device === "hub" && talking.length > 1) {
        out.classList.add("is-bad");
        out.innerHTML = `<b>✕ Collision</b><span>A and C both transmitted into the same domain, so the two signals added and both frames were destroyed. Neither can tell until the corrupted data reaches the far end — that is why a hub gives you no isolation.</span>`;
      } else if (device === "switch") {
        out.classList.add("is-good");
        out.innerHTML = `<b>✓ No collision</b><span>${talking.length > 1
          ? "A→B and C→D are crossing the switch on separate ports, so both run at full rate simultaneously. Aggregate throughput doubles."
          : "The switch forwards only toward the destination port; B and D never see this frame at all. That is the isolation a hub cannot give."}</span>`;
      } else {
        out.classList.add("is-good");
        out.innerHTML = `<b>✓ One talker</b><span>A holds the whole domain while it transmits, and every other station waits. No collision — but the entire channel serves one conversation.</span>`;
      }
    }

    function setDevice(d) { device = d; talking = []; draw(); }

    root.querySelector("[data-dm-hub]").addEventListener("click", function () { setDevice("hub"); });
    root.querySelector("[data-dm-switch]").addEventListener("click", function () { setDevice("switch"); });
    root.querySelector("[data-dm-send]").addEventListener("click", function () { talking = ["A"]; draw(); });
    root.querySelector("[data-dm-both]").addEventListener("click", function () { talking = ["A", "C"]; draw(); });
    w.addEventListener("resize", draw);

    draw();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("collision-domain", {
    title: "One collision domain or four? Hub versus switch",
    note: "With a hub every station shares one channel. With a switch each port is its own domain, so two conversations run at once.",
    mount: mount
  });
})(window);
