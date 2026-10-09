---
name: small-design
description: >-
  Develop high-quality web UI components and pages by starting small. Instead of designing a sprawling system or full page up front, start with a single focused component anchored by a strong fine-art piece. The artwork drives the visual language, palette, and emotional tone; typography is chosen by feeling; layout is intrinsic CSS grid; and every element must earn its place. As components succeed, the design record (DESIGN.md) grows organically. Use whenever the user wants to start small on a design, design a component or page concept driven by an art style, pick fonts by mood, create an essential-only UI, or develop a page one component at a time — even if they never say "skill" or name Stitch.
---

# Small design: start small, anchored by art

To develop a good design, you must start small. Starting with a blank canvas or trying to design an entire product up front usually stalls out: without a strong visual point of view, components look generic and decision fatigue sets in.

This skill anchors the design immediately with a **strong fine-art piece**. The artwork is not mere decoration; it drives the design. It supplies the color palette (sampled directly from the art), establishes the contrast and tonal atmosphere, sets the emotional character for typography, and gives the UI an object to frame.

From that anchor, the interface develops **one focused component at a time**. The process is a tight loop of **decide in words, then generate and judge**, recorded in a living `DESIGN.md`. Nothing is generated until the decision behind it is made, and every screen is verified before moving to the next.

## What you need before starting

- **An image generation command.** Use the one the user names. If they name none, look for `mdmedia` (it may be a shell function, in which case run it as `zsh -ic 'mdmedia image ...'`). If there is none, say so and stop; the workflow cannot produce artwork without it.
- **The Stitch CLI** (`stitch`), logged in.
- **Node 22.18 or later**, to run the bundled check (`scripts/check_screen.ts`). Install its one dependency once with `npm ci --prefix <skill-dir>/scripts --omit=dev --ignore-scripts`.
- **The `@google/design.md` CLI** (via `npx -y @google/design.md`), to validate and lint the `DESIGN.md` specification.
- **A project folder** to keep the design record (`DESIGN.md`), prompts, artwork and screenshots together. Use the working directory unless told otherwise.

## Two modes

**Directed (default).** At each gate, propose with a recommendation and reasons, then wait for the person directing the work. The decisions at the gates are theirs: they are matters of taste and intent that cannot be derived from the brief.

**One-shot.** Use this when the user asks for it ("one-shot", "decide for me", "don't stop to ask", or the run is unattended). Do every step in the same order and with the same reasoning, but make each gate decision yourself. The thinking is not skipped, only the waiting. At each gate:
1. write the options you considered, the one you chose and why, into `decisions.md` in the project folder;
2. carry on.

In one-shot mode, still stop if a required tool is missing or an action would delete or overwrite something the user made. At the end, report every gate decision so the user can overrule any of them.

## Principles

These are the rules the workflow exists to enforce. Each has a reason; when a situation is not covered, reason from the reason.

