/* viz-layers.js — encapsulation: where a piece of data sits at each layer.
 *
 * The OSI and TCP/IP models are taught as two stacked diagrams with a mapping
 * arrow, and the part students actually miss is that the DATA CHANGES as it
 * descends: each layer prepends its own header, and the receiving stack strips
 * them in reverse. A static picture of seven boxes cannot show that.
 *
 * Student-driven: move the data up and down the stack and watch the headers
 * accumulate and come off, with the layer name for that piece of data.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    // The OSI stack, with the TCP/IP mapping and the PDU name at each layer.
    var LAYERS = [
      { osi: "7 Application",  tcp: "Application", pdu: "Data",
        adds: null,
        note: "The user's data. Nothing has been added yet — this is the message as the application produced it." },
      { osi: "6 Presentation", tcp: "Application", pdu: "Data",
        adds: null,
        note: "Translation, compression, encryption. In TCP/IP these jobs are folded into the application itself, which is why the mapping arrow is not one-to-one." },
      { osi: "5 Session",      tcp: "Application", pdu: "Data",
        adds: null,
        note: "Dialogue control — who speaks, how long, how to recover a broken conversation. Also absorbed into the application in TCP/IP." },
      { osi: "4 Transport",    tcp: "Transport",   pdu: "Segment / Datagram",
        adds: "TCP or UDP header",
        note: "The first header appears. The transport header carries port numbers, so it identifies the process rather than the machine." },
      { osi: "3 Network",      tcp: "Internet",    pdu: "Packet / Datagram",
        adds: "IP header",
        note: "A second header is wrapped around the first. The IP header carries addresses that can route across networks, and the transport header becomes payload." },
      { osi: "2 Data link",    tcp: "Network access", pdu: "Frame",
        adds: "Frame header + trailer",
        note: "A third header, plus a trailer — the only layer that adds anything at the end, because the frame check sequence goes at the back." },
      { osi: "1 Physical",     tcp: "Network access", pdu: "Bits",
        adds: null,
        note: "No header at all. The layer converts the whole frame to a signal; the frame's bytes have no layered structure here." }
    ];

    root.innerHTML = `
      <div class="viz__tabs" role="tablist" aria-label="OSI layers"></div>
      <canvas data-ly-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-ly-out aria-live="polite"></div>
      <p class="viz__note">
        Move down the stack and watch each layer wrap its own header around what
        the layer above handed it. The receiver strips them in reverse — that is
        what <b>encapsulation</b> means.
      </p>`;

    var tabsEl = root.querySelector(".viz__tabs");
    var cv = root.querySelector("[data-ly-cv]");
    var out = root.querySelector("[data-ly-out]");
    var active = 3;      // start at the transport layer, where the first header appears

    function renderTabs() {
      tabsEl.innerHTML = LAYERS.map(function (l, k) {
        return `<button type="button" role="tab" class="${k === active ? "viz__tab is-on" : "viz__tab"}"
                  aria-selected="${k === active}" data-ly="${k}">${l.osi.split(" ")[0]}</button>`;
      }).join("");
      tabsEl.querySelectorAll("[data-ly]").forEach(function (b) {
        b.addEventListener("click", function () {
          active = Number(b.getAttribute("data-ly"));
          renderTabs(); draw();
        });
      });
    }

    function draw() {
      var L = LAYERS[active];
      var W = H.measure(cv);
      // Fixed height: one row of nested blocks with its labels above and below.
      // No run-length-dependent content, so nothing can be clipped.
      var Hh = 250;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";

      // Draw the encapsulation as nested bars: the innermost is the user data,
      // and each layer below adds a segment on each side of it.
      var x0 = 30, x1 = W - 30, cy = 120;
      var barH = 30;

      // Work out how many wrappers are present at this layer: it is the count of
      // layers from transport down to the active one.
      var wrappers = [];
      for (var k = 3; k <= active; k++) wrappers.push(LAYERS[k].adds);

      // The innermost payload.
      var innerW = Math.max(90, (x1 - x0) * 0.42);
      var cx = (x0 + x1) / 2;
      var pw = innerW;
      // Each wrapper adds a fixed 54px block on each side, but never past the
      // canvas edge: clamp so the outermost bar cannot be cut off.
      var wrapW = 54;
      var maxExtra = (x1 - x0 - innerW) / 2;
      var extra = Math.min(wrappers.length * wrapW, maxExtra);
      var step = wrappers.length ? extra / wrappers.length : 0;

      // Draw outermost first so inner bars paint on top.
      for (var j = wrappers.length - 1; j >= 0; j--) {
        var wj = innerW + (j + 1) * step;
        var isLast = (j === wrappers.length - 1);
        var col = j === 0 ? p.traceDim : (j === 1 ? p.amber : p.warn);
        ctx.fillStyle = "rgba(255,255,255,.03)";
        ctx.strokeStyle = col; ctx.lineWidth = 1;
        var bx = cx - wj / 2, by = cy - barH / 2 - j * 0;
        ctx.fillRect(bx, by, wj, barH);
        ctx.strokeRect(bx + .5, by + .5, wj, barH);
        // Label the wrapper in its own left margin, if there is room.
        if (step >= 34) {
          ctx.fillStyle = col;
          ctx.textAlign = "left";
          ctx.fillText(LAYERS[3 + j].adds.split(" ")[0], bx + 4, by - 10);
        }
      }
      // The payload, inside everything.
      ctx.fillStyle = "rgba(125,255,178,.10)";
      ctx.fillRect(cx - pw / 2, cy - barH / 2, pw, barH);
      ctx.strokeStyle = p.trace; ctx.lineWidth = 1;
      ctx.strokeRect(cx - pw / 2 + .5, cy - barH / 2 + .5, pw, barH);
      ctx.fillStyle = p.ink;
      ctx.textAlign = "center";
      ctx.fillText(L.pdu, cx, cy);

      // A legend row under the diagram naming the layer and its TCP/IP peer.
      ctx.textAlign = "left";
      ctx.fillStyle = p.faint;
      ctx.fillText("OSI", 30, 44);
      ctx.fillStyle = p.inkDim;
      ctx.fillText(L.osi.slice(2), 30, 60);
      ctx.fillStyle = p.faint;
      ctx.fillText("TCP/IP", W - 150, 44);
      ctx.fillStyle = p.trace;
      ctx.fillText(L.tcp, W - 150, 60);

      // What this layer adds, as a line under the bars.
      ctx.fillStyle = p.faint;
      ctx.fillText("adds", 30, 196);
      ctx.fillStyle = L.adds ? p.amber : p.faint;
      ctx.fillText(L.adds || "nothing", 30, 212);

      // The verdict.
      out.classList.remove("is-bad", "is-good");
      out.classList.add("is-good");
      out.innerHTML = `<b>${L.osi} — ${L.pdu}</b><span>${L.note}</span>`;
      ctx.textAlign = "left";
    }

    renderTabs();
    draw();
    w.addEventListener("resize", draw);
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("encapsulation", {
    title: "Encapsulation: what each layer adds",
    note: "Move down the OSI stack and watch each layer wrap its own header around the data. The receiver strips them in reverse.",
    mount: mount
  });
})(window);
