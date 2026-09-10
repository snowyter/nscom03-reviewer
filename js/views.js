/* views.js — drill (flashcards) and quiz surfaces.
   Mounted by app.js. Each returns a teardown function so listeners are not
   leaked when the route changes. */

(function (w) {
  "use strict";

  var D = w.document;

  function el(html) {
    var t = D.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* ── flashcards ─────────────────────────────────────────────── */

  function mountDrill(root, mod) {
    var order = w.SRS.order(mod, w.STORE.all());
    var pos = 0, revealed = false, again = [];

    function header() {
      var p = w.SRS.deckProgress(mod, w.STORE.all());
      return `<div class="drill__bar">
        <span class="drill__count">${Math.min(pos + 1, order.length)}
          <span class="drill__of">/ ${order.length}</span></span>
        <span class="drill__hint">space = flip · 1 = again · 2 = got it</span>
      </div>
      <p class="drill__hint" style="margin:-.6rem 0 1rem">
        Deck seen ${p.seen}/${p.total} (${p.pct}%)${again.length ? " · " + again.length + " to repeat" : ""}
      </p>`;
    }

    function cardHtml() {
      if (pos >= order.length) return doneHtml();
      var idx = order[pos];
      var c = mod.flashcards[idx];
      var face = revealed ? "answer" : "question";
      return `<button class="card" type="button" data-flip aria-label="Flip card">
          <span class="card__face">${face} · card ${idx + 1}</span>
          <p class="card__q">${w.RENDER.esc(c.q)}</p>
          ${revealed
            ? `<p class="card__a">${w.RENDER.esc(c.a)}</p>
               <span class="card__sec">§ ${w.RENDER.esc(sectionTitle(mod, c.sec))}</span>`
            : `<span class="card__reveal">tap to reveal</span>`}
        </button>
        <div class="drill__grade">
          <button class="grade grade--no" type="button" data-grade="0">1 · again</button>
          <button class="grade grade--yes" type="button" data-grade="1" ${revealed ? "" : "disabled"}>
            2 · got it</button>
        </div>`;
    }

    function sectionTitle(mod, secId) {
      for (var i = 0; i < mod.sections.length; i++) {
        if (mod.sections[i].id === secId) return mod.sections[i].title;
      }
      return secId;
    }

    function doneHtml() {
      var p = w.SRS.deckProgress(mod, w.STORE.all());
      var againBtn = again.length
        ? `<button class="btn btn--go" type="button" data-restart>Repeat ${again.length} missed</button>`
        : "";
      return `<div class="drill__done">
        <h3>Deck complete</h3>
        <p>${p.seen} of ${p.total} cards in this deck have been seen.
        ${again.length ? "The cards you marked again are queued below." : "Nothing left for this pass."}</p>
        <div class="quiz__actions" style="margin:0">
          ${againBtn}
          <a class="btn" href="#/m/${mod.id}/quiz">Take the quiz</a>
          <a class="btn" href="#/m/${mod.id}">Back to sheet</a>
        </div>
      </div>`;
    }

    function draw() {
      root.innerHTML = header() + cardHtml();
    }

    function onFlip() {
      revealed = !revealed;
      draw();
    }

    function onGrade(gotIt) {
      if (!revealed && gotIt) return;
      var idx = order[pos];
      w.STORE.gradeCard(mod.id, idx, gotIt);
      if (!gotIt) again.push(idx);
      revealed = false;
      pos++;
      draw();
    }

    function restart() {
      order = again.slice();
      again = [];
      pos = 0;
      revealed = false;
      draw();
    }

    function click(e) {
      var t = e.target.closest("[data-flip],[data-grade],[data-restart]");
      if (!t) return;
      if (t.hasAttribute("data-flip")) return onFlip();
      if (t.hasAttribute("data-grade")) return onGrade(t.getAttribute("data-grade") === "1");
      if (t.hasAttribute("data-restart")) return restart();
    }

    function key(e) {
      if (e.key === " ") { e.preventDefault(); onFlip(); }
      else if (e.key === "1") { e.preventDefault(); onGrade(false); }
      else if (e.key === "2") { e.preventDefault(); onGrade(true); }
    }

    draw();
    root.addEventListener("click", click);
    D.addEventListener("keydown", key);
    return function () {
      root.removeEventListener("click", click);
      D.removeEventListener("keydown", key);
    };
  }

  /* ── quiz ───────────────────────────────────────────────────── */

  function mountQuiz(root, mod) {
    var answered = {};     // qIndex -> chosen option
    var done = false;

    function score() {
      var n = 0, tot = mod.quiz.length, wrong = [];
      for (var i = 0; i < tot; i++) {
        if (answered[i] === mod.quiz[i].answer) n++;
        else if (answered[i] !== undefined) wrong.push(i);
      }
      return { n: n, tot: tot, wrong: wrong };
    }

    function answeredCount() {
      return Object.keys(answered).length;
    }

    function qHtml(q, i) {
      var chosen = answered[i];
      var isDone = chosen !== undefined;
      var opts = q.choices.map(function (c, k) {
        var cls = "opt";
        var mark = "";
        if (isDone) {
          if (k === q.answer) { cls += " is-ok"; mark = "✓"; }
          else if (k === chosen) { cls += " is-bad"; mark = "✗"; }
        }
        return `<li><button class="${cls}" type="button" data-q="${i}" data-k="${k}"
          ${isDone ? "disabled" : ""}>
          <span class="opt__k">${"abcd"[k]}</span>
          <span>${w.RENDER.esc(c)}</span>
          <span class="opt__mark">${mark}</span>
        </button></li>`;
      }).join("");

      var why = isDone
        ? `<div class="q__why"><b>Why</b>${w.RENDER.esc(q.why)}
             <button class="q__jump" type="button" data-goto="${w.RENDER.esc(q.sec)}">
               → § ${w.RENDER.esc(secName(mod, q.sec))}</button></div>`
        : "";

      return `<div class="q" id="q${i}">
        <span class="q__no">Question ${i + 1} of ${mod.quiz.length}</span>
        <p class="q__text">${w.RENDER.esc(q.q)}</p>
        <ul class="q__list">${opts}</ul>
        ${why}
      </div>`;
    }

    function secName(mod, id) {
      for (var i = 0; i < mod.sections.length; i++) {
        if (mod.sections[i].id === id) return mod.sections[i].title;
      }
      return id;
    }

    function draw() {
      var s = score();
      var n = answeredCount();
      var rec = w.STORE.quizRec(mod.id);
      var head = `<div class="quiz__score">
        <b>${s.n}<span style="font-size:1rem;color:var(--ink-faint)">/${s.tot}</span></b>
        <span>${n} of ${s.tot} answered</span>
        ${rec.best !== null ? `<span>best ${rec.best}/${rec.total}</span>` : ""}
        <div class="quiz__actions">
          ${n < s.tot
            ? `<button class="btn" type="button" data-goto-left>Go to first unanswered</button>`
            : `<button class="btn btn--go" type="button" data-finish>Finish &amp; record</button>`}
          ${s.wrong.length && n === s.tot
            ? `<button class="btn" type="button" data-retry-wrong>Retry ${s.wrong.length} wrong</button>`
            : ""}
          <button class="btn" type="button" data-reset>Reset</button>
        </div>
      </div>`;
      root.innerHTML = head + mod.quiz.map(qHtml).join("");
    }

    function pick(i, k) {
      if (answered[i] !== undefined) return;
      answered[i] = k;
      var s = score();
      if (answeredCount() === mod.quiz.length && !done) {
        done = true;
        w.STORE.scoreQuiz(mod.id, s.n, s.tot, s.wrong);
      }
      draw();
    }

    function finish() {
      var s = score();
      done = true;
      w.STORE.scoreQuiz(mod.id, s.n, s.tot, s.wrong);
      draw();
    }

    function retryWrong() {
      var s = score();
      var keep = {};
      s.wrong.forEach(function (i) { keep[i] = undefined; });
      answered = {};
      done = false;
      draw();
    }

    function click(e) {
      var t = e.target.closest("[data-q],[data-goto],[data-goto-left],[data-finish],[data-reset],[data-retry-wrong]");
      if (!t) return;
      if (t.hasAttribute("data-q")) return pick(+t.getAttribute("data-q"), +t.getAttribute("data-k"));
      if (t.hasAttribute("data-goto")) {
        var sec = t.getAttribute("data-goto");
        location.hash = "#/m/" + mod.id + "/s/" + sec;
        return;
      }
      if (t.hasAttribute("data-goto-left")) {
        for (var i = 0; i < mod.quiz.length; i++) {
          if (answered[i] === undefined) {
            var node = D.getElementById("q" + i);
            if (node) { node.scrollIntoView({ block: "center" }); }
            return;
          }
        }
      }
      if (t.hasAttribute("data-finish")) return finish();
      if (t.hasAttribute("data-retry-wrong")) return retryWrong();
      if (t.hasAttribute("data-reset")) { answered = {}; done = false; draw(); return; }
    }

    draw();
    root.addEventListener("click", click);
    return function () { root.removeEventListener("click", click); };
  }

  w.VIEWS = { mountDrill: mountDrill, mountQuiz: mountQuiz };
})(window);
