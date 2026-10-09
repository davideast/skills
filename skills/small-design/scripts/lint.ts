/**
 * Lint rules for a generated Stitch screen. Pure: takes HTML text, returns findings.
 * No network, no filesystem, no Stitch calls; the CLI in check_screen.ts handles I/O.
 */
import { Parser } from "htmlparser2";

export type Level = "PASS" | "FAIL" | "WARN" | "INFO";
export interface Finding {
  level: Level;
  message: string;
}

export interface LintOptions {
  /** Every visible string, one per entry. */
  text: string[];
  /** Artwork URLs in page order. Skipped when undefined. */
  images?: string[];
  /** Font families that should be loaded. When undefined, loaded fonts are only reported. */
  fonts?: Set<string>;
  /** A justified absolute or fixed element exists. */
  allowAbsolute?: boolean;
}

interface Element {
  tag: string;
  attrs: Record<string, string>;
}

export interface Page {
  bodyAttrs: Record<string, string> | null;
  /** Direct children of body, excluding <script>. */
  bodyChildren: Element[];
  /** Every element inside body. */
  elements: Element[];
  text: string[];
  images: string[];
  links: string[];
  styles: string[];
}

const SKIP_TEXT = new Set(["script", "style", "title", "template", "noscript"]);
const ZERO = new Set(["0", "0px", "[0]", "[0px]"]);

export function parsePage(html: string): Page {
  const page: Page = {
    bodyAttrs: null,
    bodyChildren: [],
    elements: [],
    text: [],
    images: [],
    links: [],
    styles: [],
  };
  const stack: string[] = [];
  // htmlparser2 may split one run of text into several chunks (e.g. around
  // entities), so collect the run and handle it at the next tag boundary.
  let pending = "";

  const flush = () => {
    if (!pending) return;
    const data = pending;
    pending = "";
    if (stack.at(-1) === "style") {
      page.styles.push(data);
      return;
    }
    if (!stack.includes("body") || stack.some((t) => SKIP_TEXT.has(t))) return;
    const t = data.replace(/\s+/g, " ").trim();
    if (t) page.text.push(t);
  };

  const parser = new Parser(
    {
      onopentag(tag, attrs) {
        flush();
        if (tag === "link" && attrs.href) page.links.push(attrs.href);
        if (tag === "body") {
          page.bodyAttrs = attrs;
        } else if (stack.includes("body")) {
          const el: Element = { tag, attrs };
          if (stack.at(-1) === "body" && tag !== "script") page.bodyChildren.push(el);
          page.elements.push(el);
          if (tag === "img" && attrs.src) page.images.push(attrs.src);
          if (tag === "video" && attrs.poster) page.images.push(attrs.poster);
        }
        stack.push(tag);
      },
      ontext(data) {
        pending += data;
      },
      onclosetag(tag) {
        flush();
        // htmlparser2 reports a close (implied or explicit) for every open,
        // including void elements, so the stack stays balanced.
        const i = stack.lastIndexOf(tag);
        if (i >= 0) stack.length = i;
      },
    },
    { decodeEntities: true },
  );
  parser.end(html);
  flush();
  return page;
}

/** Strip Tailwind variant prefixes and the important marker: md:hover:!mt-4 -> mt-4. */
export function baseClass(cls: string): string {
  return (cls.split(":").at(-1) ?? "").replace(/^!+/, "");
}

const classes = (attrs: Record<string, string>): string[] =>
  (attrs.class ?? "").split(/\s+/).filter(Boolean);

class Report {
  findings: Finding[] = [];
  ok(message: string) {
    this.findings.push({ level: "PASS", message });
  }
  fail(message: string) {
    this.findings.push({ level: "FAIL", message });
  }
  warn(message: string) {
    this.findings.push({ level: "WARN", message });
  }
  info(message: string) {
    this.findings.push({ level: "INFO", message });
  }
}

function checkWrapper(page: Page, rep: Report) {
  const bodyCls = classes(page.bodyAttrs ?? {});
  if (bodyCls.includes("m-0") && bodyCls.includes("p-0")) {
    rep.ok("body has m-0 p-0");
  } else {
    rep.fail(`body classes should include m-0 p-0, found: ${bodyCls.join(" ") || "(none)"}`);
  }
  if (page.bodyChildren.length !== 1) {
    rep.fail(`body should have exactly one direct child, found ${page.bodyChildren.length}`);
    return;
  }
  const { tag, attrs } = page.bodyChildren[0];
  const cls = classes(attrs);
  const need = ["min-h-[100dvh]", "py-20", "px-12"];
  const missing = need.filter((n) => !cls.includes(n));
  if (tag === "div" && missing.length === 0) {
    rep.ok("wrapper div has min-h-[100dvh] py-20 px-12");
  } else {
    rep.fail(
      `wrapper should be a div with ${need.join(" ")}; missing: ${missing.join(" ") || "n/a"} (tag <${tag}>)`,
    );
  }
}

