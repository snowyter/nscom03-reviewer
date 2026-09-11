#!/usr/bin/env python3
"""Diagnose which slide pages carry attribution marks, and where.

The lecture decks stamp identifying chrome on every page:
  - bottom-left:  the date, e.g. "2024-09-06"
  - bottom-centre: the course/term line, e.g. "AY23-24_T2 NSCOM03 Data Communications"
  - bottom-right: a decorative character that also hides the slide number
  - title pages:  "Prepared by: <name>" bottom-right

This script measures, per page, where that chrome sits so the crop used by
figures.py can be set from evidence instead of a guess.
"""
import json
import pathlib
import re
import sys

import numpy as np
from PIL import Image

HOME = pathlib.Path.home()
PAGES = HOME / "academics" / "nscom_pages"
TXT = HOME / "academics" / "nscom_txt"

BG = np.array([250, 247, 235])


def page_size(p):
    with Image.open(p) as im:
        return im.size


def ink_mask(p, thresh=60):
    a = np.asarray(Image.open(p).convert("RGB")).astype(int)
    return np.abs(a - BG).sum(axis=2) > thresh


def footer_rows(mask):
    """Rows in the bottom 12% that contain text-like ink left of x=900."""
    H, W = mask.shape
    y0 = int(H * 0.955)
    rows = []
    for y in range(y0, H):
        n = int(mask[y, 40:900].sum())
        if n > 8:
            rows.append(y)
    return rows


def char_left_edge(mask):
    """Leftmost column of the bottom-right decoration, measured in the bottom
    band only (above that, real content reaches into the same x range)."""
    H, W = mask.shape
    band = mask[int(H * 0.60):, :]
    cols = np.where(band.any(axis=0))[0]
    if not len(cols):
        return None
    # walk in from the right: the decoration is contiguous to the page edge
    right = cols.max()
    left = right
    while left > 0 and band[:, left - 1].sum() > 0:
        left -= 1
    return int(left)


def main():
    pages = sorted(PAGES.glob("*.png"))
    print(f"pages on disk: {len(pages)}")
    sizes = {}
    results = []
    for p in pages:
        w, h = page_size(p)
        sizes[(w, h)] = sizes.get((w, h), 0) + 1
        m = ink_mask(p)
        fr = footer_rows(m)
        cle = char_left_edge(m)
        results.append({
            "file": p.name, "w": w, "h": h,
            "footer_rows": (min(fr), max(fr)) if fr else None,
            "char_left": cle,
        })
    print("page sizes:", sizes)

    withfr = [r for r in results if r["footer_rows"]]
    print(f"pages with a footer band: {len(withfr)} / {len(results)}")
    if withfr:
        y0 = min(r["footer_rows"][0] for r in withfr)
        y1 = max(r["footer_rows"][1] for r in withfr)
        h = withfr[0]["h"]
        print(f"  footer rows span {y0}..{y1}  (page height {h})")
        print(f"  => safe crop bottom = {y0}  ({y0/h:.3%} of height)")

    lefts = [r["char_left"] for r in results if r["char_left"]]
    if lefts:
        lo = min(lefts)
        w = results[0]["w"]
        print(f"decoration left edge: min {lo} (page width {w}) => safe crop right = {lo}")

    out = pathlib.Path("/tmp/fig-crop-diagnosis.json")
    out.write_text(json.dumps(results, indent=1))
    print("wrote", out)


if __name__ == "__main__":
    sys.exit(main())
