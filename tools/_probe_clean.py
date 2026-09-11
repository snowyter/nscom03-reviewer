#!/usr/bin/env python3
"""Erase the decorative character + title-page attribution from lecture pages.

The problem
-----------
Every page of these decks carries chrome the study-reviewer must not show:

  * a decorative anime character, stamped at the page's bottom-right on content
    pages and at the bottom-left on title pages (where it is drawn on top of the
    deck's coloured wedge artwork);
  * on title pages only, a date and a "Prepared by: <name>" block bottom-right.

Both sit on a cream-to-white background.  Painting a rectangle of sampled
background colour was tried and is wrong: the page tone drifts, and on title
pages the character overlaps the deck's own coloured artwork, so no single fill
colour is right everywhere.  It left a visible flat block.

Approach
--------
The chrome is removed per-pixel, and each removed pixel is refilled from the real
pixels around it, so gradients, wedges and the cream wash all come back:

  * The right-hand character is a FIXED STAMP -- the same illustration at the
    same offsets on every page it appears (verified across pages at IoU 0.99).
    Its silhouette is therefore derived once and shipped as
    ``_character_mask_right.npy`` next to this module.  Using the stamp's exact
    shape is what guarantees a diagram's connector line or a line of body text
    is never clipped: they are simply not part of the silhouette.

  * The left-hand character is not separable the same way (it is fused into the
    wedge artwork), so it is segmented from the page and its hole is filled
    along the artwork's own stripe direction, whose slope is measured from the
    visible wedge above the character (about 1px in x per 5px in y).

  * The attribution block is located from its own ink in two narrow row bands
    and cleared only there, so a page without the stamp is untouched and the
    character sharing that corner is not eaten.

  * The ladder band down the left edge is protected by matching its own palette
    rather than by a column rule, because the band is a tapering diagonal wedge
    that is absent at some rows the character's hair covers.
"""
from __future__ import annotations

import pathlib

import numpy as np
from PIL import Image

# ---------------------------------------------------------------- geometry ---

LADDER_X = 36                  # nominal width of the ladder band at the left edge
_BAND_COLOURS = np.array([     # the ladder band / wedge palette
    [194, 205, 74], [40, 147, 126], [132, 185, 98],
    [163, 193, 84], [73, 167, 123], [94, 177, 138],
])
_WEDGE_SLOPE = 5.0             # wedge stripes: 1px in x per 5px in y (measured)

# The right-hand character stamp: bounding box on a 1467x825 page, and the
# packed silhouette bitmap shipped beside this file.
SIL_RIGHT = {
    "path": "_character_mask_right.npy",
    "x0": 1287,
    "y0": 630,
    "x1": 1467,
    "h": 195,
    "w": 180,
}


def _ink(a: np.ndarray, bg: np.ndarray, thresh: int = 55) -> np.ndarray:
    """Boolean mask of pixels that differ from the page background."""
    return np.abs(a.astype(int) - bg).sum(axis=2) > thresh


def _bg_colour(a: np.ndarray) -> np.ndarray:
    """Median colour of a column strip known to be empty page background.

    x 1400..1460 is empty on every 1467-wide page checked (including the title
    page) and is far from the ladder band and the footer chrome.
    """
    W = a.shape[1]
    x0, x1 = min(1400, W - 1), min(1460, W)
    return np.median(a[:, x0:x1].reshape(-1, 3), axis=0).astype(int)


def _band_mask(a: np.ndarray) -> np.ndarray:
    """True where a pixel matches the ladder band / wedge palette."""
    sub = a[:, :LADDER_X + 8].astype(int)
    out = np.zeros(sub.shape[:2], bool)
    for bc in _BAND_COLOURS:
        out |= np.abs(sub - bc).sum(axis=2) < 45
    return out


def _load_silhouette() -> np.ndarray | None:
    """The right-hand character's packed silhouette, or None if not shipped."""
    p = pathlib.Path(__file__).with_name(SIL_RIGHT["path"])
    if not p.exists():
        return None
    flat = np.unpackbits(np.load(p)).astype(bool)
    return flat[: SIL_RIGHT["h"] * SIL_RIGHT["w"]].reshape(
        SIL_RIGHT["h"], SIL_RIGHT["w"])


# ------------------------------------------------------------- attribution ---

def _attribution_zone(a: np.ndarray) -> tuple[int, int, int, int]:
    """The (zx, zy, zx_end, zy_end) box the title-page stamp can occupy."""
    H, W, _ = a.shape
    return int(W * 0.78), int(H * 0.915), W, min(H, int(H * 0.915) + 70)