1. **Start small, anchored by art.** Great design starts small: one focused component, one job, one screen. A strong, singular fine-art piece anchors the design immediately: its colors give you the palette (surfaces, text tones, and the one pop of accent), its composition sets the visual weight, and its mood guides typography. Start with the art and this single component; let the design system grow outward into `DESIGN.md` as more components earn their place.
2. **Be inspired by the art, not built out of it.** The art direction shapes the artworks only. The interface is fully modern web UI; it is never assembled from the movement's shapes, grids or textures. Prefer contemporary or enduring abstract directions (Color Field, pigment drift, hard-edge abstraction, Light and Space, flat contemporary landscape) over historical pastiche.
3. **The art belongs to an object.** Each artwork is the cover of a thing in the product: a document, a project, a video, a plan, a file. It is never decoration, a background, or the component itself.
4. **Small in scope, never simplistic in function.** "Small" means a tightly bounded scope (one component or region), not an empty wireframe or naive minimal UI. Real products have real states: status, ownership, access, progress, empty, and error. Confident display type, pills, chips, avatars, badges and thin dividers are the vocabulary. If a user cannot tell whether an action succeeded, the component has failed the essential test. Where a component's value is in its states, show several states side by side.
5. **The art is framed and modest.** A cover sits inside or beside a component at the size it would really have. Components are sized to their content (a dialog is roughly 560 to 760px wide) and shown with breathing room. Nothing fills the page.
6. **The UI is neutral and the art pops against it.** The art drives the color. For saturated art, use a dark neutral UI (near-black surfaces, grey text, hairline borders). Colour lives in the covers. The interface takes one accent, sampled directly from the art, for the one primary action in a view. Artworks are reductive (three or four colours, one clear form) and saturated, so they read at thumbnail and feature size alike.
7. **Type is chosen from feeling.** Decide the feeling first, then the classification that carries it, then the font. See `references/type-decision.md`.
8. **Every element must be essential.** For each element ask: *if this did not exist, could the user still achieve the component's core goals?* If they could, cut it. A goal is not achieved if the user cannot tell that it worked, so status, state, ownership and access pass the test. See `references/essential-test.md`.
9. **State is shown by shape and words.** A switched-on control changes its icon and says what happened. A coloured background alone is not a state.
10. **Features answer real user questions.** Propose each feature as the question it answers and what it adds. List what is left out, with the reason.
11. **Layout is intrinsic CSS grid.** Grid with `gap` for all spacing, subgrid for shared alignment lines, no margins, no padding used to space or nudge, no absolute positioning. Overlapping grid areas are the way to layer one object over another. See `references/layout.md`.
12. **Reference designs give principles, never surface.** When the director shares references, name the principles they demonstrate and apply those. Do not reuse a reference's palette or colour temperature, its accent, its typeface or a close look-alike, its signature layout device (for example a cover raised behind a dialog), its kind of artwork, or anything resembling its copy and names. Before building, list each of those for the reference and for your design side by side; if any line matches, change it. A result that can be traced back to a reference is a copy, however well made.
13. **Do not fall back on the default skeleton.** The dark card with art-thumbnail chips, a pill toolbar, an avatar stack in the footer and one accent button is what you and the generator produce when not pushed elsewhere. Recolouring or retyping that skeleton is not a new design; it was rejected as "the same damn UI with different colours". A new direction must differ in structure and composition: what leads, how space is divided, how the art and the controls relate.
14. **Choose colour by looking, not by ruling things out.** A palette picked only to avoid something ("not warm, not peach") produced colours the director called disgusting. Judge every palette on rendered pixels, at the size it will be seen, before building.
15. **The UI leads; the art is a minor part.** The interface is the subject of the shot. The art takes a small share of the component (a cover, a swatch, a thumbnail), never the main field, and the component must still read as complete if the art were removed. Any concept whose thesis makes the painting the component's main surface is art-forward and will be rejected.
16. **Report failures before passes.** Lead every report with what is wrong or uncertain. The check script cannot see whether a design is good; never present its passes as a verdict.
17. **New screens are grounded in existing ones, unless the existing one was rejected.** Edit an approved screen with a complete from-scratch prompt to keep the established look. After a rejection, generate fresh, so the new screen is not anchored on the rejected one.

## The loop

Gates are marked **[gate]**. In directed mode, stop there. In one-shot mode, decide, log it, continue.

### 1. Style and subject **[gate]**
Propose one art direction and one focused web component. The fine-art movement is chosen because its character and color palette will drive the visual design. Give the reason they fit, a one-sentence thesis, and one or two alternative directions in a line each. Say which object in the product this artwork will be the cover of.

Start small: do not invent an entire multi-screen product universe, a huge backstory, or a 5-item inventory up front. Focus strictly on this one component and the art piece that anchors it.

### 2. Concept image **[gate]**
Generate one quick image of the whole shot with the image command to test the direction, and judge the palette on the rendered pixels (principle 14). Report what came out, failures first. This image is a sketch; it is not used in the build. Do not hand-build HTML mock-ups: the workflow is artwork from the image command plus a prompt for Stitch.

### 3. Design record (`DESIGN.md`)
Create or update `DESIGN.md` in the project folder according to the **`@google/design.md`** specification. It combines machine-readable design tokens in YAML frontmatter with markdown design rationale.

Structure `DESIGN.md` with:
- **YAML frontmatter tokens:**
  - `name`: project or component name.
  - `colors`: `primary` (the single accent sampled from the art for primary actions), `backdrop`, `surface-1`, `surface-2`, `surface-3`, `border`, `text-primary`, `text-secondary`, `text-muted`.
  - `typography`: token levels such as `display`, `body`, `label` with `fontFamily`, `fontSize`, `fontWeight`, and `lineHeight`.
  - `rounded`: radii (`sm: 4px`, `md: 8px`, `full: 9999px`).
  - `spacing`: base scale (`xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`).
- **Markdown body:**
  - `## Visual Identity & Art Direction`: movement, thesis, and mark/texture handling.
  - `## Color & Contrast`: contrast budget (what stays quiet, what pops).
  - `## Typography`: chosen feelings, classifications, and fonts (updated after Step 4).
  - `## Layout & Intrinsic Grid`: tracks, gaps, no margins.
  - `## Do's and Don'ts`: concrete guardrails.

