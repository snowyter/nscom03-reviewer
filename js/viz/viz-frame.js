/* viz-frame.js — the Ethernet frame, field by field.
 *
 * The 802.3 frame is usually memorised as a row of boxes with byte counts the
 * student cannot connect to anything. What is actually hard is why each field
 * exists: why the preamble is 7 bytes of alternating bits and not data, why the
 * length/type field is ambiguous, why the data field has both a floor and a
 * ceiling, and where the CRC's coverage stops.
 *
 * Student-driven: the student picks a field and the frame shows what that field
 * is for, where it sits, and what goes wrong when it is wrong. Nothing animates
 * on its own.
 */

(function (w) {
  "use strict";

  function mount(root) {
    var H = w.VIZ;

    // The frame as a sequence of fields with real byte counts. `bit` fields are
    // counted in bits so the preamble/SFD split is honest.
    var FIELDS = [
      { id: "pre",    name: "Preamble",      bytes: 7,   kind: "sync",
        short: "7 bytes",
        what: "Seven bytes of alternating 10101010, used by the receiver's clock to lock onto the incoming bit stream before any real data arrives.",
        why: "Ethernet has no separate clock line. The physical layer recovers timing from the transitions in the signal, and a long run of identical bits gives it nothing to synchronise to. The preamble guarantees transitions." },
      { id: "sfd",    name: "Start Frame Delimiter", bytes: 1, kind: "sync",
        short: "1 byte",
        what: "10101011 — the preamble pattern with its last two bits flipped to 11.",
        why: "The preamble is a repeating pattern, so it cannot say \"data starts now\". Breaking the pattern is the signal. The receiver counts on the first 11 it sees where 10 was expected." },
      { id: "dst",    name: "Destination MAC", bytes: 6, kind: "addr",
        short: "6 bytes",
        what: "The 48-bit hardware address of the intended receiver.",
        why: "Every station on the segment reads the frame; only the one whose address matches keeps it. A broadcast address (all ones) is accepted by all." },
      { id: "src",    name: "Source MAC",    bytes: 6,   kind: "addr",
        short: "6 bytes",
        what: "The 48-bit hardware address of the sender.",
        why: "Needed so the receiver can reply, and so a switch can learn which port that address lives on." },
      { id: "typ",    name: "Length / Type", bytes: 2,   kind: "type",
        short: "2 bytes",
        what: "Values ≤ 1500 are a length in bytes; values ≥ 1536 name an upper-layer protocol (0x0800 = IPv4, 0x0806 = ARP).",
        why: "One field, two meanings, disambiguated only by range. The gap between 1500 and 1536 is what makes the two readings never collide — which is why the data field's ceiling is 1500 and not something arbitrary." },
      { id: "data",   name: "Data / Payload", bytes: 46, kind: "data",
        short: "46–1500 bytes",
        what: "The payload handed down from the layer above. If the payload is shorter than 46 bytes it is padded up to 46.",
        why: "46 is not a round number for its own sake: 64 (the minimum frame) minus 18 (every other field) is 46. The floor exists so the frame is long enough to still be transmitting when a collision at the far end gets back." },
      { id: "fcs",    name: "Frame Check Sequence", bytes: 4, kind: "check",
        short: "4 bytes",
        what: "A 32-bit CRC over the destination, source, length/type and data fields.",
        why: "It detects corruption but does not correct it — Ethernet is unreliable by design and drops a bad frame rather than repairing it. Note what is NOT covered: the preamble, the SFD, and the CRC itself." }
    ];

    root.innerHTML = `
      <div class="viz__fields" role="group" aria-label="Ethernet frame fields, to scale"></div>
      <ul class="viz__fieldlist" data-fr-list></ul>
      <div class="viz__verdict" data-fr-out aria-live="polite"></div>
      <p class="viz__note">
        Click any field to see what it is for. The bar above is drawn to
        <b>scale</b> — the payload dominates, which is why the header cost is
        negligible on a large frame and significant on a small one.
      </p>`;

    var fieldsEl = root.querySelector(".viz__fields");
    var listEl = root.querySelector("[data-fr-list]");
    var out = root.querySelector("[data-fr-out]");
    var ACTIVE = "pre";   // the field whose explanation is showing

    // Draw the bar to scale so the student sees the real proportions: the
    // 18 bytes of overhead against up to 1500 of data.
    var TOTAL = FIELDS.reduce(function (s, f) { return s + f.bytes; }, 0);

    function render() {
      // The to-scale bar: proportional widths, no text inside. The SFD is one
      // byte of 1522 and would be a 12px sliver -- putting its label in there
      // clipped the words, so the text lives in the list below instead.
      fieldsEl.innerHTML = FIELDS.map(function (f) {
        var pct = (f.bytes / TOTAL * 100);
        var on = f.id === ACTIVE;
        return `<button type="button" class="viz__field${on ? " is-on" : ""}"
                  data-fr="${f.id}" style="--w:${pct.toFixed(3)}%"
                  title="${f.name} — ${f.short}"
                  aria-pressed="${on}"><span class="sr-only">${f.name}</span></button>`;
      }).join("");

      // The same fields as a readable list, each row a button.
      listEl.innerHTML = FIELDS.map(function (f) {
        var on = f.id === ACTIVE;
        return `<li${on ? ' class="is-on"' : ""}>
                  <button type="button" data-fr="${f.id}"
                          class="viz__fieldrow" aria-pressed="${on}">
                    <span class="n">${f.name}</span>
                    <span class="b">${f.short}</span>
                  </button>
                </li>`;
      }).join("");

      var f = FIELDS.filter(function (x) { return x.id === ACTIVE; })[0];
      out.innerHTML =
        `<b>${f.name} — ${f.short}</b>` +
        `<span>${f.what}</span>` +
        `<span class="viz__why"><i>Why it is there:</i> ${f.why}</span>`;

      root.querySelectorAll("[data-fr]").forEach(function (b) {
        b.addEventListener("click", function () {
          ACTIVE = b.getAttribute("data-fr");
          render();
        });
      });
    }

    render();
    return function () {};
  }

  w.VIZ.register("ethernet-frame", {
    title: "The IEEE 802.3 frame, field by field",
    note: "Seven fields, 18 bytes of overhead. Pick one to see what it is for and why it has that exact width.",
    mount: mount
  });
})(window);
