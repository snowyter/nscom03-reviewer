# NSCOM03 — Instrument Bench Reviewer

An interactive study reviewer for **NSCOM03 Data Communications**, built from the
course's own lecture material. Static site, no build step, no backend.

## What's inside

- **10 modules** covering every source document, including the standalone
  microwave-oven interference paper.
- **139 sections** of lesson content — the slides' own material plus labelled
  additive depth (derivations, worked examples, exam framing).
- **304 flashcards** with Leitner-style scheduling and local progress.
- **220 quiz questions** with per-answer explanations and a jump-link back to the
  section that teaches each one.
- **5 interactive simulators**: CRC long division (step by step), line-coding
  waveforms, ASK/FSK/PSK/QAM, Nyquist & Shannon limits, and FDM/WDM/TDM.
- **258 slide figures** extracted from the course's own PDFs.

## Using it

Open the site and pick a module from the channel rail. Each module has a lesson
(read it, marking sections as you go), a drill deck, and a quiz. Progress is
stored in your browser's localStorage — nothing leaves your device.

Keyboard: `space` flips a flashcard, `1`/`2` grade it, `Esc` closes an enlarged
figure.

## Running locally

Any static server works:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly also works.

## Development

```bash
node --test test/          # 11 tests: schema, content, figures, boot, routing
node tools/figures.py      # rebuild slide figures (needs the source PDFs)
```

Content lives in `js/data/m01.js` … `m10.js`; the shape is documented in
`SCHEMA.md`. Design tokens and rules are in `DESIGN.md`.

## Sourcing

Lesson content is faithful to the NSCOM03 lecture slides. Depth beyond the slides
follows standard data-communications theory and is labelled as additive
throughout — it is never attributed to the lecturer. Figure captions and slide
numbers come from the source PDFs.
