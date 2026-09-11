/* viz-hamming.js — Hamming distance, and what a code can and cannot detect.
 *
 * "Hamming distance is the number of bit positions in which two words differ" is
 * a definition students can recite and cannot use. What the definition is FOR is
 * deciding how many errors a code can catch or correct, and the arithmetic that
 * links the two is exactly the part that is not visible in prose.
 *
 * Student-driven: pick a code set and flip bits in the received word. The
 * distance from every valid codeword is measured live, and the readout says
 * whether the flip is detected, silently accepted, or unambiguous.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    // Each code set is a list of valid codewords of the same length.
    var CODES = [
      { id: "p2", label: "Even parity, 2 data bits",
        words: ["000", "101", "011", "110"],
        note: "Each codeword has an even number of 1s. Any single-bit flip makes the count odd, so one error is always detected. Two flips restore an even count, so they are invisible." },
      { id: "p3", label: "Even parity, 3 data bits",
        words: ["0000", "1011", "1101", "0111", "1110", "1100", "1010", "0011"],
        note: "Four bits with an even number of 1s. The minimum distance is 2, which is what gives single-error detection and no correction." },
      { id: "rep3", label: "Repetition code (3x)",
        words: ["000", "111"],
        note: "Only two codewords, three bits apart. A minimum distance of 3 allows one error to be CORRECTED: the received word is still nearest its original." }
    ];

    var code = 0;
    var recv = "";        // the received word, as a string

    root.innerHTML = `
      <div class="viz__tabs" role="tablist" aria-label="Code sets"></div>
      <canvas data-hm-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-hm-out aria-live="polite"></div>
      <div class="viz__steps" data-hm-bits></div>
      <p class="viz__note">
        Every bit you flip moves the received word away from the codeword that was
        sent. The distances to <b>all</b> valid codewords are measured below — the
        smallest one decides what the receiver concludes.
      </p>`;

    var tabsEl = root.querySelector(".viz__tabs");
    var cv = root.querySelector("[data-hm-cv]");
    var out = root.querySelector("[data-hm-out]");
    var bitsEl = root.querySelector("[data-hm-bits]");

    function dist(a, b) {
      var d = 0;
      for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
      return d;
    }

    function minDistance() {
      var W = CODES[code].words, m = Infinity;
      for (var i = 0; i < W.length; i++)
        for (var j = i + 1; j < W.length; j++) {
          var d = dist(W[i], W[j]);
          if (d < m) m = d;
        }
      return m;
    }

    function reset() { recv = CODES[code].words[0]; }

    function renderTabs() {
      tabsEl.innerHTML = CODES.map(function (c, k) {
        return `<button type="button" role="tab" class="viz__tab${k === code ? " is-on" : ""}"
                  aria-selected="${k === code}" data-hm="${k}">${c.label}</button>`;
      }).join("");
      tabsEl.querySelectorAll("[data-hm]").forEach(function (b) {
        b.addEventListener("click", function () {
          code = Number(b.getAttribute("data-hm"));
          reset(); renderTabs(); draw();
        });
      });
    }

    function renderBits() {
      bitsEl.innerHTML = recv.split("").map(function (c, i) {
        return `<button type="button" data-hm-bit="${i}" title="Flip bit ${i}">${c}</button>`;
      }).join("") + ` <button type="button" data-hm-reset>Reset</button>`;
      bitsEl.querySelectorAll("[data-hm-bit]").forEach(function (b) {
        b.addEventListener("click", function () {
          var i = Number(b.getAttribute("data-hm-bit"));
          recv = recv.slice(0, i) + (recv[i] === "0" ? "1" : "0") + recv.slice(i + 1);
          draw();
        });
      });
      bitsEl.querySelector("[data-hm-reset]").addEventListener("click", function () { reset(); draw(); });
    }

    function draw() {
      var C = CODES[code];
      var dmin = minDistance();
      var W = H.measure(cv);
      var Hh = 60 + C.words.length * 30 + 44;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      ctx.font = "12px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      ctx.font = "10px ui-monospace, monospace";
      ctx.fillStyle = p.faint;
      ctx.fillText("codeword", 14, 22);
      ctx.fillText("distance from received word", 150, 22);

      // Every valid codeword, with its live distance to the received word.
      var best = Infinity, bestIdx = -1;
      C.words.forEach(function (wd, k) {
        var d = dist(wd, recv);
        if (d < best) { best = d; bestIdx = k; }
      });

      var y = 48;
      C.words.forEach(function (wd, k) {
        var d = dist(wd, recv);
        var isBest = (k === bestIdx);
        ctx.font = "12px ui-monospace, monospace";
        ctx.fillStyle = isBest ? p.trace : p.inkDim;
        ctx.fillText(wd, 14, y);
        // Mark the bits that differ, so the distance is visible rather than
        // asserted.
        var cellW = 8.2;
        for (var i = 0; i < recv.length; i++) {
          if (recv[i] !== wd[i]) {
            ctx.fillStyle = "rgba(255,123,107,.30)";
            ctx.fillRect(12 + i * cellW, y - 8, cellW, 16);
          }
        }
        // A bar whose length is the distance, on a scale of the word length.
        var maxD = recv.length;
        var barW = 190;
        ctx.fillStyle = "rgba(255,255,255,.04)";
        ctx.fillRect(130, y - 7, barW, 14);
        ctx.fillStyle = isBest ? p.trace : p.inkDim;
        ctx.globalAlpha = .45;
        ctx.fillRect(130, y - 7, barW * d / maxD, 14);
        ctx.globalAlpha = 1;
        ctx.fillStyle = isBest ? p.trace : p.inkDim;
        ctx.fillText("d = " + d, 330, y);
        if (isBest) {
          ctx.fillStyle = p.faint;
          ctx.fillText("← nearest", 380, y);
        }
        y += 30;
      });

      // What the receiver concludes.
      var isCodeword = C.words.indexOf(recv) >= 0;
      var flipped = dist(C.words[0], recv);   // just for display
      out.classList.remove("is-bad", "is-good");
      var detect = dmin - 1;                  // errors detected
      var correct = Math.floor((dmin - 1) / 2); // errors corrected
      if (isCodeword && recv === C.words[0]) {
        out.classList.add("is-good");
        out.innerHTML = `<b>No error — received word is a valid codeword</b>` +
          `<span>Distance 0 from the codeword that was sent. Flip a bit to introduce an error.</span>` +
          `<span class="viz__why"><i>Minimum distance of this code:</i> ${dmin}. ` +
          `<i>So it can detect</i> up to ${detect} error${detect === 1 ? "" : "s"} ` +
          `and <i>correct</i> up to ${correct}.</span>`;
      } else if (isCodeword) {
        out.classList.add("is-bad");
        out.innerHTML = `<b>✕ Undetected error — the received word looks valid</b>` +
          `<span>The flips landed on another legitimate codeword, so the distance to a valid word is 0 and the receiver accepts it as correct. This is exactly why an even-parity code cannot catch two errors: two flips restore the parity.</span>` +
          `<span class="viz__why"><i>Minimum distance ${dmin} means</i> only ${detect} error${detect === 1 ? "" : "s"} can be detected — no more.</span>`;
      } else if (correct >= 1) {
        out.classList.add("is-good");
        out.innerHTML = `<b>✓ Error detected and correctable</b>` +
          `<span>The nearest codeword is ${best} bit${best === 1 ? "" : "s"} away — uniquely closest, so the receiver corrects to it. Minimum distance ${dmin} is what guarantees only one codeword can be that close.</span>` +
          `<span class="viz__why"><i>Detects</i> ${detect} error${detect === 1 ? "" : "s"}, <i>corrects</i> ${correct}. ` +
          `With d_min = ${dmin}: correction needs 2t + 1 ≤ d_min, so t = ${correct}.</span>`;
      } else {
        out.classList.add("is-bad");
        out.innerHTML = `<b>≈ Error detected, not correctable</b>` +
          `<span>The received word is not a codeword, so the receiver knows something went wrong — but the nearest codeword is ${best} bits away and the code's minimum distance is only ${dmin}, which is not enough to pick a unique original. It can only ask for a retransmission.</span>` +
          `<span class="viz__why"><i>To correct ${Math.ceil((best + 1) / 2)} error${Math.ceil((best + 1) / 2) === 1 ? "" : "s"} you would need</i> d_min ≥ ${2 * Math.ceil((best + 1) / 2) + 1}.</span>`;
      }
      ctx.textAlign = "left";
    }

    reset();
    renderTabs();
    renderBits();
    draw();

    // The bit row must be re-rendered whenever the received word changes, so
    // wrap draw to keep the two in step.
    var origDraw = draw;
    draw = function () { renderBits(); origDraw(); };
    renderBits();

    w.addEventListener("resize", draw);
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("hamming-distance", {
    title: "Hamming distance and what a code can catch",
    note: "Flip bits and watch the distance to every valid codeword. The minimum distance sets how many errors a code can detect and correct.",
    mount: mount
  });
})(window);
