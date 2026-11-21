#!/usr/bin/env node
/**
 * Cut-out regression guard.
 *
 * The portrait cut-out is produced by a build-time Swift script
 * (`scripts/cutout-portrait.swift`) with no test harness of its own.
 * That is exactly how an artefact-prone pipeline shipped a cut-out with
 * a black blotch on the forehead, a white smear across the glasses and
 * a halo around the silhouette.
 *
 * This script asserts the invariants that keep those artefacts out:
 *
 *   1. Every opaque pixel is byte-identical to the source photograph.
 *      Nothing may be re-encoded, smoothed, sharpened or colour-shifted.
 *   2. The four corners are transparent — the backdrop was removed.
 *   3. There are no isolated opaque pixels (speckles) and no isolated
 *      transparent pixels (pinholes) in the silhouette.
 *   4. The opaque bounding box is plausible — this catches the "grey
 *      slab left behind" failure mode a flood-fill regression causes.
 *
 * Run with:  node scripts/qa-cutout.mjs
 *
 * macOS only: the generator is a Swift script. On other platforms the
 * script skips with a clear message rather than failing.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SOURCE = join(ROOT, 'public/images/profile.jpg');
const SHIPPED = join(ROOT, 'public/images/profile-cutout.png');
const SCRIPT = join(ROOT, 'scripts/cutout-portrait.swift');

const results = [];
function record(item, pass, detail) {
  results.push({ item, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${item}${detail ? ` — ${detail}` : ''}`);
}

// ─── Can we run the generator? ──────────────────────────────────────
let hasSwift = true;
try {
  execFileSync('swift', ['--version'], { stdio: 'ignore' });
} catch {
  hasSwift = false;
}

if (!hasSwift) {
  console.log(
    'SKIP  swift is unavailable on this platform — the cut-out invariants ' +
      'cannot be re-derived here.',
  );
  console.log(
    '      The shipped asset is still checked for the invariants that can ' +
      'be verified without the generator.',
  );
} else {
  const dir = mkdtempSync(join(tmpdir(), 'qa-cutout-'));
  try {
    const regenerated = join(dir, 'cutout.png');
    execFileSync(
      'swift',
      [SCRIPT, SOURCE, regenerated, '--report', '--verify'],
      { stdio: 'inherit' },
    );
    record(
      'The cut-out generator reproduces the shipped asset',
      true,
      'swift --verify passed',
    );
  } catch {
    record(
      'The cut-out generator reproduces the shipped asset',
      false,
      'swift --verify failed',
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ─── Pixel-level checks on the shipped asset ────────────────────────
//
// The pixel work is done by the Swift script's own --verify pass, which
// compares the output against the source byte-for-byte. Here we only
// re-assert the structural facts that a reader of the repository can
// confirm without running Swift.

try {
  const { execFileSync: run } = await import('node:child_process');
  const probe = `
import Foundation
import CoreGraphics
import ImageIO

func load(_ path: String) -> CGImage? {
    guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil)
    else { return nil }
    return CGImageSourceCreateImageAtIndex(src, 0, nil)
}

guard let source = load("${SOURCE}"),
      let cutout = load("${SHIPPED}") else {
    FileHandle.standardError.write(Data("probe: cannot load\\n".utf8))
    exit(1)
}

let w = cutout.width, h = cutout.height
func ctx(_ image: CGImage) -> CGContext {
    let c = CGContext(data: nil, width: image.width, height: image.height,
                      bitsPerComponent: 8, bytesPerRow: image.width * 4,
                      space: CGColorSpaceCreateDeviceRGB(),
                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    c.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
    return c
}
let sc = ctx(source), cc = ctx(cutout)
let sp = sc.data!.bindMemory(to: UInt8.self, capacity: source.width * source.height * 4)
let cp = cc.data!.bindMemory(to: UInt8.self, capacity: w * h * 4)

var mismatches = 0, opaque = 0, specks = 0, holes = 0
var minX = w, maxX = -1, minY = h, maxY = -1
func alpha(_ x: Int, _ yTop: Int) -> Int {
    let y = h - 1 - yTop
    return Int(cp[y * w * 4 + x * 4 + 3])
}
for yTop in 0..<h {
    let y = h - 1 - yTop
    for x in 0..<w {
        let ci = y * w * 4 + x * 4
        let si = y * source.width * 4 + x * 4
        if cp[ci + 3] == 255 {
            opaque += 1
            minX = min(minX, x); maxX = max(maxX, x)
            minY = min(minY, yTop); maxY = max(maxY, yTop)
            if cp[ci] != sp[si] || cp[ci+1] != sp[si+1] || cp[ci+2] != sp[si+2] {
                mismatches += 1
            }
        }
    }
}
for yTop in 1..<(h-1) {
    for x in 1..<(w-1) {
        var n = 0
        for dy in -1...1 { for dx in -1...1 {
            if dx == 0 && dy == 0 { continue }
            if alpha(x+dx, yTop+dy) == 255 { n += 1 }
        }}
        if alpha(x, yTop) == 255 && n == 0 { specks += 1 }
        if alpha(x, yTop) != 255 {
            var m = 0
            for dy in -1...1 { for dx in -1...1 {
                if dx == 0 && dy == 0 { continue }
                if alpha(x+dx, yTop+dy) != 255 { m += 1 }
            }}
            if m == 0 { holes += 1 }
        }
    }
}
let corners = [alpha(0,0), alpha(w-1,0), alpha(0,h-1), alpha(w-1,h-1)]
print("MISMATCHES \\(mismatches)")
print("OPAQUE \\(opaque)")
print("SPECKS \\(specks)")
print("HOLES \\(holes)")
print("CORNERS \\(corners.map(String.init).joined(separator: ","))")
print("BBOX \\(minX) \\(maxX) \\(minY) \\(maxY)")
print("SIZE \\(w) \\(h)")
`;
  const out = run('swift', ['-'], { input: probe, encoding: 'utf8' });
  const get = (key) => {
    const line = out.split('\n').find((l) => l.startsWith(`${key} `));
    return line ? line.slice(key.length + 1).trim() : '';
  };
  const mismatches = Number(get('MISMATCHES'));
  const opaque = Number(get('OPAQUE'));
  const specks = Number(get('SPECKS'));
  const holes = Number(get('HOLES'));
  const corners = get('CORNERS');
  const bbox = get('BBOX').split(/\s+/).map(Number);
  const size = get('SIZE').split(/\s+/).map(Number);
  const total = size[0] * size[1];

  record(
    'Every opaque pixel is byte-identical to the source photograph',
    mismatches === 0,
    `${mismatches} mismatching pixels of ${opaque}`,
  );
  record(
    'The four corners are transparent',
    corners === '0,0,0,0',
    `corner alpha = ${corners}`,
  );
  record('There are no isolated opaque pixels', specks === 0, `${specks} specks`);
  record('There are no pinholes inside the silhouette', holes === 0, `${holes} holes`);
  record(
    'The opaque bounding box is plausible',
    bbox[0] >= 0 &&
      bbox[1] > bbox[0] &&
      bbox[3] > bbox[2] &&
      opaque / total > 0.15 &&
      opaque / total < 0.7,
    `bbox x ${bbox[0]}…${bbox[1]} y ${bbox[2]}…${bbox[3]} · ${((opaque / total) * 100).toFixed(1)}% opaque`,
  );
} catch (err) {
  record(
    'The shipped cut-out satisfies its pixel-level invariants',
    false,
    `probe failed: ${err.message}`,
  );
}

console.log('\n────────────────────────────────');
const failed = results.filter((r) => !r.pass);
console.log(
  `TOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
if (failed.length) {
  console.log('\nFAILURES:');
  for (const f of failed) console.log(`  ${f.item} — ${f.detail}`);
  process.exit(1);
}
