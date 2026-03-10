#!/usr/bin/env node
// Quick script to create minimal placeholder PNG icons
// No dependencies needed – uses raw PNG binary

const fs = require("fs");
const path = require("path");

// Minimal 1x1 purple PNG (valid PNG file)
// This is a properly encoded 1x1 pixel PNG with a purple (#a78bfa) pixel
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A  // PNG signature
]);

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPNG(size) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);   // width
  ihdr.writeUInt32BE(size, 4);   // height
  ihdr[8] = 8;                    // bit depth
  ihdr[9] = 2;                    // color type (RGB)
  ihdr[10] = 0;                   // compression
  ihdr[11] = 0;                   // filter
  ihdr[12] = 0;                   // interlace

  // IDAT - raw image data (filter byte + RGB for each row)
  const rawData = [];
  for (let y = 0; y < size; y++) {
    rawData.push(0); // filter: none
    for (let x = 0; x < size; x++) {
      // Gradient from purple to pink
      const t = (x + y) / (2 * size);
      const r = Math.round(167 + (244 - 167) * t);
      const g = Math.round(139 + (114 - 139) * t);
      const b = Math.round(250 + (182 - 250) * t);
      rawData.push(r, g, b);
    }
  }

  // Use zlib deflate
  const zlib = require("zlib");
  const compressed = zlib.deflateSync(Buffer.from(rawData));

  return Buffer.concat([
    pngHeader,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0))
  ]);
}

const outDir = path.join(__dirname, "icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

[16, 48, 128].forEach(size => {
  const png = createPNG(size);
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), png);
  console.log(`✓ Created icons/icon${size}.png (${size}x${size}, ${png.length} bytes)`);
});

console.log("\nDone! Icons are ready.");
