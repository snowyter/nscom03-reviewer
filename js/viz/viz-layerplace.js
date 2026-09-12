/* viz-layerplace.js — put the job on the right layer.
 *
 * m01 s2 teaches the seven OSI layers and s3 maps them onto the Internet
 * model's four. Both sections end with the same exam task -- "given a job,
 * name its layer" -- and both answer it in prose, in a Go deeper panel the
 * student may never open. A stacked diagram of seven boxes does not rehearse
 * that skill; a wrong answer does.
 *
 * So this aid is a placement drill, not a diagram. The student is given a job
 * and picks a layer; the pick is marked, the reason is stated, and the row's
 * TCP/IP peer is highlighted so the mapping from s3 is rehearsed at the same
 * time. The tasks are the sections' own examples, so the aid cannot drift from
 * what the prose teaches.
 *
 * Student-driven: nothing is marked until the student commits to an answer.
 */

(function (w) {
  "use strict";

  // num = OSI layer number; tcp = the Internet model layer it belongs to.
  // The tasks are drawn from s2's and s3's own worked examples.
  var TASKS = [
    { q: "Decide which port the web server is listening on.", num: 4,
      why: "Port numbers are layer 4 addresses: they identify a process, not a machine. The transport header carries them." },
    { q: "Decide which cable pin carries the transmit pair.", num: 1,
      why: "Pin assignments and connector wiring are layer 1 mechanical and electrical specifications — the physical layer owns the medium." },
    { q: "Decide which way a packet travels toward a remote network.", num: 3,
      why: "Routing and logical addressing are layer 3. In the Internet model this is the internet layer." },
    { q: "Decide whether a frame arrived without bit errors from its immediate neighbour.", num: 2,
      why: "The frame check sequence guarding one hop is layer 2 error detection — node to node, not end to end." },
    { q: "Define a data representation both ends understand — JSON serialisation.", num: 6,
      why: "Data format and encoding are presentation-layer concerns. TCP/IP folds them into the application, which is why the collapse is not one-to-one." },
    { q: "Decide who speaks when, and how to resume a broken conversation.", num: 5,
      why: "Dialog control and synchronisation are session-layer work. Also folded into the application in the Internet model." },
    { q: "Serve a page to a browser over HTTP.", num: 7,
      why: "HTTP is an application-layer protocol: network services usable directly by an application." },
    { q: "Convert the whole frame into a signal on the medium.", num: 1,
      why: "The physical layer adds no header at all — it turns the frame into a signal. Bits, not frames, are its business." }
  ];

  var LAYERS = [
    { num: 7, name: "Application",  tcp: "Application",  group: 0 },
    { num: 6, name: "Presentation", tcp: "Application",  group: 0 },
    { num: 5, name: "Session",      tcp: "Application",  group: 0 },
    { num: 4, name: "Transport",    tcp: "Transport",    group: 1 },
    { num: 3, name: "Network",      tcp: "Internet",     group: 2 },
    { num: 2, name: "Data link",    tcp: "Link",         group: 3 },
    { num: 1, name: "Physical",     tcp: "Link",         group: 3 }
  ];

  function mount(root) {
    var H = w.VIZ;
    var p = H.palette(root);

    var idx = 0, picked = null, right = 0, asked = 0, done = false;

    root.innerHTML = `
      <div class="ly__ask" data-lp-ask></div>
      <div class="ly" role="group" aria-label="Choose the OSI layer for this job">
        <div class="ly__hrow" aria-hidden="true">
          <span class="ly__h">OSI — pick one</span>
          <span class="ly__h">Internet model</span>
        </div>
        <div data-lp-rows></div>
      </div>
      <div class="viz__verdict" data-lp-out aria-live="polite"></div>
      <div class="viz__steps">
        <button type="button" data-lp-next>Next job</button>
        <button type="button" data-lp-reset>Start over</button>
      </div>
      <p class="viz__note">
        Pick the layer that owns the job. Your answer is marked with the reason,
        and the row's <b>Internet model</b> peer lights up — that is the mapping
        between the two stacks, rehearsed one job at a time.
      </p>`;

    var askEl = root.querySelector("[data-lp-ask]");
    var rowsEl = root.querySelector("[data-lp-rows]");
    var out = root.querySelector("[data-lp-out]");
    var nextBtn = root.querySelector("[data-lp-next]");

    function renderRows() {
      // A CSS grid: column 1 holds the seven OSI rows, column 2 holds the
      // Internet-model layers as cells that SPAN the OSI rows they cover. That
      // span is the whole point of the mapping, so it is expressed in the
      // layout rather than described in a caption.
      var groups = {};
      LAYERS.forEach(function (l) { (groups[l.group] = groups[l.group] || []).push(l); });

      var html = "";
      LAYERS.forEach(function (l, i) {
        var state = "";
        if (picked !== null) {
          if (l.num === TASKS[idx].num) state = " is-right";
          else if (l.num === picked) state = " is-wrong";
        }
        html += `<div class="ly__row${state}" style="grid-row:${i + 1}">
          <button type="button" class="ly__btn" data-lp-pick="${l.num}"
                  ${picked !== null ? "disabled" : ""}>
            <span class="ly__n">${l.num}</span><span class="ly__nm">${l.name}</span>
          </button>
        </div>`;
      });
      // The TCP column cells, each spanning its group's OSI rows.
      var row = 1;
      Object.keys(groups).sort().forEach(function (g) {
        var list = groups[g];
        var span = list.length;
        var hit = picked !== null && list.some(function (l) { return l.num === TASKS[idx].num; });
        html += `<div class="ly__tcp${hit ? " is-hit" : ""}" style="grid-row:${row} / span ${span}">
          <span class="ly__tcpn">${list[0].tcp}</span>
          <span class="ly__tcpl">${span === 1 ? "1 OSI layer" : span + " OSI layers"}</span>
        </div>`;
        row += span;
      });

      rowsEl.innerHTML = html;

      rowsEl.querySelectorAll("[data-lp-pick]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (picked !== null) return;
          picked = Number(b.getAttribute("data-lp-pick"));
          asked++;
          if (picked === TASKS[idx].num) right++;
          renderRows();
          verdict();
        });
      });
    }

    function verdict() {
      var t = TASKS[idx];
      out.classList.remove("is-bad", "is-good");
      if (picked === null) {
        out.innerHTML = `<b>Your call</b><span>Nothing is marked until you commit. ` +
          `Job ${idx + 1} of ${TASKS.length}.</span>`;
        return;
      }
      if (picked === t.num) {
        out.classList.add("is-good");
        out.innerHTML = `<b style="color:${p.trace}">✓ Correct — layer ${t.num}, ${name(t.num)}</b>` +
          `<span>${t.why}</span>` +
          `<p class="viz__stats">Score <i>${right}/${asked}</i> · Internet model peer <i>${tcpOf(t.num)}</i></p>`;
      } else {
        out.classList.add("is-bad");
        out.innerHTML = `<b style="color:${p.warn}">✕ Layer ${picked}, ${name(picked)} — not this one</b>` +
          `<span>${t.why} That is layer <b>${t.num}, ${name(t.num)}</b>` +
          `, which the Internet model calls <b>${tcpOf(t.num)}</b>.</span>` +
          `<p class="viz__stats">Score <i>${right}/${asked}</i></p>`;
      }
      nextBtn.textContent = done ? "Start over" : (idx + 1 >= TASKS.length ? "Start over" : "Next job");
    }

    function name(n) { return (LAYERS.find(function (l) { return l.num === n; }) || {}).name || ""; }
    function tcpOf(n) { return (LAYERS.find(function (l) { return l.num === n; }) || {}).tcp || ""; }

    function load(i) {
      idx = i; picked = null;
      done = false;
      askEl.innerHTML = `<span class="ly__k">Job ${i + 1} of ${TASKS.length}</span>` +
        `<span class="ly__q">${TASKS[i].q}</span>`;
      renderRows();
      verdict();
    }

    nextBtn.addEventListener("click", function () {
      if (idx + 1 >= TASKS.length) {
        idx = 0; right = 0; asked = 0;
      } else {
        idx += 1;
      }
      load(idx);
    });

    root.querySelector("[data-lp-reset]").addEventListener("click", function () {
      right = 0; asked = 0;
      load(0);
    });

    load(0);
    return null;
  }

  w.VIZ.register("layer-place", {
    title: "Put the job on the right layer",
    note: "Eight jobs, seven layers. Pick the layer that owns each one and watch its Internet-model peer light up.",
    mount: mount
  });
})(window);
