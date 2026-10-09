#!/usr/bin/env node
/**
 * Upload, refresh, and swap Stitch artwork URLs for small-design.
 *
 * Commands:
 *   node artwork.ts upload <file.jpg> --project <id> [--title "<title>"] [--width <px>] [--out <images.txt>]
 *   node artwork.ts fix-html <screen.html> --images <images.txt>
 *   node artwork.ts refresh <images.txt> [--project <id>] [--force] [--swap <file> ...]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename } from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { fifeSizeSuffix, isAidaPublicUrl, parsePage } from "./lint.ts";

export interface ImageEntry {
  url: string;
  screenId?: string;
  projectId?: string;
  width?: number;
  file?: string;
}

const USAGE = `usage:
  node artwork.ts upload <file> --project <id> [--title "<title>"] [--width <px>] [--out <images.txt>]
  node artwork.ts fix-html <screen.html> --images <images.txt>
  node artwork.ts refresh <images.txt> [--project <id>] [--force] [--swap <file> ...]`;

/** Strip any trailing FIFE size suffix (`=w640`, `=s0`, etc.) from a URL. */
export function stripFifeSuffix(url: string): string {
  return url.replace(/=[a-zA-Z0-9_-]+$/, "");
}

/** Return `url` with `=w<width>` (or `=s0` when width is unknown) appended. */
export function withWidthSuffix(url: string, width?: number): string {
  const base = stripFifeSuffix(url);
  return width && width > 0 ? `${base}=w${width}` : `${base}=s0`;
}

/** Parse one line from `<name>.images.txt`, including optional `# key=value` metadata. */
export function parseImageLine(line: string): ImageEntry | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const hashIdx = trimmed.indexOf("#");
  const url = (hashIdx >= 0 ? trimmed.slice(0, hashIdx) : trimmed).trim();
  if (!url) return null;

  const entry: ImageEntry = { url };
  const suffixMatch = url.match(/=w(\d+)$/);
  if (suffixMatch) {
    entry.width = Number(suffixMatch[1]);
  }

  if (hashIdx >= 0) {
    const comment = trimmed.slice(hashIdx + 1).trim();
    for (const token of comment.split(/\s+/)) {
      const eq = token.indexOf("=");
      if (eq <= 0) continue;
      const key = token.slice(0, eq);
      const val = token.slice(eq + 1);
      if (!val) continue;
      if (key === "screen") entry.screenId = val;
      else if (key === "project") entry.projectId = val;
      else if (key === "width" && /^\d+$/.test(val)) entry.width = Number(val);
      else if (key === "file") entry.file = val;
    }
  }
  return entry;
}

/** Parse all image entries from an `<images.txt>` file's contents. */
export function parseImageEntries(content: string): ImageEntry[] {
  const entries: ImageEntry[] = [];
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseImageLine(line);
    if (parsed) entries.push(parsed);
  }
  return entries;
}

/** Format an `ImageEntry` as a single `<images.txt>` line with `# key=value` provenance. */
export function formatImageLine(entry: ImageEntry): string {
  const meta: string[] = [];
  if (entry.screenId) meta.push(`screen=${entry.screenId}`);
  if (entry.projectId) meta.push(`project=${entry.projectId}`);
  if (entry.width) meta.push(`width=${entry.width}`);
  if (entry.file) meta.push(`file=${entry.file}`);
  return meta.length > 0 ? `${entry.url}  # ${meta.join(" ")}` : entry.url;
}

/** Format a list of `ImageEntry` items as `<images.txt>` file content. */
export function formatImageEntries(entries: ImageEntry[]): string {
  return entries.map(formatImageLine).join("\n") + (entries.length ? "\n" : "");
}

/**
 * Read pixel dimensions from a PNG, JPEG, or WebP buffer without external dependencies.
 */
export function readImageDimensions(buf: Buffer): { width: number; height: number } | null {
  // PNG: 8-byte signature + IHDR chunk at offset 16 (width: 4B BE, height: 4B BE)
  if (
    buf.length >= 24 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  }

  // JPEG: scan markers for SOF0..SOF3 / SOF5..SOF7 / SOF9..SOF11 / SOF13..SOF15
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 <= buf.length) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      while (offset < buf.length && buf[offset] === 0xff) offset++;
      if (offset >= buf.length) break;
      const marker = buf[offset++];
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
        continue;
      }
      if (offset + 2 > buf.length) break;
      const segLen = buf.readUInt16BE(offset);
      if (segLen < 2 || offset + segLen > buf.length) break;
      const isSof =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      if (isSof && segLen >= 7) {
        const height = buf.readUInt16BE(offset + 3);
        const width = buf.readUInt16BE(offset + 5);
        return { width, height };
      }
      offset += segLen;
    }
  }

  // WebP: RIFF....WEBP
  if (
    buf.length >= 30 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8 " && buf[23] === 0x9d && buf[24] === 0x01 && buf[25] === 0x2a) {
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      };
    }
    if (chunk === "VP8L" && buf[20] === 0x2f) {
      const b0 = buf[21];
      const b1 = buf[22];
      const b2 = buf[23];
      const b3 = buf[24];
      return {
        width: 1 + (((b1 & 0x3f) << 8) | b0),
        height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
      };
    }
    if (chunk === "VP8X") {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
      };
    }
  }

  return null;
}

