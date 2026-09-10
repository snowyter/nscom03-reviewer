# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML/CSS/vanilla JS, no build step — required for GitHub Pages hosting and
because the previous wiped build proved a zero-dependency static site deploys
reliably and loads fast on a phone.

## Users

DLSU students enrolled in NSCOM03 (Data Communications), primarily one student
(Kryster, section S40C) studying for quizzes and exams, usually on a laptop or
phone, often the night before an assessment. Job: understand the module topics
well enough to answer exam questions and complete lab/paper requirements.

## Product Purpose

A study reviewer that covers all 10 NSCOM03 source documents (9 numbered modules
plus a standalone microwave-interference research paper) in depth, so the student
can read, drill, and self-test from one place instead of re-scanning slide decks.
Success: the student can find any topic, understand it better than the slides
alone allowed, and test recall without opening Canvas.

## Positioning

It is the only study surface built from *this* course's actual lecture PDFs and
figures — the prof's own diagrams, terminology, and slide wording — rather than a
generic networking textbook. Depth beyond the slides is additive and clearly
grounded in standard data-communications theory (Forouzan's framework, which the
slides follow).

## Operating Context

Source material lives in Canvas course 264442 at `dlsu.instructure.com`, already
downloaded to `~/academics/nscom_pdfs` (10 PDFs) with extracted text in
`~/academics/nscom_txt` and 285 rendered figure pages in
`~/academics/nscom_pages`. Topics follow the Forouzan ordering: physical layer
(signals, digital transmission, analog conversion, multiplexing), error detection,
media access control, and data-link protocols for LAN/WAN.

## Capabilities and Constraints

Confirmed capabilities: per-module detailed lessons, flashcards, multiple-choice
quizzes, and interactive simulators (CRC calculator, line coding, modulation,
Nyquist/Shannon, multiplexing). Static site, no backend, no login, no analytics.
Must deploy to GitHub Pages. Content must be accurate to the source slides and
must not fabricate exam content, grades, or claims by the professor.

Explicitly undecided: whether any additional courses beyond NSCOM03 are added.

## Brand Commitments

None. No existing logo, palette, or identity. Free to establish a visual world.

## Evidence on Hand

- 10 source PDFs: `~/academics/nscom_pdfs/` (NSCOM03-01 … NSCOM03-09, plus
  `Microwave_Interference.pdf`)
- Extracted page text: `~/academics/nscom_txt/` (10 `.txt`, `===== [PAGE n] =====`
  delimited)
- 285 rendered figure pages at 110 dpi: `~/academics/nscom_pages/` with
  `~/academics/nscom_page_manifest.json` recording per-page char/figure counts
- Course/module/file metadata: `~/academics/nscom_courses.json`,
  `nscom_modules.json`, `nscom_files.json`

No student data, no exam archives, no professor endorsements — none may be
invented.

## Product Principles

1. Faithful first: the prof's slides are the authority; added depth is labelled and
   never contradicts the source.
2. Show the real figure: use the actual rendered slide diagrams, not redrawn
   approximations, wherever a diagram teaches the concept.
3. Retrieval over rereading: every module carries flashcards and a quiz so the
   student tests recall rather than skim-reading.
4. Interactive where it matters: abstract maths (CRC, line coding, modulation)
   becomes manipulable, because those are the exam topics students get wrong.
5. Zero friction: opens instantly on a phone, remembers progress locally, no
   accounts, no backend, works offline once loaded.

## Accessibility & Inclusion

Readable on a phone in one hand at night: dark-capable theme, generous type size,
keyboard-navigable quiz and flashcards, sufficient contrast, and figures with alt
text. No motion that cannot be reduced.
