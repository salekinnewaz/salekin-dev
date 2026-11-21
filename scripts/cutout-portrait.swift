#!/usr/bin/env swift
//
// Cutout portrait generator.
//
// The shipped profile photo is a square studio headshot on a uniform
// grey backdrop. The hero design shows a *cut-out* figure standing on a
// tilted frame, so the backdrop has to be removed.
//
// This samples the backdrop colour from the image corners, then builds
// an alpha channel from each pixel's distance to that colour and blurs
// it, so the cut-out edge is soft rather than stair-stepped. The result
// is a PNG with a real alpha channel.
//
// Usage:  swift scripts/cutout-portrait.swift <input> <output> [tolerance]
//
import Foundation
import CoreImage
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count >= 3 else {
    FileHandle.standardError.write(
        Data("usage: cutout-portrait.swift <input> <output> [tolerance]\n".utf8)
    )
    exit(1)
}

let inputPath = args[1]
let outputPath = args[2]
let chromaLimit = args.count >= 4 ? Double(args[3]) ?? 34.0 : 34.0
let lumaLimit = args.count >= 5 ? Double(args[4]) ?? 118.0 : 118.0

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

// ─── Background removal ────────────────────────────────────────────
// The studio backdrop is a neutral light grey with a gentle gradient,
// so it is identified by *saturation* rather than by a single colour:
// a pixel is backdrop when its channels are close to each other (low
// chroma) and it is bright. The subject is either saturated (skin, the
// yellow shirt) or dark (hair, glasses), so neither is mistaken for
// backdrop.
//
// Connectivity is NOT used to decide membership: the subject's hair
// touches the top border of the crop, so a border-seeded flood fill
// stalls the moment it reaches the hair and leaves a large grey slab
// behind. Instead every pixel is classified independently, and the
// feather pass below softens the resulting edge.

var mask = [UInt8](repeating: 255, count: width * height)  // 255 = subject

/// Chroma = the spread between the brightest and darkest channel.
/// Saturation-like, but independent of overall brightness.
@inline(__always)
func chroma(_ x: Int, _ y: Int) -> Double {
    let i = y * bytesPerRow + x * bytesPerPixel
    let r = Double(pixels[i]), g = Double(pixels[i + 1]), b = Double(pixels[i + 2])
    let hi = max(r, max(g, b))
    let lo = min(r, min(g, b))
    return hi - lo
}

/// Luma, 0-255.
@inline(__always)
func luma(_ x: Int, _ y: Int) -> Double {
    let i = y * bytesPerRow + x * bytesPerPixel
    return 0.2126 * Double(pixels[i]) + 0.7152 * Double(pixels[i + 1]) + 0.0722 * Double(pixels[i + 2])
}

/// Is this pixel part of the neutral grey backdrop?
@inline(__always)
func isBackdrop(_ x: Int, _ y: Int) -> Bool {
    let c = chroma(x, y)
    let l = luma(x, y)
    // Low chroma AND bright = the grey backdrop.
    if c <= chromaLimit && l >= lumaLimit { return true }
    // Very low chroma AND very dark = the hair/shadow, which is subject.
    return false
}

for y in 0..<height {
    for x in 0..<width {
        if isBackdrop(x, y) {
            mask[y * width + x] = 0
        }
    }
}

// Feather the boundary so the cut-out edge is soft rather than
// stair-stepped. A subject pixel close in colour to the backdrop gets
// partial alpha.
let featherLimit = 26.0
for y in 1..<(height - 1) {
    for x in 1..<(width - 1) {
        let idx = y * width + x
        if mask[idx] == 0 { continue }
        let i = y * bytesPerRow + x * bytesPerPixel
        let r = Double(pixels[i]), g = Double(pixels[i + 1]), b = Double(pixels[i + 2])
        let hi = max(r, max(g, b)), lo = min(r, min(g, b))
        // Distance from this pixel to the neutral grey the backdrop
        // sits around (about 158, 158, 156).
        let d = ((r - 158).magnitude + (g - 158).magnitude + (b - 156).magnitude) / 3.0
        let c = hi - lo
        // Only feather pixels that are close to grey in BOTH chroma and
        // distance — i.e. genuine edge pixels.
        if c <= 40 && d < featherLimit {
            let a = min(1.0, d / featherLimit)
            mask[idx] = UInt8((a * a * (3 - 2 * a) * 255).rounded())
        }
    }
}

// ─── Debug: write the raw mask ─────────────────────────────────────
if let dbgIndex = CommandLine.arguments.firstIndex(of: "--mask-dump") {
    let dumpName = dbgIndex + 1 < CommandLine.arguments.count ? CommandLine.arguments[dbgIndex + 1] : "/tmp/mask.png"
    var dumpPixels = [UInt8](repeating: 0, count: width * height * 4)
    for i in 0..<(width * height) {
        let di = i * 4
        dumpPixels[di] = mask[i]
        dumpPixels[di + 1] = mask[i]
        dumpPixels[di + 2] = mask[i]
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

// Blur the mask so the cut-out edge is soft rather than stair-stepped.
let ciContext = CIContext()
let maskData = Data(mask)
let maskCI = CIImage(
    bitmapData: maskData,
    bytesPerRow: width,
    size: CGSize(width: width, height: height),
    format: .L8,
    colorSpace: CGColorSpaceCreateDeviceGray()
)
let blurred = ciContext.createCGImage(
    maskCI.applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 1.6]),
    from: maskCI.extent
)!

// Apply the mask as the image's alpha channel.
//
// Core Image normalises the `.L8` mask to a four-channel image, so the
// blurred grey value lives in the RGB channels (not the alpha channel,
// which is fully opaque). Read the red channel as the mask value.
var outPixels = [UInt8](repeating: 0, count: width * height * 4)
let blurData = blurred.dataProvider!.data! as Data
let blurBytes = [UInt8](blurData)
let blurBpp = blurred.bitsPerPixel / 8
let blurRow = blurred.bytesPerRow
for y in 0..<height {
    for x in 0..<width {
        let i = y * width + x
        let si = i * bytesPerPixel
        let di = i * 4
        outPixels[di] = pixels[si]
        outPixels[di + 1] = pixels[si + 1]
        outPixels[di + 2] = pixels[si + 2]
        let bi = y * blurRow + x * blurBpp
        outPixels[di + 3] = blurBytes[bi]
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
    bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
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

print("wrote \(outputPath) (\(width)x\(height))")
