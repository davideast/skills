# Worked example: an Orphism radio station page

**Historical.** This was an early run. Its light UI, page-sized paintings and art built into the interface were later rejected; follow `DESIGN.md`, `references/system.md`, and the current principles instead. It is kept for its gate reasoning (feeling, type, the essential test), which still holds.

One full pass of the loop, in directed mode. It shows the kind of reasoning expected at each gate and the corrections that shaped the principles. Do not reuse its style, copy or fonts; a new project makes its own decisions.

## 1. Style and subject

- **Style:** Orphism (Paris, about 1912–14): concentric discs split into arcs, flat complementary colours set against each other.
- **Why it fits UI:** discs and arcs are already dials and progress rings, so the painting can be a control. The movement was about musical rhythm, which gives an audio subject a reason.
- **Component:** a live web radio player card.
- **Thesis:** a web radio player that feels like a 1913 gouache disc study, where the painting is the control.
- **Alternatives offered:** Suprematism for a file-upload card; Colour Field for a sleep or weather widget.

## 2. Concept image

One 4:3 image of the whole card. The text came out exact; the progress ring was wrong. Reported as such. It confirmed the direction and was not used in the build.

## 4. Type

- **Feeling proposed:** being let into a room where someone with taste is choosing records. Avoid: museum gift shop, streaming-app neutrality, retro costume.
- **Fork:** "listening room" or "gallery". The director chose gallery.
- **First classification:** a transitional serif for the title (stately, counterpoints the hand-made painting) and a clean neo-grotesque for everything else (institutional, spends no contrast).
- **After seeing the screen:** the italic serif title read as too much museum, and the interface was gaining small text. Replaced by one family from the Quirky/Friendly grotesques, with hierarchy from weight and size. The gallery feeling moved into the painting and the space around it.

Lesson: type is re-tested against a real screen.

## 5. Plan under the essential test

**Goals:** know whether it is playing, what is playing and that it is live; start or stop; keep a track.

First plan kept six elements and cut the progress ring, the time, the divider and two secondary discs in the painting. That went too far: the director called the result too simplistic.

The correction became principle 4. The second plan restored status that the user needs in order to know their goal is met:

| Added | The question it answers |
|---|---|
| Progress line with times, no handle | Is audio advancing, and how far through is this track? |
| Mute and volume | How loud is this against everything else? |
| Show name, host, end time | What programme is this, and how long does it run? |
| Last two tracks, each saveable | What was that song a minute ago? |

Still left out: skip and seek (impossible on a live stream), up next (the station cannot promise it), share, speed, sleep timer.

## 6. Artwork

- A square single-disc painting for the player, with a calm ivory circle at the centre for the play button.
- Four small marks for the schedule, one per show, generated with the disc as style reference. Each was given a different shape (quarter-disc, crescent, rising half-disc, split disc) and only two or three bold rings, because they display at 56px.
- One mark came back with a paper margin and was regenerated.

## 8–9. Build and check

The player was generated, then rebuilt by `stitch edit screen` with a full new prompt. Every check passed. One screen did not appear on the canvas and was recovered by capture and upload.

## 10. Critique

The schedule's switched-on reminder was first shown as a bell in a coloured circle. The director asked what the circle meant. It was colour standing in for state, in the colour already used for a primary action. Rebuilt as a filled bell with a tick plus the words "Reminder set for 22:55". This became principle 6.

Features then added to the schedule, each from a user question: day labels ("is 07:00 tonight or tomorrow?"), a countdown on the next show, and an expandable one-sentence description.

## 11. Next component

With the player answering "what is on now", the schedule was proposed to answer "what is on later, and is it worth coming back?". Alternatives considered: a saved-tracks list (too close to the last-played list) and an about-the-show panel (mostly reading).

## The schedule's layout, written as grid tracks

This is how the layout section of that prompt reads under the layout rules:

> The card is a grid with one column, a row gap of 16px and an inset of 28px. Inside it, the list is a grid with columns `[time] max-content [mark] 56px [text] minmax(0, 1fr) [action] 44px`, a column gap of 16px and a row gap of 20px. Group labels span all columns. Each row spans all columns, uses `grid-template-columns: subgrid` and centres its items. The description of an expanded row is a second grid row inside that row's subgrid, placed on the `text` column. The countdown sits under the time in a two-row grid in the `time` column with a row gap of 2px.
