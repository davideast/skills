#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const usage = `Export consecutive crops from an approved PNG, without resizing.
Usage: node export-panorama.mjs --input IMAGE.png --out NEW_DIRECTORY
       [--count 3] [--crop x,y,width,height] [--gap 12]
Requires Node 22+, pngjs 7, and the zip command. Destination must not exist.`;

function integer(value, name, minimum) {
  if (!/^\d+$/.test(value)) throw new Error(`${name} must be an integer`);
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < minimum) {
    throw new Error(`${name} must be at least ${minimum}`);
  }
  return result;
}

function hash(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function crop(PNG, source, x, y, width, height) {
  const image = new PNG({ width, height });
  for (let row = 0; row < height; row += 1) {
    const start = ((y + row) * source.width + x) * 4;
    source.data.copy(image.data, row * width * 4, start, start + width * 4);
  }
  return image;
}

function paste(source, target, x) {
  for (let row = 0; row < source.height; row += 1) {
    source.data.copy(
      target.data,
      (row * target.width + x) * 4,
      row * source.width * 4,
      (row + 1) * source.width * 4,
    );
  }
}

// Retain source color interpretation while encoding new RGBA pixel data.
function colorChunks(bytes) {
  const wanted = new Set(['gAMA', 'cHRM', 'sRGB', 'iCCP', 'cICP']);
  const chunks = [];
  for (let offset = 8; offset < bytes.length; ) {
    const length = bytes.readUInt32BE(offset);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error('Invalid PNG chunk length');
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (type === 'acTL') throw new Error('Animated PNGs are not supported');
    if (wanted.has(type)) {
      chunks.push(bytes.subarray(offset, end));
    }
    offset = end;
  }
  return chunks;
}

function encode(PNG, image, profile) {
  const png = PNG.sync.write(image);
  // PNG signature + IHDR occupy the first 33 bytes.
  return Buffer.concat([png.subarray(0, 33), ...profile, png.subarray(33)]);
}

async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: 'string' },
      out: { type: 'string' },
      count: { type: 'string', default: '3' },
      crop: { type: 'string' },
      gap: { type: 'string', default: '12' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
    allowPositionals: false,
  });
  if (values.help) {
    console.log(usage);
    return;
  }
  if (!values.input || !values.out) throw new Error(usage);
  // pngjs is CommonJS; load it lazily so --help works before dependencies are installed.
  const { PNG } = (await import('pngjs')).default;
  const input = path.resolve(values.input);
  const destination = path.resolve(values.out);
  const count = integer(values.count, 'count', 2);
  const gap = integer(values.gap, 'gap', 0);
  // lstat also detects dangling symlinks, which must not be overwritten.
  try {
    fs.lstatSync(destination);
    throw new Error(`Destination already exists: ${destination}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const bytes = fs.readFileSync(input);
  const source = PNG.sync.read(bytes, { checkCRC: true });
  if (source.depth > 8) {
    throw new Error('16-bit PNGs need a 16-bit export workflow; refusing to reduce precision');
  }
  const profile = colorChunks(bytes);
  let bounds = { x: 0, y: 0, width: source.width, height: source.height };
  if (values.crop) {
    const parts = values.crop.split(',');
    if (parts.length !== 4) throw new Error('crop must be x,y,width,height');
    bounds = {
      x: integer(parts[0], 'crop x', 0),
      y: integer(parts[1], 'crop y', 0),
      width: integer(parts[2], 'crop width', 1),
      height: integer(parts[3], 'crop height', 1),
    };
  }
  if (bounds.x + bounds.width > source.width || bounds.y + bounds.height > source.height) {
    throw new Error('Crop extends outside the source');
  }
  if (count > bounds.width) throw new Error('Slice count exceeds the number of pixel columns');
  execFileSync('zip', ['-v'], { stdio: 'ignore' });

  const master = crop(PNG, source, bounds.x, bounds.y, bounds.width, bounds.height);
  const joined = new PNG({ width: master.width, height: master.height });
  const preview = new PNG({ width: master.width + gap * (count - 1), height: master.height });
  for (let index = 0; index < preview.data.length; index += 4) {
    preview.data[index] = 234;
    preview.data[index + 1] = 230;
    preview.data[index + 2] = 223;
    preview.data[index + 3] = 255;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const staging = fs.mkdtempSync(path.join(path.dirname(destination), '.panorama-export-'));
  let reserved = false;
  try {
    const masterBytes = encode(PNG, master, profile);
    fs.writeFileSync(path.join(staging, 'panorama.png'), masterBytes, { flag: 'wx' });
    if (!PNG.sync.read(masterBytes).data.equals(master.data)) {
      throw new Error('Master encoding changed source crop pixels');
    }
    const slices = [];
    const baseWidth = Math.floor(master.width / count);
    const remainder = master.width % count;
    let x = 0;
    for (let index = 0; index < count; index += 1) {
      const width = baseWidth + (index < remainder ? 1 : 0);
      const slice = crop(PNG, master, x, 0, width, master.height);
      const file = `slice-${String(index + 1).padStart(Math.max(2, String(count).length), '0')}.png`;
      const encoded = encode(PNG, slice, profile);
      fs.writeFileSync(path.join(staging, file), encoded, { flag: 'wx' });
      // Verify decoded exported files, not merely the in-memory crop operation.
      const decoded = PNG.sync.read(fs.readFileSync(path.join(staging, file)));
      paste(decoded, joined, x);
      paste(decoded, preview, x + index * gap);
      slices.push({
        order: index + 1,
        file,
        x,
        width,
        height: master.height,
        sha256: hash(encoded),
      });
      x += width;
    }
    if (x !== master.width || !joined.data.equals(master.data)) {
      throw new Error('Reconstructed slices do not match master pixels');
    }
    fs.writeFileSync(path.join(staging, 'carousel-preview.png'), encode(PNG, preview, profile), {
      flag: 'wx',
    });
    const report = {
      source: {
        file: path.basename(input),
        width: source.width,
        height: source.height,
        sha256: hash(bytes),
      },
      crop: bounds,
      master: {
        file: 'panorama.png',
        width: master.width,
        height: master.height,
        sha256: hash(masterBytes),
        rgbaSha256: hash(master.data),
      },
      slices,
      exactSourceCropPixels: true,
      exactReconstructionPixels: true,
      preservedColorChunks: profile.map((chunk) => chunk.toString('ascii', 4, 8)),
      preview: { file: 'carousel-preview.png', gap, upload: false },
    };
    fs.writeFileSync(
      path.join(staging, 'verification.json'),
      JSON.stringify(report, null, 2) + '\n',
      {
        flag: 'wx',
      },
    );
    execFileSync('zip', ['-q', 'carousel-slices.zip', ...slices.map((slice) => slice.file)], {
      cwd: staging,
      stdio: 'pipe',
    });
    // Reserve a fresh destination, then atomically replace our own empty directory.
    fs.mkdirSync(destination);
    reserved = true;
    fs.renameSync(staging, destination);
    reserved = false;
    console.log(
      JSON.stringify(
        { output: destination, master: report.master, slices, exactReconstructionPixels: true },
        null,
        2,
      ),
    );
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
    if (reserved) {
      try {
        fs.rmdirSync(destination);
      } catch {
        /* Never remove a nonempty destination. */
      }
    }
  }
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