/**
 * Fix artwork URLs in downloaded HTML:
 * 1. If Stitch re-hosted an image to an `aida-public` URL without a size suffix (512px),
 *    keep the durable `aida-public` URL and append `=w<width>` (or `=s0`), updating both
 *    the HTML and the corresponding `ImageEntry.url`.
 * 2. Otherwise, if the page has a stale URL at index `i` that differs from `entries[i].url`,
 *    swap `entries[i].url` into the HTML.
 */
export function fixHtmlArtworkUrls(
  html: string,
  entries: ImageEntry[],
): { html: string; changes: string[]; entries: ImageEntry[] } {
  const page = parsePage(html);
  const updatedEntries = entries.map((e) => ({ ...e }));
  const changes: string[] = [];
  if (page.images.length !== entries.length) {
    return { html, changes, entries: updatedEntries };
  }

  let out = html;
  for (let i = 0; i < entries.length; i++) {
    const pageUrl = page.images[i];
    const entry = updatedEntries[i];
    if (isAidaPublicUrl(pageUrl)) {
      const expSuffix = fifeSizeSuffix(entry.url);
      const gotSuffix = fifeSizeSuffix(pageUrl);
      const targetUrl =
        gotSuffix && (gotSuffix === expSuffix || gotSuffix === "=s0")
          ? pageUrl
          : withWidthSuffix(pageUrl, entry.width);
      if (pageUrl !== targetUrl) {
        out = out.replaceAll(pageUrl, targetUrl);
        changes.push(`suffixed aida-public URL ${i + 1} with ${fifeSizeSuffix(targetUrl)}`);
      }
      if (entry.url !== targetUrl) {
        entry.url = targetUrl;
      }
      continue;
    }

    if (pageUrl !== entry.url) {
      out = out.replaceAll(pageUrl, entry.url);
      changes.push(`swapped artwork URL ${i + 1} -> ${entry.url.slice(0, 64)}...`);
    }
  }

  return { html: out, changes, entries: updatedEntries };
}

/**
 * Swap old URLs (both suffixed and unsuffixed base forms) for new URLs in arbitrary text.
 */
export function swapUrlsInText(
  text: string,
  replacements: ReadonlyMap<string, string>,
): { text: string; count: number } {
  let out = text;
  let count = 0;
  for (const [oldUrl, newUrl] of replacements) {
    if (!oldUrl || oldUrl === newUrl) continue;
    if (out.includes(oldUrl)) {
      const parts = out.split(oldUrl);
      count += parts.length - 1;
      out = parts.join(newUrl);
    }
    const bareOld = stripFifeSuffix(oldUrl);
    if (bareOld !== oldUrl && out.includes(bareOld)) {
      // Replace any other size-suffixed or bare occurrence of the same FIFE token
      const escaped = bareOld.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`${escaped}(?:=[a-zA-Z0-9_-]+)?`, "g");
      out = out.replace(re, () => {
        count++;
        return newUrl;
      });
    }
  }
  return { text: out, count };
}

function runStitchJson(args: string[]): any {
  const stdout = execFileSync("stitch", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(stdout);
}

function extractScreenId(uploadJson: any): string | undefined {
  const data = uploadJson?.data ?? uploadJson;
  return (
    data?.id ??
    data?.screenId ??
    data?.screens?.[0]?.id ??
    data?.screens?.[0]?.screenId ??
    data?.results?.[0]?.screen?.id
  );
}

function extractDownloadUrl(screenJson: any): string | undefined {
  const data = screenJson?.data ?? screenJson;
  return data?.screenshot?.downloadUrl ?? data?.imageUrl;
}

function fetchFreshUrlFromScreen(projectId: string, screenId: string, width?: number): string {
  const res = runStitchJson(["get", "screen", screenId, "--project", projectId, "--json"]);
  const rawUrl = extractDownloadUrl(res);
  if (!rawUrl) {
    throw new Error(`stitch get screen ${screenId} did not return data.screenshot.downloadUrl`);
  }
  return withWidthSuffix(rawUrl, width);
}

function uploadFileToStitch(
  filePath: string,
  projectId: string,
  title?: string,
  explicitWidth?: number,
): ImageEntry {
  const buf = readFileSync(filePath);
  const dims = readImageDimensions(buf);
  const width = explicitWidth ?? dims?.width;
  const screenTitle = title ?? basename(filePath);

  const upRes = runStitchJson([
    "upload",
    "screen",
    filePath,
    "--project",
    projectId,
    "--title",
    screenTitle,
    "--json",
  ]);
  const screenId = extractScreenId(upRes);
  if (!screenId) {
    throw new Error(`stitch upload screen did not return a screen id for ${filePath}`);
  }
  const url = fetchFreshUrlFromScreen(projectId, screenId, width);
  return {
    url,
    screenId,
    projectId,
    width,
    file: filePath,
  };
}

async function isUrlLive(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

function cmdUpload(argv: string[]): number {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      project: { type: "string" },
      title: { type: "string" },
      width: { type: "string" },
      out: { type: "string" },
    },
  });
  const filePath = positionals[0];
  if (!filePath || !values.project) {
    console.error(USAGE);
    return 2;
  }
  const explicitWidth = values.width ? Number(values.width) : undefined;
  const entry = uploadFileToStitch(filePath, values.project, values.title, explicitWidth);
  const line = formatImageLine(entry);
  console.log(line);

  if (values.out) {
    const existing = existsSync(values.out)
      ? parseImageEntries(readFileSync(values.out, "utf8"))
      : [];
    const idx = existing.findIndex(
      (e) => (entry.file && e.file === entry.file) || (entry.screenId && e.screenId === entry.screenId),
    );
    if (idx >= 0) existing[idx] = entry;
    else existing.push(entry);
    writeFileSync(values.out, formatImageEntries(existing), "utf8");
  }
  return 0;
}

