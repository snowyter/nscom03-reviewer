/* viz-addr4.js — 802.11's four address cases.
 *
 * The four rows of the 802.11 addressing table are the single most memorised and
 * least understood part of the module. Each row is an answer to "who is the
 * receiver, who is the transmitter, and why is a third address needed at all" —
 * and the third address exists only because a frame may cross a distribution
 * system, where the MAC-level sender and receiver are not the radio-level ones.
 *
 * Student-driven: pick a case and the diagram shows the path, naming which role
 * each of the three address fields plays in that row.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    // Each case: the scenario, the path, and what A1/A2/A3 hold.
    var CASES = [
      { id: 1, label: "To AP",
        scenario: "A station sends to another station through the AP.",
        chain: ["A", "AP", "B"],
        a1: "B  — the final destination", a2: "A  — the actual transmitter", a3: "AP — the router (source)",
        why: "The frame leaves A and is received by the AP, but it is addressed to B at the far side. Address 1 is whoever hears it next (the AP), address 3 is where it must end up (B).",
        from: 0, to: 2 },
      { id: 2, label: "From AP",
        scenario: "The AP forwards that frame on to the destination station.",
        chain: ["AP", "B"],
        a1: "B — the destination station", a2: "AP — the transmitter", a3: "A — the original source",
        why: "Now the AP is the transmitter, so address 2 changes role. Address 3 still names the original source, which is what lets B put the reply back on the right path even though the radio hop changed.",
        from: 0, to: 1 },
      { id: 3, label: "AP to AP",
        scenario: "A frame crosses the distribution system between two access points.",
        chain: ["AP1", "AP2"],
        a1: "AP2 — the receiving AP", a2: "AP1 — the sending AP", a3: "the router",
        why: "Neither endpoint is a normal station. The distribution system itself is bridged, so the addresses describe a link between infrastructure devices, and address 3 carries the original source through.",
        from: 0, to: 1 },
      { id: 4, label: "Ad hoc",         chain: ["A", "B"],
        scenario: "Two stations talk directly, with no AP and no distribution system.",
        a1: "B — the destination", a2: "A — the transmitter", a3: "not used",
        why: "With no infrastructure there is no third party to route through, so address 3 is simply not needed. The same frame layout carries it, empty.",
        from: 0, to: 1 }
    ];

    root.innerHTML = `
      <div class="viz__tabs" role="tablist" aria-label="Addressing cases"></div>
      <canvas data-a4-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-a4-out aria-live="polite"></div>
      <p class="viz__note">
        The three address fields do not mean "source, destination, spare".
        Their meanings <b>shift</b> with the case, which is why the table exists.
      </p>`;

    var tabsEl = root.querySelector(".viz__tabs");
    var cv = root.querySelector("[data-a4-cv]");
    var out = root.querySelector("[data-a4-out]");
    var active = 0;

    function renderTabs() {
      tabsEl.innerHTML = CASES.map(function (c, k) {
        return `<button type="button" role="tab" aria-selected="${k === active}"
                  class="viz__tab${k === active ? " is-on" : ""}" data-a4="${k}">
                  ${c.id}. ${c.label}</button>`;
      }).join("");
      tabsEl.querySelectorAll("[data-a4]").forEach(function (b) {
        b.addEventListener("click", function () {
          active = Number(b.getAttribute("data-a4"));
          renderTabs(); draw();
        });
      });
    }

    function draw() {
      var c = CASES[active];
      var W = H.measure(cv);
      // Fixed height: one row of nodes plus the space its labels need above and
      // below. The case list is a tab strip in the DOM, not the canvas, so there
      // is no run-length-dependent content here and nothing can be clipped.
      var Hh = 210;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      var n = c.chain.length;
      var y = 104;
      var gap = Math.min(220, (W - 120) / Math.max(1, n - 1 || 1));
      var startX = W / 2 - gap * (n - 1) / 2;

      // Nodes.
      c.chain.forEach(function (name, k) {
        var x = startX + k * gap;
        var isEnd = k === c.from, isDest = k === c.to;
        var col = isEnd ? p.trace : (isDest ? p.amber : p.inkDim);
        ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,.03)"; ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = col;
        ctx.font = "11px ui-monospace, monospace";
        ctx.fillText(name, x, y + .5);
        // Role captions, above for the sender and below for the destination, so
        // the two never share a line when the chain is only two nodes long.
        ctx.font = "9px ui-monospace, monospace";
        if (isEnd) { ctx.fillStyle = p.trace; ctx.fillText("transmitter", x, y - 34); }
        if (isDest) { ctx.fillStyle = p.amber; ctx.fillText("destination", x, y + 36); }
      });

      // The hop, drawn between the first two nodes; the rest of the chain is
      // the "through the DS" part and is drawn dashed to show it is not radio.
      for (var k = 0; k < n - 1; k++) {
        var x1 = startX + k * gap, x2 = startX + (k + 1) * gap;
        var radio = (k === 0);
        ctx.strokeStyle = radio ? p.trace : p.rule;
        ctx.lineWidth = radio ? 2 : 1;
        ctx.setLineDash(radio ? [] : [4, 4]);
        ctx.beginPath(); ctx.moveTo(x1 + 20, y); ctx.lineTo(x2 - 20, y); ctx.stroke();
        ctx.setLineDash([]);
        if (radio) {
          ctx.fillStyle = p.faint;
          ctx.font = "9px ui-monospace, monospace";
          ctx.fillText("radio hop", (x1 + x2) / 2, y - 14);
        }
      }
      ctx.textAlign = "left";

      // The address fields, listed as data.
      out.classList.remove("is-bad", "is-good");
      out.classList.add("is-good");
      out.innerHTML =
        `<b>Case ${c.id} — ${c.label}</b>` +
        `<span>${c.scenario}</span>` +
        `<span class="viz__why"><i>Address 1 (receiver):</i> ${c.a1}</span>` +
        `<span class="viz__why"><i>Address 2 (transmitter):</i> ${c.a2}</span>` +
        `<span class="viz__why"><i>Address 3:</i> ${c.a3}</span>` +
        `<span class="viz__why"><i>Why:</i> ${c.why}</span>`;
    }

    renderTabs();
    draw();
    w.addEventListener("resize", draw);
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("wifi-addressing", {
    title: "802.11 addressing: the four cases",
    note: "The three address fields change meaning with the case. Pick a case and see which role each field plays.",
    mount: mount
  });
})(window);
