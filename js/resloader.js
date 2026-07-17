/**
 * resloader.js — 资源加载器
 */
class ResLoader {
  constructor() { this._cache = {}; this._loading = {}; }

  loadImage(src) {
    if (this._cache[src]) return Promise.resolve(this._cache[src]);
    if (this._loading[src]) return this._loading[src];
    this._loading[src] = new Promise((resolve, reject) => {
      const img = wx.createImage();
      img.onload = () => { this._cache[src] = img; delete this._loading[src]; resolve(img); };
      img.onerror = () => { console.warn('[resloader] 加载失败:', src); delete this._loading[src]; resolve(null); };
      img.src = src;
    });
    return this._loading[src];
  }

  async preloadAll() {
    const types = ['wenzi', 'jingui', 'fjg', 'jia', 'piao', 'gudao', 'ying', 'ding', 'die'];
    const promises = [];
    for (const type of types) { for (let i = 1; i <= 5; i++) promises.push(this.loadImage(`images/${type}${i}_spritesheet.png`)); }
    promises.push(this.loadImage('images/background1.jpg'));
    for (let i = 2; i <= 9; i++) promises.push(this.loadImage(`images/background${i}.png`));
    promises.push(this.loadImage('images/tiaozhan.png'));
    for (let i = 1; i <= 9; i++) promises.push(this.loadImage(`images/tiaozhan${i}.png`));
    promises.push(this.loadImage('images/bullet_spritesheet.png'));
    promises.push(this.loadImage('images/mz.png'));
    promises.push(this.loadImage('images/testball_spritesheet.png'));
    const results = await Promise.all(promises);
    const loaded = results.filter(r => r !== null).length;
    console.log(`[resloader] 预加载完成: ${loaded}/${promises.length}`);
  }

  getImage(src) { return this._cache[src] || null; }
  get(src) { return this._cache[src] || null; }
}

const resloader = new ResLoader();
export default resloader;