def _looks_like_stamp(zone: np.ndarray) -> bool:
    """Distinguish the thin grey stamp from the solid, tinted illustration."""
    bg = np.array([253, 248, 225])
    if _ink(zone, bg, thresh=20).sum() < 40:
        return False
    if (zone.sum(axis=2) < 300).mean() > 0.02:           # large solid dark fills
        return False
    if (zone.max(axis=2) - zone.min(axis=2) > 60).mean() > 0.05:   # saturated
        return False
    return True


def has_attribution(a: np.ndarray) -> bool:
    """True when the page carries the title-page 'Prepared by:' stamp."""
    zx, zy, zxe, zye = _attribution_zone(a)
    return _looks_like_stamp(a[zy:zye, zx:zxe])


def _clear_paper_chrome(a: np.ndarray) -> np.ndarray:
    """Erase the author block and IEEE notice from a published paper page.

    Module 10 is an IEEE paper, not a lecture deck, so its chrome is different:

      * p001 carries the title (kept), then the author line, affiliation and
        email directly beneath it (removed). Measured on the 935x1210 render:
        title y~82..93, authors y~101..112, affiliation y~119..147,
        email y~155..164; the abstract starts at y~195.
      * p002 is a continuation page: no title and no authors, so its head is left
        alone.
      * Both pages carry the IEEE copyright notice in the footer (y~1169..1197),
        which is removed.

    The head is cut to y=172 (below the email, above the abstract) only when the
    author block is actually detected, so a continuation page is not damaged.
    The footer is cut below the last body line at y=1165.
    """
    import numpy as np

    H, W, _ = a.shape
    if (W, H) != (935, 1210):
        return a

    out = a.copy()
    bg = np.array([255, 255, 255])
    # a page carries the author block if rows 101..164 hold real ink across the
    # middle of the page (the title above it is a separate, narrower band)
    head = a[98:168, int(W * 0.15):int(W * 0.85)]
    if _ink(head, bg, thresh=60).sum() > 3000:
        # Clear from just below the title (which ends ~y93) down to above the
        # abstract (~y195). Clearing from y=0 also removed the paper title, which
        # is real content.
        out[98:172, :] = bg
    out[1165:, :] = bg
    return out


def _clear_attribution(a: np.ndarray) -> np.ndarray:
    """Erase the date + 'Prepared by:' block AND the content-page footer.

    Two different pieces of text share this corner across the decks:

    * The title-page stamp: 'Prepared by: <name>' (rows ~791..804) above a date
      (~760..771) at x 1172..1362.
    * The content-page footer on the 1467x825 decks: a date bottom-left
      (x ~112..186) and the course line bottom-centre (x ~586..879), both around
      rows 806..820.  m01/m02 carry it on every content page; m03/m07/m08/m09
      only on title and end pages.  It is cleared wherever it is found, so pages
      without it are untouched.

    Each ink band is found from its own pixels and filled from the local row
    background, so the cream-to-white gradient is preserved and no flat patch
    appears.
    """
    H, W, _ = a.shape
    out = a.copy()

    # --- title-page stamp (top of this corner) -----------------------------
    # Evaluated against `a`, the raw page, before anything is cleared. Tests must
    # never run on already-cleared pixels: the footer band below overlaps the
    # stamp, so clearing first makes the stamp undetectable.
    zx, zy, zxe, zye = _attribution_zone(a)
    stamp_here = _looks_like_stamp(a[zy:zye, zx:zxe])
    if stamp_here:
        out = _clear_bands(out, zy, zye, zx, W)

    # --- content-page footer, full width -------------------------------------
    # The band sits below the last body content on these decks, so text inside it
    # is chrome by construction. On a title page the stamp occupies this same
    # band, and it is already handled above, so the footer pass is skipped there
    # to avoid re-clearing a region whose fill would be sampled from cleared
    # pixels.
    if (W, H) == (1467, 825) and not stamp_here:
        # The footer chrome occupies TWO narrow column zones, not the full width:
        # the date at x ~112..186 and the course line at x ~586..879, both within
        # rows 808..818.  Body text on a full slide reaches into the same rows at
        # x > 950 (a bullet's last words), so clearing the whole width sliced the
        # tail off paragraphs -- it cut the word "are" off a bullet.
        #
        # Clearing only the chrome's own columns is what makes this safe: nothing
        # else is typeset in those two zones on these decks.
        for (cx0, cx1) in ((60, 300), (520, 940)):
            out = _clear_bands(out, 806, H, cx0, cx1, drop_thresh=30)

    return out


