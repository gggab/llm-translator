// 生成 images/icon.png(128x128),零依赖,仅用 Node 内置 zlib。
// 画面:蓝紫渐变圆角背景 + 白色地球(外圈 + 经线椭圆 + 两条纬线)。
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const S = 128;
const buf = Buffer.alloc(S * S * 4); // RGBA

function set(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= S || y >= S) return;
  const i = (y * S + x) * 4;
  const ia = a / 255;
  buf[i] = Math.round(buf[i] * (1 - ia) + r * ia);
  buf[i + 1] = Math.round(buf[i + 1] * (1 - ia) + g * ia);
  buf[i + 2] = Math.round(buf[i + 2] * (1 - ia) + b * ia);
  buf[i + 3] = Math.max(buf[i + 3], a);
}

// 平滑边缘:dist 为到边界的有符号距离(像素),宽度 1px 过渡
function cover(dist) {
  return Math.max(0, Math.min(1, 0.5 - dist));
}

const cx = S / 2, cy = S / 2;
const radius = 26; // 圆角半径

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    // 圆角矩形背景
    const dx = Math.max(radius - x, x - (S - radius), 0);
    const dy = Math.max(radius - y, y - (S - radius), 0);
    const rectDist = Math.hypot(dx, dy) - radius;
    const bgA = cover(rectDist);
    if (bgA > 0) {
      const t = (x + y) / (2 * S); // 对角渐变
      const r = Math.round(79 + (139 - 79) * t);   // 4F -> 8B
      const g = Math.round(70 + (92 - 70) * t);    // 46 -> 5C
      const b = Math.round(229 + (246 - 229) * t); // E5 -> F6
      set(x, y, r, g, b, Math.round(bgA * 255));
    }
  }
}

// 白色地球
const R = 38;
function ring(px, py, rad, thick) {
  const d = Math.abs(Math.hypot(px - cx, py - cy) - rad);
  return cover(d - thick / 2);
}
function ellipseV(px, py, rx) {
  const nx = (px - cx) / rx;
  const ny = (py - cy) / R;
  const d = (Math.hypot(nx, ny) - 1) * Math.min(rx, R);
  return cover(Math.abs(d) - 1.4);
}
function hline(px, py, yy, halfLen) {
  if (Math.abs(px - cx) > halfLen) return 0;
  return cover(Math.abs(py - yy) - 1.4);
}

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const inside = Math.hypot(x - cx, y - cy) <= R + 1;
    let a = 0;
    a = Math.max(a, ring(x, y, R, 3));            // 外圈
    if (inside) {
      a = Math.max(a, ellipseV(x, y, R * 0.52));  // 中经线
      a = Math.max(a, ellipseV(x, y, R * 0.0001 + 0.5)); // 竖直中线(细)
      a = Math.max(a, hline(x, y, cy, R * 0.96)); // 赤道
      a = Math.max(a, hline(x, y, cy - R * 0.5, R * 0.78)); // 上纬线
      a = Math.max(a, hline(x, y, cy + R * 0.5, R * 0.78)); // 下纬线
    }
    if (a > 0) set(x, y, 255, 255, 255, Math.round(a * 255));
  }
}

// 编码 PNG
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td) >>> 0, 0);
  return Buffer.concat([len, td, crc]);
}
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c;
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8;   // bit depth
ihdr[9] = 6;   // color type RGBA
const raw = Buffer.alloc((S * 4 + 1) * S);
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0; // filter type 0
  buf.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}
const idat = zlib.deflateSync(raw);
const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0))
]);

const outDir = path.join(__dirname, '..', 'images');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'icon.png'), png);
console.log('wrote images/icon.png', png.length, 'bytes');
