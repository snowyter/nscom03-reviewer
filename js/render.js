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
          <span class="fx">${esc(b.tex)}</span>
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
    return `<section class="sec${read ? " is-read" : ""}" id="${esc(sec.id)}"
                     data-sec="${esc(sec.id)}" aria-labelledby="${esc(sec.id)}-t">
      <div class="sec__head">
        <span class="sec__no">${String(i + 1).padStart(2, "0")}</span>
        <h2 class="sec__title" id="${esc(sec.id)}-t">${esc(sec.title)}</h2>
        <button class="sec__link" type="button" data-mark="${esc(sec.id)}">
          ${read ? "read ✓" : "mark read"}
        </button>
      </div>
      ${body}
    </section>`;
  }

  /* ── lesson sheet ───────────────────────────────────────────── */

  function lesson(mod, state) {
    var ids = mod.sections.map(function (s) { return s.id; });
    var readN = w.STORE.readCount(ids);
    var secs = mod.sections;
    var bar = secs.map(function (s, i) {
      var isRead = !!state.read[s.id];
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
          <button class="mode" type="button" data-mark-all>Mark all read</button>
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
      var readN = w.STORE.readCount(ids);
      var pct = Math.round((readN / ids.length) * 100);
      var bars = m.sections.map(function (s) {
        return `<span class="cell__b${state.read[s.id] ? " is-on" : ""}"></span>`;
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
