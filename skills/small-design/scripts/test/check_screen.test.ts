import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { baseClass, lintScreen, parsePage } from "../lint.ts";
import type { Finding, LintOptions } from "../lint.ts";
import {
  fixHtmlArtworkUrls,
  formatImageLine,
  parseImageEntries,
  parseImageLine,
  readImageDimensions,
  swapUrlsInText,
} from "../artwork.ts";

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const read = (name: string) => readFileSync(fixture(name), "utf8");

const OPTS: LintOptions = {
  text: ["Field notes", "Shared with AT&T · 3 people", "Open"],
  images: ["https://lh3.googleusercontent.com/aida/one=w1600", "https://lh3.googleusercontent.com/aida/two=w1600"],
  fonts: new Set(["Instrument Serif", "Manrope"]),
};

const failures = (fs: Finding[]) => fs.filter((f) => f.level === "FAIL").map((f) => f.message);
const warnings = (fs: Finding[]) => fs.filter((f) => f.level === "WARN").map((f) => f.message);
const has = (msgs: string[], needle: string) =>
  assert.ok(msgs.some((m) => m.includes(needle)), `expected a message containing "${needle}" in:\n${msgs.join("\n")}`);

test("clean screen passes every check", () => {
  const findings = lintScreen(read("clean.html"), OPTS);
  assert.deepEqual(failures(findings), []);
  assert.deepEqual(warnings(findings), []);
});

test("broken screen fails each rule", () => {
  const fails = failures(lintScreen(read("broken.html"), OPTS));
  has(fails, "body classes should include m-0 p-0");
  has(fails, "body should have exactly one direct child, found 2");
  has(fails, 'text missing from page: "Shared with AT&T · 3 people"');
  has(fails, 'unexpected text on page: "New Learn more close © 2026"');
  has(fails, "artwork URLs differ: expected 2, found 1");
  has(fails, "icon font in use: Material Symbols Outlined, icon font reference in markup");
  has(fails, "fonts loaded that were not chosen: Inter");
  has(fails, "chosen fonts not loaded: Instrument Serif, Manrope");
  has(fails, "<section> space-y-4");
  has(fails, "<section> mt-4"); // variant and ! prefixes are stripped
  has(fails, "<p> style margin-left:8px");
  has(fails, "<style> margin-top:12px");
  has(fails, "<span> absolute");
  has(fails, "<style> position");
  has(fails, "no grid containers found");
});

test("broken screen warns on nudges and flex", () => {
  const warns = warnings(lintScreen(read("broken.html"), OPTS));
  has(warns, "one-sided padding, likely a nudge (1): <section> pt-3");
  has(warns, "flex containers inside the wrapper (1)");
  has(warns, "no subgrid found");
});

test("m-0 and html/body-only stylesheet rules are not margins", () => {
  const fails = failures(lintScreen(read("broken.html"), OPTS));
  const margin = fails.find((m) => m.startsWith("margin used for spacing")) ?? "";
  assert.ok(!margin.includes("m-0"), margin);
  assert.ok(!margin.includes("margin:0"), margin);
});

test("--allow-absolute downgrades positioning to a warning", () => {
  const findings = lintScreen(read("broken.html"), { ...OPTS, allowAbsolute: true });
  assert.ok(!failures(findings).some((m) => m.includes("absolute/fixed")));
  has(warnings(findings), "absolute/fixed positioning allowed by flag (2)");
});

test("without --fonts, loaded fonts are only reported", () => {
  const findings = lintScreen(read("clean.html"), { ...OPTS, fonts: undefined });
  assert.ok(findings.some((f) => f.level === "INFO" && f.message === "fonts loaded: Instrument Serif, Manrope"));
});

test("text split by entities is joined back into one run", () => {
  const page = parsePage('<body><div>AT&amp;T <b>x</b></div></body>');
  assert.deepEqual(page.text, ["AT&T", "x"]);
});

