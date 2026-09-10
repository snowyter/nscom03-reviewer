/* sim-multiplexing.js — FDM / TDM / WDM channel diagrams with a step-through
   animation showing how separate channels interleave onto one link. */

(function (w) {
  "use strict";

  var KINDS = {
    fdm: { label: "FDM — frequency", unit: "channel bands laid side by side",
           note: "Each channel owns a frequency band for the whole time it is active, so all channels transmit at once. Guard bands keep them from bleeding into each other." },
    wdm: { label: "WDM — wavelength", unit: "colours of light on one fibre",
           note: "FDM done on light: each channel is a different wavelength, combined by a prism and split again at the far end. Wavelengths must differ enough to stay distinguishable." },
    tdm: { label: "TDM — time slots", unit: "slots in a repeating frame",
           note: "Each channel owns a time slot, and slots repeat in a fixed frame, so every channel gets the same share whether or not it has data. That fixed share is why statistical TDM exists." }
  };

  var CH_COLORS = ["#7dffb2", "#ffd166", "#4fb3d9", "#ff9f6b", "#c792ea"];

  function mount(root) {
    root.innerHTML = `
      <div class="ctlrow ctlrow--split">
        <div class="ctlrow">
          <label for="mx-kind">Technique</label>
          <select id="mx-kind">
            ${Object.keys(KINDS).map(function (k) {
              return `<option value="${k}">${KINDS[k].label}</option>`;
            }).join("")}
          </select>
        </div>
        <div class="ctlrow">
          <label for="mx-ch">Channels</label>
          <input id="mx-ch" type="range" min="2" max="5" value="4" step="1">
          <span class="val" data-mx-ch>4</span>
        </div>
        <div class="ctlrow">
          <label for="mx-slot">Slot step</label>
          <input id="mx-slot" type="range" min="0" max="11" value="0" step="1">
          <span class="val" data-mx-slot>0</span>
        </div>
      </div>
      <div class="wave" data-mx-wave></div>
      <div class="wave__legend" data-mx-legend></div>
      <div class="readout" data-mx-out></div>
      <p class="sim__desc" style="padding:.7rem 0 0" data-mx-note></p>`;

    var $ = function (s) { return root.querySelector(s); };
    var kindEl = $("#mx-kind"), chEl = $("#mx-ch"), slotEl = $("#mx-slot");
    var waveEl = $("#mx-wave"), legendEl = $("#mx-legend");
    var outEl = $("#mx-out"), noteEl = $("#mx-note");

    var W = 900, H = 260, pad = 40;

    function draw() {
      var kind = kindEl.value, n = +chEl.value, step = +slotEl.value;
      root.querySelector("[data-mx-ch]").textContent = String(n);
      root.querySelector("[data-mx-slot]").textContent = String(step);
      noteEl.textContent = KINDS[kind].note;

      var svg = "", legend = "";
      var lanes = Math.min(n, 5);

      if (kind === "tdm") {
        var frames = 4, slotsPerFrame = lanes;
        var x0 = pad, x1 = W - pad;
        var laneH = 30, top = 52;
        var slotW = (x1 - x0) / (frames * slotsPerFrame);

        for (var c = 0; c < lanes; c++) {
          var y = top + c * laneH;
          svg += `<text x="${pad - 8}" y="${y + 18}" fill="var(--ink-faint)"
            font-size="11" font-family="var(--mono)" text-anchor="end">Ch${c + 1}</text>`;
          for (var f = 0; f < frames; f++) {
            for (var s = 0; s < slotsPerFrame; s++) {
              var idx = f * slotsPerFrame + s;
              var isOwn = s === c;
              var active = isOwn && (Math.floor(step) % frames) === f && step > 0;
              var x = x0 + idx * slotW;
              svg += `<rect x="${x.toFixed(1)}" y="${y}" width="${(slotW - 1.5).toFixed(1)}"
                height="${laneH - 8}" fill="${isOwn ? CH_COLORS[c] : "transparent"}"
                stroke="var(--rule)" stroke-width="1" opacity="${active ? 1 : (isOwn ? .75 : .3)}"/>`;
            }
          }
        }
        // the multiplexed link line
        var ly = top + lanes * laneH + 26;
        svg += `<line x1="${pad}" y1="${ly}" x2="${W - pad}" y2="${ly}"
                  stroke="var(--trace)" stroke-width="2"/>`;
        svg += `<text x="${pad}" y="${ly + 20}" fill="var(--trace)" font-size="11"
                  font-family="var(--mono)">single link — slots interleaved, frame by frame</text>`;
        legend = Array.from({ length: lanes }, function (_, c) {
          return `<i><span class="sw" style="background:${CH_COLORS[c]}"></span>Channel ${c + 1}
            → slot ${c + 1}</i>`;
        }).join("");
      } else {
        // FDM / WDM: stacked bands, each owning a frequency/wavelength range
        var bandH = Math.floor((H - 90) / lanes);
        var top2 = 40, x0b = pad + 30, x1b = W - pad;
        var guard = 5;
        for (var c2 = 0; c2 < lanes; c2++) {
          var y2 = top2 + c2 * bandH;
          var active2 = (Math.floor(step / 3) % lanes) === c2 && step > 0;
          var bh = bandH - guard;
          svg += `<rect x="${x0b}" y="${y2}" width="${x1b - x0b}" height="${bh}"
            fill="${CH_COLORS[c2]}" opacity="${active2 ? .95 : .55}"/>`;
          var lbl = kind === "wdm"
            ? "λ" + (c2 + 1) + "  " + [1550, 1310, 980, 850, 780][c2] + " nm"
            : "Ch" + (c2 + 1) + "  " + [300, 400, 500, 600, 700][c2] + " Hz-band";
          svg += `<text x="${x0b + 10}" y="${y2 + bh / 2 + 4}" fill="#0a1410"
            font-size="12" font-family="var(--mono)">${lbl}</text>`;
          svg += `<text x="${pad - 8}" y="${y2 + bh / 2 + 4}" fill="var(--ink-faint)"
            font-size="10" font-family="var(--mono)" text-anchor="end">${kind === "wdm" ? "λ" : "f"}</text>`;
        }
        svg += `<text x="${x0b}" y="${top2 - 12}" fill="var(--trace)" font-size="11"
          font-family="var(--mono)">all channels share the medium simultaneously —
          separated by ${kind === "wdm" ? "wavelength" : "frequency"}${kind === "wdm" ? "" : ", with guard bands"}</text>`;
        legend = `<i><span class="sw" style="background:${CH_COLORS[0]}"></span>each band = one channel</i>
          <i>guard band keeps neighbours from overlapping</i>`;
      }

      waveEl.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img"
        aria-label="${KINDS[kind].label} diagram">${svg}</svg>`;
      legendEl.innerHTML = legend;

      var totalBw = n * 100 + (n - 1) * 5;
      outEl.innerHTML = [
        ["Technique", KINDS[kind].label],
        ["Channels", String(n)],
        kind === "tdm" ? ["Slots per frame", String(n)] : ["Guard bands", String(n - 1)],
        kind === "tdm"
          ? ["Frame rate", "one frame = " + n + " slots, repeating"]
          : ["Aggregate bandwidth", totalBw + " Hz (100 Hz/ch + 5 Hz guard)"]
      ].map(function (r) {
        return `<div><dt>${w.RENDER.esc(r[0])}</dt><dd>${w.RENDER.esc(r[1])}</dd></div>`;
      }).join("");
    }

    if (!root.dataset.mxTimer) {
      root.dataset.mxTimer = "1";
      // advance the "which channel is live" highlight so the diagram is dynamic
      setInterval(function () {
        if (!root.isConnected) return;
        var v = (+slotEl.value + 1) % (12 * 3);
        slotEl.value = String(v);
        draw();
      }, 900);
    }

    root.addEventListener("input", draw);
    root.addEventListener("change", draw);
    draw();
  }

  w.SIMS.push({
    id: "sim-multiplexing", mod: "m05",
    title: "FDM · WDM · TDM channel viewer",
    desc: "Compare how three multiplexing schemes share one link: separate frequency bands held all the time, separate wavelengths on a fibre, or time slots rotating in a frame. The highlight steps through which channel is transmitting.",
    mount: mount,
    _kinds: KINDS
  });
})(window);