def _clear_bands(a: np.ndarray, y_top: int, y_bot: int,
                 x_left: int, x_right: int,
                 drop_thresh: int = 20) -> np.ndarray:
    """Clear every ink band inside a row window, filling from local background."""
    H, W, _ = a.shape
    bg = np.array([253, 248, 225])
    zone = a[y_top:y_bot, x_left:x_right]
    ink = _ink(zone, bg, thresh=drop_thresh)
    if not ink.any():
        return a

    rows = np.where(ink.any(axis=1))[0]
    bands: list[tuple[int, int]] = []
    start = prev = int(rows[0])
    for r in rows[1:]:
        if r - prev > 4:
            bands.append((start, prev))
            start = int(r)
        prev = int(r)
    bands.append((start, prev))

    out = a
    for r0, r1 in bands:
        y0 = max(0, y_top + r0 - 2)
        y1 = min(H, y_top + r1 + 3)
        sub = _ink(out[y0:y1, x_left:x_right], bg, thresh=drop_thresh)
        if not sub.any():
            continue
        cols = np.where(sub.any(axis=0))[0]
        x0 = max(x_left, x_left + int(cols.min()) - 3)
        x1 = min(x_right, x_left + int(cols.max()) + 4)
        m = np.zeros((H, W), bool)
        band_ink = _ink(out[y0:y1, x0:x1], bg, thresh=max(12, drop_thresh - 4))
        band_ink[1:, :] |= band_ink[:-1, :]        # 1px vertical dilation for AA
        band_ink[:-1, :] |= band_ink[1:, :]
        m[y0:y1, x0:x1] = band_ink
        out = _fill(out, m)
    return out


# ---------------------------------------------------------- character (left) --

def _find_left_character(a: np.ndarray, bg: np.ndarray) -> tuple[int, int, int]:
    """Bounding box of the bottom-anchored illustration at the page's left edge.

    Walks up from the bottom row while the corner band keeps carrying ink, so
    body text or a diagram stroke that merely shares the corner is not included.
    """
    H, _ = a.shape[:2]
    ink = _ink(a, bg, thresh=25)
    x_lo, x_hi = 0, 360
    band = ink[:, x_lo:x_hi]
    row_has = band.any(axis=1)
    max_reach = int(H * 0.45)
    y = H - 1
    if not row_has[y]:
        return 0, 0, 0
    gap = 0
    while y > H - max_reach:
        if row_has[y - 1]:
            gap = 0
        else:
            gap += 1
            if gap > 3:
                break
        y -= 1
    y_top = max(0, y - 12)          # step back over the antialiased hair top

    span = ink[y_top:, x_lo:x_hi]
    height = span.shape[0]
    col_hits = span.sum(axis=0)
    live = np.where(col_hits >= max(3, int(height * 0.12)))[0]
    if not len(live):
        return 0, 0, 0
    return 0, int(live.max()) + x_lo + 1, y_top