test("script, style and template text is not visible text", () => {
  const page = parsePage("<body><div>a<script>b</script><template>c</template><noscript>d</noscript></div></body>");
  assert.deepEqual(page.text, ["a"]);
});

test("baseClass strips variants and the important marker", () => {
  assert.equal(baseClass("md:hover:!mt-4"), "mt-4");
  assert.equal(baseClass("-mx-2"), "-mx-2");
});

test("images list supports inline # metadata comments", () => {
  const findings = lintScreen(read("clean.html"), {
    ...OPTS,
    images: [
      "https://lh3.googleusercontent.com/aida/one=w1600  # screen=s1 project=p1 width=1600 file=art/one.jpg",
      "https://lh3.googleusercontent.com/aida/two=w1600  # screen=s2 project=p1 width=1600 file=art/two.jpg",
    ],
  });
  assert.deepEqual(failures(findings), []);
});

test("unsuffixed aida-public URL fails with 512px diagnostic; suffixed aida-public URL passes", () => {
  const rehostedUnsuffixed = read("clean.html").replace(
    "https://lh3.googleusercontent.com/aida/one=w1600",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuRehostedOne",
  );
  const fails = failures(lintScreen(rehostedUnsuffixed, OPTS));
  assert.equal(fails.length, 1);
  has(fails, "artwork URL 1 was re-hosted to aida-public at 512px (missing =w1600)");

  const rehostedSuffixed = read("clean.html").replace(
    "https://lh3.googleusercontent.com/aida/one=w1600",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuRehostedOne=w1600",
  );
  assert.deepEqual(failures(lintScreen(rehostedSuffixed, OPTS)), []);
});

test("fixHtmlArtworkUrls suffixes aida-public URLs and swaps refreshed aida URLs", () => {
  const entries = parseImageEntries(
    [
      "https://lh3.googleusercontent.com/aida/one-fresh=w1600  # screen=s1 project=p1 width=1600 file=art/one.jpg",
      "https://lh3.googleusercontent.com/aida/two=w1600  # screen=s2 project=p1 width=1600 file=art/two.jpg",
    ].join("\n"),
  );
  const htmlWithStaleAndAidaPublic = read("clean.html")
    .replace("https://lh3.googleusercontent.com/aida/one=w1600", "https://lh3.googleusercontent.com/aida/one-expired=w1600")
    .replace(
      "https://lh3.googleusercontent.com/aida/two=w1600",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuRehostedTwo",
    );

  const fixed = fixHtmlArtworkUrls(htmlWithStaleAndAidaPublic, entries);
  assert.equal(fixed.changes.length, 2);
  assert.ok(fixed.html.includes("https://lh3.googleusercontent.com/aida/one-fresh=w1600"));
  assert.ok(fixed.html.includes("https://lh3.googleusercontent.com/aida-public/AB6AXuRehostedTwo=w1600"));
  assert.equal(fixed.entries[1].url, "https://lh3.googleusercontent.com/aida-public/AB6AXuRehostedTwo=w1600");
  assert.equal(fixed.entries[1].screenId, "s2");

  const findings = lintScreen(fixed.html, {
    ...OPTS,
    images: fixed.entries.map(formatImageLine),
  });
  assert.deepEqual(failures(findings), []);
});

test("parseImageLine and swapUrlsInText round-trip metadata and swap expired URLs", () => {
  const line =
    "https://lh3.googleusercontent.com/aida/oldToken=w640  # screen=scr123 project=proj456 width=640 file=art/cover.jpg";
  const parsed = parseImageLine(line);
  assert.deepEqual(parsed, {
    url: "https://lh3.googleusercontent.com/aida/oldToken=w640",
    screenId: "scr123",
    projectId: "proj456",
    width: 640,
    file: "art/cover.jpg",
  });
  assert.equal(formatImageLine(parsed!), line);

  const swapped = swapUrlsInText(
    'Prompt: use <img src="https://lh3.googleusercontent.com/aida/oldToken=w640"> and https://lh3.googleusercontent.com/aida/oldToken',
    new Map([["https://lh3.googleusercontent.com/aida/oldToken=w640", "https://lh3.googleusercontent.com/aida/newToken=w640"]]),
  );
  assert.equal(swapped.count, 2);
  assert.ok(!swapped.text.includes("oldToken"));
  assert.ok(swapped.text.includes("https://lh3.googleusercontent.com/aida/newToken=w640"));
});

