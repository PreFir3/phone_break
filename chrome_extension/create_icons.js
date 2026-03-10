// Run: node create_icons.js
// Creates simple PNG icon files for the Chrome extension

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const sizes = [16, 48, 128];
const outDir = path.join(__dirname, "icons");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#a78bfa");
  grad.addColorStop(1, "#f472b6");
  ctx.fillStyle = grad;

  // Rounded rect
  const r = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Phone outline
  const px = size * 0.3, py = size * 0.15, pw = size * 0.4, ph = size * 0.7;
  const pr = size * 0.06;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(1, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(px + pr, py);
  ctx.lineTo(px + pw - pr, py);
  ctx.quadraticCurveTo(px + pw, py, px + pw, py + pr);
  ctx.lineTo(px + pw, py + ph - pr);
  ctx.quadraticCurveTo(px + pw, py + ph, px + pw - pr, py + ph);
  ctx.lineTo(px + pr, py + ph);
  ctx.quadraticCurveTo(px, py + ph, px, py + ph - pr);
  ctx.lineTo(px, py + pr);
  ctx.quadraticCurveTo(px, py, px + pr, py);
  ctx.closePath();
  ctx.stroke();

  // X mark
  ctx.lineWidth = Math.max(1, size * 0.05);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(size * 0.38, size * 0.38);
  ctx.lineTo(size * 0.62, size * 0.62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.62, size * 0.38);
  ctx.lineTo(size * 0.38, size * 0.62);
  ctx.stroke();

  const buf = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), buf);
  console.log(`Created icon${size}.png`);
}

console.log("Done!");
