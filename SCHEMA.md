# Content Schema (v1)

Every module is one JS file at `js/data/<id>.js`. It seeds the registry and pushes
its payload exactly once:

```js
window.NSCOM_MODULES = window.NSCOM_MODULES || [];
window.NSCOM_MODULES.push({ /* module object */ });
```

The file must push **exactly one** module object — no appends, no second write.
(The validator loads each file in a sandbox and asserts the registry grew by
exactly 1, which is a real check; a text-level count of the string
`window.NSCOM_MODULES` would wrongly flag the idiomatic two-line form above, in
which that name legitimately appears twice. Write the readable form.)

All HTML strings use **backtick template literals**. Never double quotes — SVG
attributes contain raw `"`, which breaks a double-quoted JS string.

## Module object

| field | type | rule |
|---|---|---|
| `id` | string | `m01`…`m10` |
| `num` | number | 1…10, matches `id` |
| `title` | string | display title |
| `icon` | string | inline SVG markup, unique across modules |
| `accent` | string | `#rrggbb`, unique across modules |
| `summary` | string | one paragraph, ≥80 chars |
| `sections` | array | ≥6 sections |
| `flashcards` | array | ≥12 cards |
| `quiz` | array | ≥10 questions |

## Section

```js
{ id: "s1", title: "Line Coding", body: [ /* blocks */ ] }
```

`id` unique within module. `title` non-empty.

## Block types

| `type` | required fields | notes |
|---|---|---|
| `p` | `text` | prose paragraph, ≥120 chars |
| `h3` | `text` | sub-heading |
| `list` | `items` (array of strings) | ≥2 items |
| `table` | `head` (array), `rows` (array of arrays) | non-empty |
| `fig` | `fig` (figure id from figs.json) | optional `caption` overrides the figure's own |
| `formula` | `tex` (string), `text` (plain-English reading) | |
| `note` | `text` | callout / exam tip |
| `example` | `text`, optional `steps` (array) | worked example |

## Flashcard

```js
{ q: "What does NRZ-I guarantee?", a: "A transition at every 1 bit…", sec: "s1" }
```

`sec` must resolve to a section `id` in the same module.

## Quiz question

```js
{ q: "…", choices: ["a","b","c","d"], answer: 2, why: "…", sec: "s1" }
```

- exactly 4 `choices`
- `answer` is an integer 0…3 pointing at the correct choice
- `why` explains the reasoning, ≥30 chars
- `sec` resolves to a section `id`

## Depth requirement

Slides + deep textbook expansion. Each section must carry the slide's own
content **and** additive depth (derivations, worked examples, extra examples)
grounded in standard data-communications theory. Depth must be labelled as
additive, never attributed to the professor.

## Accuracy rules

- Never fabricate quiz answers, exam questions, grades, or professor quotes.
- Numeric examples must be arithmetically correct — verify formulas
  independently in Python before shipping.