function checkText(page: Page, expected: string[], rep: Report) {
  let remaining = page.text.join(" ");
  const missing: string[] = [];
  // Longest first, so a short string cannot consume part of a longer one.
  for (const s of [...expected].sort((a, b) => b.length - a.length)) {
    const norm = s.replace(/\s+/g, " ");
    if (remaining.includes(norm)) {
      remaining = remaining.replace(norm, () => " ");
    } else {
      missing.push(s);
    }
  }
  const extra = remaining.replace(/\s+/g, " ").trim();
  if (missing.length) rep.fail("text missing from page: " + missing.map((m) => `"${m}"`).join("; "));
  if (extra) rep.fail(`unexpected text on page: "${extra}"`);
  if (!missing.length && !extra) {
    rep.ok(`visible text matches the list exactly (${expected.length} strings)`);
  }
}

/** Strip inline `# ...` metadata comments from an images.txt line. */
export function stripImageComment(line: string): string {
  const hashIdx = line.indexOf("#");
  return (hashIdx >= 0 ? line.slice(0, hashIdx) : line).trim();
}

/** Extract trailing FIFE size suffix such as `=w1600` or `=s0` from a URL. */
export function fifeSizeSuffix(url: string): string | null {
  const m = url.match(/=([sw]\d+)$/);
  return m ? `=${m[1]}` : null;
}

/** True when `url` is a Stitch re-hosted `aida-public` FIFE URL. */
export function isAidaPublicUrl(url: string): boolean {
  return /^https:\/\/lh[3-6][^/]*\.googleusercontent\.com\/aida-public\//.test(url);
}

function checkImages(page: Page, expectedRaw: string[], rep: Report) {
  const expected = expectedRaw.map(stripImageComment).filter(Boolean);
  const got = page.images;
  if (got.length === expected.length) {
    let allMatch = true;
    const unsuffixedAidaPublic: string[] = [];
    for (let i = 0; i < expected.length; i++) {
      const g = got[i];
      const e = expected[i];
      if (g === e) continue;
      if (isAidaPublicUrl(g)) {
        const expSuffix = fifeSizeSuffix(e);
        const gotSuffix = fifeSizeSuffix(g);
        if (gotSuffix && (gotSuffix === expSuffix || gotSuffix === "=s0")) {
          continue;
        }
        unsuffixedAidaPublic.push(
          `artwork URL ${i + 1} was re-hosted to aida-public at 512px (missing ${expSuffix ?? "=w<width>"}); ` +
            `append ${expSuffix ?? "=w<width>"} to the aida-public URL in the HTML ` +
            `(or run: node scripts/artwork.ts fix-html <screen.html> --images <images.txt>)`,
        );
        allMatch = false;
      } else {
        allMatch = false;
      }
    }
    if (allMatch) {
      rep.ok(`artwork URLs match, in order (${got.length})`);
      return;
    }
    if (unsuffixedAidaPublic.length > 0) {
      for (const msg of unsuffixedAidaPublic) rep.fail(msg);
      return;
    }
  }
  const short = (urls: string[]) => JSON.stringify(urls.map((u) => u.slice(0, 70)));
  rep.fail(
    `artwork URLs differ: expected ${expected.length}, found ${got.length}; ` +
      `unexpected: ${short(got.filter((u) => !expected.includes(u)))}; ` +
      `missing: ${short(expected.filter((u) => !got.includes(u)))}`,
  );
}

const ICON_FAMILY = /material|icon/i;

