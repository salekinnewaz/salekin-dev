#!/usr/bin/env swift
//
// Cutout portrait generator.
//
// The shipped profile photo is a square studio headshot on a uniform
// grey backdrop. The hero design shows a *cut-out* figure standing on a
// tilted frame, so the backdrop has to be removed.
//
// ── Why this is a flood fill and not a per-pixel threshold ──────────
//
// The first version of this script classified every pixel
// independently by "low chroma and bright = backdrop". That rule cannot
// work on this photograph: the cheek skin at (160,159,157) is a
// distance of *one* from the backdrop grey (158,158,156) because of a
// studio specular highlight, so no colour threshold separates them. It
// also ate the forehead highlights, the glasses' lenses and frames, and
// the yellow shirt — which is what produced the black blotch, the
// white smear across the nose, and the halo around the silhouette.
//
// The rule that *does* work is connectivity: the backdrop is whatever
// you can reach from the image border without crossing the subject.
// So:
//
//   1. A pixel is a *candidate* for backdrop if it is neutral and
//      bright and not warm-cast (the warm-cast gate protects pale
//      skin and the yellow shirt).
//   2. Candidates reachable from any image border through other
//      candidates are backdrop.
//   3. Everything else is the subject.
//
// ── Output guarantees ───────────────────────────────────────────────
//
// The subject's pixels are copied byte-for-byte from the source. The
// alpha channel is binary (0 or 255) — no feather, no blur, no partial
// alpha — because a partial-alpha pixel has to round-trip through
// premultiplied alpha, and that round-trip is what shifted the
// shipped asset's colours by up to a whole unit per channel.
//
// Usage:
//   swift scripts/cutout-portrait.swift <input> <output> [chromaLimit] [lumaLimit]
//          [--max-rb-delta=N] [--mask-dump <path>] [--report] [--verify]
//
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// ─── Arguments ──────────────────────────────────────────────────────

let args = CommandLine.arguments
guard args.count >= 3 else {
    FileHandle.standardError.write(
        Data("usage: cutout-portrait.swift <input> <output> [chromaLimit=22] [lumaLimit=105] [--max-rb-delta=8] [--mask-dump <path>] [--report] [--verify]\n".utf8)
    )
    exit(1)
}

let inputPath = args[1]
let outputPath = args[2]

func flag(_ name: String) -> Bool {
    args.contains(name)
}

func optionValue(_ name: String) -> String? {
    guard let i = args.firstIndex(of: name), i + 1 < args.count else { return nil }
    return args[i + 1]
}

let positional = args.filter { !$0.hasPrefix("--") }
let chromaLimit = positional.count >= 3 ? Double(positional[2]) ?? 22.0 : 22.0
let lumaLimit = positional.count >= 4 ? Double(positional[3]) ?? 105.0 : 105.0
let rbLimit = optionValue("--max-rb-delta").flatMap { Double($0) } ?? 8.0

// ─── Decode ─────────────────────────────────────────────────────────

guard let src = CGImageSourceCreateWithURL(
    URL(fileURLWithPath: inputPath) as CFURL, nil
) else {
    FileHandle.standardError.write(Data("cannot read \(inputPath)\n".utf8))
    exit(1)
}
guard let image = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
    FileHandle.standardError.write(Data("cannot decode \(inputPath)\n".utf8))
    exit(1)
}

let width = image.width
let height = image.height
let bytesPerPixel = 4
let bytesPerRow = width * bytesPerPixel

guard let ctx = CGContext(
    data: nil,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: bytesPerRow,
    space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
    FileHandle.standardError.write(Data("cannot create context\n".utf8))
    exit(1)
}
ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

guard let baseData = ctx.data else { exit(1) }
let pixels = baseData.bindMemory(to: UInt8.self, capacity: bytesPerRow * height)

// ─── Classification ─────────────────────────────────────────────────

