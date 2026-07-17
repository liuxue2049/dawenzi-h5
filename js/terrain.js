/**
 * terrain.js — FBM + 域扭曲地形生成（移植自 world.html）
 * 保持原 export API 不变，main.js 无需改动
 */

// ─── Simplex Noise（含 seed / fbm） ───
class SimplexNoise {
  constructor(seed = 42) {
    this.grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    this.perm = new Uint8Array(512);
    this.seed(seed);
  }
  seed(s) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let r = s;
    const rng = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    for (let i = 255; i > 0; i--) {
      const j = (rng() * (i + 1)) | 0;
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  noise2D(x, y) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s), j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - (i - t), y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    const dot = (g, a, b) => g[0] * a + g[1] * b;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) { t0 *= t0; n0 = t0 * t0 * dot(this.grad3[this.perm[ii + this.perm[jj]] % 12], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) { t1 *= t1; n1 = t1 * t1 * dot(this.grad3[this.perm[ii + i1 + this.perm[jj + j1]] % 12], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) { t2 *= t2; n2 = t2 * t2 * dot(this.grad3[this.perm[ii + 1 + this.perm[jj + 1]] % 12], x2, y2); }
    return 70 * (n0 + n1 + n2);
  }
  fbm(x, y, oct, lac, gain) {
    let sum = 0, amp = 1, freq = 1, max = 0;
    for (let i = 0; i < oct; i++) {
      sum += this.noise2D(x * freq, y * freq) * amp;
      max += amp; amp *= gain; freq *= lac;
    }
    return sum / max;
  }
}

// ─── 常量 ───
const CHUNK_W = 256;
const CHUNK_H = 256;
const TILE = 4;            // 渲染瓦片尺寸（与 world.html 一致）
const TERRAIN_SCALE = 3;   // 噪声空间缩放（值越大特征越密）

// ─── 地球生物群系调色板（直接来自 world.html） ───
const BIOME = {
  water:  [[0,30,60],[0,50,100],[20,80,140]],
  beach:  [190,170,120],
  grass:  [[40,120,40],[60,140,50],[80,160,60]],
  forest: [[20,80,20],[30,100,30],[15,70,25]],
  rock:   [[120,110,100],[140,130,120],[100,95,85]],
  snow:   [240,245,255],
  treeColor: [[20,70,15],[35,90,25],[45,110,30]],
};

// ─── mulberry32 确定性随机 ───
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ─── 地形颜色（与 world.html getTerrainColor 完全一致，去掉 nightMul） ───
function terrainRGB(h, m) {
  let r, g, b;
  if (h < 0.28) {
    const t = h / 0.28;
    r = BIOME.water[0][0] + (BIOME.water[2][0] - BIOME.water[0][0]) * t;
    g = BIOME.water[0][1] + (BIOME.water[2][1] - BIOME.water[0][1]) * t;
    b = BIOME.water[0][2] + (BIOME.water[2][2] - BIOME.water[0][2]) * t;
  } else if (h < 0.32) {
    const t = (h - 0.28) / 0.04;
    r = BIOME.water[2][0] + (BIOME.water[1][0] - BIOME.water[2][0]) * t;
    g = BIOME.water[2][1] + (BIOME.water[1][1] - BIOME.water[2][1]) * t;
    b = BIOME.water[2][2] + (BIOME.water[1][2] - BIOME.water[2][2]) * t;
  } else if (h < 0.35) {
    r = BIOME.beach[0]; g = BIOME.beach[1]; b = BIOME.beach[2];
  } else if (h < 0.55) {
    const t = (h - 0.35) / 0.2;
    const mi = Math.max(0, Math.min(2, (m * 2.5) | 0));
    const hi = Math.max(0, Math.min(2, (m * 1.25) | 0));
    const gb = BIOME.grass[mi], fh = BIOME.forest[hi];
    r = gb[0] + (fh[0] - gb[0]) * t;
    g = gb[1] + (fh[1] - gb[1]) * t;
    b = gb[2] + (fh[2] - gb[2]) * t;
  } else if (h < 0.7) {
    const t = (h - 0.55) / 0.15;
    const mi = Math.max(0, Math.min(2, (m * 2.5) | 0));
    const f = BIOME.forest[mi], rk = BIOME.rock[1];
    r = f[0] + (rk[0] - f[0]) * t;
    g = f[1] + (rk[1] - f[1]) * t;
    b = f[2] + (rk[2] - f[2]) * t;
  } else if (h < 0.85) {
    const t = (h - 0.7) / 0.15;
    const ri = Math.max(0, Math.min(2, (t * 2.5) | 0));
    const c = BIOME.rock[ri];
    r = c[0]; g = c[1]; b = c[2];
  } else {
    const t = Math.min(1, (h - 0.85) / 0.15);
    const rk = BIOME.rock[2];
    r = rk[0] + (BIOME.snow[0] - rk[0]) * t;
    g = rk[1] + (BIOME.snow[1] - rk[1]) * t;
    b = rk[2] + (BIOME.snow[2] - rk[2]) * t;
  }
  return [r | 0, g | 0, b | 0];
}

// ─── 公开 API（与原接口完全兼容） ───

export function getChunkSize() {
  return CHUNK_W;   // main.js 当数字用：col * cs, ww / cs, sp.x + cs
}

/**
 * 异步生成地形网格（保留兼容，main.js 存储引用用）
 * 新渲染路径不再依赖 grid，而是按像素实时采样噪声
 */
export async function generateTerrainGrid(worldWidth, worldHeight, seed = 42) {
  return { seed, worldWidth, worldHeight, grid: true };  // grid:true 兼容 main.js 的 !td.grid 检查
}

