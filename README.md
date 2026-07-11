# wrist-slap-me

`/wrist-slap-me` is a focus guardrail for coding agents. It compares proposed work with the two or three priorities you have deliberately set for the current season. Work that meets a priority proceeds normally. Work that misses every priority receives a direct wrist slap, a concrete cost, and three ways forward: park it, make the case, or overrule it.

The skill is agent-agnostic: it lives under `.agents/skills/wrist-slap-me`, with no dependency on a vendor-specific skill directory.

## What it does

The skill treats `PRIORITIES.md` in the repository root as the source of truth. Each priority has a short, testable question and a living **Now** list. When an idea fails all priority tests, the agent begins its response with:

> **WRIST SLAP!** This is not a <priority names> task.

It then states the failed test, identifies the Now-list work that would be displaced, and offers these exits:

- **Park it:** save the idea in `.wrist-slaps/parked.md`.
- **Make the case:** show how it serves a priority; if it does, add it to that priority's Now list.
- **Overrule:** proceed because you choose to, while recording the decision in `.wrist-slaps/log.md`.

`/wrist-slap-me log` summarizes patterns in the log, such as priorities most often raided and the ratio of parked to overruled ideas.

## Setup

1. Add this repository's `.agents/skills/wrist-slap-me` directory to the skills location your coding agent discovers. For agents that scan repository-local skills, keep it in the repository root as shown.
2. Invoke `/wrist-slap-me setup`. It interviews you one question at a time to create or revise `PRIORITIES.md`.
3. Add the following standing instruction to the repository's `AGENTS.md` (or equivalent agent instruction file):

```markdown
## Priorities are law

`PRIORITIES.md` names this repo's current priorities, each with a one-sentence test.
Judge every piece of proposed work — the user's and your own — against those tests before starting it.
Work that passes proceeds without comment. Work that fails every test gets the `/wrist-slap-me` treatment: slap first, then the exits.
```

4. Keep the **Now** lists current. The skill uses them to make the tradeoff concrete.

Use [PRIORITIES-FORMAT.md](.agents/skills/wrist-slap-me/PRIORITIES-FORMAT.md) as the template and rules for `PRIORITIES.md`.

## Files created in a project using the skill

```text
PRIORITIES.md
.wrist-slaps/
  log.md
  parked.md
```

The skill creates and updates the two `.wrist-slaps` files as decisions are made. They are intentionally project-local, so each repository retains its own focus history.
