#!/usr/bin/env python3
"""Strip course chrome from rendered lecture pages before figure extraction.

The decks carry identifying chrome and the crop differs per deck shape AND per
page, so it is set from measurement rather than one percentage:

  m01-m03, m05-m09  (1467x825)
      footer band   the date (bottom-left) and the course/term line (bottom-centre)
      left column   a decorative character that sits in the lower-left on roughly
                    one page in five. 183 of 227 figure pages have no character
                    at all and their left column is empty page, so the column is
                    only cut when a character is actually detected.

  m04               (1618x910)  no chrome; page kept whole.
  m10               (935x1210)  a published paper: author block under the title
                                and the IEEE notice in the footer are both cut.

Why crop and not paint: painting the chrome out leaves a visible notch where the
slide's own side band used to be, which reads as damage. Cropping the band off is
what a person would do by hand.
"""
import pathlib

FOOT_TOP_FRAC = 0.955      # top of the footer chrome band, 1467x825 decks
DECO_MIN_COLS = 60         # a "wide" left column means a character is present
PAPER_HEAD_FRAC = 0.120
PAPER_FOOT_FRAC = 0.950


def detect_decoration(a):
    """Locate the decorative character in the lower corners.

    Returns {"left": cols, "right": cols} where each is the number of columns the
    character occupies at that page edge, or 0 when the corner is clear.

    The character appears bottom-LEFT on title pages and bottom-RIGHT on most
    content pages, where it also covers the slide number, so both corners are
    checked. It is an illustration rather than a solid block: its columns carry
    roughly 25-40% ink, so a per-column density test never fires. Presence plus
    gap tolerance is what actually finds it.
    """
    import numpy as np

    H, W, _ = a.shape
    bg = a[4, W // 2].astype(int)
    ink = np.abs(a.astype(int) - bg).sum(axis=2) > 60
    band = ink[int(H * 0.45):, :]

    def width_from(start, step, max_cols=230):
        cols = 0
        gap = 0
        c = start
        while 0 <= c < W and cols < max_cols:
            if band[:, c].mean() > 0.10:
                cols += 1
                gap = 0
            else:
                gap += 1
                if gap > 12:
                    break
                cols += 1
            c += step
        return max(0, cols - gap)

    left = width_from(0, 1)
    right = width_from(W - 1, -1)
    return {
        "left": left if left > DECO_MIN_COLS else 0,
        "right": right if right > DECO_MIN_COLS else 0,
    }


def clear_attribution_text(a):
    """Erase the date and the course/term line where decks carry them.

    These sit in the footer band, but on title pages the date is at the RIGHT and
    overlaps the vertical range of the title block, so cropping the whole footer
    would cut the title. Clearing the specific footer zones is what actually
    removes them on every page shape.

    Measured on the 1467x825 decks: the date occupies rows ~0.92H..0.975H at the
    right (x > 0.79W), and the course line the same rows across the middle.
    """
    import numpy as np

    H, W, _ = a.shape
    if (W, H) != (1467, 825):
        return a
    out = a.copy()
    ref = a[:, int(W * 0.62)]               # an empty column inside the slide body
    y0 = int(H * FOOT_TOP_FRAC)
    out[y0:H, :] = ref[y0:H, None, :]       # date + course line + baseline
    # title pages also carry a small date higher up on the right
    out[int(H * 0.915):y0, int(W * 0.78):] = ref[int(H * 0.915):y0, None, :]
    return out


def paint_out_character(a):
    """Erase the decorative character in place and return the new array.

    Cropping the character's column is wrong wherever it overlaps a diagram: 30
    pages have a figure sharing that space, and cutting the column decapitates the
    figure. Painting the character's own pixels back to the page background keeps
    every piece of real content.

    The character is the connected blob touching the bottom edge at its corner.
    Its horizontal extent comes from detect_decoration; vertically it runs from
    the first row where that corner band is occupied down to the page bottom.
    """
    import numpy as np
    from PIL import Image  # noqa: F401  (kept for callers that pass an Image)

    H, W, _ = a.shape
    deco = detect_decoration(a)
    if not (deco["left"] or deco["right"]):
        return a, deco

    out = a.copy()
    ref = a[:, int(W * 0.62)]

    for side in ("left", "right"):
        w = deco[side]
        if not w:
            continue
        x0, x1 = (0, w) if side == "left" else (W - w, W)
        # find the character's top: the first row from the bottom where this
        # corner band still holds ink
        colmask = np.abs(a[:, x0:x1].astype(int) - a[4, W // 2].astype(int)).sum(axis=2) > 60
        occupied = colmask.any(axis=1)
        ys = np.where(occupied)[0]
        if not len(ys):
            continue
        y0 = int(ys[0])
        # clear only the character zone, from its top down to the page bottom
        # bleed one row up so the antialiased top edge goes too
        out[max(0, y0 - 1):, x0:x1] = ref[max(0, y0 - 1):, None, :]

    return out, deco


def crop_box(a):
    """Return (left, top, right, bottom) to keep for this page."""
    import numpy as np

    H, W, _ = a.shape
    if (W, H) == (1467, 825):
        # Only the footer band is cropped; the character is painted out instead
        # (see paint_out_character) because on dozens of pages it overlaps a
        # figure that cropping would destroy.
        return (0, 0, W, int(H * FOOT_TOP_FRAC))
    if (W, H) == (1618, 910):
        return (0, 0, W, H)
    if (W, H) == (935, 1210):
        return (0, int(H * PAPER_HEAD_FRAC), W, int(H * PAPER_FOOT_FRAC))
    return (0, 0, W, int(H * 0.985))


def apply(png_src, png_dst, report=None):
    import numpy as np
    from PIL import Image

    im = Image.open(png_src).convert("RGB")
    a = np.asarray(im)
    if a.shape[1] == 1467:
        a = clear_attribution_text(a)
        a, deco = paint_out_character(a)
    else:
        deco = {"left": 0, "right": 0}
    box = crop_box(a)
    out = Image.fromarray(a).crop(box)
    out.save(png_dst)
    if report is not None:
        report.append({"src": str(png_src), "from": im.size, "box": box,
                       "to": out.size, "deco": deco})
    return out.size


if __name__ == "__main__":
    import json
    import sys

    PAGES = pathlib.Path.home() / "academics" / "nscom_pages"
    files = sys.argv[1:] or [str(p) for p in sorted(PAGES.glob("*.png"))]
    rep = []
    for f in files:
        f = pathlib.Path(f)
        dst = pathlib.Path("/tmp") / ("clean-" + f.name)
        apply(f, dst, rep)
    deco_n = sum(1 for r in rep if r["deco"]["left"] or r["deco"]["right"])
    print(f"processed {len(rep)} pages; {deco_n} had a decoration to remove")
    json.dump(rep, open("/tmp/deattr-report.json", "w"), indent=1)
