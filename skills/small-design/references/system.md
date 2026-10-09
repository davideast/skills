# Growing a system from small components, and art as covers

Read this when making more than one component, or any component whose art is the cover of an object.

To develop a good design, you must start small. A common failure mode is trying to architect a giant, speculative design system up front—inventing dozens of fictional entities, tokens, and lore before a single pixel has been judged.

Instead, the system **grows organically from what works in real pixels**:
1. Start with **one focused component**, anchored by a single strong art piece.
2. Record its visual decisions (surfaces, borders, text shades, accent, typography) in `DESIGN.md`.
3. When you build the next component, reuse those established tokens and patterns. The system expands in `DESIGN.md` only as new needs actually arise.

## The pattern for art as covers

Artworks work best in modern UI when they belong to an object: a document, a project, a video, a plan, or a file.

1. **The art belongs to an object.** The artwork is the cover of a thing in the product, never mere decoration, background wallpaper, or the component itself.
2. **Give the object a cover.** Portrait 3:4 for documents and projects; 16:9 for video frames. If titles sit on the cover, ask for a calm pale band at the top of the painting.
3. **Capture the tokens in `DESIGN.md`.** Record the product object, the cover's local file path, uploaded Stitch `IMAGE` screen ID (`<image-screen-id>`), and hosted URL (so `stitch get screen <image-screen-id> --project <id> --json` can mint a fresh URL whenever an `/aida/` signature expires), along with tokens (surfaces, borders, text shades, the one accent sampled from the art), type, radii, and how the shot is framed. Every subsequent component prompt borrows directly from `DESIGN.md`.
4. **Make the Cover a component.** Artwork fills the box (`object-fit: cover`); the object's title is HTML text layered on the pale band in the same grid cell, not part of the image. Thumbnails (under 64px) show the painting only. Define sizes as needed: thumbnail (about 28×36 or 36×48), card (about 240×320), feature (about 300×400).
5. **Reuse covers and art direction across components.** A chip shows the thumbnail, a list row shows the thumbnail, a dialog may show the feature cover raised beside it. When a new object is added in later steps, generate its cover under the same art direction with its own palette line.

## Tokens in `@google/design.md` format

`DESIGN.md` encodes these tokens in standard YAML frontmatter validated by `npx -y @google/design.md lint`:

```yaml
---
name: <system-or-component-name>
colors:
  primary: "#FF5533"     # Accent sampled from the art for primary actions
  backdrop: "#000000"
  surface-1: "#111113"   # Dialogs, cards
  surface-2: "#1B1B1E"   # Inputs, chips
  surface-3: "#26262A"   # Selected states
  border: "#2A2A2F"      # Hairline border
  text-primary: "#F5F4F2"
  text-secondary: "#A1A1A8"
  text-muted: "#6D6D75"
typography:
  display:
    fontFamily: "<Chosen Display Font>"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "<Chosen Body Font>"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: 4px
  md: 8px
  full: 9999px
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
---
```

## Framing a shot

- Black backdrop, the component centred with generous space.
- The object's feature cover may sit raised beside the component, partly behind it, using overlapping grid areas (cover first in source order, component second so it draws on top). Leave the cover's title clear of the overlap.
- When a component's value is in its states, show two or three states side by side as one shot.

## Art direction for covers

- Contemporary or enduring abstraction: Color Field, pigment drift, hard-edge abstraction, Light and Space gradients, flat contemporary landscape.
- Reductive: three or four colours, two or three fields, one movement. Saturated, with real contrast between the lightest and darkest field.
- No text in the image, no bare canvas at the edges, no famous-painting pastiche.
- When multiple covers exist, check them side by side at thumbnail and feature size, and regenerate or crop any that fail.
