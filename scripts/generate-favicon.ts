import fs from 'fs';
import path from 'path';

function createIco(width: number, height: number): Buffer {
  // We will create a 32x32 32-bit RGBA BMP inside an ICO
  const pixels = Buffer.alloc(width * height * 4); // BGRA

  function setPixel(x: number, y: number, r: number, g: number, b: number, a: number) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    // ICO BMP stores bottom-to-top!
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
      // Check rounded corners
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

      // Linear gradient: (x + y) / (width + height)
      const t = (x + y) / (width + height);
      // from #2563EB (37, 99, 235) to #4F46E5 (79, 70, 229)
      const r = Math.round(37 + (79 - 37) * t);
      const g = Math.round(99 + (70 - 99) * t);
      const b = Math.round(235 + (229 - 235) * t);

      // Subtle top/left inner border
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
        // Dark slate fill
        setPixel(x, y, 15, 23, 42, 230);
      }
    }
  }
  // Top LEDs
  setPixel(8, 9, 16, 185, 129, 255); // Green LED
  setPixel(8, 10, 16, 185, 129, 255);
  setPixel(11, 9, 56, 189, 248, 255); // Cyan LED
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
  setPixel(8, 20, 245, 158, 11, 255); // Amber LED
  setPixel(8, 21, 245, 158, 11, 255);
  // Terminal > _ symbol
  setPixel(12, 19, 52, 211, 153, 255);
  setPixel(13, 20, 52, 211, 153, 255);
  setPixel(12, 21, 52, 211, 153, 255);

  setPixel(16, 21, 56, 189, 248, 255);
  setPixel(17, 21, 56, 189, 248, 255);
  setPixel(18, 21, 56, 189, 248, 255);
  setPixel(19, 21, 56, 189, 248, 255);

  // BITMAPINFOHEADER (40 bytes)
  const bih = Buffer.alloc(40);
  bih.writeUInt32LE(40, 0); // biSize
  bih.writeInt32LE(width, 4); // biWidth
  bih.writeInt32LE(height * 2, 8); // biHeight (double height for ICO)
  bih.writeUInt16LE(1, 12); // biPlanes
  bih.writeUInt16LE(32, 14); // biBitCount
  bih.writeUInt32LE(0, 16); // biCompression (BI_RGB)
  bih.writeUInt32LE(pixels.length, 20); // biSizeImage
  bih.writeInt32LE(0, 24); // biXPelsPerMeter
  bih.writeInt32LE(0, 28); // biYPelsPerMeter
  bih.writeUInt32LE(0, 32); // biClrUsed
  bih.writeUInt32LE(0, 36); // biClrImportant

  // AND mask (1 bit per pixel, 32 rows * 4 bytes = 128 bytes)
  const andMask = Buffer.alloc((width * height) / 8);

  const imageSize = bih.length + pixels.length + andMask.length;

  // ICONDIR (6 bytes)
  const iconDir = Buffer.alloc(6);
  iconDir.writeUInt16LE(0, 0); // Reserved
  iconDir.writeUInt16LE(1, 2); // Type 1 = ICO
  iconDir.writeUInt16LE(1, 4); // 1 Image

  // ICONDIRENTRY (16 bytes)
  const iconEntry = Buffer.alloc(16);
  iconEntry.writeUInt8(width, 0); // Width
  iconEntry.writeUInt8(height, 1); // Height
  iconEntry.writeUInt8(0, 2); // Color count
  iconEntry.writeUInt8(0, 3); // Reserved
  iconEntry.writeUInt16LE(1, 4); // Color planes
  iconEntry.writeUInt16LE(32, 6); // Bits per pixel
  iconEntry.writeUInt32LE(imageSize, 8); // Size of Image
  iconEntry.writeUInt32LE(6 + 16, 12); // Offset to image data

  return Buffer.concat([iconDir, iconEntry, bih, pixels, andMask]);
}

const icoBuffer = createIco(32, 32);
fs.writeFileSync(path.resolve('src/app/favicon.ico'), icoBuffer);
fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
console.log('Successfully generated favicon.ico for src/app and public!');
