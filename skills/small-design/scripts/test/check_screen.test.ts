import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { baseClass, lintScreen, parsePage } from "../lint.ts";
import type { Finding, LintOptions } from "../lint.ts";

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

test("images list supports inline # metadata comments and reused cover URLs across states", () => {
  const repeatedCoverHtml = read("clean.html").replace(
    "https://lh3.googleusercontent.com/aida/two=w1600",
    "https://lh3.googleusercontent.com/aida/one=w1600",
  );
  const findings = lintScreen(repeatedCoverHtml, {
    ...OPTS,
    images: ["https://lh3.googleusercontent.com/aida/one=w1600  # screen=s1 project=p1 file=art/one.jpg"],
  });
  assert.deepEqual(failures(findings), []);
});

test("unsuffixed FIFE URL fails with 512px diagnostic; suffixed aida-public URL passes with a warning", () => {
  const rehostedUnsuffixed = read("clean.html").replace(
    "https://lh3.googleusercontent.com/aida/one=w1600",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuRehostedOne",
  );
  const fails = failures(lintScreen(rehostedUnsuffixed, OPTS));
  assert.equal(fails.length, 1);
  has(fails, "artwork URL is missing a size suffix (serves 512px)");

  const rehostedSuffixed = read("clean.html").replace(
    "https://lh3.googleusercontent.com/aida/one=w1600",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuRehostedOne=w1600",
  );
  const findings = lintScreen(rehostedSuffixed, OPTS);
  assert.deepEqual(failures(findings), []);
  has(warnings(findings), "artwork URL was re-hosted to durable aida-public URL");
});

test("CSS background-image URLs and repeated/curly-quote text pass", () => {
  const cssBgAndRepeatedText = read("clean.html")
    .replace(
      '<img class="cover" src="https://lh3.googleusercontent.com/aida/one=w1600" alt="">',
      '<div class="cover" style="background-image: url(\'https://lh3.googleusercontent.com/aida/one=w1600\')"></div>',
    )
    .replace("<button class=\"px-4 py-2 rounded-full\">Open</button>", "<button>Open</button><button>Open</button>");

  const findings = lintScreen(cssBgAndRepeatedText, OPTS);
  assert.deepEqual(failures(findings), []);
});

test("CLI exits 0 on pass, 1 on fail, 2 on bad usage", () => {
  const cli = fileURLToPath(new URL("../check_screen.ts", import.meta.url));
  const run = (...args: string[]) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  const textFile = fixture("clean.text.txt");

  const pass = run(fixture("clean.html"), "--text", textFile);
  assert.equal(pass.status, 0, pass.stdout + pass.stderr);
  assert.match(pass.stdout, /RESULT PASSED/);

  const fail = run(fixture("broken.html"), "--text", textFile);
  assert.equal(fail.status, 1);
  assert.match(fail.stdout, /^FAIL {2}/m);

  assert.equal(run("--text", textFile).status, 2);
});


