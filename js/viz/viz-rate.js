/* viz-rate.js — Nyquist against Shannon, on the same channel.
 *
 * The two formulas are memorised as "Nyquist for noiseless, Shannon for noisy"
 * and then applied to the wrong situation, because the relationship between them
 * is never shown. Nyquist says how fast you CAN signal given the bandwidth and
 * how many levels you use; Shannon says how much information the NOISE lets
 * through, regardless of how cleverly you signal.
 *
 * Student-driven: drag bandwidth, levels and SNR and watch both ceilings move.
 * The lesson is the gap: past a certain SNR, adding levels stops helping,
 * because Shannon's limit is the one you hit.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;
    var B = 3000;      // bandwidth, Hz
    var L = 4;         // signal levels
    var snr = 30;      // dB

    root.innerHTML = `
      <canvas data-rt-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-rt-out aria-live="polite"></div>
      <div class="viz__ctl"><label for="rt-b">Bandwidth <span data-rt-bv>3000</span> Hz</label>
        <input id="rt-b" type="range" data-rt-b min="1000" max="10000" step="500" value="3000"></div>
      <div class="viz__ctl"><label for="rt-l">Signal levels <span data-rt-lv>4</span></label>
        <input id="rt-l" type="range" data-rt-l min="2" max="32" step="2" value="4"></div>
      <div class="viz__ctl"><label for="rt-s">SNR <span data-rt-sv>30</span> dB</label>
        <input id="rt-s" type="range" data-rt-s min="0" max="60" step="1" value="30"></div>
      <p class="viz__note">
        <b>Nyquist</b> depends on bandwidth and levels; <b>Shannon</b> depends on
        bandwidth and noise and ignores levels entirely. Add levels and the
        Nyquist ceiling keeps rising — but the Shannon ceiling does not move,
        because it never depended on them.
      </p>`;

    var cv = root.querySelector("[data-rt-cv]");
    var out = root.querySelector("[data-rt-out]");

    // The two formulas, in the forms the slides use.
    function nyquist(Bw, Lv) { return 2 * Bw * Math.log2(Lv); }
    function shannon(Bw, dB) { return Bw * Math.log2(1 + Math.pow(10, dB / 10)); }

    function draw() {
      var W = H.measure(cv);
      var Hh = 230;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      var nq = nyquist(B, L);
      var sh = shannon(B, snr);
      var limit = Math.min(nq, sh);

      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";

      // Two horizontal bars: the two ceilings, on a shared scale whose maximum
      // is the larger of the two. The scale is labelled so the comparison is
      // quantitative, not just "this bar is longer".
      var padL = 118, padR = 70;
      var span = W - padL - padR;
      var scaleMax = Math.max(nq, sh, 1);

      function bar(y, value, colour, label, sub) {
        var w = Math.max(2, value / scaleMax * span);
        ctx.fillStyle = "rgba(255,255,255,.03)";
        ctx.fillRect(padL, y - 13, span, 26);
        ctx.fillStyle = colour;
        ctx.globalAlpha = .30;
        ctx.fillRect(padL, y - 13, w, 26);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colour; ctx.lineWidth = 1;
        ctx.strokeRect(padL + .5, y - 12.5, w, 25);
        ctx.fillStyle = p.faint;
        ctx.textAlign = "right";
        ctx.fillText(label, padL - 10, y - 5);
        ctx.fillStyle = p.inkDim;
        ctx.fillText(sub, padL - 10, y + 8);
        ctx.textAlign = "left";
        ctx.fillStyle = colour;
        ctx.fillText(Math.round(value).toLocaleString() + " bps", padL + w + 8, y);
      }

      ctx.textAlign = "right";
      bar(66, nq, p.trace, "Nyquist", "noiseless");
      bar(126, sh, p.amber, "Shannon", "noisy");

      // The binding constraint, named under the bars.
      ctx.textAlign = "left";
      ctx.fillStyle = p.faint;
      ctx.fillText("achievable rate is the LOWER of the two", padL, 174);
      ctx.fillStyle = (nq < sh) ? p.trace : p.amber;
      ctx.fillText(((nq < sh) ? "Nyquist" : "Shannon") + " is binding", padL, 194);

      // The verdict explains WHY, which is the examined part.
      out.classList.remove("is-bad", "is-good");
      out.classList.add("is-good");
      var bitsPerLevel = Math.log2(L);
      out.innerHTML =
        `<b>Nyquist ${Math.round(nq).toLocaleString()} bps · Shannon ${Math.round(sh).toLocaleString()} bps</b>` +
        `<span>Nyquist: 2 × ${B} × log₂(${L}) = 2 × ${B} × ${bitsPerLevel.toFixed(2)}. ` +
        `Shannon: ${B} × log₂(1 + SNR) with SNR = ${snr} dB as a ratio of ${Math.pow(10, snr / 10).toFixed(0)}. ` +
        `The channel really carries <b>${Math.round(limit).toLocaleString()} bps</b>.</span>` +
        `<span class="viz__why"><i>Why levels do not beat noise:</i> ${nq > sh
          ? `${L} levels would give ${Math.round(nq).toLocaleString()} bps in silence, but at ${snr} dB the noise collapses that to ${Math.round(sh).toLocaleString()}. Adding more levels raises Nyquist and changes nothing real.`
          : `the noise is low enough that ${L} levels are the binding constraint, not the noise — so raising the level count is what buys you rate here.`}</span>`;
    }

    ["b", "l", "s"].forEach(function (k) {
      var el = root.querySelector("[data-rt-" + k + "]");
      el.addEventListener("input", function () {
        var v = Number(el.value);
        if (k === "b") { B = v; root.querySelector("[data-rt-bv]").textContent = String(v); }
        if (k === "l") { L = v; root.querySelector("[data-rt-lv]").textContent = String(v); }
        if (k === "s") { snr = v; root.querySelector("[data-rt-sv]").textContent = String(v); }
        draw();
      });
    });
    w.addEventListener("resize", draw);

    draw();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("rate-limits", {
    title: "Nyquist versus Shannon",
    note: "Nyquist depends on bandwidth and levels, Shannon on bandwidth and noise. The channel carries the lower of the two.",
    mount: mount
  });
})(window);
