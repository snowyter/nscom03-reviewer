/* sims.js — simulator registry and host.
   Mount pattern: w.SIMS.push({ id, mod, title, desc, mount(root) }).
   mount is wrapped in try/catch and the error text is surfaced in the DOM,
   because a silent simulator failure is indistinguishable from a blank one. */

(function (w) {
  "use strict";

  w.SIMS = w.SIMS || [];
  var D = w.document;

  function render(target, modFilter) {
    if (!target) return;
    var list = w.SIMS.filter(function (s) { return !modFilter || s.mod === modFilter; });
    target.innerHTML = list.map(function (s) {
      return `<section class="sim" data-sim="${s.id}">
        <header class="sim__head">
          <h3 class="sim__title">${w.RENDER.esc(s.title)}</h3>
          <span class="sim__mod">${w.RENDER.esc(s.mod || "bench")}</span>
        </header>
        <p class="sim__desc">${w.RENDER.esc(s.desc || "")}</p>
        <div class="sim__body" data-sim-root></div>
      </section>`;
    }).join("");

    list.forEach(function (s) {
      var host = target.querySelector('[data-sim="' + s.id + '"] [data-sim-root]');
      if (!host) return;
      try {
        s.mount(host);
      } catch (err) {
        var box = D.createElement("div");
        box.className = "sim__err";
        box.textContent = "This simulator failed to load: " + (err && err.message ? err.message : err);
        host.appendChild(box);
      }
    });
  }

  w.SIMHOST = { render: render };
})(window);