@inline(__always)
func rgb(_ x: Int, _ y: Int) -> (Double, Double, Double) {
    let i = y * bytesPerRow + x * bytesPerPixel
    return (
        Double(pixels[i]),
        Double(pixels[i + 1]),
        Double(pixels[i + 2])
    )
}

/// Could this pixel be part of the neutral grey backdrop?
///
/// The warm-cast gate is the important one, and it has to compare
/// **red against blue**, not green against blue.
///
/// The studio backdrop in this photograph is a slightly cool grey
/// (154,155,150) — its green channel sits about 5 above its blue
/// channel. Skin, hair, the yellow shirt and the glasses are all
/// *warm*, meaning red runs well ahead of blue (r−b of 20 to 95).
///
/// So the discriminator is `r − b`. An earlier version of this script
/// tested `g > b + 4` instead, which rejected the backdrop's own
/// green-blue offset and trapped 44 blobs of grey inside the cut-out.
@inline(__always)
func isCandidate(_ x: Int, _ y: Int) -> Bool {
    let (r, g, b) = rgb(x, y)
    let hi = max(r, max(g, b))
    let lo = min(r, min(g, b))
    let c = hi - lo
    let l = 0.2126 * r + 0.7152 * g + 0.0722 * b
    if c > chromaLimit { return false }      // any colour cast = subject
    if l < lumaLimit { return false }        // dark = hair, glasses, shadow
    if r - b > rbLimit { return false }  // warm cast = skin, hair, shirt
    return true
}

// ─── Border-seeded 4-connected flood fill ───────────────────────────

var isBackdrop = [Bool](repeating: false, count: width * height)
var stack: [Int] = []
stack.reserveCapacity(width * height)

func seed(_ index: Int) {
    guard !isBackdrop[index] else { return }
    guard isCandidate(index % width, index / width) else { return }
    isBackdrop[index] = true
    stack.append(index)
}

// Seed from all four borders. The hair in this asset starts a few
// pixels below the top edge, so the whole top row is backdrop.
for x in 0..<width {
    seed(x)                        // top
    seed((height - 1) * width + x) // bottom
}
for y in 0..<height {
    seed(y * width)                // left
    seed(y * width + width - 1)    // right
}

while let index = stack.popLast() {
    let x = index % width
    let y = index / width
    if x > 0 { seed(index - 1) }
    if x < width - 1 { seed(index + 1) }
    if y > 0 { seed(index - width) }
    if y < height - 1 { seed(index + width) }
}

// ─── Despeckle ──────────────────────────────────────────────────────
//
// The flood fill can leave two kinds of artefact behind, and both are
// removed by a connected-component pass rather than a per-pixel one:
//
//   • A small *subject* island in the backdrop — a blob of pixels the
//     classifier rejected as backdrop but that the flood fill could
//     not reach, so it stayed opaque. These are JPEG noise in the
//     studio backdrop.
//   • A small *backdrop* hole inside the silhouette — a pinhole.
//
// Components are 8-connected. The threshold is deliberately generous:
// no part of the photograph is legitimately that small, and the hair's
// finest strands are still an order of magnitude larger.

let minComponentSize = 64

var subject = [Bool](repeating: true, count: width * height)
for y in 0..<height {
    for x in 0..<width {
        if isBackdrop[y * width + x] { subject[y * width + x] = false }
    }
}

var visited = [Bool](repeating: false, count: width * height)
var removedSpecks = 0
var filledHoles = 0

for yTop in 0..<height {
    for x in 0..<width {
        let start = yTop * width + x
        if visited[start] { continue }
        // Collect one 8-connected component of equal-valued pixels.
        var component: [Int] = []
        var stack = [start]
        visited[start] = true
        while let index = stack.popLast() {
            component.append(index)
            let ix = index % width
            let iy = index / width
            for dy in -1...1 {
                for dx in -1...1 {
                    if dx == 0 && dy == 0 { continue }
                    let nx = ix + dx, ny = iy + dy
                    if nx < 0 || nx >= width || ny < 0 || ny >= height { continue }
                    let ni = ny * width + nx
                    if visited[ni] { continue }
                    if subject[ni] != subject[start] { continue }
                    visited[ni] = true
                    stack.append(ni)
                }
            }
        }
        guard component.count < minComponentSize else { continue }
        if subject[start] {
            // A tiny opaque island in the backdrop → make it backdrop.
            for index in component { subject[index] = false }
            removedSpecks += component.count
        } else {
            // A tiny transparent hole inside the subject → fill it.
            for index in component { subject[index] = true }
            filledHoles += component.count
        }
    }
}

