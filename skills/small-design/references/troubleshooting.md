# Troubleshooting

Failures seen while this workflow was developed, and what to do about each.

## Image generation

| Symptom | What to do |
|---|---|
| Connection reset, or a 503 "high demand" error | Retry. A second or third attempt has succeeded each time. Wrap generation in a loop of up to four attempts. |
| `mdmedia: command not found` in a script | It is a shell function. Run it through an interactive shell: `zsh -ic 'mdmedia image ...'`. |
| A white margin or rough paper edge around the art | Regenerate with an added line saying the paint covers the whole image and runs off all four edges. |
| A different composition from the one asked for | Judge it against its job. Keep it if it does the job and say so; otherwise regenerate. |
| Text in the image is slightly wrong | Do not rely on image models for text. Interface text belongs in the Stitch build. |

## Stitch

| Symptom | What to do |
|---|---|
| A generated or edited screen exists but is not on the canvas | This is the usual outcome, not an exception. `stitch get screen` works but the id is missing from `screenInstances` in `stitch get project <id> --json --no-cache`. Re-check for a few minutes; some appear late (and an early fix then leaves a duplicate). If still missing: download the screen's HTML, run `stitch capture <file>.html -o <out>.html`, then `stitch upload screen <out>.html --project <id> --title "<title>"`. The uploaded screen has a new id; use that id from then on. |
| An edit returns a different screen id | Expected. Edits can create a new screen. Always take the id from the result. |
| The screenshot URL returns a small image | Append `=w2560` to the URL for full size. |
| A downloaded screenshot will not open | Download it again. For viewing, make a copy no larger than 1600px on its longest side. |
| The generator added a badge, date, link or divider | The text list did not forbid it by name. Add it to the forbidden items and rebuild. |
| The generator used margins, flex or absolute positioning | Make sure the layout paragraph from `layout.md` is in the prompt, and describe placement as grid tracks, not as distances. Rebuild. |
| Stray words in the visible text such as icon names | An icon font was used. Require inline SVG and forbid icon fonts by name. |

## Seen in later runs

| Symptom | What to do |
|---|---|
| The check fails the artwork URL, and the page shows an `aida-public` URL | Stitch re-hosted the image at 512px without a size suffix. Unlike `/aida/` URLs, `aida-public` URLs do not expire—keep the `aida-public` URL and append `=w<native width>` to it by running `node <skill-dir>/scripts/artwork.ts fix-html <screen.html> --images <name>.images.txt`, then capture and upload. |
| An `/aida/` artwork URL expired (broken image or HTTP 403 after 1–2 days) | Run `node <skill-dir>/scripts/artwork.ts refresh <name>.images.txt --swap <screen.html> --swap <name>.prompt.md --swap DESIGN.md` to mint a fresh signed URL from the recorded `screen=<image-screen-id>` (or local `file=`) and swap it in, then capture and upload `<screen.html>` if updating the canvas. |
| `stitch edit` returns the old id | The new screen's id is in `data.updated.id` (or in an `htmlCode`-bearing object deeper in the JSON), not `data.id`. |
| An edit with a tiny prompt reports success but nothing changed | Send the complete prompt. |
| A highlighted row inside a subgrid pushes its icon into the text | Padding on a subgrid row squeezes its outer tracks. Draw the highlight with `outline` and `outline-offset`, or keep padding outside the subgrid. |
| Rows in a shared subgrid spread their lines apart | Add `align-content: start` to the content inside the shared row. |
| A visually hidden input fails the layout check | Tailwind's `sr-only` uses absolute positioning. Leave the hidden input out of the shot. |
| The text check fails on a string shown more than once | List it in the text file once per appearance. |
| The text check fails on capitalised labels | Do not use CSS `uppercase`; write the string in the case it should appear. |
| Keyboard glyphs (↑ ↓ ↵) render tiny | Draw them as inline SVG. |
| `stitch url` says `"verified": false` | Ignore it; the `screenInstances` check (SKILL.md step 9, command 4) is the reliable one. |

## Fixing a failed screen

Correct the prompt and build again with the whole prompt. Small follow-up edits ("move this", "remove that") tend not to hold and leave the prompt file out of step with the screen.
