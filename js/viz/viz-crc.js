/* viz-crc.js — modulo-2 division, worked step by step.
 *
 * CRC is taught as "divide the data by the generator using XOR" and then every
 * worked example in the slides is a column of numbers with no indication of WHERE
 * the XOR is being applied or WHY the remainder is the checksum. Students copy
 * the pattern and cannot do a new one.
 *
 * This walks the division one step at a time: which bits are being XORed, what
 * the running remainder is, and when the leading bit is cancelled.
 *
 * Student-driven: press one step at a time. Nothing calculates itself.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    // Values chosen so the division takes several steps and ends non-zero, which
    // is the case the slides actually work.
    var DATA = "110010101";
    var GEN = "10011";        // x^4 + x + 1

    root.innerHTML = `
      <div class="viz__tabs" role="tablist" aria-label="CRC examples"></div>
      <canvas data-cr-cv aria-hidden="true"></canvas>
      <div class="viz__verdict" data-cr-out aria-live="polite"></div>
      <div class="viz__steps">
        <button type="button" data-cr-step>Next step</button>
        <button type="button" data-cr-reset>Reset</button>
        <button type="button" data-cr-all>Finish</button>
      </div>
      <p class="viz__note">
        The data has <b>k</b> zeros appended — the degree of the generator — and
        then the whole string is divided by the generator using <b>XOR</b> instead
        of subtraction. The remainder becomes the CRC.
      </p>`;

    var EX = [
      { id: 0, label: "Data 110010101, gen 10011", data: "110010101", gen: "10011" },
      { id: 1, label: "Data 1101011011, gen 10011", data: "1101011011", gen: "10011" }
    ];
    var tabsEl = root.querySelector(".viz__tabs");
    var cv = root.querySelector("[data-cr-cv]");
    var out = root.querySelector("[data-cr-out]");
    var ex = 0, step = 0, rows = [];

    // Build the division. Each step is a row: the current remainder string, and
    // the row to XOR against it, aligned under the leading 1.
    function build() {
      var d = EX[ex].data, g = EX[ex].gen;
      var work = d + "0".repeat(g.length - 1);       // k zeros appended
      var r = work.split("");
      var out2 = [];
      out2.push({ kind: "dividend", text: work, note: "data + " + (g.length - 1) + " zeros" });
      // Repeat: align the generator under the first 1 and XOR, until no position
      // remains where a full generator fits.
      var pos = 0, guard = 0;
      while (pos <= r.length - g.length && guard++ < 40) {
        var idx = r.slice(pos).findIndex(function (c) { return c === "1"; });
        if (idx < 0) break;
        pos = pos + idx;
        if (pos > r.length - g.length) break;
        var before = r.slice();
        var xorRow = " ".repeat(pos) + g;
        for (var k = 0; k < g.length; k++) {
          r[pos + k] = (r[pos + k] === g[k]) ? "0" : "1";
        }
        out2.push({
          kind: "xor",
          text: before.join(""),
          xor: xorRow,
          after: r.join(""),
          note: "leading 1 at position " + pos + " — XOR the generator under it"
        });
        pos += 1;
      }
      var rem = r.slice(r.length - (g.length - 1)).join("");
      out2.push({ kind: "remainder", text: r.join(""), rem: rem,
                  note: "remainder = CRC" });
      return { rows: out2, work: work, rem: rem, g: g };
    }

    function renderTabs() {
      tabsEl.innerHTML = EX.map(function (e, k) {
        return `<button type="button" role="tab" class="viz__tab${k === ex ? " is-on" : ""}"
                  aria-selected="${k === ex}" data-cr="${k}">${e.label}</button>`;
      }).join("");
      tabsEl.querySelectorAll("[data-cr]").forEach(function (b) {
        b.addEventListener("click", function () {
          ex = Number(b.getAttribute("data-cr")); step = 0;
          renderTabs(); build_(); draw();
        });
      });
    }
    function build_() { rows = build().rows; }

    function draw() {
      var R = build();
      rows = R.rows;
      var W = H.measure(cv);
      // Height is driven by the number of steps actually drawn, and the string
      // row count is known before drawing, so the canvas always fits the content
      // -- the mistake that clipped an earlier chart.
      var shown = rows.slice(0, Math.min(step + 1, rows.length)).filter(function (x) {
        return x.kind !== "remainder" || step >= rows.length - 1;
      });
      var lineH = 22;
      var Hh = 64 + (shown.length + 1) * lineH + 40;
      var ctx = H.fitCanvas(cv, W, Hh, draw);
      var p = H.palette(root);
      ctx.clearRect(0, 0, W, Hh);

      ctx.font = "12px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      ctx.font = "10px ui-monospace, monospace";
      ctx.fillStyle = p.faint;
      ctx.fillText("generator  " + R.g + "   (degree " + (R.g.length - 1) + ")", 12, 18);
      ctx.fillText("monospace columns line up so each XOR is under the bit it cancels", 12, 34);

      var y = 62;
      ctx.font = "12px ui-monospace, monospace";
      shown.forEach(function (row, k) {
        if (row.kind === "dividend") {
          ctx.fillStyle = p.inkDim;
          ctx.fillText(row.text, 12, y);
        } else if (row.kind === "xor") {
          ctx.fillStyle = p.ink;
          ctx.fillText(row.text, 12, y);
          ctx.fillStyle = p.warn;
          ctx.fillText(row.xor, 12, y + lineH * 0.55);
          // The XOR rule line, drawn as the separator students draw by hand.
          ctx.strokeStyle = p.warn; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(8, y + lineH * 0.85); ctx.lineTo(8 + R.work.length * 7.3, y + lineH * 0.85);
          ctx.stroke();
          y += lineH * 1.5;
          ctx.fillStyle = p.trace;
          ctx.fillText(row.after, 12, y);
          y += lineH;
        } else {
          ctx.fillStyle = p.amber;
          ctx.fillText(row.text, 12, y);
          y += lineH;
          ctx.fillStyle = p.faint;
          ctx.fillText("→", 12 + row.text.length * 7.3 + 10, y - lineH);
        }
      });

      // The verdict names the result and what it means.
      out.classList.remove("is-bad", "is-good");
      var done = step >= rows.length - 1;
      if (!done) {
        out.classList.add("is-bad");
        out.innerHTML = `<b>Step ${Math.min(step + 1, rows.length - 1)} of ${rows.length - 1}</b>` +
          `<span>XOR the generator under the leftmost 1 of the current remainder. The leading 1 always cancels to 0 — that is the whole purpose of the step.</span>`;
      } else {
        out.classList.add("is-good");
        out.innerHTML = `<b>Remainder = ${R.rem} (the CRC)</b>` +
          `<span>After the last XOR no position is left where the full generator fits, so the division stops. The ${R.rem.length}-bit remainder is appended to the data and sent. At the receiver the whole received string is divided again — a zero remainder means no error was detected.</span>` +
          `<span class="viz__why"><i>Why XOR rather than subtract:</i> in modulo-2 arithmetic there is no borrow, so subtract and XOR are the same operation, which makes the whole thing trivial to build in hardware as a shift register.</span>`;
      }

      root.querySelector("[data-cr-step]").disabled = done;
    }

    root.querySelector("[data-cr-step]").addEventListener("click", function () {
      if (step < rows.length - 1) { step += 1; draw(); }
    });
    root.querySelector("[data-cr-reset]").addEventListener("click", function () { step = 0; draw(); });
    root.querySelector("[data-cr-all]").addEventListener("click", function () { step = rows.length - 1; draw(); });
    w.addEventListener("resize", draw);

    renderTabs();
    build_();
    draw();
    return function () { w.removeEventListener("resize", draw); };
  }

  w.VIZ.register("crc-division", {
    title: "CRC: modulo-2 division step by step",
    note: "Append k zeros, then XOR the generator under the leftmost 1 until it no longer fits. The remainder is the checksum.",
    mount: mount
  });
})(window);
