/* store.js — localStorage-backed study state.
   Namespaced, versioned, and defensive: a corrupt or absent record must never
   throw, because the whole surface reads from here on every route render. */

(function (w) {
  "use strict";

  var KEY = "nscom03.state.v1";

  var EMPTY = {
    v: 1,
    read: {},      // sectionId -> true            (lesson read through)
    cards: {},     // moduleId -> {cardIndex: {seen, box, due}}
    quiz: {},      // moduleId -> {best, lastScore, total, wrong:[indices]}
    theme: null,
    last: null     // last route, for resume
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      var raw = w.localStorage.getItem(KEY);
      if (!raw) return clone(EMPTY);
      var got = JSON.parse(raw);
      if (!got || typeof got !== "object") return clone(EMPTY);
      // merge forward so older records stay usable
      var out = clone(EMPTY);
      out.read = got.read || {};
      out.cards = got.cards || {};
      out.quiz = got.quiz || {};
      out.theme = got.theme || null;
      out.last = got.last || null;
      return out;
    } catch (e) {
      return clone(EMPTY);
    }
  }

  var state = load();
  var listeners = [];

  function persist() {
    try {
      w.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* private mode / quota — study state is a convenience, never a blocker */
    }
  }

  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](state); } catch (e) { /* one bad listener must not stop the rest */ }
    }
  }

  function commit() { persist(); emit(); }

  var store = {
    all: function () { return state; },
    on: function (fn) { listeners.push(fn); return function () {
      var i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1);
    }; },

    /* ── lessons ─────────────────────────────────────────────── */
    markSection: function (secId) {
      if (!secId || state.read[secId]) return;
      state.read[secId] = true;
      var m = /^(m\d\d)\./.exec(secId);
      if (m) state.last = "#/m/" + m[1];
      commit();
    },
    isSectionRead: function (secId) { return !!state.read[secId]; },
    readCount: function (ids) {
      var n = 0;
      for (var i = 0; i < ids.length; i++) if (state.read[ids[i]]) n++;
      return n;
    },

    /* ── flashcards (Leitner boxes) ──────────────────────────── */
    card: function (modId, idx) {
      var m = state.cards[modId] || (state.cards[modId] = {});
      var c = m[idx];
      if (!c) c = m[idx] = { seen: 0, box: 0, due: 0 };
      return c;
    },
    gradeCard: function (modId, idx, gotIt) {
      var c = store.card(modId, idx);
      c.seen += 1;
      var DAY = 86400000;
      var waits = [0, 1, 2, 4, 8, 16];
      if (gotIt) c.box = Math.min((c.box || 0) + 1, waits.length - 1);
      else c.box = 0;
      c.due = Date.now() + waits[c.box] * DAY;
      commit();
    },
    dueCards: function (modId, total) {
      var now = Date.now(), n = 0;
      for (var i = 0; i < total; i++) {
        var c = store.card(modId, i);
        if (!c.seen || c.due <= now) n++;
      }
      return n;
    },
    dueAll: function (modules) {
      var n = 0;
      for (var i = 0; i < modules.length; i++) {
        n += store.dueCards(modules[i].id, modules[i].flashcards.length);
      }
      return n;
    },
    cardsSeen: function (modId, total) {
      var n = 0;
      for (var i = 0; i < total; i++) if (store.card(modId, i).seen) n++;
      return n;
    },

    /* ── quiz ────────────────────────────────────────────────── */
    quizRec: function (modId) {
      return state.quiz[modId] || { best: null, lastScore: null, total: null, wrong: [] };
    },
    scoreQuiz: function (modId, correct, total, wrongList) {
      var r = store.quizRec(modId);
      r.lastScore = correct; r.total = total;
      r.wrong = wrongList || [];
      if (r.best === null || correct > r.best) r.best = correct;
      state.quiz[modId] = r;
      commit();
    },

    /* ── theme ───────────────────────────────────────────────── */
    theme: function () { return state.theme; },
    setTheme: function (t) { state.theme = t; commit(); },

    /* ── misc ────────────────────────────────────────────────── */
    remember: function (route) { state.last = route; commit(); },
    last: function () { return state.last; },
    reset: function () { state = clone(EMPTY); commit(); }
  };

  w.STORE = store;
})(window);
