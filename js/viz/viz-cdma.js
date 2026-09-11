/* viz-cdma.js — orthogonality made arithmetic.
 *
 * "Orthogonal sequences" is a phrase students repeat without ever seeing the
 * property that earns the name. CDMA rests on one fact: if you take the chip
 * sequences of two stations and multiply them element by element, the sum is
 * exactly zero. That is the whole reason two stations can transmit at once and
 * still be told apart at the receiver.
 *
 * So this viz shows the multiplication and the running sum, live, as the student
 * picks pairs of codes. Picking two different Walsh rows gives 0; picking a row
 * against itself gives 4 (the sequence length). Seeing the number refuse to move
 * off zero is the lesson.
 */

(function (w) {
  "use strict";

  // Walsh codes of length 4 -- the standard first example in any CDMA treatment.
  var CODES = {
    "W1": [+1, +1, +1, +1],
    "W2": [+1, -1, +1, -1],
    "W3": [+1, +1, -1, -1],
    "W4": [+1, -1, -1, +1]
  };
  var NAMES = Object.keys(CODES);

  function seqHTML(seq, colour) {
    return seq.map(function (v) {
      return `<span style="color:${v > 0 ? colour : "var(--ink-faint)"}">${v > 0 ? "+1" : "−1"}</span>`;
    }).join(" ");
  }

  function mount(root) {
    var H = w.VIZ;

    root.innerHTML = `
      <div class="ctlrow">
        <label for="cd-a">Station A sends</label>
        <span class="seg" data-cd-a>
          ${NAMES.map(function (n, i) {
            return `<button type="button" class="${i === 0 ? "is-on" : ""}" data-code="${n}" data-which="a">${n}</button>`;
          }).join("")}
        </span>
      </div>
      <div class="ctlrow">
        <label for="cd-b">Station B sends</label>
        <span class="seg" data-cd-b>
          ${NAMES.map(function (n, i) {
            return `<button type="button" class="${i === 1 ? "is-on" : ""}" data-code="${n}" data-which="b">${n}</button>`;
          }).join("")}
        </span>
      </div>
      <div class="viz__verdict" data-cd-out aria-live="polite"></div>
      <div data-cd-work></div>
      <p class="viz__note">
        Walsh codes of length 4. Two stations can share the channel only if the
        chip-by-chip product of their codes sums to <b>exactly zero</b> — that is
        what "orthogonal" means, and it is arithmetic you can check by hand.
      </div>`;

    // Resolve both "#foo" and "[data-foo]" so markup may carry either
    // convention; the sims use the same dual lookup.
    var $ = function (s) {
      if (!s) return null;
      var el = root.querySelector(s);
      if (el) return el;
      if (s.charAt(0) === "#") return root.querySelector("[data-" + s.slice(1) + "]");
      return null;
    };
    var out = $("[data-cd-out]"), work = $("[data-cd-work]");
    var chose = { a: "W1", b: "W2" };

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-code]");
      if (!btn) return;
      var which = btn.getAttribute("data-which");
      chose[which] = btn.getAttribute("data-code");
      var grp = root.querySelector(`[data-cd-${which}]`);
      Array.prototype.forEach.call(grp.querySelectorAll("button"), function (x) {
        x.classList.toggle("is-on", x === btn);
      });
      draw();
    });

    function draw() {
      var p = H.palette(root);
      var A = CODES[chose.a], B = CODES[chose.b];
      var prod = A.map(function (v, i) { return v * B[i]; });
      var sum = prod.reduce(function (x, y) { return x + y; }, 0);
      var same = chose.a === chose.b;
      var orth = sum === 0;

      // The running total is what convinces: show every partial sum, because the
      // cancellation is the thing being taught.
      var running = [], acc = 0;
      prod.forEach(function (v) { acc += v; running.push(acc); });

      work.innerHTML = `
        <div class="viz__work">
          <div class="wrow"><span class="wk">${chose.a}</span>
            <span class="wv">${seqHTML(A, "var(--trace)")}</span></div>
          <div class="wrow"><span class="wk">${chose.b}</span>
            <span class="wv">${seqHTML(B, "var(--amber)")}</span></div>
          <div class="wrow wrow--rule"><span class="wk">product</span>
            <span class="wv">${prod.map(function (v) {
              return `<span style="color:${v > 0 ? "var(--trace)" : "var(--warn)"}">${v > 0 ? "+1" : "−1"}</span>`;
            }).join(" ")}</span></div>
          <div class="wrow"><span class="wk">running sum</span>
            <span class="wv">${running.map(function (v) { return v; }).join("  →  ")}</span></div>
        </div>`;

      // The bar shows the accumulation; a dot that never leaves zero is the
      // visual proof of orthogonality.
      var bar = prod.map(function (v) {
        return v > 0
          ? `<span class="cbar cbar--up"></span>`
          : `<span class="cbar cbar--dn"></span>`;
      }).join("");

      out.classList.toggle("is-bad", !orth);
      out.classList.toggle("is-good", orth);
      out.innerHTML = `
        <b style="color:${orth ? p.trace : p.warn}">${same ? "△ Same code" : orth ? "✓ Orthogonal" : "✕ Not orthogonal"}</b>
        <span class="viz__stats">
          <span>Σ = <i class="sum" style="color:${orth ? p.trace : p.warn}">${sum}</i></span>
          <span class="cdsum__bars">${bar}</span>
        </span>
        <span>${
          same
            ? `The same code against itself: the sum is 4, not 0. This is how a receiver recovers its own station's signal.`
            : orth
              ? `The products cancel exactly, so A and B can transmit at the same time and the receiver still tells them apart.`
              : `The products do not cancel, so these two codes interfere with each other.`
        }</span>`;

      if (!root.querySelector("#cdma-style")) {
        var st = w.document.createElement("style");
        st.id = "cdma-style";
        st.textContent = `
          .viz__work { margin-top:.8rem; border:1px solid var(--rule); padding:.6rem .7rem; }
          .wrow { display:flex; gap:.7rem; align-items:baseline; padding:.22rem 0;
                  font:400 .72rem/1.5 var(--mono); }
          .wrow--rule { border-top:1px solid var(--rule); margin-top:.3rem; padding-top:.42rem; }
          .wk { flex:0 0 7.5rem; color:var(--ink-faint); }
          .wv { flex:1 1 auto; letter-spacing:.14em; color:var(--ink); }
          .cdsum__bars { display:inline-flex; gap:2px; vertical-align:middle; }
          .cbar { width:9px; display:inline-block; }
          .cbar--up { height:16px; background:var(--trace); }
          .cbar--dn { height:16px; background:var(--warn); margin-top:16px; }`;
        w.document.head.appendChild(st);
      }
    }

    draw();
  }

  w.VIZ.register("cdma-orthogonality", {
    title: "Why orthogonal codes work",
    note: "Pick two Walsh codes and watch the product's sum. Different codes cancel to zero — that is what lets two stations transmit at once.",
    mount: mount
  });
})(window);