// ─── Debug: write the raw mask ─────────────────────────────────────

if let dumpName = optionValue("--mask-dump") {
    var dumpPixels = [UInt8](repeating: 0, count: width * height * 4)
    for i in 0..<(width * height) {
        let di = i * 4
        let v: UInt8 = subject[i] ? 255 : 0
        dumpPixels[di] = v
        dumpPixels[di + 1] = v
        dumpPixels[di + 2] = v
        dumpPixels[di + 3] = 255
    }
    let dumpData = NSMutableData()
    dumpPixels.withUnsafeBufferPointer { dumpData.append($0.baseAddress!, length: dumpPixels.count) }
    if let dumpImage = CGImage(
        width: width, height: height, bitsPerComponent: 8, bitsPerPixel: 32,
        bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
        provider: CGDataProvider(data: dumpData as CFData)!, decode: nil,
        shouldInterpolate: true, intent: .defaultIntent
    ), let dest = CGImageDestinationCreateWithURL(
        URL(fileURLWithPath: dumpName) as CFURL, UTType.png.identifier as CFString, 1, nil
    ) {
        CGImageDestinationAddImage(dest, dumpImage, nil)
        CGImageDestinationFinalize(dest)
        print("mask -> \(dumpName)")
    }
}

// ─── Write the cut-out ──────────────────────────────────────────────
//
// The output context is NON-premultiplied (`.last`), so the subject's
// RGB is stored exactly as read. Writing straight RGB into a
// premultiplied context would scale it by the alpha and silently
// change every colour.

var outPixels = [UInt8](repeating: 0, count: width * height * 4)
var opaqueCount = 0
var transparentCount = 0
for y in 0..<height {
    for x in 0..<width {
        let i = y * width + x
        let si = y * bytesPerRow + x * bytesPerPixel
        let di = i * 4
        if subject[i] {
            outPixels[di] = pixels[si]
            outPixels[di + 1] = pixels[si + 1]
            outPixels[di + 2] = pixels[si + 2]
            outPixels[di + 3] = 255
            opaqueCount += 1
        } else {
            // Backdrop: leave RGB at zero, alpha at zero.
            outPixels[di] = 0
            outPixels[di + 1] = 0
            outPixels[di + 2] = 0
            outPixels[di + 3] = 0
            transparentCount += 1
        }
    }
}

let outData = NSMutableData()
outPixels.withUnsafeBufferPointer { buf in
    outData.append(buf.baseAddress!, length: outPixels.count)
}

guard let out = CGImage(
    width: width,
    height: height,
    bitsPerComponent: 8,
    bitsPerPixel: 32,
    bytesPerRow: width * 4,
    space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue),
    provider: CGDataProvider(data: outData as CFData)!,
    decode: nil,
    shouldInterpolate: true,
    intent: .defaultIntent
) else { exit(1) }

guard let dest = CGImageDestinationCreateWithURL(
    URL(fileURLWithPath: outputPath) as CFURL, UTType.png.identifier as CFString, 1, nil
) else { exit(1) }
CGImageDestinationAddImage(dest, out, nil)
CGImageDestinationFinalize(dest)

// ─── Report ─────────────────────────────────────────────────────────

