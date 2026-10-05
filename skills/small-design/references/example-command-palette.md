# Worked example: a command palette (step 5, the component plan)

A real component plan from a one-shot run, trimmed. It shows what a good step 5 looks like: goals first, then scale, states, hierarchy, and the two tables from the essential test, with the judgment calls named for the director. Do not reuse its copy, names or visual choices; a new project makes its own.

**Context.** This was one component in a small system that was already built (a document-and-film workspace, abstract Color Field covers, one typeface, one chartreuse accent sampled from the art). On a new project you would plan the first component the same way and let `DESIGN.md` grow from it (principle 1).

## Goals

1. Find any object, person or action by typing a few letters.
2. Tell results apart at a glance (object, person, action) and know why each matched.
3. See which result Enter will act on, and see the object before opening it.
4. Know how to drive it from the keyboard.
5. When nothing matches, know the search ran, where it looked, and what to do next.

## Scale

- Each palette `min(100%, 560px)`. Two across with a 32px gap is 1152px, inside the ~1180px budget of a 1280px Stitch canvas.
- Object marks 6×32px (a thin strip of the object's cover, the full height of the row). One cover at card size (180×240) in the preview pane only. Avatars 28px.

## States and arrangement

Three palettes in one shot, **two across and one below**:

- Top left: empty query, recent objects and suggested actions.
- Top right: typing "harbour", grouped results, one row selected, preview with cover.
- Below, centred: no results for a query that matches nothing.

Why: the order follows the palette's own life (open, type, miss). The top two have similar heights, so they share a row and their input rows, bodies and footers align with `grid-template-rows: subgrid`. The no-results state is shortest, so it sits alone below instead of leaving a tall hole beside the typing state.

Rejected: the typing state wider beside two stacked small ones (unbalanced heights, and the brief caps width), and three across (about 370px each, too narrow for the preview cover).

## Hierarchy

- Each palette is led by its input row.
- In results, object names lead; kinds and match reasons are quiet and small.
- In the typing state, the selected row and the preview cover lead.
- In no-results, the one accent button leads.

## What stays

| Element | Job |
|---|---|
| Search icon, query or placeholder, caret | Where to type; what was typed |
| "6 results" / "0 results" | Status: the search ran, and how much it found |
| Group labels (Recent, Objects, People, Actions) | Tell kinds of result apart |
| Cover strip on each object row | Identifies the object by its painting |
| Kind line ("Rough cut · 12:40") | Tells object types apart |
| Match reason ("Mentions “harbour-master interview”") | Answers "why is this here?" |
| Selected row: raised surface, "Open" label, return keycap | Shows what Enter does, by shape and words, not colour alone |
| Preview: cover, name, kind, members, last edited | Lets the user confirm it is the right object before going |
| Footer keycaps (↑↓ Move, ↵ Open, esc Close) | How to operate it |
| No-results message, where it searched, primary action | A next step instead of a dead end |

## What goes

| Element | Why |
|---|---|
| Timestamps on recent rows | Order already says recency |
| Owner on every row | Not needed to choose; shown once in the preview |
| Shortcut letters on each action | The footer teaches navigation; per-row shortcuts add noise |
| Filter tabs or scope dropdown | Groups already separate kinds |
| Highlighted matched letters | A colour-only cue; the match reason says it in words |
| State captions on the backdrop | The backdrop stays empty; the query text tells states apart |

## Accent budget

The caret in all three inputs and one primary button in the no-results state. No accent in rows, selection or preview.

## Calls the director may overrule

- The empty state shows no pre-selected row (real palettes usually pre-select the first).
- People are matched by project membership rather than by name.
- A preview pane inside a 560px palette leaves the results column about 345px wide.

## What to take from it

- The goals come first and every row of both tables traces back to one.
- "What goes" has reasons, and some goes were judgment calls that the plan says the director may reverse.
- The state arrangement is decided by reading order and heights, with rejected options named.
- Status and state (result count, selected row, no-results next step) survive the essential test; decoration does not.
