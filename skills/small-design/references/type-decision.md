# Deciding type

Type is decided in three passes. Each pass narrows the next. Do not name a font, or think in terms of specific fonts, until the third pass: a font named early turns the rest of the discussion into defending it.

## Pass 1: feeling

Answer in plain words:
- **What should the visitor feel?** Three or four feelings, most important first.
- **What should they think?** Two or three sentences they might say to themselves.
- **What must it avoid?** Name the neighbouring characters the design could slide into by accident.
- **What job does that leave for the type?** The art already carries some of the feeling. State what the type must add that the art cannot.
- **A fork.** End with two distinct characters the page could have, and recommend one. The director chooses.

## Pass 2: classification

Read `google-fonts.md`. Each classification states what it signals.
- Choose a classification **per role** (title, body or interface text, labels, numbers). One family for everything is a legitimate answer.
- For each choice, say why it carries the feeling from pass 1.
- Say why each rejected classification does not. This is where the reasoning is tested.
- Prefer fewer voices. Every extra family is another thing competing with the art.

## Pass 3: font

Within the chosen classifications, choose fonts from `google-fonts.md`.
- Give the reason for the pick and the reason against each alternative in the same classification.
- State the setting per role: weight, size, case, tracking, colour.
- Check the practical needs: enough weights for the hierarchy, italics if the design uses them, numerals that line up if figures change.

## Re-test against a real screen

Words about type are a prediction. When the first screen is built, look again:
- Does the type read as the chosen character, or as its caricature?
- Does it still work now that the interface has small text, numbers and controls?

If it fails, go back to the pass that was wrong. A font that fails is often a classification that was wrong, and a classification that fails is often a feeling that was only half right.
