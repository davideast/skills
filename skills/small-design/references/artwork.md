# Generating artwork

Artwork is generated separately from the interface and placed into the screen by URL. The image model is good at paint and poor at exact interface, and Stitch is the reverse, so each does its own part. Read `references/system.md`: artworks are covers of objects.

## Rules

- **One image per artwork.** Do not generate a sheet and crop it.
- **Clean and edge to edge.** No text, numbers, signatures, borders, frames, mock-up surroundings, bare canvas at the edges, or interface elements. Titles are added as HTML on top.
- **Reductive and saturated.** Three or four colours, one clear form, real contrast. It must read at 28px wide and at 400px wide. Pale, muddy or busy images were rejected every time.
- **Contemporary, not pastiche.** No imitation of a specific famous painting.
- **Design for the display size and aspect.** Decide the cover's display size and aspect first (3:4 for documents, 16:9 for video) and generate at that aspect.
- **Give the art a calm zone where a title will sit** (usually a pale band across the top).
- **Match the family.** Generate a system's covers in one pass with one shared prompt and a palette line per cover.

## Commands

```bash
zsh -ic 'mdmedia image -i <prompt.md> -o <out.jpg> -a 3:4'            # also 1:1, 4:3, 16:9, 21:9
zsh -ic 'mdmedia image -i <prompt.md> -r <first.jpg> -o <out.jpg> -a 3:4'
```

`mdmedia` is a zsh function and writes JPEG data, so name files `.jpg`. Use the user's image command if it is not `mdmedia`. Independent pieces can be generated in parallel; retry up to four times on a connection reset or 503.

## Inspect every image

Look at each result at its display size before using it:
- Does it fill the frame, with no margin, bare canvas or paper edge? A thin bad edge can be cropped (`sips -c <h> <w> in.jpg --out out.jpg`) instead of regenerating.
- Is anything on it that should not be?
- Will it read as a thumbnail, and is it distinct from its siblings?

Regenerate what breaks the brief. If you keep an image that drifted because it works, say so in the report.