def _left_mask(a: np.ndarray, x1: int, y_top: int, bg: np.ndarray) -> np.ndarray:
    """Per-pixel mask of the left-hand illustration.

    The mask is the ink connected to the page-bottom edge, grown a few pixels so
    the illustration's pale interior joins it.  Restricting to the bottom-
    connected component is what keeps the deck's wedge artwork -- which shares
    every row -- from being swept in.
    """
    from collections import deque

    H, W, _ = a.shape
    if x1 <= 0:
        return np.zeros((H, W), bool)
    box = a[y_top:H, :x1]
    ink = _ink(box, bg, thresh=25)
    h, w = ink.shape[:2]

    char = np.zeros((h, w), bool)
    dq: deque = deque()
    for x in range(w):
        if ink[h - 1, x]:
            char[h - 1, x] = True
            dq.append((h - 1, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and ink[ny, nx] and not char[ny, nx]:
                char[ny, nx] = True
                dq.append((ny, nx))

    # Grow into neighbouring ink so blush, glasses and eye whites are included,
    # never seeding from the box's own top/left edges.
    for _ in range(3):
        g = char.copy()
        g[1:, :] |= char[:-1, :]
        g[:-1, :] |= char[1:, :]
        g[:, 1:] |= char[:, :-1]
        g[:, :-1] |= char[:, 1:]
        g[:2, :] = False
        g[:, :2] = False
        char = g | char
    char = char & (ink | ~_ink(box, bg, thresh=140))

    # keep only the bottom-connected component
    keep = np.zeros_like(char)
    dq = deque()
    for x in range(w):
        if char[h - 1, x]:
            keep[h - 1, x] = True
            dq.append((h - 1, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and char[ny, nx] and not keep[ny, nx]:
                keep[ny, nx] = True
                dq.append((ny, nx))

    full = np.zeros((H, W), bool)
    full[y_top:H, :x1] = keep
    full[:, :LADDER_X + 8] &= ~_band_mask(a)     # the band survives untouched
    return full


# -------------------------------------------------------------------- fill ---

def _fill(a: np.ndarray, mask: np.ndarray,
          slope: float | None = None) -> np.ndarray:
    """Refill masked pixels from the real pixels around them.

    Default: for each masked pixel take the median of the unmasked pixels in its
    own row, blended toward the nearest clean neighbour on either side.  The
    median is what stops a leftover outline from tinting the fill, and reading
    the row means a cream wash or a vertical gradient is tracked -- there is no
    single fill colour anywhere, so no flat rectangle can appear.

    ``slope``: fill along the deck's stripe direction instead.  The wedge stripes
    run about 1px in x per 5px in y, so a masked pixel takes the value of the
    nearest clean pixel up-and-left along its own stripe.  This is what restores
    the title page's yellow and green wedges exactly rather than combing them.
    """
    H, W, _ = a.shape
    out = a.astype(float).copy()
    ys, xs = np.where(mask)
    if not len(ys):
        return out

    if slope is not None:
        done = np.zeros(len(ys), bool)
        for k in range(1, 400):
            if done.all():
                break
            sy = ys - k
            sx = xs - int(round(k / slope))
            ok = (~done) & (sy >= 0) & (sx >= 0)
            if not ok.any():
                continue
            idx = np.where(ok)[0]
            idx = idx[~mask[sy[idx], sx[idx]]]
            if len(idx):
                out[ys[idx], xs[idx]] = a[sy[idx], sx[idx]]
                done[idx] = True
        if done.all():
            return out
        # Anything the stripe walk could not reach falls through to the row fill.
        ys, xs = ys[~done], xs[~done]
        if not len(xs):
            return out

    clean = ~mask
    rows = np.arange(H)
    row_med = np.full((H, 3), np.nan)
    for y in range(H):
        cm = clean[y]
        if cm.sum() >= 6:
            row_med[y] = np.median(a[y][cm], axis=0)
    good = ~np.isnan(row_med[:, 0])
    if not good.any():
        return out
    for c in range(3):
        prof = row_med[:, c]
        prof[~good] = np.interp(rows[~good], rows[good], prof[good])

    for y, x in zip(ys, xs):
        cm = clean[y]
        if not cm.any():
            out[y, x] = row_med[y]
            continue
        left = np.where(cm[:x])[0]
        right = np.where(cm[x:])[0]
        cands = []
        if len(left):
            cands.append(a[y, left[-1]].astype(float))
        if len(right):
            cands.append(a[y, x + right[0]].astype(float))
        if cands:
            out[y, x] = np.mean(cands, axis=0)
        else:
            out[y, x] = row_med[y]
    return out


# ------------------------------------------------------------------- entry ---

def clean_slide(src_path: str, dst_path: str) -> tuple[int, int]:
    """Erase the decorative character and the attribution from one slide page.

    Returns the output image size.  The ladder band down the left edge is left
    untouched except where the illustration itself covers it.
    """
    im = Image.open(src_path).convert("RGB")
    a = np.asarray(im).copy()
    H, W, _ = a.shape

    # Module 10 is a published paper with its own chrome shape.
    if (W, H) == (935, 1210):
        out = Image.fromarray(_clear_paper_chrome(a).astype(np.uint8))
        out.save(dst_path)
        return out.size

    # The stamp identifies a title page, so the test must run on the RAW page.
    # Clearing first destroys the stamp's own ink (the footer band overlaps it),
    # which silently disabled the left-hand character branch -- the title-page
    # character came back and "Prepared by:" reappeared.
    is_title = has_attribution(a)
    a = _clear_attribution(a)

    bg = _bg_colour(a)

    # --- right-hand character: use the exact stamp silhouette ---------------
    sil = _load_silhouette()
    x0, y0, x1 = SIL_RIGHT["x0"], SIL_RIGHT["y0"], SIL_RIGHT["x1"]
    if sil is not None and x1 <= W and y0 + sil.shape[0] <= H:
        region = a[y0:y0 + sil.shape[0], x0:x1]
        if _ink(region, bg, thresh=25).sum() > 1500:     # the stamp is present
            mask = np.zeros((H, W), bool)
            mask[y0:y0 + sil.shape[0], x0:x1] = sil
            a = _fill(a, mask).astype(np.uint8)

    # --- left-hand character: title pages only -----------------------------
    if is_title:
        x1, y_top = _find_left_character(a, bg)[1:]
        if x1 > 80:
            mask = _left_mask(a, x1, y_top, bg)
            if mask.sum() >= 2000:
                a = _fill(a, mask, slope=_WEDGE_SLOPE).astype(np.uint8)

    out = Image.fromarray(a.astype(np.uint8))
    out.save(dst_path)
    return out.size


if __name__ == "__main__":
    import sys

    pages = pathlib.Path.home() / "academics" / "nscom_pages"
    args = sys.argv[1:] or [str(p) for p in sorted(pages.glob("*.png"))[:3]]
    for f in args:
        p = pathlib.Path(f)
        dst = "/tmp/probe-" + p.name
        size = clean_slide(str(p), dst)
        print(f"{p.name} -> {dst} {size}")