let total = width * height
if flag("--report") {
    print("source      \(inputPath) (\(width)x\(height))")
    print("opaque      \(opaqueCount) px (\(String(format: "%.1f", Double(opaqueCount) / Double(total) * 100))%)")
    print("transparent \(transparentCount) px (\(String(format: "%.1f", Double(transparentCount) / Double(total) * 100))%)")
    print("filled      \(filledHoles) isolated backdrop px")
    print("removed     \(removedSpecks) isolated subject px")
}

// ─── Verify ─────────────────────────────────────────────────────────
//
// Re-reads the written file and proves the three invariants that
// matter: the subject's pixels are byte-identical to the source, the
// corners are transparent, and there are no isolated specks.

if flag("--verify") {
    guard let vsrc = CGImageSourceCreateWithURL(
        URL(fileURLWithPath: outputPath) as CFURL, nil
    ), let vimage = CGImageSourceCreateImageAtIndex(vsrc, 0, nil),
    let vctx = CGContext(
        data: nil,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
        FileHandle.standardError.write(Data("verify: cannot re-read \(outputPath)\n".utf8))
        exit(1)
    }
    vctx.draw(vimage, in: CGRect(x: 0, y: 0, width: width, height: height))
    guard let vdata = vctx.data else { exit(1) }
    let vp = vdata.bindMemory(to: UInt8.self, capacity: bytesPerRow * height)

    var mismatches = 0
    var opaqueInOutput = 0
    for y in 0..<height {
        for x in 0..<width {
            let vi = y * bytesPerRow + x * bytesPerPixel
            let alpha = vp[vi + 3]
            if alpha != 255 { continue }
            opaqueInOutput += 1
            let si = y * bytesPerRow + x * bytesPerPixel
            if vp[vi] != pixels[si] || vp[vi + 1] != pixels[si + 1] || vp[vi + 2] != pixels[si + 2] {
                mismatches += 1
            }
        }
    }

    func alphaAt(_ x: Int, _ y: Int) -> Int {
        Int(vp[y * bytesPerRow + x * bytesPerPixel + 3])
    }
    let corners = [
        alphaAt(0, 0), alphaAt(width - 1, 0),
        alphaAt(0, height - 1), alphaAt(width - 1, height - 1),
    ]
    let cornersClear = corners.allSatisfy { $0 == 0 }

    // Count isolated opaque pixels.
    var specks = 0
    var minX = width, maxX = -1, minY = height, maxY = -1
    for y in 0..<height {
        for x in 0..<width {
            let vi = y * bytesPerRow + x * bytesPerPixel
            if vp[vi + 3] != 255 { continue }
            minX = min(minX, x); maxX = max(maxX, x)
            minY = min(minY, y); maxY = max(maxY, y)
            var neighbours = 0
            for dy in -1...1 {
                for dx in -1...1 {
                    if dx == 0 && dy == 0 { continue }
                    let nx = x + dx, ny = y + dy
                    if nx < 0 || nx >= width || ny < 0 || ny >= height { continue }
                    if vp[ny * bytesPerRow + nx * bytesPerPixel + 3] == 255 { neighbours += 1 }
                }
            }
            if neighbours == 0 { specks += 1 }
        }
    }

    print("verify opaque px      \(opaqueInOutput)")
    print("verify colour diffs   \(mismatches)")
    print("verify corner alpha   \(corners) -> \(cornersClear ? "clear" : "NOT CLEAR")")
    print("verify isolated px    \(specks)")
    print("verify subject bbox   x \(minX)...\(maxX)  y \(minY)...\(maxY)")

    var ok = true
    if mismatches > 0 {
        print("FAIL: \(mismatches) subject pixels differ from the source")
        ok = false
    }
    if !cornersClear {
        print("FAIL: a corner is not transparent")
        ok = false
    }
    if specks > 0 {
        print("FAIL: \(specks) isolated opaque pixels")
        ok = false
    }
    if minX > maxX {
        print("FAIL: the subject is empty")
        ok = false
    }
    if !ok { exit(1) }
    print("verify OK")
}

print("wrote \(outputPath) (\(width)x\(height))")
