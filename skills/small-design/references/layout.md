# Layout: intrinsic CSS grid

Every screen prompt must prescribe this layout approach to Stitch explicitly. Left to itself, a generator spaces things with margins, nudges with padding and layers with absolute positioning. That output looks right in one screenshot and falls apart when content or width changes, and it leaves no shared lines for other components to align to.

## The rules

1. **Grid is the layout tool.** Any element that arranges children is `display: grid`.
2. **Spacing between things is `gap`.** Row gap and column gap on the parent are the only way siblings are separated.
3. **No margins.** Not for spacing, not for centring, not negative. This includes Tailwind's `space-x-*` and `space-y-*`, which are margins. Centre with `place-items`, `place-content` or `justify-self`.
4. **Padding is only a container's own inset.** A card surface or a button may have padding to hold its content away from its own edge. Padding is never used to push one child away from another, to indent something into line, or to nudge. One-sided padding is nearly always a nudge.
5. **Sizes are intrinsic.** Tracks are sized by content and available space: `auto`, `min-content`, `max-content`, `fit-content()`, `minmax()`, `fr`. Give a container a limit, not a fixed size: `inline-size: min(100%, 560px)`. Use `repeat(auto-fit, minmax(<min>, 1fr))` for collections so they reflow without breakpoints. Use `minmax(0, 1fr)` for a text track so long text can shrink.
6. **Subgrid establishes the alignment lines.** Define the column lines once, on the outermost grid that owns the group (the card, or the page). Every nested row or section spans those lines and declares `grid-template-columns: subgrid`, so its children snap to the same lines as every other row. Use `grid-template-rows: subgrid` the same way when rows must align across columns.
7. **Absolute positioning is not a layout method.** Do not place children with `position: absolute` inside a `relative` parent as the default. To layer one thing on another, put both in the same grid cell (`grid-area: 1 / 1`) and position with `place-self`. Absolute positioning is reserved for things that must leave the flow, such as a popover anchored to a trigger, and the prompt must say so when it is used.

## The one exception

The page wrapper is a fixed contract with the Stitch canvas and is written exactly as given in `screen-prompt.md` (it uses flex and padding). The rules above apply to everything inside it.

## How to describe layout in a prompt

Describe tracks and gaps. Do not describe distances between neighbours.

- Wrong: "16px to the right of the image, the show name."
- Right: "The list is a grid with columns `[time] max-content [mark] 56px [text] minmax(0, 1fr) [action] 44px` and a column gap of 16px. Each row spans all four columns and uses subgrid."

### Rows sharing lines (subgrid)

```html
<ul style="display:grid; grid-template-columns:max-content 56px minmax(0,1fr) 44px; column-gap:16px; row-gap:20px;">
  <li style="display:grid; grid-column:1 / -1; grid-template-columns:subgrid; align-items:center;">
    <time>23:00</time>
    <img ...>
    <div style="display:grid; row-gap:2px;">...</div>
    <button>...</button>
  </li>
</ul>
```

In Tailwind this is `grid-cols-subgrid` with `col-span-full`. If that utility is not available, an inline `style="grid-template-columns: subgrid"` is acceptable.

### Layering without absolute positioning

```html
<button style="display:grid;">
  <img style="grid-area:1 / 1; inline-size:100%; block-size:100%; object-fit:cover;" ...>
  <span style="grid-area:1 / 1; place-self:center;">...</span>
</button>
```

### Layering one object over another (overlapping grid areas)

To raise a cover behind a dialog, give both the same parent grid and overlapping areas. Source order decides which draws on top.

```html
<div style="display:grid; grid-template-columns:640px 80px 240px; grid-template-rows:104px auto;">
  <figure style="grid-column:2 / 4; grid-row:1 / 3; align-self:start;">…cover…</figure>
  <form style="grid-column:1 / 3; grid-row:2 / 3; align-self:start;">…dialog…</form>
</div>
```

### Image boxes

An image inside a grid box needs `grid-template-rows: minmax(0, 1fr)` on the box and `min-block-size: 0` on the image, or the image overflows and is clipped from the top.

### Dividers

A thin divider is a grid row of its own (`<div role="separator">` with `block-size: 1px` and a border colour), never a one-sided border plus padding.

### Content placed under one column of a row

Give it its own grid row inside the subgrid and place it on the named column (`grid-column: text`). Do not indent it with padding.

## Paragraph to include in every prompt

Paste this, then follow it with the specific tracks and gaps for the screen:

> LAYOUT (mandatory): use intrinsic CSS grid throughout. Every element that arranges children is `display: grid`, and all spacing between elements is `gap` on the parent. Do not use margin anywhere, including `space-x`, `space-y` and auto margins. Use padding only as a container's own inset (the card surface, a button's interior), never to separate or nudge children, and never one-sided. Size tracks intrinsically with `auto`, `min-content`, `max-content`, `minmax()` and `fr`; limit widths with `min(100%, <size>)` and do not fix them. Define the column lines once on the outer grid and have every nested row span them with `grid-template-columns: subgrid`, so all rows share the same alignment lines. Do not use `position: absolute` to place children; to layer elements, put them in the same grid cell with `grid-area: 1 / 1` and align with `place-self`. The only exception to these rules is the page wrapper, which must be written exactly as specified.

## What the check script enforces

`scripts/check_screen.ts` fails a screen that contains margins, `space-*` utilities, or absolute or fixed positioning, and warns on one-sided padding, on flex containers other than the wrapper, and when no subgrid is present. If a screen has a justified absolute element, pass `--allow-absolute` and say why in the report.
