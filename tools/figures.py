#!/usr/bin/env python3
"""Extract, trim, and export slide figures as shipping WebP.

Inputs:
  ~/academics/nscom_pages/*.png        (rendered slide pages, 110 dpi)
  ~/academics/nscom_page_manifest.json (per-page char/figure counts)
  ~/academics/nscom_txt/*.txt          (page-delimited extracted text)

Outputs:
  assets/figs/<mod>/<slug>.webp
  figs.json
"""
import json
import pathlib
import re
import shutil
import subprocess
import sys

HOME = pathlib.Path.home()
PAGES = HOME / "academics" / "nscom_pages"
TXT = HOME / "academics" / "nscom_txt"
ROOT = HOME / "nscom03-reviewer"
FIXT = ROOT / "assets" / "figs"

# module key -> (id, display title, source txt stem, page png stem prefix)
MODULES = [
    ("m01", "Review of Physical and Data Link Layer", "NSCOM03-01 Review of Physical and Data Link Layer", "NSCOM03_01_Review_of_Physical_and_Data_Link_Layer"),
    ("m02", "Physical Communication Layer", "NSCOM03-02 Physical Communication Layer", "NSCOM03_02_Physical_Communication_Layer"),
    ("m03", "Physical Layer - Digital Transmission", "NSCOM03-03 Physical Communication Layer - Digital Transmission", "NSCOM03_03_Physical_Communication_Layer___Digital_Transmission"),
    ("m04", "Physical Layer - Digital to Analog", "NSCOM03-04 Physical Communication Layer - Digital to Analog Transmission", "NSCOM03_04_Physical_Communication_Layer___Digital_to_Analog_Transmission"),
    ("m05", "Physical Layer - Multiplexing", "NSCOM03-05 Physical Layer - Multiplexing", "NSCOM03_05_Physical_Layer_Multiplexing"),
    ("m06", "Error Detection", "NSCOM03-06 Error Detection", "NSCOM03_06_Error_Detection"),
    ("m07", "Media Access Control", "NSCOM03-07 Media Access Control", "NSCOM03_07_Media_Access_Control"),
    ("m08", "Data Link Protocols - LAN", "NSCOM03-08 Data Link Protcols -LAN", "NSCOM03_08_Data_Link_Protcols__LAN"),
    ("m09", "Data Link Protocols - WAN", "NSCOM03-09 Data Link Protcols - WANs", "NSCOM03_09_Data_Link_Protcols___WANs"),
    ("m10", "Microwave Interference", "Microwave_Interference", "Microwave_Interference"),
]

# Slides that teach nothing: titles, agendas, thank-yous, section dividers.
DROP_TITLE = re.compile(
    r"^(prepared by|review of|physical communication|physical layer|error detection|"
    r"media access control|data link|digital transmission|digital to analog|multiplexing|"
    r"microwave|introduction to|chapter|outline|agenda|thank|questions\?*$|references|"
    r"any questions)", re.I)


def parse_pages(txt_path):
    """Return {page_no: page_text}."""
    raw = txt_path.read_text(errors="replace")
    parts = re.split(r"===== \[PAGE (\d+)\] =====", raw)
    out = {}
    for i in range(1, len(parts) - 1, 2):
        out[int(parts[i])] = parts[i + 1].strip()
    return out


def slugify(s, maxlen=48):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:maxlen].rstrip("-") or "figure"


def heading_for(page_text, fallback):
    """First substantive line of the slide is its heading."""
    for line in page_text.splitlines():
        line = line.strip()
        if len(line) < 3:
            continue
        if re.match(r"^(20\d\d-\d\d-\d\d|AY\d\d)", line):
            continue
        if re.match(r"^(NSCOM03|Data Communications|Prepared by)", line, re.I):
            continue
        return line
    return fallback


def trim_uniform_border(png, dst):
    """Trim uniform margins using PIL-free numpy if available, else copy."""
    try:
        import numpy as np
        from PIL import Image
    except ImportError:
        shutil.copy(png, dst)
        return
    im = Image.open(png).convert("RGB")
    a = np.asarray(im)
    # A row/col is uniform if its stddev across channels is tiny.
    rowstd = a.std(axis=(1, 2))
    colstd = a.std(axis=(0, 2))
    rows = np.where(rowstd > 6)[0]
    cols = np.where(colstd > 6)[0]
    if len(rows) == 0 or len(cols) == 0:
        shutil.copy(png, dst)
        return
    pad = 14
    y0, y1 = max(0, rows[0] - pad), min(a.shape[0], rows[-1] + pad)
    x0, x1 = max(0, cols[0] - pad), min(a.shape[1], cols[-1] + pad)
    # Keep the slide's own aspect reasonably intact; don't crop to a sliver.
    if (y1 - y0) < 120 or (x1 - x0) < 200:
        shutil.copy(png, dst)
        return
    im.crop((x0, y0, x1, y1)).save(dst)


