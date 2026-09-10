/* srs.js — study ordering for the drill deck.
   Not a scheduler on its own (store.js owns the Leitner boxes); this decides the
   order cards are presented: unseen first, then due, then the rest, with the
   weakest box pulled forward. Pure functions so the order is testable. */

(function (w) {
  "use strict";

  var DAY = 86400000;

  /* Returns an array of card indices in study order. */
  function order(mod, state, now) {
    now = now || Date.now();
    var total = mod.flashcards.length;
    var per = (state.cards && state.cards[mod.id]) || {};
    var rows = [];
    for (var i = 0; i < total; i++) {
      var c = per[i];
      var seen = c ? c.seen : 0;
      var box = c ? (c.box || 0) : 0;
      var due = c ? (c.due || 0) : 0;
      var isDue = !seen || due <= now;
      rows.push({ i: i, seen: seen, box: box, due: due, isDue: isDue });
    }
    rows.sort(function (a, b) {
      // 1. due cards before not-due
      if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
      // 2. among due: never-seen first, then lowest box (weakest)
      if (a.isDue) {
        if ((a.seen === 0) !== (b.seen === 0)) return a.seen === 0 ? -1 : 1;
        if (a.box !== b.box) return a.box - b.box;
      } else {
        // 3. among not-due: soonest due
        if (a.due !== b.due) return a.due - b.due;
      }
      return a.i - b.i;
    });
    return rows.map(function (r) { return r.i; });
  }

  /* Human-readable label for a box level. */
  function boxLabel(box) {
    return ["new", "learning", "day 1", "day 2", "day 4", "day 8"][box] || "new";
  }

  /* Progress through the deck: how many cards have been seen at least once. */
  function deckProgress(mod, state) {
    var per = (state.cards && state.cards[mod.id]) || {};
    var seen = 0;
    for (var i = 0; i < mod.flashcards.length; i++) {
      if (per[i] && per[i].seen) seen++;
    }
    return { seen: seen, total: mod.flashcards.length,
             pct: Math.round((seen / mod.flashcards.length) * 100) };
  }

  w.SRS = { order: order, boxLabel: boxLabel, deckProgress: deckProgress, DAY: DAY };
})(window);
