const fs = require('fs');
const path = require('path');

function createIco(width, height) {
  const pixels = Buffer.alloc(width * height * 4); // BGRA

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const row = height - 1 - y;
    const offset = (row * width + x) * 4;
    pixels[offset] = b;     // B
    pixels[offset + 1] = g; // G
    pixels[offset + 2] = r; // R
    pixels[offset + 3] = a; // A
  }

  // Draw 32x32 rounded rectangle with gradient #2563EB to #4F46E5
  const cornerRadius = 7;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let inside = true;
      if (x < cornerRadius && y < cornerRadius) {
        inside = Math.hypot(x - cornerRadius + 0.5, y - cornerRadius + 0.5) <= cornerRadius;
      } else if (x >= width - cornerRadius && y < cornerRadius) {
        inside = Math.hypot(x - (width - cornerRadius) + 0.5, y - cornerRadius + 0.5) <= cornerRadius;
      } else if (x < cornerRadius && y >= height - cornerRadius) {
        inside = Math.hypot(x - cornerRadius + 0.5, y - (height - cornerRadius) + 0.5) <= cornerRadius;
      } else if (x >= width - cornerRadius && y >= height - cornerRadius) {
        inside = Math.hypot(x - (width - cornerRadius) + 0.5, y - (height - cornerRadius) + 0.5) <= cornerRadius;
      }

      if (!inside) {
        setPixel(x, y, 0, 0, 0, 0);
        continue;
      }

      const t = (x + y) / (width + height);
      const r = Math.round(37 + (79 - 37) * t);
      const g = Math.round(99 + (70 - 99) * t);
      const b = Math.round(235 + (229 - 235) * t);

      if (x === 1 || y === 1 || x === width - 2 || y === height - 2) {
        setPixel(x, y, Math.min(255, r + 40), Math.min(255, g + 40), Math.min(255, b + 40), 255);
      } else {
        setPixel(x, y, r, g, b, 255);
      }
    }
  }

  // Draw Top Server Box (y: 6 to 13, x: 5 to 26)
  for (let y = 6; y <= 13; y++) {
    for (let x = 5; x <= 26; x++) {
      const isBorder = (y === 6 || y === 13 || x === 5 || x === 26);
      if (isBorder) {
        setPixel(x, y, 255, 255, 255, 240);
      } else {
        setPixel(x, y, 15, 23, 42, 230);
      }
    }
  }
  // Top LEDs
  setPixel(8, 9, 16, 185, 129, 255);
  setPixel(8, 10, 16, 185, 129, 255);
  setPixel(11, 9, 56, 189, 248, 255);
  setPixel(11, 10, 56, 189, 248, 255);
  // Slot drive lines
  for (let x = 16; x <= 23; x++) {
    setPixel(x, 10, 255, 255, 255, 220);
  }

  // Draw Bottom Server Box (y: 17 to 24, x: 5 to 26)
  for (let y = 17; y <= 24; y++) {
    for (let x = 5; x <= 26; x++) {
      const isBorder = (y === 17 || y === 24 || x === 5 || x === 26);
      if (isBorder) {
        setPixel(x, y, 255, 255, 255, 240);
      } else {
        setPixel(x, y, 15, 23, 42, 230);
      }
    }
  }
  // Bottom LED
  setPixel(8, 20, 245, 158, 11, 255);
  setPixel(8, 21, 245, 158, 11, 255);
  // Terminal > _ symbol
  setPixel(12, 19, 52, 211, 153, 255);
  setPixel(13, 20, 52, 211, 153, 255);
  setPixel(12, 21, 52, 211, 153, 255);

  setPixel(16, 21, 56, 189, 248, 255);
  setPixel(17, 21, 56, 189, 248, 255);
  setPixel(18, 21, 56, 189, 248, 255);
  setPixel(19, 21, 56, 189, 248, 255);

  const bih = Buffer.alloc(40);
  bih.writeUInt32LE(40, 0);
  bih.writeInt32LE(width, 4);
  bih.writeInt32LE(height * 2, 8);
  bih.writeUInt16LE(1, 12);
  bih.writeUInt16LE(32, 14);
  bih.writeUInt32LE(0, 16);
  bih.writeUInt32LE(pixels.length, 20);
  bih.writeInt32LE(0, 24);
  bih.writeInt32LE(0, 28);
  bih.writeUInt32LE(0, 32);
  bih.writeUInt32LE(0, 36);

  const andMask = Buffer.alloc((width * height) / 8);
  const imageSize = bih.length + pixels.length + andMask.length;

  const iconDir = Buffer.alloc(6);
  iconDir.writeUInt16LE(0, 0);
  iconDir.writeUInt16LE(1, 2);
  iconDir.writeUInt16LE(1, 4);

  const iconEntry = Buffer.alloc(16);
  iconEntry.writeUInt8(width, 0);
  iconEntry.writeUInt8(height, 1);
  iconEntry.writeUInt8(0, 2);
  iconEntry.writeUInt8(0, 3);
  iconEntry.writeUInt16LE(1, 4);
  iconEntry.writeUInt16LE(32, 6);
  iconEntry.writeUInt32LE(imageSize, 8);
  iconEntry.writeUInt32LE(6 + 16, 12);

  return Buffer.concat([iconDir, iconEntry, bih, pixels, andMask]);
}

const icoBuffer = createIco(32, 32);
fs.writeFileSync(path.resolve('src/app/favicon.ico'), icoBuffer);
fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
console.log('Successfully generated favicon.ico for src/app and public!');