/**
 * 渲染一个地形 chunk 到离屏 canvas
 * @param {object} terrainData  - 含 seed
 * @param {number} startCol    - chunk 列号
 * @param {number} startRow    - chunk 行号
 * @param {number} [chunkW]    - chunk 宽（像素），缺省用 CHUNK_W
 * @param {number} [chunkH]    - chunk 高（像素），缺省用 CHUNK_H
 */
export function renderTerrainChunk(terrainData, startCol, startRow, chunkW, chunkH) {
  chunkW = chunkW || CHUNK_W;
  chunkH = chunkH || CHUNK_H;
  const seed = (terrainData && terrainData.seed) || 42;
  const noise = new SimplexNoise(seed);

  const offscreen = document.createElement('canvas');
  offscreen.width = chunkW;
  offscreen.height = chunkH;
  const octx = offscreen.getContext('2d');

  const tw = chunkW / TILE;
  const th = chunkH / TILE;
  const imgData = octx.createImageData(chunkW, chunkH);
  const data = imgData.data;

  // ── 逐 TILE 像素渲染地形 ──
  for (let ty = 0; ty < th; ty++) {
    for (let tx = 0; tx < tw; tx++) {
      // 世界坐标（取 TILE 中心）
      const wx = startCol * chunkW + tx * TILE + (TILE >> 1);
      const wy = startRow * chunkH + ty * TILE + (TILE >> 1);

      // 噪声坐标
      const nx = wx * TERRAIN_SCALE / 1000;
      const ny = wy * TERRAIN_SCALE / 1000;

      // 域扭曲（domain warping）—— 与 world.html 完全一致
      const warpX = noise.fbm(nx + 5.2, ny + 1.3, 3, 2, 0.5) * 0.4;
      const warpY = noise.fbm(nx + 9.1, ny + 4.7, 3, 2, 0.5) * 0.4;
      let h = noise.fbm(nx + warpX, ny + warpY, 6, 2.0, 0.5) * 0.5 + 0.5;
      h = Math.max(0, Math.min(1, h));

      // 湿度（独立偏移采样）
      let m = noise.fbm(nx + 20, ny + 20, 4, 2, 0.5) * 0.5 + 0.5;
      m = Math.max(0, Math.min(1, m));

      const rgb = terrainRGB(h, m);

      // 写入 TILE×TILE 像素块
      for (let py = 0; py < TILE; py++) {
        for (let px = 0; px < TILE; px++) {
          const idx = ((ty * TILE + py) * chunkW + (tx * TILE + px)) * 4;
          data[idx]     = rgb[0];
          data[idx + 1] = rgb[1];
          data[idx + 2] = rgb[2];
          data[idx + 3] = 255;
        }
      }
    }
  }
  octx.putImageData(imgData, 0, 0);

  // ── 树木叠加 ──
  _drawTrees(octx, startCol, startRow, chunkW, chunkH, noise, seed);

  return offscreen;
}

// ─── 树木绘制（确定性，同 chunk 同种子 → 同位置同树） ───
function _drawTrees(octx, col, row, cw, ch, noise, baseSeed) {
  const rng = mulberry32(baseSeed + col * 7919 + row * 104729);
  const count = (cw * ch * 0.35 * 0.02) | 0;

  for (let i = 0; i < count; i++) {
    const lx = rng() * cw;
    const ly = rng() * ch;
    const wx = col * cw + lx;
    const wy = row * ch + ly;

    // 采样该位置高度 / 湿度
    const nx = wx * TERRAIN_SCALE / 1000;
    const ny = wy * TERRAIN_SCALE / 1000;
    const wX = noise.fbm(nx + 5.2, ny + 1.3, 3, 2, 0.5) * 0.4;
    const wY = noise.fbm(nx + 9.1, ny + 4.7, 3, 2, 0.5) * 0.4;
    const h = Math.max(0, Math.min(1, noise.fbm(nx + wX, ny + wY, 6, 2, 0.5) * 0.5 + 0.5));
    const m = Math.max(0, Math.min(1, noise.fbm(nx + 20, ny + 20, 4, 2, 0.5) * 0.5 + 0.5));

    // 只在草地/森林区生长（与 world.html 条件一致）
    if (h <= 0.35 || h >= 0.75 || m <= 0.3) continue;

    const size = 2 + rng() * 3;
    const shade = 0.7 + rng() * 0.3;
    const ci = ((lx * 7 + ly * 13) | 0) % BIOME.treeColor.length;
    const c = BIOME.treeColor[ci];
    if (!c) continue;

    const r = (c[0] * shade) | 0;
    const g = (c[1] * shade) | 0;
    const b = (c[2] * shade) | 0;

    if (rng() > 0.7) {
      // 三角形树
      octx.fillStyle = `rgb(${r},${g},${b})`;
      octx.beginPath();
      octx.moveTo(lx, ly - size * 2);
      octx.lineTo(lx - size, ly + size * 0.5);
      octx.lineTo(lx + size, ly + size * 0.5);
      octx.fill();
      octx.fillStyle = `rgb(${(r * 0.4) | 0},${(g * 0.3) | 0},${(b * 0.2) | 0})`;
      octx.fillRect(lx - 1, ly, 2, size);
    } else {
      // 圆形树
      octx.fillStyle = `rgb(${r},${g},${b})`;
      octx.beginPath();
      octx.arc(lx, ly - size, size * 1.2, 0, Math.PI * 2);
      octx.fill();
      octx.fillStyle = `rgb(${(r * 0.4) | 0},${(g * 0.3) | 0},${(b * 0.2) | 0})`;
      octx.fillRect(lx - 1, ly - size, 2, size * 1.5);
    }
  }
}