function checkFonts(page: Page, raw: string, allowed: Set<string> | undefined, rep: Report) {
  const families = new Set<string>();
  // Links are entity-decoded by the parser; URLs found in raw markup or CSS are not.
  const inRaw = (raw.match(/https:\/\/fonts\.googleapis\.com\/[^"')\s]+/g) ?? []).map((u) =>
    u.replaceAll("&amp;", "&").replaceAll("&#38;", "&"),
  );
  for (const href of [...page.links, ...inRaw]) {
    if (!href.includes("fonts.googleapis.com")) continue;
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      continue;
    }
    for (const fam of url.searchParams.getAll("family")) {
      for (const part of fam.split("|")) {
        families.add(part.split(":")[0].replaceAll("+", " ").trim());
      }
    }
  }

  const icon = [...families].filter((f) => ICON_FAMILY.test(f)).sort();
  if (/font-?awesome|material-symbols|material-icons/i.test(raw)) {
    icon.push("icon font reference in markup");
  }
  if (icon.length) rep.fail(`icon font in use: ${icon.join(", ")}`);
  else rep.ok("no icon font");

  const loaded = new Set([...families].filter((f) => !ICON_FAMILY.test(f)));
  if (!allowed) {
    rep.info(`fonts loaded: ${[...loaded].sort().join(", ") || "(none)"}`);
    return;
  }
  const extra = [...loaded].filter((f) => !allowed.has(f)).sort();
  const missing = [...allowed].filter((f) => !loaded.has(f)).sort();
  if (extra.length) rep.fail(`fonts loaded that were not chosen: ${extra.join(", ")}`);
  if (missing.length) rep.fail(`chosen fonts not loaded: ${missing.join(", ")}`);
  if (!extra.length && !missing.length) rep.ok(`fonts are exactly: ${[...loaded].sort().join(", ")}`);
}

function checkLayout(page: Page, rep: Report, allowAbsolute: boolean) {
  const margins: string[] = [];
  const spaces: string[] = [];
  const absolutes: string[] = [];
  const oneSided: string[] = [];
  const flexes: string[] = [];
  let grids = 0;
  let subgrids = 0;
  let gaps = 0;
  const wrapper = page.bodyChildren.length === 1 ? page.bodyChildren[0] : null;

  for (const el of page.elements) {
    const { tag, attrs } = el;
    const isWrapper = el === wrapper;
    for (const c of classes(attrs).map(baseClass)) {
      const m = c.match(/^-?m([trblxyse]?)-(.+)$/);
      if (m && !ZERO.has(m[2])) margins.push(`<${tag}> ${c}`);
      if (/^-?space-[xy]-/.test(c) && !c.endsWith("reverse")) spaces.push(`<${tag}> ${c}`);
      if (c === "absolute" || c === "fixed") absolutes.push(`<${tag}> ${c}`);
      const p = c.match(/^p([trblse])-(.+)$/);
      if (p && !ZERO.has(p[2]) && !isWrapper) oneSided.push(`<${tag}> ${c}`);
      if ((c === "flex" || c === "inline-flex") && !isWrapper) flexes.push(`<${tag}>`);
      if (c === "grid" || c === "inline-grid") grids++;
      if (c === "grid-cols-subgrid" || c === "grid-rows-subgrid") subgrids++;
      if (/^gap(-[xy])?-/.test(c)) gaps++;
    }

    const s = (attrs.style ?? "").toLowerCase();
    if (!s) continue;
    for (const [, prop, val] of s.matchAll(/(margin[a-z-]*)\s*:\s*([^;]+)/g)) {
      if (!["0", "0px"].includes(val.trim())) margins.push(`<${tag}> style ${prop}:${val.trim()}`);
    }
    if (/position\s*:\s*(absolute|fixed)/.test(s)) absolutes.push(`<${tag}> style position`);
    if (/display\s*:\s*(inline-)?grid/.test(s)) grids++;
    if (s.includes("subgrid")) subgrids++;
    if (/(^|[;\s])(row-|column-)?gap\s*:/.test(s)) gaps++;
    if (/display\s*:\s*(inline-)?flex/.test(s) && !isWrapper) flexes.push(`<${tag}> style`);
  }

  // Rules that target only html/body are page scaffolding (Stitch injects one), not layout.
  let css = "";
  for (const [, selector, decls] of page.styles.join(" ").toLowerCase().matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const targets = selector.split(",").map((t) => t.trim());
    if (targets.every((t) => t === "html" || t === "body")) continue;
    css += `${selector}{${decls}} `;
  }
  for (const [, prop, val] of css.matchAll(/(margin[a-z-]*)\s*:\s*([^;}]+)/g)) {
    if (!["0", "0px"].includes(val.trim())) margins.push(`<style> ${prop}:${val.trim()}`);
  }
  if (/position\s*:\s*(absolute|fixed)/.test(css)) absolutes.push("<style> position");
  subgrids += css.split("subgrid").length - 1;

  const show = (items: string[]) =>
    items.slice(0, 8).join(", ") + (items.length > 8 ? ` (+${items.length - 8} more)` : "");

  const spacing = [...margins, ...spaces];
  if (spacing.length) rep.fail(`margin used for spacing (${spacing.length}): ${show(spacing)}`);
  else rep.ok("no margins");

  if (absolutes.length && !allowAbsolute) {
    rep.fail(`absolute/fixed positioning (${absolutes.length}): ${show(absolutes)}`);
  } else if (absolutes.length) {
    rep.warn(`absolute/fixed positioning allowed by flag (${absolutes.length}): ${show(absolutes)}`);
  } else {
    rep.ok("no absolute or fixed positioning");
  }

  if (oneSided.length) rep.warn(`one-sided padding, likely a nudge (${oneSided.length}): ${show(oneSided)}`);
  if (flexes.length) rep.warn(`flex containers inside the wrapper (${flexes.length}); grid is the layout tool`);

  if (grids === 0) rep.fail("no grid containers found");
  else rep.ok(`grid containers: ${grids}, with gap declarations: ${gaps}`);

  if (subgrids === 0) rep.warn("no subgrid found; rows are not sharing alignment lines");
  else rep.ok(`subgrid used: ${subgrids}`);
}

export function lintScreen(html: string, opts: LintOptions): Finding[] {
  const page = parsePage(html);
  const rep = new Report();
  checkWrapper(page, rep);
  checkText(page, opts.text, rep);
  if (opts.images) checkImages(page, opts.images, rep);
  checkFonts(page, html, opts.fonts, rep);
  checkLayout(page, rep, opts.allowAbsolute ?? false);
  return rep.findings;
}
