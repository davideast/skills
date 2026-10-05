#!/usr/bin/env node
/**
 * Check a generated Stitch screen's HTML against its prompt.
 *
 * Checks the page wrapper, visible text, artwork URLs, fonts, icon fonts and the
 * intrinsic-grid layout rules. Lint only: fetch the HTML with the Stitch CLI first
 * (see SKILL.md, step 9).
 *
 * Usage:
 *   node check_screen.ts <screen.html> --text <strings.txt>
 *        [--images <urls.txt>] [--fonts "Family One,Family Two"] [--allow-absolute]
 *
 * Exit code is 1 if any check fails, 0 otherwise.
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { lintScreen } from "./lint.ts";

const USAGE = `usage: node check_screen.ts <screen.html> --text <strings.txt>
       [--images <urls.txt>] [--fonts "Family One,Family Two"] [--allow-absolute]`;

function readLines(path: string): string[] {
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function main(): number {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        text: { type: "string" },
        images: { type: "string" },
        fonts: { type: "string" },
        "allow-absolute": { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
      },
    });
  } catch (err) {
    console.error(`${(err as Error).message}\n${USAGE}`);
    return 2;
  }
  const { values, positionals } = parsed;
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  if (positionals.length !== 1 || !values.text) {
    console.error(USAGE);
    return 2;
  }

  const fonts = values.fonts
    ? new Set(values.fonts.split(",").map((f) => f.trim()).filter(Boolean))
    : undefined;

  const findings = lintScreen(readFileSync(positionals[0], "utf8"), {
    text: readLines(values.text),
    images: values.images ? readLines(values.images) : undefined,
    fonts,
    allowAbsolute: values["allow-absolute"],
  });

  for (const f of findings) console.log(`${f.level.padEnd(4)}  ${f.message}`);
  const failed = findings.some((f) => f.level === "FAIL");
  console.log(`RESULT ${failed ? "FAILED" : "PASSED"} — now look at the screenshot.`);
  return failed ? 1 : 0;
}

process.exitCode = main();
