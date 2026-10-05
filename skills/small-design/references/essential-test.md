# The essential test

Every piece of content and every element on the page must be essential. The test for each one is a single question:

> **If this did not exist on the page, could the user still achieve the page's core goals?**
>
> - **Yes, they still could:** it is not essential. Cut it.
> - **No, they could not:** it is essential. Keep it.

The reason for the rule: every element costs the user attention, and an element with no job spends that attention on nothing. Decoration is the art's job, and the art is given a job too.

## Applying it

1. **Write the core goals first.** Phrase them as what the user needs to know and what they need to do. Two to five items. Without this list the test has nothing to measure against.
2. **Run every element through the question**, including ones that feel obvious: dividers, labels, icons, containers, shadows, secondary shapes in the artwork.
3. **Record both outcomes.** A table of what stays with the job each element does, and a table of what goes with the reason it fails the test.

## What counts as achieving a goal

A goal is not achieved if the user cannot tell that it was. So these pass the test even though they are not actions:

- **System status:** is it working, how far along is it, how loud is it.
- **Current state:** is this on or off, saved or not.
- **Disambiguation:** which day a time belongs to, which item is the current one.
- **Recognisability:** the minimum that lets the user see what kind of thing this is and how to operate it.

Cutting these is the common way to fail in the other direction. A component stripped of its status reads as a picture of an interface.

## What usually fails

- A second element that repeats what another already says.
- A control for something the system cannot do (a seek handle on a live stream).
- Dividers between things that spacing already separates.
- Information the user cannot act on and does not need for orientation.
- Anything added because components of this kind usually have one.

## The art

Art is held to the same test. Give it a job: it is the control, it identifies the item, it shows state. Art with no job is decoration, and decoration is cut.

## When proposing features

Use the same test in reverse. A feature earns its place when there is a real user question it answers. Present proposals as:

| Feature | The question it answers | What it adds |
|---|---|---|

And list what is still left out, each with the reason no user is asking for it.
