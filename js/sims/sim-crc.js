/* sim-crc.js — CRC modulo-2 long division, shown step by step.
   The receiver check divides the WHOLE codeword (data + CRC) with no extra
   zero-append, and leading zeros are preserved, because both are fatal errors
   in modulo-2 long division. */

(function (w) {
  "use strict";

  // XOR of two equal-length bit strings, preserving leading zeros.
  function xorBits(a, b) {
    var n = Math.max(a.length, b.length), out = "";
    a = a.padStart(n, "0"); b = b.padStart(n, "0");
    for (var i = 0; i < n; i++) out += (a[i] !== b[i]) ? "1" : "0";
    return out;
  }

  // Long division of dividend by divisor, returning quotient/remainder and a
  // per-step trace. Keeps the dividend's leading zeros in the trace strings.
  function divide(dividend, divisor) {
    var div = divisor.replace(/^0+/, "") || "0";
    var dl = div.length;
    var work = dividend.split("");
    var steps = [];
    var quotient = "";

    for (var i = 0; i + dl <= work.length; i++) {
      if (work[i] === "1") {
        var seg = work.slice(i, i + dl).join("");
        var res = xorBits(seg, div);
        quotient += "1";
        for (var k = 0; k < dl; k++) work[i + k] = res[k];
        steps.push({
          i: i,
          seg: seg,
          div: div,
          res: res,
          after: work.join("")
        });
      } else {
        quotient += "0";
      }
    }
    var rest = work.slice(Math.max(0, work.length - dl + 1)).join("");
    return { quotient: quotient, remainder: rest, steps: steps, work: work.join("") };
  }

  function clean(s, name) {
    var v = (s || "").replace(/[^01]/g, "");
    if (!v) throw new Error(name + " must contain at least one bit (0 or 1)");
    if (v.length > 64) throw new Error(name + " is capped at 64 bits here");
    return v;
  }

  function mount(root) {
    root.innerHTML = `
      <div class="ctlrow ctlrow--split">
        <div class="ctlrow">
          <label for="crc-data">Data (bits)</label>
          <input id="crc-data" type="text" value="1101011011" spellcheck="false">
        </div>
        <div class="ctlrow">
          <label for="crc-gen">Generator</label>
          <input id="crc-gen" type="text" value="10011" spellcheck="false">
        </div>
      </div>
      <div class="ctlrow">
        <button class="btn" type="button" data-crc-send>Compute CRC</button>
        <button class="btn" type="button" data-crc-check>Verify received codeword</button>
        <button class="btn" type="button" data-crc-flip>Flip a bit (corrupt)</button>
      </div>
      <div class="readout" id="crc-out" data-crc-out></div>
      <ol class="steps" id="crc-steps" data-crc-steps></ol>
      <p class="sim__desc" style="padding:.7rem 0 0">
        The generator must have a degree of at least 1; its bit length is
        degree + 1. The sender appends degree-many zeros, divides, and sends the
        remainder as the CRC. The receiver divides the whole codeword by the same
        generator: a remainder of zero means no error was detected.
      </p>`;

    var $ = function (sel) {
      // resolve both "#foo" and "[data-foo]" lookup conventions
      var byData = sel.charAt(0) === "#" ? "[data-" + sel.slice(1) + "]" : sel;
      return root.querySelector(sel) || root.querySelector(byData);
    };
    var dataEl = $("#crc-data"), genEl = $("#crc-gen");
    var outEl = $("#crc-out"), stepsEl = $("#crc-steps");
    var corrupted = false;

    function readInputs() {
      var data = clean(dataEl.value, "Data");
      var gen = clean(genEl.value, "Generator");
      if (gen.length < 2) throw new Error("Generator needs at least 2 bits (degree ≥ 1)");
      if (gen[0] !== "1") throw new Error("Generator must start with 1 (leading zero means lower degree)");
      return { data: data, gen: gen };
    }

    function show(obj) {
      outEl.innerHTML = Object.keys(obj).map(function (k) {
        return `<div><dt>${w.RENDER.esc(k)}</dt><dd>${w.RENDER.esc(obj[k])}</dd></div>`;
      }).join("");
    }

    function send() {
      corrupted = false;
      var v;
      try {
        v = readInputs();
      } catch (err) {
        showError(err.message);
        return;
      }
      clearError();
      var deg = v.gen.length - 1;
      var appended = v.data + "0".repeat(deg);
      var r = divide(appended, v.gen);
      var codeword = v.data + r.remainder;

      show({
        "Data bits": v.data,
        "Generator": v.gen + "  (degree " + deg + ")",
        "Appended zeros": appended,
        "CRC remainder": r.remainder,
        "Transmitted codeword": codeword
      });
      paintSteps(r.steps, v.gen);
      root.dataset.codeword = codeword;
      root.dataset.gen = v.gen;
      return codeword;
    }

    function showError(msg) {
      // The old build threw from inside the input listener, so the readout kept
      // showing the previous codeword and the bad input looked accepted.
      root.dataset.codeword = "";
      root.dataset.gen = "";
      outEl.innerHTML = `<div><dt>Input problem</dt><dd>${w.RENDER.esc(msg)}</dd></div>`;
      stepsEl.innerHTML = "";
      var box = root.querySelector(".sim__inline-err");
      if (!box) {
        box = root.ownerDocument.createElement("div");
        box.className = "sim__err sim__inline-err";
        outEl.parentNode.insertBefore(box, outEl);
      }
      box.textContent = msg;
    }

    function clearError() {
      var box = root.querySelector(".sim__inline-err");
      if (box && box.parentNode) box.parentNode.removeChild(box);
    }

    function paintSteps(steps, gen) {
      if (!steps.length) { stepsEl.innerHTML = ""; return; }
      // Long division is read strictly as a column: each step's dividend and the
      // divisor subtracted from it must start at the SAME character column, which
      // is the column of the leftmost 1 being divided. The ⊕ belongs in its own
      // gutter to the left, never inside the padded run, or it consumes a column
      // and pushes the divisor one character past the bits it subtracts from.
      // Leading spaces inside HTML collapse, so the indent is nbsp.
      var indent = function (n) { return "\u00a0".repeat(Math.max(0, n)); };

      stepsEl.innerHTML = steps.map(function (s) {
        var pad = indent(s.i);
        // The operator sits in its own fixed gutter on BOTH rows, so the divisor's
        // bit columns line up exactly with the dividend's. The gutter is an nbsp
        // rather than a space because HTML collapses runs of plain spaces.
        return `<li class="step">
          <span class="step__row"><span class="step__op" aria-hidden="true">\u00a0</span><span class="step__bits">${w.RENDER.esc(pad)}${w.RENDER.esc(s.seg)}</span></span>
          <span class="step__row step__row--sub"><span class="step__op">⊕</span><span class="step__bits">${w.RENDER.esc(pad)}${w.RENDER.esc(s.div)}</span><span class="step__arrow">→</span><span class="step__bits">${w.RENDER.esc(s.res)}</span></span>
        </li>`;
      }).join("");
    }

    function check() {
      var gen = root.dataset.gen, cw = root.dataset.codeword;
      if (!gen || !cw) { send(); gen = root.dataset.gen; cw = root.dataset.codeword; }
      if (!gen || !cw) return;              // input is invalid; showError already ran
      var r = divide(cw, gen);
      var ok = /^0+$/.test(r.remainder);
      show({
        "Received codeword": cw + (corrupted ? "   ← one bit flipped" : ""),
        "Divided by": gen,
        "Remainder": r.remainder,
        "Verdict": ok ? "0 remainder — accepted (no error detected)" : "non-zero — REJECTED"
      });
      paintSteps(r.steps, gen);
    }

    function flip() {
      if (!root.dataset.codeword) send();
      if (!root.dataset.codeword) return;    // invalid input; nothing to corrupt
      var cw = root.dataset.codeword.split("");
      var at = 1 + Math.floor(Math.random() * (cw.length - 1));
      cw[at] = cw[at] === "1" ? "0" : "1";
      root.dataset.codeword = cw.join("");
      corrupted = true;
      check();
    }

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-crc-send]")) send();
      else if (e.target.closest("[data-crc-check]")) check();
      else if (e.target.closest("[data-crc-flip]")) flip();
    });
    root.addEventListener("input", function () { send(); });

    send();
  }

  w.SIMS.push({
    id: "sim-crc", mod: "m06",
    title: "CRC calculator with long division",
    desc: "Enter data and a generator, then watch the modulo-2 long division run step by step and see the transmitted codeword. Corrupt a bit and watch the receiver reject it.",
    mount: mount,
    _divide: divide, _xor: xorBits        // exposed for the maths tests
  });
})(window);