Validate the specification before proceeding:
```bash
npx -y @google/design.md lint <project-folder>/DESIGN.md
```
Exit code 0 means structural correctness; fix any reported token errors before continuing. This document starts small with this first component and expands organically as future components are added.

### 4. Type, in three passes
Read `references/type-decision.md` for the method and `references/google-fonts.md` for the classifications and fonts.
1. **Feeling [gate]:** what the visitor should feel and think, what to avoid, and a fork between two characters for the page.
2. **Classification [gate]:** which classification per role, why it carries the feeling, why the others do not.
3. **Font [gate]:** specific fonts and settings per role.

Record the chosen fonts and feelings in `DESIGN.md` under `typography`. Re-test the type once a real screen exists. A choice that sounded right in words can read wrongly in pixels.

### 5. Component plan **[gate]**
Read `references/essential-test.md`. Produce:
- the user's goals for this component;
- **scale**: the component's width and the display size of each cover, and how the shot is framed;
- **states**: which states the shot shows, and whether several are shown side by side;
- **hierarchy**: the one element that leads each region, and how elements are grouped;
- a table of what stays with each element's job, and a table of what goes and why;
- the layout as grid tracks, type and colour per element, and the exact text.

Name the calls the director may want to overrule.

### 6. Artwork
Read `references/artwork.md`. Generate each piece of art separately, as a clean full-bleed image with no text or interface on it. Look at every image and regenerate any that break the brief.

### 7. Stitch project and uploads
Create a project (first time only), upload each artwork image as a screen, and record its suffixed URL together with its `screen` ID, `project` ID, native `width`, and local `file` path using `scripts/artwork.ts`:

```bash
stitch create project --json '{"title":"<title>"}' --format json
node <skill-dir>/scripts/artwork.ts upload <file.jpg> --project <id> --title "<title>" --out <name>.images.txt
```

`artwork.ts upload` uploads `<file.jpg>`, reads `data.screenshot.downloadUrl`, appends `=w<native width>` (without the suffix, Stitch serves a 512px copy), and writes a line to `<name>.images.txt` in the format:
```text
https://lh3.googleusercontent.com/aida/...=w640  # screen=<image-screen-id> project=<id> width=640 file=<file.jpg>
```
Because `/aida/` URLs expire after 1–2 days while the uploaded `IMAGE` screen (`screen=<image-screen-id>`) persists in the project, keeping this metadata lets you regenerate a fresh URL and swap it across your prompt, HTML, and `DESIGN.md` in one command whenever a URL expires:
```bash
node <skill-dir>/scripts/artwork.ts refresh <name>.images.txt --swap <name>.prompt.md --swap <screen-id>.html --swap DESIGN.md
```

### 8. Write the prompt and build
Read `references/screen-prompt.md` and `references/layout.md`. Save three files in the project folder for each screen:
- `<name>.prompt.md`: the full prompt (if reusing artwork from an earlier session, run `node <skill-dir>/scripts/artwork.ts refresh <name>.images.txt --swap <name>.prompt.md` first so the prompt never passes an expired `/aida/` URL);
- `<name>.text.txt`: every visible string, one per line;
- `<name>.images.txt`: the artwork URLs in page order, one per line (with `# screen=<id> project=<id> width=<px> file=<path>` provenance comments).

First screen of a project:
```bash
stitch generate screen --project <id> --device DESKTOP --title "<title>" --format json --prompt "$(cat <name>.prompt.md)"
```
Every later screen (new version or new component): edit an existing screen with the complete new prompt.
```bash
stitch edit screen <existing-screen-id> --project <id> --device DESKTOP --format json --prompt "$(cat <name>.prompt.md)"
```
Build one screen at a time.

### 9. Check
There are two checks in this workflow:
1. **Contract check (Step 3):** `npx -y @google/design.md lint <project-folder>/DESIGN.md` validates the token specification and design system structure.
2. **Output check (Step 9):** `node check_screen.ts` validates the rendered Stitch HTML against layout and content rules.

For every screen: download its HTML and screenshot, lint the HTML, check the canvas, then look at the screenshot.

