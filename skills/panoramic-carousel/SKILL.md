---
name: panoramic-carousel
description: 'Export a continuous image or approved website design as consecutive vertical carousel slices, with a master, ordered PNGs, preview, ZIP, and pixel verification. Use for panoramic multi-image posts or slicing Stitch screens.'
---

# Panoramic Carousel

Turn one approved composition into ordered vertical crops that reconstruct the whole image. Slicing is an export operation; it does not require regenerating artwork or redesigning a page.

## Establish the master

- **Existing image or design:** preserve its layout, typography, spacing, artwork scale, and aspect ratio. Inspect the actual latest source. Remove a surrounding screenshot mat only when the requested component's bounds are clear; record those bounds. Do not expand, stretch, or rearrange the design to fit preferred slice dimensions.
- **New composition requested:** develop and approve the composition before exporting. Use available image-generation or UI-design capabilities only for the work the user requested. Generate one continuous artwork, never independently generated panels. Reuse a chosen style without hardcoding a particular landscape, palette, brand, hero, or footer.
- **Stitch URL supplied:** read [references/stitch-source.md](references/stitch-source.md). Use the Stitch CLI for source retrieval. Download the returned assets with redirect-following requests. Do not substitute a generated screen for the user's source.

Agree on or infer the slice count from the current request. Three slices is a useful starting proposal, not a platform requirement. If upload constraints matter, verify the intended platform's current rules rather than assuming them. Different platform surfaces may display multi-image posts differently; export alone does not control their viewer.

## Export

Use the final approved PNG as the master input. For HTML, prefer its approved screenshot when exact appearance matters. Re-rendering responsive HTML at another width can change the composition; inspect and approve such a render before slicing it. Fetch fonts and artwork at appropriate resolution if rendering is necessary.

Run the bundled exporter with Node 22+ and `zip` available. Install its pinned PNG dependency once if missing:

```sh
npm ci --prefix "$SKILL_DIR/scripts" --ignore-scripts
node "$SKILL_DIR/scripts/export-panorama.mjs" \
  --input /absolute/path/approved.png \
  --out /absolute/path/new-export-directory \
  --count 3
```

`SKILL_DIR` means this skill's folder. Use `--crop x,y,width,height` only for a deliberate, inspected crop. The destination must not exist; use a new directory for revisions.

The script exports:

- `panorama.png`: the source or recorded crop at its original pixel size.
- `slice-01.png`, etc.: left-to-right, full-height crops, with no gaps, overlaps, borders, rounded corners, padding, or resampling added.
- `carousel-preview.png`: a separate gap-separated contact sheet for review.
- `carousel-slices.zip`: the upload slices only.
- `verification.json`: crop geometry, source/master hashes, slice order, dimensions, and pixel reconstruction results.

When width is not divisible by count, the script distributes the remainder across integer-width slices, differing by at most one pixel. It preserves every column. If a target requires identical dimensions, choose an explicitly approved crop or master size before export; do not silently discard columns or resize.

Text may cross cuts when preserving an existing design. In a newly composed showcase, consider seams during layout, but do not treat each slice as a separate page or move approved content merely to keep each panel self-contained.

## Review and deliver

Inspect the master and preview: confirm the selected bounds, the original layout, artwork continuity, and absence of unintended clipping. Pixel checks establish exact reconstruction; they do not establish that the chosen crop or design is correct.

Deliver the ZIP, master, preview, slice dimensions, and numeric upload order. Explain any approved crop or scale change. Keep the preview separate from upload images. Preparing files does not authorize posting them or uploading a new Stitch screen.