def convert_webp(src, dst, maxw=1400, q=82):
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
           "-vf", f"scale='min({maxw},iw)':-2", "-quality", str(q), str(dst)]
    r = subprocess.run(cmd, capture_output=True)
    return r.returncode == 0


def main():
    manifest = json.loads((HOME / "academics" / "nscom_page_manifest.json").read_text())
    # The manifest key is the exported prefix, truncated by the renderer.
    # Derive the mapping from the actual files on disk, not from re-slugifying
    # the pdf name (the renderer truncated that key to 40 chars).
    disk_prefixes = sorted({p.name.rsplit("_p", 1)[0]
                            for p in PAGES.glob("*.png")})
    disk_prefixes = [x for x in disk_prefixes if x]

    by_prefix = {}
    for pdfname, pages in manifest.items():
        want = re.sub(r"[^A-Za-z0-9]+", "_", pathlib.Path(pdfname).stem)
        hit = None
        for cand in disk_prefixes:
            if cand == want or want.startswith(cand) or cand.startswith(want[:38]):
                # prefer the longest match that actually owns figure pages
                if hit is None or len(cand) > len(hit):
                    hit = cand
        if hit:
            by_prefix[hit] = pages
        else:
            print(f"!! could not map manifest key for {pdfname}", file=sys.stderr)

    figs = []
    scratch = ROOT / "_scratch"
    scratch.mkdir(exist_ok=True)

    for mod, title, txtstem, pngstem in MODULES:
        txt_path = TXT / f"{txtstem}.txt"
        if not txt_path.exists():
            print(f"!! missing txt {txt_path}", file=sys.stderr)
            continue
        pages_txt = parse_pages(txt_path)
        pages_meta = by_prefix.get(pngstem)
        if pages_meta is None:
            # fall back: find the disk prefix that matches this module's pdf stem
            want = pngstem
            for cand, pages in by_prefix.items():
                if cand.startswith(want[:30]) or want.startswith(cand[:30]):
                    pages_meta = pages
                    break
        if pages_meta is None:
            print(f"!! no manifest for {pngstem}", file=sys.stderr)
            continue

        kept = 0
        for rec in pages_meta:
            pno = rec["page"]
            if not rec.get("figure"):
                continue
            ptext = pages_txt.get(pno, "").strip()
            head = heading_for(ptext, f"{title} slide {pno}")
            # Drop only genuine divider/decorative slides. A short page whose text
            # names a mechanism IS a figure page (e.g. "Burst Error", "CRC
            # Computation") -- that is the diagram, not an empty slide.
            if DROP_TITLE.match(head) and not re.search(
                    r"(error|parity|crc|checksum|frame|code|diagram|example|"
                    r"computation|topology|waveform|signal|encoding|scheme)", head, re.I):
                continue
            if len(ptext) < 12:
                continue

            slug = f"{mod}-{slugify(head)}" if not slugify(head).startswith(mod) else slugify(head)
            slug = f"{mod}-p{pno:02d}-{slugify(head, 36)}"
            src_png = PAGES / rec["file"]
            if not src_png.exists():
                print(f"!! missing png {src_png}", file=sys.stderr)
                continue

            trimmed = scratch / f"{slug}.png"
            trim_uniform_border(src_png, trimmed)
            dst = FIXT / mod / f"{slug}.webp"
            if not convert_webp(trimmed, dst):
                print(f"!! ffmpeg failed {slug}", file=sys.stderr)
                continue

            from PIL import Image
            with Image.open(dst) as im:
                w, h = im.size

            figs.append({
                "id": slug,
                "mod": mod,
                "slide": pno,
                "slug": slug,
                "path": f"assets/figs/{mod}/{slug}.webp",
                "caption": head,
                "alt": head,
                "w": w,
                "h": h,
            })
            kept += 1
        print(f"{mod} {title[:38]:40} kept {kept}")

    (ROOT / "figs.json").write_text(json.dumps(figs, indent=1))
    print(f"\nTOTAL FIGURES: {len(figs)}")
    print(f"figs.json: {(ROOT/'figs.json').stat().st_size} bytes")


if __name__ == "__main__":
    main()
