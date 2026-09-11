/* render.js — content object -> instrument markup.
   Every string that can contain HTML is built with template literals, and all
   text passes through esc() unless it is already trusted markup. */

(function (w) {
  "use strict";

  var FIG = {};
  var FIG_READY = false;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function indexFigs(list) {
    FIG = {}; (list || []).forEach(function (f) { FIG[f.id] = f; });
    FIG_READY = true;
  }

  function fig(id) { return FIG_READY ? FIG[id] : null; }

  /* ── blocks ─────────────────────────────────────────────────── */

  function block(b) {
    if (!b || !b.type) return "";
    switch (b.type) {
      case "p":
        return `<p class="blk blk--p">${esc(b.text)}</p>`;

      case "h3":
        return `<h3 class="blk blk--h3">${esc(b.text)}</h3>`;

      case "list":
        return `<ul class="blk blk--list">` +
          (b.items || []).map(function (t) { return `<li>${esc(t)}</li>`; }).join("") +
          `</ul>`;

      case "note":
        return `<div class="blk blk--note" role="note">${esc(b.text)}</div>`;

      case "table": {
        var head = (b.head || []).map(function (h) { return `<th>${esc(h)}</th>`; }).join("");
        var rows = (b.rows || []).map(function (r) {
          return `<tr>` + r.map(function (c) { return `<td>${esc(c)}</td>`; }).join("") + `</tr>`;
        }).join("");
        return `<div class="blk blk--table"><table>
          <thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
      }

      case "formula":
        return `<div class="blk blk--formula">
          <span class="fx">${w.MATH.toHtml(b.tex)}</span>
          <span class="fx__say"><b>In words:</b> ${esc(b.text)}</span></div>`;

      case "example": {
        var steps = b.steps && b.steps.length
          ? `<ol>` + b.steps.map(function (s) { return `<li>${esc(s)}</li>`; }).join("") + `</ol>`
          : "";
        return `<div class="blk blk--example">
          <span class="blk__k">Worked example</span>
          <span>${esc(b.text)}</span>${steps}</div>`;
      }

      case "fig": {
        var f = fig(b.fig);
        if (!f) return "";
        var cap = b.caption || f.caption || "";
        return `<figure class="blk blk--fig fig">
          <button class="fig__btn" type="button" data-zoom="${esc(f.path)}"
                  data-zoom-alt="${esc(f.alt || cap)}" aria-label="Enlarge figure: ${esc(cap)}">
            <img src="${esc(f.path)}" width="${f.w}" height="${f.h}"
                 loading="lazy" decoding="async" alt="${esc(f.alt || cap)}">
          </button>
          <figcaption class="fig__cap">
            <b>Fig.</b><span>${esc(cap)}</span>
            <span class="fig__slide">slide ${f.slide}</span>
          </figcaption>
        </figure>`;
      }

      default:
        return "";
    }
  }

  function section(sec, i, total, read) {
    var body = (sec.body || []).map(block).join("");
    var no = String(i + 1).padStart(2, "0");
    // A section is a disclosure: the head is the toggle, the body is the panel.
    // The head is a real <button> so it is keyboard-operable and announces its
    // expanded state; the panel is a grid-rows track that animates from 0fr to
    // 1fr, which gives a smooth height transition without measuring anything in
    // JS (a max-height guess either clips long sections or eases unevenly).
    //
    // EVERY section starts collapsed, read or not. A module is a list of section
    // titles until the student opens one, which is what makes the page navigable
    // on a phone: a 15-section module is otherwise thousands of pixels of scroll
    // before you reach section 2. It also means expanding a section is a
    // deliberate act, so the reading order is theirs.
    //
    // The state is the initial markup, not an effect that fires after paint, so
    // there is no flash of open content.
    return `<section class="sec is-collapsed${read ? " is-read" : ""}"
                     id="${esc(sec.id)}"
                     data-sec="${esc(sec.id)}" aria-labelledby="${esc(sec.id)}-t">
      <h2 class="sec__h">
        <button class="sec__head" type="button" data-toggle="${esc(sec.id)}"
                aria-expanded="false"
                aria-controls="${esc(sec.id)}-b">
          <span class="sec__no">${no}</span>
          <span class="sec__title" id="${esc(sec.id)}-t">
            <span class="sec__ttext">${esc(sec.title)}</span><span
              class="sec__chev" aria-hidden="true"><svg viewBox="0 0 12 8"
              width="11" height="8" fill="none" stroke="currentColor"
              stroke-width="1.7" stroke-linecap="round"
              stroke-linejoin="round"><path d="M1 1.5 L6 6.5 L11 1.5"/></svg></span>
          </span>
          <span class="sec__state" aria-hidden="true">${read ? "Read" : ""}</span>
        </button>
      </h2>
      <div class="sec__body" id="${esc(sec.id)}-b" role="region"
           aria-labelledby="${esc(sec.id)}-t">
        <div class="sec__inner">
          ${body}
          <div class="sec__foot">
            <button class="mark${read ? " is-on" : ""}" type="button"
                    data-mark="${esc(sec.id)}"
                    aria-pressed="${read ? "true" : "false"}">
              <span class="mark__box" aria-hidden="true">${read ? "✓" : ""}</span>
              <span class="mark__txt">${read ? "Read" : "Mark as read"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ── lesson sheet ───────────────────────────────────────────── */

  function lesson(mod, state) {
    var ids = mod.sections.map(function (s) { return s.id; });
    var readN = w.STORE.readCount(mod.id, ids);
    var secs = mod.sections;
    var bar = secs.map(function (s, i) {
      var isRead = w.STORE.isSectionRead(mod.id, s.id);
      return `<span class="spine__b${isRead ? " is-on" : ""}" title="${esc(s.title)}"></span>`;
    }).join("");

    return `<article class="sheet">
      <header>
        <div class="sheet__eyebrow">
          <span class="tag">Module ${String(mod.num).padStart(2, "0")}</span>
          <span>${secs.length} sections</span>
          <span>·</span>
          <span>${mod.flashcards.length} cards</span>
          <span>·</span>
          <span>${mod.quiz.length} quiz</span>
        </div>
        <h1 class="sheet__title">${esc(mod.title)}</h1>
        <p class="sheet__sum">${esc(mod.summary)}</p>
        <div class="sheet__modes">
          <a class="mode" href="#/m/${mod.id}/cards">Drill cards <span class="mode__n">${mod.flashcards.length}</span></a>
          <a class="mode" href="#/m/${mod.id}/quiz">Take quiz <span class="mode__n">${mod.quiz.length}</span></a>
          <button class="mode" type="button" data-mark-all>${
            readN === secs.length ? "Clear all marks" : "Mark all read"}</button>
        </div>
      </header>

      <div class="spine">
        <span>Read ${readN}/${secs.length}</span>
        <span class="spine__bars">${bar}</span>
        <span>${Math.round((readN / secs.length) * 100)}%</span>
      </div>

      ${secs.map(function (s, i) {
        return section(s, i, secs.length, !!state.read[s.id]);
      }).join("")}
    </article>`;
  }

  /* ── overview ───────────────────────────────────────────────── */

  function overview(mods, state, figs) {
    var cards = mods.map(function (m) {
      var ids = m.sections.map(function (s) { return s.id; });
      var readN = w.STORE.readCount(m.id, ids);
      var pct = Math.round((readN / ids.length) * 100);
      var bars = m.sections.map(function (s) {
        return `<span class="cell__b${w.STORE.isSectionRead(m.id, s.id) ? " is-on" : ""}"></span>`;
      }).join("");
      var rec = w.STORE.quizRec(m.id);
      var seen = w.STORE.cardsSeen(m.id, m.flashcards.length);
      return `<a class="cell" href="#/m/${m.id}">
        <span class="cell__top">
          <span class="cell__ico" aria-hidden="true">${m.icon}</span>
          <span class="cell__no">${String(m.num).padStart(2, "0")}</span>
        </span>
        <h2 class="cell__title">${esc(m.title)}</h2>
        <p class="cell__sum">${esc(m.summary)}</p>
        <span class="cell__meta">
          <span>read <b>${pct}%</b></span>
          <span>cards <b>${seen}/${m.flashcards.length}</b></span>
          <span>quiz <b>${rec.best === null ? "—" : rec.best + "/" + rec.total}</b></span>
        </span>
        <span class="cell__bar">${bars}</span>
      </a>`;
    }).join("");

    return `<div class="ov__head">
      <h1 class="ov__title">Bench overview</h1>
      <p class="ov__lede">${mods.length} modules from the NSCOM03 lecture material, with the
      course's own figures and added depth. Pick a channel below, or open the
      simulator bench to play with the maths.</p>
      <div class="sheet__modes" style="margin-top:1.1rem">
        <a class="mode" href="#/sims">Simulator bench</a>
        <a class="mode" href="#/syllabus">Sheet index</a>
        <button class="mode" type="button" data-clear-progress>Clear all progress</button>
      </div>
    </div>
    <div class="grid">${cards}</div>`;
  }

  /* ── sim mountain ───────────────────────────────────────────── */

  function simHost() {
    return `<div class="ov__head">
      <h1 class="ov__title">Simulator bench</h1>
      <p class="ov__lede">Live instruments for the maths the course tests. Drag the
      controls and watch the readouts agree with the formulas.</p>
    </div>
    <div data-sim-host></div>`;
  }

  w.RENDER = {
    esc: esc, block: block, section: section, lesson: lesson,
    overview: overview, simHost: simHost, indexFigs: indexFigs, fig: fig
  };
})(window);
