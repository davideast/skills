# Writing a screen prompt

A screen prompt is complete and concrete: exact colours, named fonts, sizes, grid tracks, quoted text. Vague words such as "editorial" or "premium" make the generator invent things. Write every prompt as if creating the screen from scratch, including prompts used with `stitch edit screen`.

Save the prompt as `<name>.prompt.md`, the visible strings as `<name>.text.txt` (one per line) and the artwork URLs as `<name>.images.txt` (one per line, with optional `# screen=<id> file=<path>` comments). The check script reads the last two.

## The parts, in order

1. **Opening.** What the screen is. For an edit, one or two sentences on what to keep from the existing screen (backdrop, surface, type, colours) and what to remove or replace.
2. **Concept.** The one-sentence thesis.
3. **Page structure.** The fixed wrapper below, and a statement that the backdrop is empty.
4. **Text list.** Every visible string, quoted, with the count, and a statement that no other text may appear. Then name the specific things the generator tends to add for this kind of component (badges, dates, "view all" links, dividers) and forbid them.
5. **Font.** The families and weights, and what is not allowed (no serif, no italic, and so on).
6. **Icons.** Each icon described, as inline SVG. No icon font and no emoji: icon fonts put stray text into the page.
7. **Layout.** The mandatory paragraph from `layout.md`, followed by the grid tracks and gaps for this screen.
8. **Container.** Width limit, surface colour, radius, inset, shadow.
9. **Each region, element by element.** Font, size, weight, colour and the exact text, placed by grid track.
10. **Artwork.** The hosted URL for each image, with an instruction not to replace, tint, blur or overlay it.
11. **States.** Which element is in which state, how each state looks, and the state attributes (`aria-pressed`, `aria-expanded`).
12. **Contrast.** What is allowed to be loud and what stays quiet.

## Page structure (fixed)

The Stitch canvas sizes a screen from the children of `<body>` and ignores padding on `<body>` itself, so a screen without this wrapper is clipped. Write it exactly:

```
PAGE STRUCTURE (mandatory, exact): <body class="m-0 p-0 bg-[<backdrop>]"> containing exactly one
direct child: <div class="w-full min-h-[100dvh] py-20 px-12 flex items-center justify-center
bg-[<backdrop>]">. That wrapper holds the component and nothing else. The backdrop is a flat
<backdrop> and stays completely empty: no header, no navigation, no footer, no caption, no decoration.
```

This wrapper is the single exception to the layout rules.

## Text list (closed)

```
TEXT INVENTORY (closed): the only visible text on the whole page is exactly these <n> strings:
"<string>", "<string>", ... Do not add any other text, <the specific things to forbid> anywhere.
```

Write fresh, specific, plausible copy for each project. Do not reuse names, places or numbers from an earlier project or from the example in this skill.

## Geometry worth stating

- **Nested radii:** when art sits inside a padded container, inner radius = outer radius − inset.
- **Targets:** interactive elements are at least 44px in both directions.
- **Keep the focus of the art clear:** nothing sits over the centre of a painting except a control that belongs there.

## Contrast as a budget

Value, saturation, scale and weight are a limited budget. Spend the strongest contrast on one or two things (usually the art and the primary action) and keep everything else in a narrow, quiet band. Check text colours for contrast against the surface; a colour that works in the painting may be too light for 12px text.