```bash
# 1. Get the download links. If htmlCode is missing, the screen is an uploaded image, not a generated one.
stitch get screen <screen-id> --project <id> --json --fields htmlCode.downloadUrl,screenshot.downloadUrl

# 2. Download both. The screenshot URL serves a small image unless you append =w2560.
curl -sL "<htmlCode.downloadUrl>" -o <project-folder>/<screen-id>.html
curl -sL "<screenshot.downloadUrl>=w2560" -o <project-folder>/<screen-id>.png
sips -Z 1600 <project-folder>/<screen-id>.png --out <project-folder>/<screen-id>.preview.png   # macOS: a copy small enough to view

# 3. Lint the HTML. Exit code 1 means a check failed.
node <skill-dir>/scripts/check_screen.ts <project-folder>/<screen-id>.html \
  --text <name>.text.txt --images <name>.images.txt --fonts "<Family One>,<Family Two>"

# 4. Canvas placement: the screen is on the canvas when its id is in this list.
stitch get project <id> --json --no-cache --fields screenInstances.id
```

The lint checks the page wrapper, the visible text against the list, the artwork URLs (`<img src>` and `<video poster>`), the fonts, icon fonts and the layout rules. It reads only the local HTML file, so you can rerun it on patched HTML without calling Stitch.

- **Content and layout failures** are fixed by correcting the prompt and building again.
- **Canvas placement** often lags for generated screens; that is normal, not an error. **Never generate or edit again because a screen is missing from the canvas: every generation spends the user's credits.** Poll in the background with command 4 (once a minute for up to ten minutes). Only if it is still missing, capture the existing HTML and upload it (`references/troubleshooting.md`). The uploaded copy gets a new id; use it from then on.
- **Credits:** one generation per screen. Fix small layout or copy problems by patching the downloaded HTML before the upload, and update the prompt file to match. Regenerate only for a genuine design failure, and say why.
- **A rewritten `aida-public` artwork URL:** Stitch sometimes re-hosts an image to `https://lh3.googleusercontent.com/aida-public/...` without a size suffix (which serves at 512px). Unlike `/aida/` URLs, `/aida-public/` URLs do not expire—so **keep the `aida-public` URL** and append `=w<native width>` to it by running `node <skill-dir>/scripts/artwork.ts fix-html <project-folder>/<screen-id>.html --images <name>.images.txt`, then capture and upload.
- **An expired `/aida/` artwork URL:** When an `/aida/` URL expires after 1–2 days (returning HTTP 403), run `node <skill-dir>/scripts/artwork.ts refresh <name>.images.txt --swap <project-folder>/<screen-id>.html --swap <name>.prompt.md --swap DESIGN.md` to mint a fresh signed URL from the recorded `screen=<image-screen-id>` and swap it in.

Then look at the screenshot and judge it against the principles, honestly, including flaws the script cannot see.

### 10. Critique and next round **[gate]**
After the director critiques a screen (or, in one-shot mode, after you critique it against the principles), propose without generating:
- features to add, as a table of the question each answers and what it adds;
- what stays left out, and why;
- any type or state change the critique calls for;
- which proposals fit one static shot and which need a separate state shot.

Then return to step 8.

### 11. Next component or complete **[gate]**
First evaluate whether the page is complete:
- **Completion test:** Does this page or view already answer the visitor's core questions and achieve their goal? If yes, the design is complete. Do not add components just to fill space. Stop here and report the final result.
- **If adding the next component:** Treat the finished component as the anchor. Propose the next component: what question it answers, what it contains, the alternatives considered, and whether it reuses an existing cover or needs a new piece of art (if so, step 6). Update `DESIGN.md` with any newly introduced tokens or objects. Build it by editing or composing onto the previous component's screen (step 8), so the page stays one unified design.

Repeat 10 and 11 until the page is complete.

## Reporting

After each build, report: the thesis, what was built, the check results, anything in the screenshot worth the director's judgment, and the canvas link. In one-shot mode, add the list of gate decisions from `decisions.md`.

## Reference files

| File | Read it when |
|---|---|
| `references/system.md` | Growing a design system from small components, and art as covers (steps 1, 3, 6, 11). |
| `references/type-decision.md` | Deciding type (step 4). |
| `references/google-fonts.md` | Choosing a classification and font (step 4). |
| `references/essential-test.md` | Planning a component or proposing features (steps 5, 10). |
| `references/artwork.md` | Generating art (step 6). |
| `references/layout.md` | Writing any screen prompt (step 8). |
| `references/screen-prompt.md` | Writing any screen prompt (step 8). |
| `references/troubleshooting.md` | A generation or check fails (steps 6 to 9). |
| `references/example-orphism.md` | You want to see one full pass of the loop (historical). |
| `references/example-command-palette.md` | You want to see what a strong component plan (step 5) looks like. |
