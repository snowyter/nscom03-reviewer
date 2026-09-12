/* viz-duty.js — the 50/100 percent choice: does the packet fit the window?
 *
 * m10 s12 states the trade in one line -- "operate only during the MWO OFF
 * cycles" -- and it reads like a flat halving. Two things are not visible in
 * that sentence, and both are what the section's own prose is about:
 *
 *   1. The silent gap is not wholly usable. The paper puts transients 2 ms
 *      before or after each AC zero crossing, and a zero crossing sits inside
 *      the gap. Those +/-2 ms zones have to be treated as ON, so they are
 *      carved out of the middle of the gap and split it into two windows.
 *   2. A packet must FIT in what remains. At 363.3 kbps a 128-bit packet is
 *      ~352 us, comfortable in a ~2.6 ms window. Raise the packet size or the
 *      bit rate and the frame stops fitting -- and the transmitter must finish
 *      what it starts, so it cannot simply gate itself mid-frame.
 *
 * Geometry follows the paper: one magnetron ON burst and one silent gap per
 * line period, the ON cycle "less than half of the 0.017 s 60 Hz period", and
 * transients 2 ms either side of the zero crossings.
 *
 * Student-driven: set the line frequency, the ON share, the packet size and the
 * bit rate, and watch a frame either fit or overrun. The overrun case is the
 * one worth seeing, because it is exactly what the paper's 128-bit packets
 * avoid.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    // Defaults are the paper's own testbed: 60 Hz line, 128-bit packets at
    // 363.3 kbps, magnetron ON for under half the line period.
    var state = {
      hz: 60,            // line frequency, Hz
      onPct: 45,         // magnetron ON fraction of the line period, percent
      bits: 128,         // packet size, bits
      kbps: 363.3,       // bit rate, kbps
      guardMs: 2         // transient zone either side of a zero crossing
    };

    root.innerHTML = `
      <canvas data-dt-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-dt-out aria-live="polite"></div>
      <div class="viz__ctl">
        <label for="dt-hz">Line frequency <span data-dt-hzv>60</span> Hz</label>
        <input id="dt-hz" type="range" data-dt-hz min="50" max="60" step="10" value="60">
        <label for="dt-on">Magnetron ON share <span data-dt-onv>45</span>% of the line period</label>
        <input id="dt-on" type="range" data-dt-on min="20" max="49" step="1" value="45">
        <label for="dt-bits">Packet size <span data-dt-bitsv>128</span> bits</label>
        <input id="dt-bits" type="range" data-dt-bits min="128" max="4096" step="128" value="128">
        <label for="dt-kbps">Bit rate <span data-dt-kbpsv>363</span> kbps</label>
        <input id="dt-kbps" type="range" data-dt-kbps min="100" max="2000" step="50" value="363.3">
      </div>
      <p class="viz__note">
        The oven's ON burst and the Wi-Fi's OFF gap are locked to the mains
        cycle, and the zero crossing falls <b>inside</b> the gap. The ±2 ms
        transient zones around that crossing are unusable, so they split the gap
        into two windows. A packet has to fit in <b>one</b> of them.
      </p>`;

    var cv = root.querySelector("[data-dt-cv]");
    var out = root.querySelector("[data-dt-out]");

    // One line period, in milliseconds. The gap is split by the guard zone
    // around the zero crossing that sits inside it, giving two usable windows.
    function geometry() {
      var T = 1000 / state.hz;                       // line period, ms
      var onT = T * (state.onPct / 100);             // burst length, ms
      var offT = T - onT;                            // silent gap, ms
      var guardT = state.guardMs * 2;                // +/-guardMs zone, ms
      var usableTotal = offT - guardT;               // both windows together
      var windowT = usableTotal / 2;                 // ONE window, ms
      var airtime = state.bits / state.kbps;         // bits / (kbit/ms) = ms
      return { T: T, onT: onT, offT: offT, guardT: guardT,
               usableTotal: usableTotal, windowT: windowT,
               airtime: airtime, gapPct: (offT / T) * 100 };
    }

    function draw() {
      var g = geometry();
      var W = H.measure(cv);
      var Hh = 320;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      var padL = 92, padR = 18;
      var span = W - padL - padR;
      var cycles = 2;                      // two line periods across the plot
      var cycleW = span / cycles;
      var top = 42;
      var bandH = 26;
      var fits = g.windowT > 0 && g.airtime <= g.windowT;

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";

      function laneLabel(text, y) {
        ctx.fillStyle = p.faint;
        ctx.textAlign = "right";
        ctx.fillText(text, padL - 10, y);
        ctx.textAlign = "left";
      }

      // --- lane 1: the mains voltage ---------------------------------------
      var y1 = top + bandH / 2;
      laneLabel("mains " + state.hz + " Hz", y1);
      ctx.strokeStyle = p.ruleSoft; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y1); ctx.lineTo(W - padR, y1); ctx.stroke();
      ctx.strokeStyle = p.inkDim; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var x = 0; x <= span; x++) {
        var ph = x / cycleW * 2 * Math.PI;
        var y = y1 - 10 * Math.sin(ph);
        if (x === 0) ctx.moveTo(padL + x, y); else ctx.lineTo(padL + x, y);
      }
      ctx.stroke();

      // The zero crossings sit at the cycle boundaries, and each is the centre
      // of a guard zone that falls inside the silent gap.
      for (var c = 0; c <= cycles; c++) {
        var zx = padL + c * cycleW;
        ctx.strokeStyle = p.rule; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(zx, y1 - 14); ctx.lineTo(zx, top + 252); ctx.stroke();
        ctx.setLineDash([]);
      }

      // --- lane 2: the magnetron ON burst ----------------------------------
      var y2 = top + 68;
      laneLabel("oven ON", y2);
      ctx.fillStyle = "rgba(255,209,102,.14)";
      ctx.fillRect(padL, y2 - bandH / 2, span, bandH);
      var onW = cycleW * (state.onPct / 100);
      // The burst is placed between the crossings -- i.e. filling the middle of
      // the cycle -- so each crossing has silent gap on both sides of it.
      for (var k = 0; k < cycles; k++) {
        var bx = padL + k * cycleW + (cycleW - onW) / 2;
        ctx.fillStyle = "rgba(255,209,102,.62)";
        ctx.fillRect(bx, y2 - bandH / 2 + 3, onW, bandH - 6);
      }

      // --- lane 3: the gap, split by the guard zone ------------------------
      var y3 = top + 128;
      laneLabel("silent gap", y3);
      var gapW = cycleW - onW;                       // gap length, px
      var guardW = cycleW * (g.guardT / g.T);        // guard zone, px
      var halfGap = gapW / 2;                        // one window, px
      for (var k2 = 0; k2 <= cycles; k2++) {
        // The gap around crossing k2 runs half a gap either side of it.
        var cx1 = padL + k2 * cycleW;
        var g0 = cx1 - halfGap;
        var g1 = cx1 + halfGap;
        // Clip to the drawing area.
        var a0 = Math.max(padL, g0), a1 = Math.min(W - padR, g1);
        if (a1 <= a0) continue;
        ctx.fillStyle = "rgba(125,255,178,.10)";
        ctx.fillRect(a0, y3 - bandH / 2, a1 - a0, bandH);
        // The guard zone is centred on the crossing.
        var z0 = Math.max(a0, cx1 - guardW / 2);
        var z1 = Math.min(a1, cx1 + guardW / 2);
        ctx.fillStyle = "rgba(255,123,107,.34)";
        ctx.fillRect(z0, y3 - bandH / 2 + 3, Math.max(0, z1 - z0), bandH - 6);
        // The two usable windows either side of it.
        ctx.fillStyle = "rgba(125,255,178,.34)";
        if (z0 > a0) ctx.fillRect(a0, y3 - bandH / 2 + 3, z0 - a0, bandH - 6);
        if (a1 > z1) ctx.fillRect(z1, y3 - bandH / 2 + 3, a1 - z1, bandH - 6);
      }
      // The guard annotation sits UNDER the lane, in the gap between lanes, not
      // inside the band where it would collide with the filled regions.
      ctx.fillStyle = p.warn;
      ctx.textAlign = "center";
      ctx.fillText("±" + state.guardMs + " ms guard", padL + cycleW, y3 + bandH / 2 + 14);
      ctx.fillStyle = p.faint;
      ctx.fillText("usable window", padL + cycleW - halfGap / 2, y3 - bandH / 2 - 9);
      ctx.textAlign = "left";

      // --- lane 4: one packet, placed in the first full window -------------
      var y4 = top + 200;
      laneLabel("one packet", y4);
      ctx.fillStyle = "rgba(125,255,178,.10)";
      ctx.fillRect(padL, y4 - 9, span, 18);
      // The first complete window is the one just before crossing 1.
      var wEnd = padL + cycleW - guardW / 2;
      var wStart = wEnd - halfGap;
      var airPx = (g.windowT > 0) ? halfGap * (g.airtime / g.windowT) : halfGap * 2;
      var drawW = Math.max(2, Math.min(airPx, halfGap));
      ctx.fillStyle = fits ? "rgba(125,255,178,.55)" : "rgba(255,123,107,.55)";
      ctx.fillRect(wStart, y4 - 9, drawW, 18);
      ctx.strokeStyle = fits ? p.trace : p.warn; ctx.lineWidth = 1;
      ctx.strokeRect(wStart + .5, y4 - 9.5, drawW, 19);
      if (!fits) {
        ctx.fillStyle = p.warn;
        ctx.textAlign = "center";
        ctx.fillText("overruns the window", wStart + halfGap / 2, y4 - 19);
        ctx.textAlign = "left";
      }

      // --- the numbers and the verdict --------------------------------------
      // The numbers used to be painted into the canvas gutter alongside the
      // lane labels, and the two collided: "mains 60 Hz" overlapped "line
      // period" and its value, "silent gap" overlapped its own reading -- five
      // overlaps, because the gutter was trying to hold two columns of text.
      // The lane labels own the gutter; the numbers are built here as a stats
      // row and included in the verdict markup, because assigning out.innerHTML
      // below replaces whatever was in the element.
      var statRows = [
        ["line period", g.T.toFixed(1) + " ms", p.inkDim],
        ["silent gap", g.offT.toFixed(2) + " ms", p.inkDim],
        ["one window", g.windowT > 0 ? g.windowT.toFixed(2) + " ms" : "none",
         g.windowT > 0 ? p.trace : p.warn],
        ["packet", g.airtime.toFixed(3) + " ms", fits ? p.trace : p.warn],
        ["gap share", g.gapPct.toFixed(0) + "%", p.amber]
      ];
      var stats = `<p class="viz__stats">` + statRows.map(function (r) {
        return `<span>${r[0]} <i style="color:${r[2]}">${r[1]}</i></span>`;
      }).join("") + `</p>`;

      out.classList.remove("is-bad", "is-good");
      if (g.windowT <= 0) {
        out.classList.add("is-bad");
        out.innerHTML = `<b style="color:${p.warn}">✕ No window left</b>` +
          `<span>The ±${state.guardMs} ms guard zone (${g.guardT} ms wide) has consumed the whole ` +
          `${g.offT.toFixed(2)} ms gap at ${state.hz} Hz. Nothing can be sent in this cycle.</span>` +
          stats;
      } else if (fits) {
        var head = g.windowT / g.airtime;
        out.classList.add("is-good");
        out.innerHTML = `<b style="color:${p.trace}">✓ Fits</b>` +
          `<span>A ${state.bits}-bit packet at ${state.kbps.toFixed(0)} kbps occupies ` +
          `<b>${g.airtime.toFixed(3)} ms</b> in a <b>${g.windowT.toFixed(2)} ms</b> window — ` +
          `${head >= 10 ? head.toFixed(0) : head.toFixed(1)}× headroom. ` +
          `The magnetron is on for ${state.onPct}% of each ${g.T.toFixed(1)} ms cycle, so ` +
          `<b>${g.gapPct.toFixed(0)}%</b> is silent; the paper's controller takes the conservative ` +
          `50% path and its measured rate halves to 181.7 kbps.</span>` +
          stats;
      } else {
        out.classList.add("is-bad");
        out.innerHTML = `<b style="color:${p.warn}">✕ Does not fit</b>` +
          `<span>A ${state.bits}-bit packet at ${state.kbps.toFixed(0)} kbps needs ` +
          `<b>${g.airtime.toFixed(3)} ms</b> but a window is only <b>${g.windowT.toFixed(2)} ms</b>. ` +
          `The transmitter must finish the frame it started, so it has to fragment, defer to the next ` +
          `window, or shorten the frame — the paper's 128-bit packets exist precisely to avoid this.</span>` +
          stats;
      }
      ctx.textAlign = "left";
    }

    function bind(sel, key, fmt, outSel) {
      root.querySelector(sel).addEventListener("input", function () {
        state[key] = Number(this.value);
        root.querySelector(outSel).textContent = fmt(state[key]);
        draw();
      });
    }
    bind("[data-dt-hz]", "hz", function (v) { return String(v); }, "[data-dt-hzv]");
    bind("[data-dt-on]", "onPct", function (v) { return String(v); }, "[data-dt-onv]");
    bind("[data-dt-bits]", "bits", function (v) { return String(v); }, "[data-dt-bitsv]");
    bind("[data-dt-kbps]", "kbps", function (v) { return v.toFixed(0); }, "[data-dt-kbpsv]");

    w.addEventListener("resize", draw);
    draw();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("line-duty", {
    title: "The 50/100% choice: does the packet fit the window?",
    note: "The zero crossing falls inside the silent gap, and its ±2 ms transient guard splits that gap into two windows. Set the line frequency, packet size and bit rate and watch a frame either fit or overrun.",
    mount: mount
  });
})(window);
