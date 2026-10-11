import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Simple CRC32 implementation
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = makeCrcTable();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writePng(width, height, getPixel) {
  // RGBA buffer with filter byte at start of each line
  const rawBytes = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawBytes[offset++] = r;
      rawBytes[offset++] = g;
      rawBytes[offset++] = b;
      rawBytes[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawBytes, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const payload = Buffer.concat([typeBuf, data]);
  const crc = crc32(payload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, payload, crcBuf]);
}

function getIconPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = (isMaskable ? 0.7 : 0.88) * (w / 512);

  // Background color #070D18
  const bgR = 7, bgG = 13, bgB = 24;

  const dx = (x - cx) / scale;
  const dy = (y - cy) / scale;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Golden color palette
  const goldR = 212, goldG = 175, goldB = 55;
  const goldLightR = 250, goldLightG = 225, goldLightB = 140;

  // Thin outer circle rings
  if (Math.abs(dist - 175) < 2) {
    return [goldR, goldG, goldB, 100];
  }
  if (Math.abs(dist - 190) < 1.5) {
    return [goldR, goldG, goldB, 60];
  }

  // Crescent Moon
  // Outer circle: center (10, 0), radius 88
  // Inner circle: center (-14, 0), radius 72
  const dOuter = Math.sqrt((dx - 10) * (dx - 10) + dy * dy);
  const dInner = Math.sqrt((dx + 14) * (dx + 14) + dy * dy);

  const inCrescent = (dOuter <= 88) && (dInner >= 70);

  // 8-point star at (30, 0)
  const sx = dx - 32;
  const sy = dy;
  const inSquare1 = Math.abs(sx) <= 20 && Math.abs(sy) <= 20;
  // rotated 45 deg
  const rotX = (sx + sy) * 0.7071;
  const rotY = (sx - sy) * 0.7071;
  const inSquare2 = Math.abs(rotX) <= 20 && Math.abs(rotY) <= 20;
  const inStarHole = Math.sqrt(sx * sx + sy * sy) <= 7;

  const inStar = (inSquare1 || inSquare2) && !inStarHole;

  if (inStar) {
    return [goldLightR, goldLightG, goldLightB, 255];
  }

  if (inCrescent) {
    const factor = (dy + 88) / 176;
    const r = Math.round(goldR + (goldLightR - goldR) * factor);
    const g = Math.round(goldG + (goldLightG - goldG) * factor);
    const b = Math.round(goldB + (goldLightB - goldB) * factor);
    return [r, g, b, 255];
  }

  return [bgR, bgG, bgB, 255];
}

// Generate icons
const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), writePng(192, 192, (x, y, w, h) => getIconPixel(x, y, w, h, false)));
console.log('Created pwa-192x192.png');

fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), writePng(512, 512, (x, y, w, h) => getIconPixel(x, y, w, h, false)));
console.log('Created pwa-512x512.png');

fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), writePng(512, 512, (x, y, w, h) => getIconPixel(x, y, w, h, true)));
console.log('Created pwa-maskable-512x512.png');

fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), writePng(180, 180, (x, y, w, h) => getIconPixel(x, y, w, h, false)));
console.log('Created apple-touch-icon.png');

// Copy 192 to favicon.ico for browser compat
fs.copyFileSync(path.join(outDir, 'apple-touch-icon.png'), path.join(outDir, 'favicon.ico'));
console.log('Created favicon.ico');