test("readImageDimensions parses PNG and JPEG headers", () => {
  // Minimal 24-byte PNG header with width=640, height=480
  const png = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png, 0);
  png.writeUInt32BE(640, 16);
  png.writeUInt32BE(480, 20);
  assert.deepEqual(readImageDimensions(png), { width: 640, height: 480 });

  // Minimal JPEG with SOI + SOF0 marker (height=800, width=1200)
  const jpg = Buffer.from([
    0xff, 0xd8, // SOI
    0xff, 0xc0, // SOF0
    0x00, 0x0b, // length = 11
    0x08, // precision
    0x03, 0x20, // height = 800
    0x04, 0xb0, // width = 1200
    0x01, 0x01, 0x11, 0x00,
    0xff, 0xd9, // EOI
  ]);
  assert.deepEqual(readImageDimensions(jpg), { width: 1200, height: 800 });
});

test("CLI exits 0 on pass, 1 on fail, 2 on bad usage, and artwork.ts fix-html repairs HTML", () => {
  const cli = fileURLToPath(new URL("../check_screen.ts", import.meta.url));
  const artCli = fileURLToPath(new URL("../artwork.ts", import.meta.url));
  const run = (...args: string[]) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  const runArt = (...args: string[]) => spawnSync(process.execPath, [artCli, ...args], { encoding: "utf8" });
  const textFile = fixture("clean.text.txt");

  const pass = run(fixture("clean.html"), "--text", textFile);
  assert.equal(pass.status, 0, pass.stdout + pass.stderr);
  assert.match(pass.stdout, /RESULT PASSED/);

  const fail = run(fixture("broken.html"), "--text", textFile);
  assert.equal(fail.status, 1);
  assert.match(fail.stdout, /^FAIL {2}/m);

  assert.equal(run("--text", textFile).status, 2);

  // Test end-to-end fix-html + check_screen CLI flow
  const tmp = mkdtempSync(join(tmpdir(), "small-design-test-"));
  try {
    const htmlPath = join(tmp, "screen.html");
    const imgsPath = join(tmp, "screen.images.txt");
    writeFileSync(
      htmlPath,
      read("clean.html").replace(
        "https://lh3.googleusercontent.com/aida/one=w1600",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuRehostedOne",
      ),
      "utf8",
    );
    writeFileSync(
      imgsPath,
      [
        "https://lh3.googleusercontent.com/aida/one=w1600  # screen=s1 project=p1 width=1600 file=art/one.jpg",
        "https://lh3.googleusercontent.com/aida/two=w1600  # screen=s2 project=p1 width=1600 file=art/two.jpg",
      ].join("\n") + "\n",
      "utf8",
    );

    // Fails before fix-html because aida-public is unsuffixed (512px)
    const before = run(htmlPath, "--text", textFile, "--images", imgsPath);
    assert.equal(before.status, 1);
    assert.match(before.stdout, /re-hosted to aida-public at 512px/);

    // fix-html appends =w1600 to the durable aida-public URL
    const fixed = runArt("fix-html", htmlPath, "--images", imgsPath);
    assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr);
    assert.match(fixed.stdout, /FIXED {2}suffixed aida-public URL 1 with =w1600/);

    // Passes after fix-html
    const after = run(htmlPath, "--text", textFile, "--images", imgsPath);
    assert.equal(after.status, 0, after.stdout + after.stderr);
    assert.match(after.stdout, /RESULT PASSED/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

