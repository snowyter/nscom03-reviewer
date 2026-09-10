/* sim-nyquist-shannon.js — data rate limits with live arithmetic.
   Nyquist (noiseless):  BitRate = 2 × B × log2(L)
   Shannon (noisy):      Capacity = B × log2(1 + SNR) */

(function (w) {
  "use strict";

  function nyquist(B, L) { return 2 * B * Math.log2(L); }
  function snrFromDb(db) { return Math.pow(10, db / 10); }
  function shannon(B, db) { return B * Math.log2(1 + snrFromDb(db)); }

  function fmt(n) {
    if (!isFinite(n)) return "—";
    if (n >= 1e9) return (n / 1e9).toFixed(3) + " Gbps";
    if (n >= 1e6) return (n / 1e6).toFixed(3) + " Mbps";
    if (n >= 1e3) return (n / 1e3).toFixed(3) + " kbps";
    return n.toFixed(2) + " bps";
  }

  function mount(root) {
    root.innerHTML = `
      <div class="ctlrow ctlrow--split">
        <div class="ctlrow">
          <label for="ns-bw">Bandwidth</label>
          <input id="ns-bw" type="range" min="1" max="100" value="3" step="1">
          <span class="val" data-ns-bw>3 kHz</span>
        </div>
        <div class="ctlrow">
          <label for="ns-lv">Signal levels L</label>
          <input id="ns-lv" type="range" min="2" max="64" value="2" step="1">
          <span class="val" data-ns-lv>2</span>
        </div>
        <div class="ctlrow">
          <label for="ns-db">SNR</label>
          <input id="ns-db" type="range" min="0" max="60" value="20" step="1">
          <span class="val" data-ns-db>20 dB</span>
        </div>
      </div>
      <div class="readout" data-ns-out></div>
      <div class="wave" data-ns-chart></div>
      <div class="wave__legend">
        <i><span class="sw" style="background:var(--trace)"></span>Nyquist limit (noiseless)</i>
        <i><span class="sw" style="background:var(--amber)"></span>Shannon limit (noisy)</i>
      </div>
      <p class="sim__desc" style="padding:.7rem 0 0">
        Pushing bandwidth or levels up raises the Nyquist ceiling, but Shannon caps
        what a real, noisy channel can carry, because noise cannot be told apart
        from signal. Whichever limit is lower is the one that binds.
      </p>`;

    var $ = function (sel) {
      // resolve both "#foo" and "[data-foo]" lookup conventions
      var byData = sel.charAt(0) === "#" ? "[data-" + sel.slice(1) + "]" : sel;
      return root.querySelector(sel) || root.querySelector(byData);
    };
    var bw = $("#ns-bw"), lv = $("#ns-lv"), db = $("#ns-db");
    var out = $("#ns-out"), chart = $("#ns-chart");

    function draw() {
      var B = +bw.value * 1000;            // slider is kHz
      var L = +lv.value;
      var dbv = +db.value;
      var snr = snrFromDb(dbv);
      var ny = nyquist(B, L);
      var sh = shannon(B, dbv);
      var bind = Math.min(ny, sh);

      root.querySelector("[data-ns-bw]").textContent = bw.value + " kHz";
      root.querySelector("[data-ns-lv]").textContent = String(L);
      root.querySelector("[data-ns-db]").textContent = dbv + " dB";

      out.innerHTML = [
        ["Nyquist bit rate", fmt(ny), "2 × B × log₂L"],
        ["Shannon capacity", fmt(sh), "B × log₂(1 + SNR)"],
        ["SNR (linear)", snr.toFixed(2), "from " + dbv + " dB"],
        ["Binding limit", fmt(bind), bind === ny ? "Nyquist is tighter" : "Shannon is tighter"],
        ["Bits per level", Math.log2(L).toFixed(3), "log₂(" + L + ")"]
      ].map(function (r) {
        return `<div><dt>${w.RENDER.esc(r[0])}</dt><dd>${w.RENDER.esc(r[1])}
          <small>${w.RENDER.esc(r[2])}</small></dd></div>`;
      }).join("");

      // bar chart of the two limits
      var W = 900, H = 190, pad = 60;
      var maxV = Math.max(ny, sh) || 1;
      var y1 = H - 40 - (ny / maxV) * (H - 80);
      var y2 = H - 40 - (sh / maxV) * (H - 80);
      var barW = 150, cx1 = W / 2 - barW - 30, cx2 = W / 2 + 30;
      chart.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img"
          aria-label="Nyquist and Shannon limits compared">
        <line x1="${pad}" y1="${H - 40}" x2="${W - pad}" y2="${H - 40}"
              stroke="var(--rule)" stroke-width="1"/>
        <rect x="${cx1}" y="${y1}" width="${barW}" height="${H - 40 - y1}"
              fill="var(--trace)" opacity=".85"/>
        <rect x="${cx2}" y="${y2}" width="${barW}" height="${H - 40 - y2}"
              fill="var(--amber)" opacity=".85"/>
        <text x="${cx1 + barW / 2}" y="${y1 - 8}" fill="var(--trace)"
              font-size="14" font-family="var(--mono)" text-anchor="middle">${fmt(ny)}</text>
        <text x="${cx2 + barW / 2}" y="${y2 - 8}" fill="var(--amber)"
              font-size="14" font-family="var(--mono)" text-anchor="middle">${fmt(sh)}</text>
        <text x="${cx1 + barW / 2}" y="${H - 18}" fill="var(--ink-faint)"
              font-size="12" font-family="var(--mono)" text-anchor="middle">Nyquist</text>
        <text x="${cx2 + barW / 2}" y="${H - 18}" fill="var(--ink-faint)"
              font-size="12" font-family="var(--mono)" text-anchor="middle">Shannon</text>
      </svg>`;
    }

    root.addEventListener("input", draw);
    draw();
  }

  w.SIMS.push({
    id: "sim-nyquist-shannon", mod: "m02",
    title: "Nyquist & Shannon data-rate limits",
    desc: "Slide bandwidth, signal levels and SNR and watch both ceilings move. The lower of the two is what the channel actually delivers — the exam's favourite trap.",
    mount: mount,
    _nyquist: nyquist, _shannon: shannon, _snrFromDb: snrFromDb
  });
})(window);
