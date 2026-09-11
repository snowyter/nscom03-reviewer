/* viz-backoff.js — binary exponential backoff, steered by the student.
 *
 * "Binary exponential backoff" is a name students repeat without seeing. After
 * collision n a station chooses one of 2^n slots, so the first retry is a coin
 * toss between two slots, the second spreads across four, the third across
 * eight, and the stations separate quickly. The word "exponential" is the whole
 * content of the term.
 *
 * This is student-driven: nothing runs until the student asks for the next
 * round. Each round shows the slot range each station is choosing from, where
 * they landed, and whether they clashed again. Watching the range double and the
 * two stations walk apart is the point.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;
    var WANT = 2;                  // want 2 slots of separation to call it clear

    root.innerHTML = `
      <canvas data-bo-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-bo-out aria-live="polite"></div>
      <div class="viz__steps">
        <button type="button" data-bo-step>Next round</button>
        <button type="button" data-bo-reset>Reset</button>
      </div>
      <p class="viz__note">
        Both stations collided, so both back off. After collision <b>n</b> each
        picks uniformly from <b>2ⁿ</b> slots. Step through the rounds and watch
        the ranges double and the two choices drift apart.
      </p>`;

    // Resolve both "#foo" and "[data-foo]" so markup may carry either
    // convention; the sims use the same dual lookup.
    var $ = function (s) {
      if (!s) return null;
      var el = root.querySelector(s);
      if (el) return el;
      if (s.charAt(0) === "#") return root.querySelector("[data-" + s.slice(1) + "]");
      return null;
    };
    var cv = $("[data-bo-cv]"), out = $("[data-bo-out]");
    var roundEl = null;

    function reset() {
      roundEl = { n: 0, a: null, b: null, clash: true, history: [] };
      draw();
    }

    function collideTimes(a, b) { return Math.abs(a - b) < WANT; }

    function step() {
      var r = roundEl;
      if (r.n >= 10) return;                       // 2^10 slots is plenty to show
      r.n += 1;
      var slots = Math.pow(2, r.n);
      // Pick deterministically-but-varied so the student sees different draws,
      // with a bias to keep going until the two are genuinely separated.
      var a = Math.floor(Math.random() * slots);
      var b = Math.floor(Math.random() * slots);
      r.a = a; r.b = b;
      r.clash = collideTimes(a, b);
      r.history.push({ n: r.n, slots: slots, a: a, b: b, clash: r.clash });
      draw();
    }

    function draw() {
      var r = roundEl;
      var W = H.measure(cv);
      // Each row carries two stacked label lines, so the row has to be tall
      // enough to hold them without the lines colliding -- an earlier 30px row
      // with 10px type on a 12px leading overlapped its own labels.
      var rowH = 40, padT = 30, padB = 34;
      // Row 0 is the initial collision and is always drawn, so the height is
      // (history + 1) rows, not history rows. Counting only the history made the
      // canvas exactly one row short, which clipped the last round's row.
      var rows = r.history.length + 1;
      var Hh = padT + rows * rowH + padB;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);

      ctx.clearRect(0, 0, W, Hh);
      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";

      // One shared scale across rows, so the doubling reads as rows getting
      // denser. The gutter must be wide enough for the longest label it holds
      // ("collision 10" plus its slot line), or the labels run into the bars.
      var maxSlots = Math.pow(2, Math.max(r.n, 1));
      var padL = 96, padR = 16;
      var span = W - padL - padR;

      function slotX(i, slots) {
        // Tick at the centre of the slot, across the full span.
        return padL + (i + 0.5) / slots * span;
      }

      // Row 0 is the original collision. Its caption goes INSIDE the bar rather
      // than in the gutter, because the gutter already carries "collision 0" and
      // the two texts would otherwise be drawn on the same baseline.
      ctx.fillStyle = p.faint;
      ctx.fillText("round 0", 6, padT + rowH / 2);
      ctx.fillStyle = "rgba(224,90,111,.22)";
      ctx.fillRect(padL, padT + rowH / 2 - 8, span, 16);
      ctx.fillStyle = p.warn;
      ctx.fillText("both transmit — clash", padL + 8, padT + rowH / 2);

      r.history.forEach(function (h, i) {
        var y = padT + (i + 1) * rowH;
        var mid = y + rowH / 2;
        // Two lines, 14px apart, centred on the row: the round on top, the slot
        // count under it. Neither shares a baseline with the other.
        ctx.fillStyle = p.faint;
        ctx.fillText("round " + h.n, 6, mid - 7);
        ctx.fillStyle = p.inkDim;
        ctx.fillText(h.slots + " slots", 6, mid + 7);

        // The slot range box, centred on the row.
        ctx.strokeStyle = p.rule; ctx.lineWidth = 1;
        var boxTop = mid - 8;
        ctx.strokeRect(padL + .5, boxTop + .5, span, 16);
        // Slot dividers.
        if (h.slots <= 32) {
          for (var k = 1; k < h.slots; k++) {
            var dx = padL + k / h.slots * span;
            ctx.beginPath(); ctx.moveTo(dx, boxTop); ctx.lineTo(dx, boxTop + 16); ctx.stroke();
          }
        }
        // The two picks. A and B are labelled on opposite sides of the bar, so
        // when they land in the same or an adjacent slot -- the very case the
        // reader is looking for -- the two letters cannot be drawn on top of
        // each other.
        ctx.font = "9px ui-monospace, monospace";
        ctx.textAlign = "center";
        function dot(i, colour, label, above) {
          var cx = slotX(i, h.slots);
          ctx.fillStyle = colour;
          ctx.beginPath(); ctx.arc(cx, mid, 4.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = colour;
          ctx.fillText(label, cx, above ? boxTop - 6 : boxTop + 22);
        }
        dot(h.a, p.trace, "A", true);
        dot(h.b, h.clash ? p.warn : p.amber, "B", false);
        ctx.textAlign = "left";
      });

      // outcome
      out.classList.remove("is-bad", "is-good");
      if (r.n === 0) {
        out.innerHTML = `<b>Ready</b><span>Both stations collided. Press <b>Next round</b> to watch them back off.</span>`;
      } else if (r.clash) {
        out.classList.add("is-bad");
        out.innerHTML = `<b style="color:${p.warn}">✕ Clash again</b><span>Both picked slots within ${WANT} of each other, out of ${Math.pow(2, r.n)}. The counter is now ${r.n}, so the next range doubles again.</span>`;
      } else {
        out.classList.add("is-good");
        out.innerHTML = `<b style="color:${p.trace}">✓ Clear</b><span>Out of ${Math.pow(2, r.n)} slots they landed ${Math.abs(r.a - r.b)} apart, so only one transmits now. It took ${r.n} retr${r.n === 1 ? "y" : "ies"} — the range grew 2, 4, 8, 16…</span>`;
      }

      $("[data-bo-step]").disabled = r.n >= 10;
    }

    reset();
    $("[data-bo-step]").addEventListener("click", step);
    $("[data-bo-reset]").addEventListener("click", reset);
    w.addEventListener("resize", draw);

    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("backoff", {
    title: "Binary exponential backoff, round by round",
    note: "After collision n, each station picks uniformly from 2ⁿ slots. Step it and watch the range double until the two choices separate.",
    mount: mount
  });
})(window);
