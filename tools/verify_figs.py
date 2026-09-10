#!/usr/bin/env python3
"""Verify every figure in figs.json exists, is WebP, is non-trivial, and has
dimensions matching the manifest. Exits non-zero on any failure."""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FIGS = json.loads((ROOT / "figs.json").read_text())

fail = []
for f in FIGS:
    p = ROOT / f["path"]
    if not p.exists():
        fail.append(f"missing: {f['path']}")
        continue
    if p.suffix != ".webp":
        fail.append(f"not webp: {f['path']}")
    sz = p.stat().st_size
    if sz < 8000:
        fail.append(f"too small ({sz}B): {f['path']}")
    try:
        from PIL import Image
        with Image.open(p) as im:
            w, h = im.size
        if (w, h) != (f["w"], f["h"]):
            fail.append(f"dim mismatch {w}x{h} != {f['w']}x{f['h']}: {f['path']}")
        if w < 400:
            fail.append(f"too narrow ({w}px): {f['path']}")
    except ImportError:
        pass

# every module must be represented
mods = sorted({f["mod"] for f in FIGS})
expected = [f"m{i:02d}" for i in range(1, 11)]
missing_mods = [m for m in expected if m not in mods]
if missing_mods:
    fail.append(f"modules with no figures: {missing_mods}")

print(f"figures checked: {len(FIGS)}")
print(f"modules: {len(mods)} -> {','.join(mods)}")
if fail:
    print(f"\nFAILURES ({len(fail)}):")
    for x in fail[:40]:
        print("  ", x)
    sys.exit(1)
print("ALL FIGURES OK")
