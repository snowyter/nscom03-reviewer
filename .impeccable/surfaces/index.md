---
version: 1
slug: "index"
primary_target: "index"
related_targets: []
---

## Scope and mode

Mode: **Read** — the visitor (a DLSU NSCOM03 student) must understand dense
technical material and find their way around it. The interface recedes behind
comprehension; expression lives in precision, not decoration.

Surface: `index` — the whole static reviewer (module list, lesson, flashcards,
quiz, simulators). One route family, hash-routed.

## Audience, job, action, content

- **Audience:** one engineering student, studying at night, laptop or phone, the
  night before a quiz.
- **Job:** understand the module's mechanisms well enough to answer exam
  questions, and test recall without opening Canvas.
- **Action:** pick a module, read the lesson, drill the flashcards, take the quiz,
  play with the simulator when the maths is abstract.
- **Content:** the course's real lecture PDFs — the prof's own figures, slide
  wording, and terminology — plus labelled textbook depth (Forouzan) and five
  interactive simulators.
- **Constraints:** static, no backend, no build step, GitHub Pages, phone-legible,
  keyboard-navigable, persists progress locally.

## Chosen direction

**Oscilloscope Phosphor Bench.** The subject's own output device. Every waveform
in this course — NRZ, Manchester, ASK/FSK/PSK, multiplexed frames — is literally
what an oscilloscope draws, so the surface that displays them takes the
instrument's form: a dark graticule, a live trace, draggable measurement cursors,
amber readouts. Chosen by the user over the roll's assignment (Circuit Schematic
Blueprint) and over the Copy-Shop Zine alternate.

**Memorable moment:** dragging a measurement cursor across a real trace and
watching the readout resolve — time per division, bit rate, and degree of
synchronization updating live to a number that matches the formula in the slide.

## Direction contract

**THESIS** The reviewer *is* the instrument that reads the course's signals. It
refuses the category default — a light card grid with a sidebar and soft shadows —
by making the page a measured display: one graticule, one trace, cursors and
readouts, where knowledge is read off the screen rather than scrolled past.

**OWN-WORLD** Near-black green phosphor ground (`#0a1410`), graticule rulings in
dim `#1c4a3a`, the active trace in signal green (`#7dffb2`) with amber (`#ffd166`)
reserved for readouts and measurement chrome. Components are instrument parts:
ruled graticule panels, labelled control cells, cursor handles, seven-segment-ish
readout numerals. No cards, no shadows, no glass, no rounded pills.

**STORY** A student lands, sees the course laid out as a bench of instruments,
opens a module, reads the mechanism while the figure sits inside the same ruled
field, drags a cursor and watches the number agree with the formula, then drills
cards and takes the quiz — each state change marked on the display rather than
announced by a toast.

**FIRST VIEWPORT** The full viewport is one lit graticule filling edge to edge. A
live waveform traces across it on load — the course's signature signal — with
measurement cursors already placed. Top-left, a labelled instrument header names
the surface and shows module count and study progress as readout numerals;
top-right, a control cluster for sheet/theme. Down the left edge, a vertical rail
of module designators acts as the selector. The primary action — enter Module 01 —
sits inside the display, anchored to the trace, not floating in a hero card.

**FORM** Grounded candidate 1 of my ordered list ("Oscilloscope phosphor bench"),
family: instrument. Seed key `dff4ac59`. The roll assigned candidate 3 and the
user overrode it explicitly, which beats the roll. Raises carried from declined
challengers: state-as-mark for progress, hand-drawn leader-arrow annotation on
the real figures, literal labelling set square on the grid, and honest figures
committed to the display rather than decorated.

**FINISH** unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.

## Unresolved decisions

- Whether additional courses beyond NSCOM03 are ever added (out of scope now, but
  the module rail must not hard-code ten).
