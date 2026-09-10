# Design

<!-- impeccable:design-schema 1 -->

## World

**Oscilloscope phosphor bench.** The surface is the instrument that reads the
subject's own signals. Chosen explicitly by the user over the roll's assigned
direction and over the copy-shop-zine alternate. See
`.impeccable/surfaces/index.md` for the direction contract.

The subject is data communications: every topic in this course — line coding,
modulation, multiplexed frames, MAC timing — is literally what an oscilloscope
displays. The reviewer therefore takes the instrument's form rather than a
document's.

## Tokens

Defined in `css/base.css` under `:root` (phosphor) and `[data-theme="beam"]`
(light).

### Colour — committed, two themes

Phosphor (default, committed world):

| role | value | use |
|---|---|---|
| `--ground` | `#0a1410` | page ground |
| `--ground-2` | `#0d1a15` | panels, rail, header |
| `--rule` | `#1c4a3a` | structural hairlines |
| `--rule-soft` | `#143127` | secondary rules, row separators |
| `--trace` | `#7dffb2` | the active signal: links, headings, progress, focus |
| `--trace-dim` | `#3d8f66` | resting trace, spine nodes |
| `--amber` | `#ffd166` | readout numerals and measurement chrome only |
| `--ink` | `#cfe8dc` | body text |
| `--ink-dim` | `#7e9d90` | secondary text |
| `--ink-faint` | `#4d6b5e` | labels, captions |
| `--warn` | `#ff7b6b` | wrong quiz answers |
| `--grid` | `rgba(28,74,58,.55)` | graticule rulings |

Beam (opt-in light theme): vellum ground `#f4f1e6`, ink `#1d2b24`, deep green
trace `#17603f`, brown-amber `#8a5a00`. Same instrument, under a bench lamp.
Theme is a stored preference, never a system-default flip.

Amber is reserved: it marks *measured values* (readouts, progress counts, section
numbers). Using it for decoration would break the instrument's own grammar.

### Type

Two families, both system stacks — no webfonts, so the page opens instantly and
works offline.

- `--mono`: `ui-monospace, SFMono-Regular, IBM Plex Mono, Cascadia Mono, Menlo,
  Consolas, monospace` — headings, readouts, labels, quizzes, tables, section
  numbers. Carries the instrument's character.
- `--sans`: `Helvetica Neue, Helvetica, Arial, ui-sans-serif, system-ui` — prose
  only, where reading comfort beats character.

Scale: title `clamp(1.5rem, 3.4vw, 2.5rem)`, section title
`clamp(1.02rem, 1.8vw, 1.3rem)`, body 15.2px (0.95rem). Labels are 0.55–0.7rem
mono at 0.12–0.18em tracking, uppercase.

Measure: `--measure: 66ch` (≈557px at body size, 66–73 characters per line).

### Spacing and shape

`--pad: clamp(0.9rem, 2.2vw, 1.6rem)`, `--rail: 15.5rem`, `--head: 3.9rem`.
Radii are `2px` everywhere except the circle spine nodes and LEDs — this is
instrument panel, not soft app UI. **No shadows, no glass, no blur, no rounded
pills, no gradients as decoration.**

## Components

- **Bench header** (`.bench`): sticky instrument face. Identity mark, three
  readout cells (modules / percent read / cards due) in amber tabular numerals,
  and a theme control with an LED indicator.
- **Channel rail** (`.rail`): numbered module selector. Active entry takes a
  trace-green left border and amber numeral; completed entries take a struck ✓
  — state as a mark, not a hue. Off-canvas below 900px, toggled by the header.
- **Scope** (`.scope`): the display. Two graticule layers (40px fine, 200px
  coarse, top-masked) and a square-edged hero signal trace that fades out before
  content begins.
- **Section spine** (`.sec`): one unbroken ruled line down the lesson with a
  tapped node per section; the node fills solid when read. Sections are a
  continuous signal path, never stacked cards.
- **Blocks**: `p`, `h3` (uppercase mono sub-head), `list`, `table` (mono, amber
  caps headers), `fig` (framed, captioned, slide-numbered, click to enlarge),
  `formula` (amber expression + plain-English reading), `note` (amber-ruled exam
  callout), `example` (trace-ruled worked example with numbered steps).
- **Card** (`.card`): the flashcard — full-width flip surface with a face label,
  section reference, and two grade controls that stay disabled until revealed.
- **Question** (`.q`): quiz item. Options are instrument keys (a/b/c/d); correct
  takes trace green, chosen-wrong takes warn; explanation carries a jump link
  back to the section that teaches it.
- **Simulator** (`.sim`): framed instrument. Control row, SVG display, and a
  `.readout` grid of amber tabular values with the formula each came from.
- **Readout grid** (`.readout`): `dt` label in faint caps, `dd` value in amber
  mono, optional `small` naming the formula.

## Motion

Deliberately minimal, because this is a *Read* surface. Transitions are 0.18s on
interactive borders and the off-canvas rail only. The multiplexing simulator's
channel highlight advances on a 900ms interval, and the hero trace is drawn once
on boot. Everything is disabled under `prefers-reduced-motion: reduce`.

## Math rendering

`js/math.js` is a small dependency-free LaTeX-subset renderer. The site must work
offline and deploy with no build step, so a full math library is not an option;
this covers exactly the constructs the content uses — `\frac`/`\dfrac`/`\tfrac`
(as a real stacked fraction with a rule), sub/superscripts, `\sqrt`,
`\overline`, `\underbrace`/`\overbrace` with labels, `\text`, `\begin{cases}`
(piecewise, with a brace rule), sizing delimiters (`\left`/`\right`), spacing
macros, and the Greek/operator symbol set.

Elements: `.fx` wraps the expression; `.mx-frac`/`.mx-num`/`.mx-den` build
fractions, `.mx-sub`/`.mx-sup` scripts, `.mx-cases`/`.mx-case` piecewise
definitions, `.mx-i` italic variables, `.mx-t` upright words, `.mx-op` operators.
Unsupported macros are rendered as visible text rather than dropped, so nothing
silently disappears. A test asserts that no formula block's rendered output
contains a leftover `\macro`.

## Accessibility

Body text and headings clear 4.5:1 on both grounds. Focus is a 2px amber outline
with offset, never removed. A skip link precedes the header. Every figure carries
alt text that names the module and describes the diagram (not just the slide
title). The quiz and drill are fully keyboard operable (space to flip, 1/2 to
grade). The rail is a real `<nav>` with `aria-current` on the active entry, and
the theme toggle is `aria-pressed`. The figure lightbox is `role="dialog"` with
`aria-modal`, traps Tab, closes on Escape, and returns focus to the figure that
opened it. No information is conveyed by colour alone — progress uses marks,
filled nodes, and numerals as well as hue.

## Study state

Progress lives in `localStorage` under `nscom03.state.v1`. Section read state is
keyed `moduleId/sectionId` (`"m06/s1"`), because bare section ids are only unique
within a module — every module has `s1`…`s16`, so keying by the bare id made one
module's progress mark the same-numbered section of all ten. Reading progress is
reversible (per-section toggle and a global "clear all progress" control); global
reset requires confirmation.

Cards use Leitner boxes with 0/1/2/4/8/16-day intervals; quiz records keep the
best score and the list of missed question indices.

## Provenance of rasters

The only rasters are the 258 slide figures under `assets/figs/`, all produced
from the course's own PDFs by `tools/figures.py` (render → trim → WebP q82,
max 1400px). No generated or stock imagery ships. Figure captions and slide
numbers are derived from the source PDFs.