function cmdFixHtml(argv: string[]): number {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      images: { type: "string" },
    },
  });
  const htmlPath = positionals[0];
  if (!htmlPath || !values.images) {
    console.error(USAGE);
    return 2;
  }
  const html = readFileSync(htmlPath, "utf8");
  const entries = parseImageEntries(readFileSync(values.images, "utf8"));
  const result = fixHtmlArtworkUrls(html, entries);
  if (result.changes.length > 0) {
    writeFileSync(htmlPath, result.html, "utf8");
    writeFileSync(values.images, formatImageEntries(result.entries), "utf8");
    for (const c of result.changes) console.log(`FIXED  ${c}`);
  } else {
    console.log("OK     no artwork URL changes needed");
  }
  return 0;
}

async function cmdRefresh(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      project: { type: "string" },
      force: { type: "boolean", default: false },
      swap: { type: "string", multiple: true },
    },
  });
  const imagesPath = positionals[0];
  if (!imagesPath) {
    console.error(USAGE);
    return 2;
  }
  const entries = parseImageEntries(readFileSync(imagesPath, "utf8"));
  const replacements = new Map<string, string>();

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const live = values.force ? false : await isUrlLive(entry.url);
    if (live) {
      console.log(`KEEP   [${i + 1}] URL is live (${entry.url.slice(0, 64)}...)`);
      continue;
    }

    const projectId = values.project ?? entry.projectId;
    if (!projectId) {
      console.error(
        `FAIL   [${i + 1}] URL expired and no project id found; pass --project <id> or record # project=<id> in ${imagesPath}`,
      );
      return 1;
    }

    let freshEntry: ImageEntry | undefined;
    if (entry.screenId && (!values.project || values.project === entry.projectId)) {
      try {
        const freshUrl = fetchFreshUrlFromScreen(projectId, entry.screenId, entry.width);
        freshEntry = { ...entry, projectId, url: freshUrl };
      } catch {
        // Fall through to re-upload if local file exists
      }
    }
    if (!freshEntry && entry.file && existsSync(entry.file)) {
      freshEntry = uploadFileToStitch(entry.file, projectId, undefined, entry.width);
    }
    if (!freshEntry) {
      console.error(
        `FAIL   [${i + 1}] Could not regenerate URL (need valid # screen=<id> or existing # file=<path> in ${imagesPath})`,
      );
      return 1;
    }

    replacements.set(entry.url, freshEntry.url);
    entries[i] = freshEntry;
    console.log(`FRESH  [${i + 1}] ${freshEntry.url.slice(0, 64)}...`);
  }

  writeFileSync(imagesPath, formatImageEntries(entries), "utf8");

  for (const targetPath of values.swap ?? []) {
    const original = readFileSync(targetPath, "utf8");
    const swapped = swapUrlsInText(original, replacements);
    let finalText = swapped.text;
    if (targetPath.endsWith(".html")) {
      const fixed = fixHtmlArtworkUrls(finalText, entries);
      finalText = fixed.html;
    }
    if (finalText !== original) {
      writeFileSync(targetPath, finalText, "utf8");
      console.log(`SWAP   updated ${targetPath}`);
    }
  }
  return 0;
}

async function main(): Promise<number> {
  const [subcmd, ...rest] = process.argv.slice(2);
  if (!subcmd || subcmd === "-h" || subcmd === "--help") {
    console.log(USAGE);
    return subcmd ? 0 : 2;
  }
  try {
    if (subcmd === "upload") return cmdUpload(rest);
    if (subcmd === "fix-html") return cmdFixHtml(rest);
    if (subcmd === "refresh") return await cmdRefresh(rest);
    console.error(`Unknown subcommand: ${subcmd}\n${USAGE}`);
    return 2;
  } catch (err) {
    console.error((err as Error).message);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => {
    process.exitCode = code;
  });
}
