(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // js/render.js
  var SCREEN_WIDTH, SCREEN_HEIGHT, canvas2, ctx;
  const IS_PC = !("ontouchstart" in window) && navigator.maxTouchPoints === 0;
  var init_render = __esm({
    "js/render.js"() {
      SCREEN_WIDTH = window.innerWidth;
      SCREEN_HEIGHT = window.innerHeight;
      canvas2 = window.canvas;
      ctx = canvas2.getContext("2d");
      canvas2.width = SCREEN_WIDTH;
      canvas2.height = SCREEN_HEIGHT;
      GameGlobal.__onResize = (w, h) => {
        SCREEN_WIDTH = w;
        SCREEN_HEIGHT = h;
        canvas2.width = w;
        canvas2.height = h;
      };
    }
  });

  // js/resloader.js
  var resloader_exports = {};
  __export(resloader_exports, {
    default: () => resloader_default
  });
  var ResLoader, resloader, resloader_default;
  var init_resloader = __esm({
    "js/resloader.js"() {
      ResLoader = class {
        constructor() {
          this._cache = {};
          this._loading = {};
        }
        loadImage(src) {
          if (this._cache[src]) return Promise.resolve(this._cache[src]);
          if (this._loading[src]) return this._loading[src];
          this._loading[src] = new Promise((resolve, reject) => {
            const img = wx.createImage();
            img.onload = () => {
              this._cache[src] = img;
              delete this._loading[src];
              resolve(img);
            };
            img.onerror = () => {
              console.warn("[resloader] \u52A0\u8F7D\u5931\u8D25:", src);
              delete this._loading[src];
              resolve(null);
            };
            img.src = src;
          });
          return this._loading[src];
        }
        async preloadAll() {
          const types = ["wenzi", "jingui", "fjg", "jia", "piao", "gudao", "ying", "ding", "die"];
          const promises = [];
          for (const type of types) {
            for (let i = 1; i <= 5; i++) promises.push(this.loadImage(`images/${type}${i}_spritesheet.png`));
          }
          promises.push(this.loadImage("images/background1.jpg"));
          for (let i = 2; i <= 9; i++) promises.push(this.loadImage(`images/background${i}.png`));
          promises.push(this.loadImage("images/tiaozhan.png"));
          for (let i = 1; i <= 9; i++) promises.push(this.loadImage(`images/tiaozhan${i}.png`));
          promises.push(this.loadImage("images/dawenzi_cover.jpg"));
          promises.push(this.loadImage("images/tubiao.png"));
          promises.push(this.loadImage("images/bullet_spritesheet.png"));
          promises.push(this.loadImage("images/mz.png"));
          promises.push(this.loadImage("images/testball_spritesheet.png"));
          const results = await Promise.all(promises);
          const loaded = results.filter((r) => r !== null).length;
          console.log(`[resloader] \u9884\u52A0\u8F7D\u5B8C\u6210: ${loaded}/${promises.length}`);
        }
        getImage(src) {
          return this._cache[src] || null;
        }
        get(src) {
          return this._cache[src] || null;
        }
      };
      resloader = new ResLoader();
      resloader_default = resloader;
    }
  });

  // js/runtime/pedia.js
  var pedia_exports = {};
  __export(pedia_exports, {
    handlePediaTouch: () => handlePediaTouch,
    renderPedia: () => renderPedia
  });
  function renderPedia(ctx3, databus) {
    const collected = databus.collectedInsects || [];
    ctx3.fillStyle = "rgba(0,0,0,0.85)";
    ctx3.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx3.fillStyle = "#FFF";
    ctx3.font = "bold 22px Arial";
    ctx3.textAlign = "center";
    ctx3.fillText("\u{1F4D6} \u6606\u866B\u56FE\u9274", SCREEN_WIDTH / 2, 40);
    let sy = 70;
    Object.entries(DATA).forEach(([cat, data]) => {
      ctx3.fillStyle = "#4CAF50";
      ctx3.font = "bold 16px Arial";
      ctx3.textAlign = "left";
      ctx3.fillText(`\u3010${data.name}\u3011`, 20, sy);
      sy += 25;
      data.entries.forEach((e, i) => {
        const col = i % 2, row = Math.floor(i / 2), cw = (SCREEN_WIDTH - 60) / 2, cx = 15 + col * (cw + 10), cy = sy + row * 68;
        const key = `${cat}_${e.id}`, ok = collected.includes(key);
        ctx3.fillStyle = ok ? "rgba(76,175,80,0.3)" : "rgba(255,255,255,0.1)";
        ctx3.beginPath();
        ctx3.roundRect(cx, cy, cw, 60, 6);
        ctx3.fill();
        ctx3.fillStyle = ok ? "#FFF" : "#666";
        ctx3.font = "bold 14px Arial";
        ctx3.fillText(ok ? e.name : "\u672A\u6536\u96C6", cx + 20, cy + 35);
      });
      sy += Math.ceil(data.entries.length / 2) * 68 + 15;
    });
    ctx3.fillStyle = "#f44336";
    ctx3.beginPath();
    ctx3.arc(SCREEN_WIDTH - 25, 25, 15, 0, Math.PI * 2);
    ctx3.fill();
    ctx3.fillStyle = "#FFF";
    ctx3.font = "bold 18px Arial";
    ctx3.textAlign = "center";
    ctx3.fillText("\xD7", SCREEN_WIDTH - 25, 31);
    ctx3.textAlign = "left";
  }
  function handlePediaTouch(x, y, databus) {
    if (Math.sqrt((x - SCREEN_WIDTH + 25) ** 2 + (y - 25) ** 2) < 15) {
      databus.isShowPedia = false;
      return "close";
    }
    return null;
  }
  var DATA;
  var init_pedia = __esm({
    "js/runtime/pedia.js"() {
      init_render();
      DATA = {
        mosquito: { name: "\u868A\u5B50", entries: [{ id: 1, name: "\u6781\u901F\u868A\u5B50", desc: "\u98DE\u884C\u901F\u5EA6\u6781\u5FEB" }, { id: 2, name: "\u5206\u8EAB\u868A\u5B50", desc: "\u53EF\u5236\u9020\u5206\u8EAB" }, { id: 3, name: "\u52A0\u8840\u868A\u5B50", desc: "\u7ED9\u540C\u4F34\u52A0\u8840" }, { id: 4, name: "\u539A\u8840\u868A\u5B50", desc: "\u8840\u91CF\u6781\u9AD8" }, { id: 5, name: "\u9690\u8EAB\u868A\u5B50", desc: "\u4F1A\u9690\u8EAB" }] },
        ufo: { name: "\u91D1\u9F9F\u5B50", entries: [{ id: 1, name: "\u91D1\u9F9F\u5B50A" }, { id: 2, name: "\u91D1\u9F9F\u5B50B" }, { id: 3, name: "\u91D1\u9F9F\u5B50C" }, { id: 4, name: "\u91D1\u9F9F\u5B50D" }, { id: 5, name: "\u91D1\u9F9F\u5B50E" }] },
        ding: { name: "\u873B\u8713", entries: [{ id: 1, name: "\u873B\u8713A" }, { id: 2, name: "\u873B\u8713B" }, { id: 3, name: "\u873B\u8713C" }, { id: 4, name: "\u873B\u8713D" }, { id: 5, name: "\u873B\u8713E" }] },
        die: { name: "\u8776", entries: [{ id: 1, name: "\u8776A" }, { id: 2, name: "\u8776B" }, { id: 3, name: "\u8776C" }, { id: 4, name: "\u8776D" }, { id: 5, name: "\u8776E" }] }
      };
    }
  });

  // js/main.js
  init_render();
  init_render();

  // js/player/bullet.js
  init_render();
  var Bullet = class {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.width = 12;
      this.height = 12;
      this.vx = 0;
      this.vy = 0;
      this.speed = 12;
      this.damage = 20;
      this.visible = true;
      this.color = "#FFD700";
    }
    init(x, y, angle, damage) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.damage = damage || 20;
      this.visible = true;
    }
    update() {
      if (!this.visible) return;
      this.x += this.vx;
      this.y += this.vy;
      const _d = GameGlobal.databus;
      const _big = _d.selectedCategory === "mosquito_bigmap";
      const _bw = _big ? _d.worldWidth : SCREEN_WIDTH;
      const _bh = _big ? _d.worldHeight : SCREEN_HEIGHT;
      if (this.x < -20 || this.x > _bw + 20 || this.y < -20 || this.y > _bh + 20) this.visible = false;
    }
    render(ctx3) {
      if (!this.visible) return;
      ctx3.save();
      ctx3.fillStyle = this.color;
      ctx3.shadowColor = "#FFD700";
      ctx3.shadowBlur = 8;
      ctx3.beginPath();
      ctx3.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.restore();
    }
    checkHit(t) {
      if (!this.visible || !t || !t.visible) return false;
      const dx = this.x - (t.x + t.width / 2), dy = this.y - (t.y + t.height / 2);
      return Math.sqrt(dx * dx + dy * dy) < (this.width + t.width) / 2 + 5;
    }
  };

  // js/base/animatoin.js
  var Animation = class {
    constructor(img, frameW, frameH, cols, totalFrames, fps = 10) {
      this.img = img;
      this.frameW = frameW;
      this.frameH = frameH;
      this.cols = cols;
      this.totalFrames = totalFrames;
      this.fps = fps;
      this.currentFrame = 0;
      this.elapsed = 0;
      this.isPlaying = true;
    }
    update(dt = 1e3 / 60) {
      if (!this.isPlaying) return;
      this.elapsed += dt;
      const frameDuration = 1e3 / this.fps;
      if (this.elapsed >= frameDuration) {
        this.elapsed -= frameDuration;
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      }
    }
    drawToCanvas(ctx3, x, y, w, h, opacity = 1, rotation = 0, scale = 1) {
      if (!this.img || !this.img.complete || !this.img.naturalWidth) return;
      const col = this.currentFrame % this.cols;
      const row = Math.floor(this.currentFrame / this.cols);
      const sx = col * this.frameW;
      const sy = row * this.frameH;
      const dw = w || this.frameW;
      const dh = h || this.frameH;
      ctx3.save();
      ctx3.globalAlpha = opacity;
      if (rotation !== 0 || scale !== 1) {
        ctx3.translate(x + dw / 2, y + dh / 2);
        ctx3.rotate(rotation);
        ctx3.scale(scale, scale);
        ctx3.drawImage(this.img, sx, sy, this.frameW, this.frameH, -dw / 2, -dh / 2, dw, dh);
      } else {
        ctx3.drawImage(this.img, sx, sy, this.frameW, this.frameH, x, y, dw, dh);
      }
      ctx3.restore();
    }
    reset() {
      this.currentFrame = 0;
      this.elapsed = 0;
      this.isPlaying = true;
    }
  };

  // js/player/missile.js
  init_render();
  var Missile = class {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.width = 10;
      this.height = 10;
      this.vx = 0;
      this.vy = 0;
      this.speed = 6;
      this.damage = 80;
      this.visible = true;
      this.target = null;
      this.turnRate = 0.08;
      this.angle = 0;
      this.trail = [];
      this.maxTrail = 15;
    }
    init(x, y, target, damage) {
      this.x = x;
      this.y = y;
      this.target = target;
      this.damage = damage || 80;
      this.visible = true;
      this.trail = [];
      this.angle = 0;
      if (target) {
        const dx = target.x + target.width / 2 - x, dy = target.y + target.height / 2 - y;
        this.angle = Math.atan2(dy, dx);
      }
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
    }
    update() {
      if (!this.visible) return;
      if (this.target && this.target.visible) {
        const tx = this.target.x + this.target.width / 2, ty = this.target.y + this.target.height / 2;
        const dx = tx - this.x, dy = ty - this.y, ta = Math.atan2(dy, dx);
        let ad = ta - this.angle;
        while (ad > Math.PI) ad -= Math.PI * 2;
        while (ad < -Math.PI) ad += Math.PI * 2;
        this.angle += Math.sign(ad) * Math.min(Math.abs(ad), this.turnRate);
      }
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.x += this.vx;
      this.y += this.vy;
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrail) this.trail.shift();
      if (this.x < -50 || this.x > SCREEN_WIDTH + 50 || this.y < -50 || this.y > SCREEN_HEIGHT + 50) this.visible = false;
    }
    render(ctx3) {
      if (!this.visible) return;
      ctx3.save();
      if (this.trail.length > 1) {
        for (let i = 0; i < this.trail.length - 1; i++) {
          ctx3.globalAlpha = i / this.trail.length * 0.5;
          ctx3.strokeStyle = "#FF6600";
          ctx3.lineWidth = 2;
          ctx3.beginPath();
          ctx3.moveTo(this.trail[i].x, this.trail[i].y);
          ctx3.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
          ctx3.stroke();
        }
      }
      ctx3.globalAlpha = 1;
      ctx3.fillStyle = "#FF4500";
      ctx3.shadowColor = "#FF6600";
      ctx3.shadowBlur = 10;
      ctx3.beginPath();
      ctx3.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.strokeStyle = "#FFD700";
      ctx3.lineWidth = 2;
      ctx3.beginPath();
      ctx3.moveTo(this.x, this.y);
      ctx3.lineTo(this.x + Math.cos(this.angle) * 12, this.y + Math.sin(this.angle) * 12);
      ctx3.stroke();
      ctx3.restore();
    }
    checkHit(t) {
      if (!this.visible || !t || !t.visible) return false;
      const dx = this.x - (t.x + t.width / 2), dy = this.y - (t.y + t.height / 2);
      return Math.sqrt(dx * dx + dy * dy) < (this.width + t.width) / 2 + 5;
    }
  };

  // js/player/laser.js
  init_render();
  var Laser = class {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.angle = 0;
      this.length = 0;
      this.width = 3;
      this.damage = 50;
      this.isActive = false;
      this.duration = 200;
      this.startTime = 0;
    }
    init(x, y, angle, damage) {
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.damage = damage || 50;
      this.isActive = true;
      this.startTime = Date.now();
      this.length = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 1.5;
    }
    update() {
      if (this.isActive && Date.now() - this.startTime > this.duration) this.isActive = false;
    }
    render(ctx3) {
      if (!this.isActive) return;
      const alpha = 1 - (Date.now() - this.startTime) / this.duration;
      ctx3.save();
      ctx3.globalAlpha = Math.max(0, alpha);
      ctx3.strokeStyle = "#00FF00";
      ctx3.lineWidth = this.width;
      ctx3.shadowColor = "#00FF00";
      ctx3.shadowBlur = 15;
      ctx3.beginPath();
      ctx3.moveTo(this.x, this.y);
      ctx3.lineTo(this.x + Math.cos(this.angle) * this.length, this.y + Math.sin(this.angle) * this.length);
      ctx3.stroke();
      ctx3.strokeStyle = "#FFF";
      ctx3.lineWidth = 1;
      ctx3.beginPath();
      ctx3.moveTo(this.x, this.y);
      ctx3.lineTo(this.x + Math.cos(this.angle) * this.length, this.y + Math.sin(this.angle) * this.length);
      ctx3.stroke();
      ctx3.restore();
    }
    checkHit(t) {
      if (!this.isActive || !t || !t.visible) return false;
      const ex = this.x + Math.cos(this.angle) * this.length, ey = this.y + Math.sin(this.angle) * this.length;
      const cx = t.x + t.width / 2, cy = t.y + t.height / 2;
      return this._ptDist(cx, cy, this.x, this.y, ex, ey) < t.width / 2 + 10;
    }
    _ptDist(px, py, x1, y1, x2, y2) {
      const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1, dot = A * C + B * D, len = C * C + D * D;
      let p = len !== 0 ? dot / len : -1, xx, yy;
      if (p < 0) {
        xx = x1;
        yy = y1;
      } else if (p > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + p * C;
        yy = y1 + p * D;
      }
      return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
    }
  };

  // js/player/index.js
  init_render();
  var Player = class {
    constructor() {
      this.x = SCREEN_WIDTH / 2 - 40;
      this.y = SCREEN_HEIGHT - 60;
      this.width = 80;
      this.height = 45;
      this.barrelLength = 50;
      this.barrelWidth = 18;
      this.angle = -Math.PI / 2;
      this.targetAngle = -Math.PI / 2;
      this.isAiming = false;
      this.testBall = { x: 0, y: 0, r: 18, vx: 0, vy: 0, speed: 4 };
      this.bullets = [];
      this.missiles = [];
      this.lasers = [];
      this.bulletDamage = 20;
      this.missileDamage = 80;
      this.laserDamage = 100;
      this._lastShoot = 0;
      this._shootCD = 250;
      this._joystick = { active: false, touchId: -1, baseX: 0, baseY: 0, curX: 0, curY: 0, dx: 0, dy: 0 };
      this._joystickRadius = 50;
      this._stickRadius = 20;
      this.ultimates = [];
      this.shotCount = 0;
      this.shieldActive = false;
      this.shieldDefense = 0;
      this.shieldCooldown = false;
      this.shieldCooldownTimer = 0;
      this.shieldPower = 0.3;
      this._shieldDuration = 0;
      this._shieldMaxDuration = 180;
      this.invincibleTimer = 0;
      this.isBigmap = false;
      this._ballAnim = null;
      this._ballImg = null;
      this._ballFw = 0;
      this._ballFh = 0;
      this._autoFire = false;
      this._joyTouchId = -1;
      this._joystickBase = { x: 80, y: 100, r: 50 };
      this._fireBtn = { x: 80, y: SCREEN_HEIGHT - 80, r: 35 };
      this._shieldBtn = { x: 210, y: SCREEN_HEIGHT - 150, r: 25 };
      const resloader2 = (init_resloader(), __toCommonJS(resloader_exports)).default;
      const img = resloader2.getImage("images/testball_spritesheet.png");
      if (img) {
        this._ballImg = img;
        this._ballFw = Math.floor(img.naturalWidth / 8);
        this._ballFh = Math.floor(img.naturalHeight / 8);
        this._ballAnim = new Animation(img, this._ballFw, this._ballFh, 8, 60, 6);
      } else {
        resloader2.loadImage("images/testball_spritesheet.png").then((i) => {
          if (i) {
            this._ballImg = i;
            this._ballFw = Math.floor(i.naturalWidth / 8);
            this._ballFh = Math.floor(i.naturalHeight / 8);
            this._ballAnim = new Animation(i, this._ballFw, this._ballFh, 8, 60, 6);
          }
        }).catch(() => {
        });
      }
      this._autoFireTimer = null;
    }
    init() {
      this.x = SCREEN_WIDTH / 2 - 40;
      this.y = SCREEN_HEIGHT - 60;
      this.angle = -Math.PI / 2;
      this.targetAngle = -Math.PI / 2;
      this.bullets = [];
      this.missiles = [];
      this.lasers = [];
      this.ultimates = [];
      this.isAiming = false;
      this.shotCount = 0;
      this.shieldActive = false;
      this.shieldCooldown = false;
      this.shieldCooldownTimer = 0;
      this.invincibleTimer = 0;
    }
    initBigmap() {
      this.isBigmap = true;
      this.testBall.x = SCREEN_WIDTH * 6;
      this.testBall.y = SCREEN_HEIGHT * 6;
      this.testBall.vx = 0;
      this.testBall.vy = 0;
      this.bullets = [];
      this.missiles = [];
      this.lasers = [];
      this.ultimates = [];
      this._autoFire = false;
    }
    handleTouchStart(e) {
      if (!this.isBigmap) {
        const t = e.touches[0];
        this.isAiming = true;
        this._updateAngle(t.clientX, t.clientY);
        return;
      }
      const j = this._joystick;
      const jb = this._joystickBase;
      let hitButton = false;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const fd = Math.sqrt((t.clientX - this._fireBtn.x) ** 2 + (t.clientY - this._fireBtn.y) ** 2);
        if (fd < this._fireBtn.r + 10) {
          this._fireBigmap();
          hitButton = true;
          continue;
        }
        const sd = Math.sqrt((t.clientX - this._shieldBtn.x) ** 2 + (t.clientY - this._shieldBtn.y) ** 2);
        if (sd < this._shieldBtn.r + 10) {
          this._activateShield();
          hitButton = true;
          continue;
        }
      }
      if (!j.active) {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          const fd = Math.sqrt((t.clientX - this._fireBtn.x) ** 2 + (t.clientY - this._fireBtn.y) ** 2);
          const sd = Math.sqrt((t.clientX - this._shieldBtn.x) ** 2 + (t.clientY - this._shieldBtn.y) ** 2);
          if (fd < this._fireBtn.r + 10 || sd < this._shieldBtn.r + 10) continue;
          const jd = Math.sqrt((t.clientX - jb.x) ** 2 + (t.clientY - jb.y) ** 2);
          if (jd < jb.r + 20) {
            j.active = true;
            j.touchId = t.identifier;
            j.baseX = jb.x;
            j.baseY = jb.y;
            j.curX = t.clientX;
            j.curY = t.clientY;
            j.dx = 0;
            j.dy = 0;
            break;
          }
        }
      }
    }
    handleTouchMove(e) {
      if (!this.isBigmap) {
        if (!this.isAiming) return;
        const t = e.touches[0];
        this._updateAngle(t.clientX, t.clientY);
        return;
      }
      const j = this._joystick;
      if (!j.active) return;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.identifier === j.touchId) {
          j.curX = t.clientX;
          j.curY = t.clientY;
          let dx = j.curX - j.baseX, dy = j.curY - j.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > this._joystickRadius) {
            dx = dx / dist * this._joystickRadius;
            dy = dy / dist * this._joystickRadius;
          }
          j.dx = dx / this._joystickRadius;
          j.dy = dy / this._joystickRadius;
          break;
        }
      }
    }
    handleTouchEnd(e) {
      if (!this.isBigmap) {
        this.isAiming = false;
        return;
      }
      const j = this._joystick;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === j.touchId) {
          j.active = false;
          j.touchId = -1;
          j.dx = 0;
          j.dy = 0;
        }
      }
    }
    _updateAngle(x, y) {
      const dx = x - (this.x + this.width / 2), dy = y - this.y;
      this.targetAngle = Math.atan2(dy, dx);
      if (this.targetAngle > 0) this.targetAngle = this.targetAngle > Math.PI / 2 ? -Math.PI : 0;
    }
    // 自动瞄准：找最近敌人（整个世界地图范围）
    _getBigmapAimAngle() {
      const databus = GameGlobal.databus;
      let nearest = null, minDist = Infinity;
      databus.enemys.forEach((e) => {
        if (!e || !e.visible) return;
        const ex = e.x + (e.width || 0) / 2, ey = e.y + (e.height || 0) / 2;
        const d = Math.sqrt((ex - this.testBall.x) ** 2 + (ey - this.testBall.y) ** 2);
        if (d < minDist) {
          minDist = d;
          nearest = { x: ex, y: ey, dist: d };
        }
      });
      this._aimTarget = nearest;
      if (nearest) return Math.atan2(nearest.y - this.testBall.y, nearest.x - this.testBall.x);
      return null;
    }
    _fireBigmap() {
      const databus = GameGlobal.databus;
      const angle = this._getBigmapAimAngle();
      if (angle === null) return;
      const b = new Bullet();
      b.init(this.testBall.x, this.testBall.y, angle, this.bulletDamage);
      databus.bullets.push(b);
    }
    _activateShield() {
      if (this.shieldActive) return;
      this.shieldActive = true;
      this.shieldDefense = 100;
    }
    shoot(damage) {
      const mx = this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength;
      const my = this.y + Math.sin(this.angle) * this.barrelLength;
      const b = new Bullet();
      b.init(mx, my, this.angle, damage || this.bulletDamage);
      this.bullets.push(b);
      this.shotCount++;
      return b;
    }
    shootSpread(count, damage) {
      const mx = this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength;
      const my = this.y + Math.sin(this.angle) * this.barrelLength;
      const sa = Math.PI / 8, start = this.angle - sa * (count - 1) / 2;
      for (let i = 0; i < count; i++) {
        const b = new Bullet();
        b.init(mx, my, start + i * sa, damage || this.bulletDamage);
        this.bullets.push(b);
      }
      this.shotCount += count;
    }
    fireMissile(target, damage) {
      const mx = this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength;
      const my = this.y + Math.sin(this.angle) * this.barrelLength;
      const m = new Missile();
      m.init(mx, my, target, damage || this.missileDamage);
      this.missiles.push(m);
      return m;
    }
    fireLaser(damage) {
      const mx = this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength;
      const my = this.y + Math.sin(this.angle) * this.barrelLength;
      const l = new Laser();
      l.init(mx, my, this.angle, damage || this.laserDamage);
      this.lasers.push(l);
      return l;
    }
    update() {
      const databus = GameGlobal.databus;
      if (this.isBigmap) {
        const j = this._joystick;
        const s = databus.activeState();
        const keys = window.__game._keys;
        if (keys) {
          let kx = 0, ky = 0;
          if (keys["KeyW"]) ky -= 1;
          if (keys["KeyS"]) ky += 1;
          if (keys["KeyA"]) kx -= 1;
          if (keys["KeyD"]) kx += 1;
          if (kx || ky) {
            const kl = Math.sqrt(kx * kx + ky * ky);
            j.dx = kx / kl;
            j.dy = ky / kl;
          } else if (!j.active) {
            j.dx = 0;
            j.dy = 0;
          }
        }
        this.testBall.x += j.dx * this.testBall.speed;
        this.testBall.y += j.dy * this.testBall.speed;
        this.testBall.x = Math.max(this.testBall.r, Math.min(databus.worldWidth - this.testBall.r, this.testBall.x));
        this.testBall.y = Math.max(this.testBall.r, Math.min(databus.worldHeight - this.testBall.r, this.testBall.y));
        databus.camera.follow(this.testBall.x, this.testBall.y);
      } else {
        let diff = this.targetAngle - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.angle += diff * 0.15;
      }
      this.bullets.forEach((b) => b.update());
      this.bullets = this.bullets.filter((b) => b.visible);
      this.missiles.forEach((m) => m.update());
      this.missiles = this.missiles.filter((m) => m.visible);
      this.lasers.forEach((l) => l.update());
      this.lasers = this.lasers.filter((l) => l.isActive);
      this.ultimates.forEach((u) => u.update());
      this.ultimates = this.ultimates.filter((u) => u.active);
      if (this.shieldCooldown && this.shieldCooldownTimer > 0) {
        this.shieldCooldownTimer--;
        if (this.shieldCooldownTimer <= 0) this.shieldCooldown = false;
      }
      if (this.invincibleTimer > 0) this.invincibleTimer--;
    }
    render(ctx3) {
      const databus = GameGlobal.databus;
      if (this.isBigmap) {
        this.renderWorld(ctx3);
        this.renderUI(ctx3);
        return;
      }
      ctx3.save();
      const bx = this.x + this.width / 2, by = this.y;
      const grad = ctx3.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
      grad.addColorStop(0, "#555");
      grad.addColorStop(0.5, "#777");
      grad.addColorStop(1, "#555");
      ctx3.fillStyle = grad;
      ctx3.beginPath();
      ctx3.roundRect(this.x, this.y, this.width, this.height, [12, 12, 4, 4]);
      ctx3.fill();
      ctx3.strokeStyle = "#333";
      ctx3.lineWidth = 2;
      ctx3.stroke();
      ctx3.save();
      ctx3.translate(bx, by);
      ctx3.rotate(this.angle);
      const bg = ctx3.createLinearGradient(0, -this.barrelWidth / 2, this.barrelLength, this.barrelWidth / 2);
      bg.addColorStop(0, "#444");
      bg.addColorStop(0.5, "#666");
      bg.addColorStop(1, "#444");
      ctx3.fillStyle = bg;
      ctx3.fillRect(0, -this.barrelWidth / 2, this.barrelLength, this.barrelWidth);
      ctx3.fillStyle = "#333";
      ctx3.fillRect(this.barrelLength - 5, -12, 18, 24);
      ctx3.restore();
      ["#FFD700", "#FFA500", "#FF8C00"].forEach((c, i) => {
        ctx3.fillStyle = c;
        ctx3.beginPath();
        ctx3.arc(bx - 15 + i * 15, by + this.height + 8, 5, 0, Math.PI * 2);
        ctx3.fill();
      });
      ctx3.restore();
      if (this.shieldActive) {
        ctx3.save();
        ctx3.strokeStyle = `rgba(100,180,255,${0.4 + Math.sin(Date.now() / 200) * 0.2})`;
        ctx3.lineWidth = 3;
        ctx3.beginPath();
        ctx3.arc(bx, by, 40, 0, Math.PI * 2);
        ctx3.stroke();
        ctx3.restore();
      }
      this.bullets.forEach((b) => b.render(ctx3));
      this.missiles.forEach((m) => m.render(ctx3));
      this.lasers.forEach((l) => l.render(ctx3));
      this.ultimates.forEach((u) => u.render(ctx3));
    }
    renderWorld(ctx3) {
      const sp = this.testBall;
      if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) return;
      ctx3.save();
      if (this._ballImg && this._ballAnim) {
        this._ballAnim.update();
        const sz = this.testBall.r * 2.5;
        ctx3.save();
        ctx3.translate(sp.x, sp.y);
        ctx3.rotate(IS_PC ? 0 : Math.PI / 2);
        this._ballAnim.drawToCanvas(ctx3, -sz / 2, -sz / 2, sz, sz);
        ctx3.restore();
      } else {
        ctx3.fillStyle = "#4FC3F7";
        ctx3.beginPath();
        ctx3.arc(sp.x, sp.y, this.testBall.r, 0, Math.PI * 2);
        ctx3.fill();
        ctx3.strokeStyle = "#0288D1";
        ctx3.lineWidth = 2;
        ctx3.stroke();
      }
      if (this.shieldActive) {
        const shieldRadius = this.testBall.r + 25;
        const pulse = Math.sin(Date.now() / 120) * 0.15;
        ctx3.save();
        ctx3.shadowColor = "#2196F3";
        ctx3.shadowBlur = 25;
        ctx3.strokeStyle = `rgba(33,150,243,${0.9 + pulse})`;
        ctx3.lineWidth = 6;
        ctx3.beginPath();
        ctx3.arc(sp.x, sp.y, shieldRadius, 0, Math.PI * 2);
        ctx3.stroke();
        ctx3.fillStyle = `rgba(100,180,255,${0.25 + pulse * 0.4})`;
        ctx3.beginPath();
        ctx3.arc(sp.x, sp.y, shieldRadius, 0, Math.PI * 2);
        ctx3.fill();
        const rot = Date.now() / 500;
        ctx3.strokeStyle = `rgba(255,255,255,${0.6 + pulse})`;
        ctx3.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          const a = rot + i * Math.PI / 2;
          ctx3.beginPath();
          ctx3.arc(sp.x, sp.y, shieldRadius - 4, a, a + 0.5);
          ctx3.stroke();
        }
        ctx3.restore();
      }
      ctx3.restore();
    }
    renderUI(ctx3) {
      if (!this.isBigmap) return;
      if (IS_PC) return;
      const j = this._joystick;
      const jb = this._joystickBase;
      ctx3.save();
      ctx3.globalAlpha = 0.25;
      ctx3.fillStyle = "#FFF";
      ctx3.beginPath();
      ctx3.arc(jb.x, jb.y, jb.r, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.restore();
      ctx3.save();
      ctx3.globalAlpha = 0.4;
      ctx3.strokeStyle = "#FFF";
      ctx3.lineWidth = 2;
      ctx3.beginPath();
      ctx3.arc(jb.x, jb.y, jb.r, 0, Math.PI * 2);
      ctx3.stroke();
      ctx3.restore();
      if (j.active) {
        const hx = j.baseX + j.dx * this._joystickRadius, hy = j.baseY + j.dy * this._joystickRadius;
        ctx3.save();
        ctx3.globalAlpha = 0.6;
        ctx3.fillStyle = "#FFF";
        ctx3.beginPath();
        ctx3.arc(hx, hy, this._stickRadius, 0, Math.PI * 2);
        ctx3.fill();
        ctx3.restore();
      }
      const fb = this._fireBtn;
      ctx3.save();
      ctx3.globalAlpha = 0.4;
      ctx3.fillStyle = "#f44336";
      ctx3.beginPath();
      ctx3.arc(fb.x, fb.y, fb.r, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.restore();
      ctx3.save();
      ctx3.translate(fb.x, fb.y);
      ctx3.rotate(Math.PI / 2);
      ctx3.fillStyle = "#FFF";
      ctx3.font = "bold 16px Arial";
      ctx3.textAlign = "center";
      ctx3.fillText("\u5C04\u51FB", 0, 5);
      ctx3.restore();
      const sb = this._shieldBtn;
      ctx3.save();
      ctx3.globalAlpha = this.shieldActive ? 0.6 : 0.4;
      ctx3.fillStyle = "#2196F3";
      ctx3.beginPath();
      ctx3.arc(sb.x, sb.y, sb.r, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.restore();
      ctx3.save();
      ctx3.translate(sb.x, sb.y);
      ctx3.rotate(Math.PI / 2);
      ctx3.fillStyle = "#FFF";
      ctx3.font = "12px Arial";
      ctx3.textAlign = "center";
      ctx3.fillText("\u62A4\u76FE", 0, 4);
      ctx3.restore();
      if (this._aimTarget) {
        const databus = GameGlobal.databus;
        const cam = databus.camera;
        const sp = cam.worldToScreen(this.testBall.x, this.testBall.y);
        const angle = Math.atan2(this._aimTarget.y - this.testBall.y, this._aimTarget.x - this.testBall.x);
        const lineLen = 50;
        ctx3.save();
        ctx3.strokeStyle = "rgba(255,255,0,0.6)";
        ctx3.lineWidth = 2;
        ctx3.setLineDash([4, 4]);
        ctx3.beginPath();
        ctx3.moveTo(sp.x, sp.y);
        ctx3.lineTo(sp.x + Math.cos(angle) * lineLen, sp.y + Math.sin(angle) * lineLen);
        ctx3.stroke();
        ctx3.setLineDash([]);
        ctx3.restore();
      }
      ctx3.textAlign = "left";
    }
    getMuzzle() {
      return { x: this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength, y: this.y + Math.sin(this.angle) * this.barrelLength };
    }
  };

  // js/base/sprite.js
  var Sprite = class {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
      this.visible = true;
      this.isActive = true;
      this.opacity = 1;
      this.scale = 1;
    }
    init() {
    }
    update() {
    }
    render(ctx3) {
    }
    isCollide(other) {
      return this.x < other.x + other.width && this.x + this.width > other.x && this.y < other.y + other.height && this.y + this.height > other.y;
    }
  };

  // js/npc/enemy.js
  init_resloader();
  init_render();
  var MOSQUITO_PROPS = {
    1: { speed: 1.5, maxHealth: 80, attackDamage: 10, attackInterval: 3e3, attack: true, label: "\u666E\u901A\u868A" },
    2: { speed: 1.2, maxHealth: 120, attackDamage: 15, attackInterval: 4e3, attack: true, clone: true, hasCloned: false, label: "\u5206\u8EAB\u868A" },
    3: { speed: 1.8, maxHealth: 200, attackDamage: 8, attackInterval: 2500, attack: true, health: true, currentHealth: 200, maxHealth: 200, label: "\u539A\u8840\u868A" },
    4: { speed: 1, maxHealth: 100, attackDamage: 12, attackInterval: 5e3, attack: true, heal: true, label: "\u6CBB\u7597\u868A" },
    5: { speed: 2, maxHealth: 60, attackDamage: 10, attackInterval: 3500, attack: true, stealth: true, label: "\u9690\u8EAB\u868A" }
  };
  var SPRITE_FRAMES = 60;
  var SPRITE_COLS = 8;
  var SPRITE_FPS = 12;
  var FRAME_W = 64;
  var FRAME_H = 64;
  var MARGIN_TOP = 70;
  var MARGIN_BOTTOM_OFFSET = 100;
  var MARGIN_SIDE = 10;
  var Enemy = class extends Sprite {
    constructor(mosquitoType = 1) {
      super();
      this.mosquitoType = mosquitoType;
      this.id = mosquitoType;
      this.width = 48;
      this.height = 48;
      this.vx = 0;
      this.vy = 0;
      this.anim = null;
      this.img = null;
      this.imgLoaded = false;
      const props = MOSQUITO_PROPS[mosquitoType] || MOSQUITO_PROPS[1];
      this.properties = {
        ...props,
        currentHealth: props.health ? props.maxHealth : props.maxHealth,
        lastAttackTime: 0
      };
      this.speed = props.speed;
      this.opacity = 1;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.markAsCloned = function() {
        this.properties.hasCloned = true;
      };
    }
    init() {
      this.isActive = true;
      this.visible = true;
      this.opacity = 1;
      const src = `images/wenzi${this.mosquitoType}_spritesheet.png`;
      this.img = resloader_default.get(src);
      if (this.img) {
        this.imgLoaded = true;
        this.anim = new Animation(this.img, Math.floor(this.img.naturalWidth / SPRITE_COLS), Math.floor(this.img.naturalHeight / Math.ceil(SPRITE_FRAMES / SPRITE_COLS)), SPRITE_COLS, SPRITE_FRAMES, SPRITE_FPS);
      } else {
        resloader_default.loadImage(src).then((img) => {
          this.img = img;
          this.imgLoaded = true;
          this.anim = new Animation(img, Math.floor(img.naturalWidth / SPRITE_COLS), Math.floor(img.naturalHeight / Math.ceil(SPRITE_FRAMES / SPRITE_COLS)), SPRITE_COLS, SPRITE_FRAMES, SPRITE_FPS);
        }).catch(() => {
        });
      }
      this.x = MARGIN_SIDE + Math.random() * (SCREEN_WIDTH - this.width - MARGIN_SIDE * 2);
      this.y = MARGIN_TOP + Math.random() * (SCREEN_HEIGHT - this.height - MARGIN_TOP - MARGIN_BOTTOM_OFFSET);
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }
    update() {
      if (!this.isActive) return;
      if (this.anim) this.anim.update();
      this.moveTimer++;
      if (this.moveTimer >= this.moveChangeInterval) {
        this.moveTimer = 0;
        this.moveChangeInterval = 60 + Math.random() * 120;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.moveAngle) * this.speed;
        this.vy = Math.sin(this.moveAngle) * this.speed;
      }
      const speedMod = this.speedModifier || 1;
      this.x += this.vx * speedMod;
      this.y += this.vy * speedMod;
      if (this.speedModifier && this.speedModifier < 1) {
        this.speedModifier = Math.min(1, this.speedModifier + 5e-3);
      }
      const databus = GameGlobal.databus;
      const isBigmap = databus.selectedCategory === "mosquito_bigmap";
      const boundW = isBigmap ? databus.worldWidth : SCREEN_WIDTH;
      const boundH = isBigmap ? databus.worldHeight : SCREEN_HEIGHT;
      const marginTop = isBigmap ? 0 : MARGIN_TOP;
      const bottomBound = boundH - (isBigmap ? 0 : MARGIN_BOTTOM_OFFSET);
      const sideMargin = isBigmap ? 0 : MARGIN_SIDE;
      if (this.x < sideMargin) {
        this.x = sideMargin;
        this.vx = Math.abs(this.vx) * 0.8;
      }
      if (this.x + this.width > boundW - sideMargin) {
        this.x = boundW - sideMargin - this.width;
        this.vx = -Math.abs(this.vx) * 0.8;
      }
      if (this.y < marginTop) {
        this.y = marginTop;
        this.vy = Math.abs(this.vy) * 0.8;
      }
      if (this.y + this.height > bottomBound) {
        this.y = bottomBound - this.height;
        this.vy = -Math.abs(this.vy) * 0.8;
      }
    }
    render(ctx3) {
      if (!this.isActive || !this.visible) return;
      ctx3.save();
      ctx3.globalAlpha = this.opacity;
      if (this.imgLoaded && this.anim) {
        var _fw = this.anim.frameW, _fh = this.anim.frameH; var _sc = Math.min(this.width / _fw, this.height / _fh); var _dw = _fw * _sc, _dh = _fh * _sc; this.anim.drawToCanvas(ctx3, this.x + this.width / 2 - _dw / 2, this.y + this.height / 2 - _dh / 2, _dw, _dh, this.opacity, Math.PI / 2, 1);
      } else {
        ctx3.fillStyle = "#FF6B35";
        ctx3.beginPath();
        ctx3.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx3.fill();
        ctx3.fillStyle = "#fff";
        ctx3.font = "10px Arial";
        ctx3.textAlign = "center";
        ctx3.fillText(`${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
      }
      {
        const barW = this.width;
        const barH = 4;
        const barX = this.x;
        const barY = this.y - 8;
        const hpRatio = this.properties.currentHealth / this.properties.maxHealth;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(barX, barY, barW, barH);
        ctx3.fillStyle = hpRatio > 0.5 ? "#4f4" : hpRatio > 0.25 ? "#ff0" : "#f44";
        ctx3.fillRect(barX, barY, barW * hpRatio, barH);
      }
      ctx3.restore();
    }
    takeDamage(amount) {
      if (!this.isActive) return;
      this.properties.currentHealth -= amount;
      if (this.properties.currentHealth <= 0) {
        this.die();
      }
    }
    heal(amount) {
      this.properties.currentHealth = Math.min(
        this.properties.currentHealth + amount,
        this.properties.maxHealth
      );
    }
    die() {
      this.isActive = false;
      this.visible = false;
      const databus = GameGlobal.databus;
      databus.killCount = (databus.killCount || 0) + 1;
      databus.score += this.getScore();
      databus.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12);
    }
    getScore() {
      const scores = { 1: 20, 2: 50, 3: 40, 4: 10, 5: 10 };
      return scores[this.mosquitoType] || 10;
    }
  };

  // js/npc/ufo.js
  init_resloader();
  init_render();
  var UFO_PROPS = {
    1: { speed: 1.2, maxHealth: 100, attackDamage: 12, attackInterval: 3500, attack: true },
    2: { speed: 1, maxHealth: 500, attackDamage: 20, attackInterval: 5e3, attack: true },
    3: { speed: 1.5, maxHealth: 120, attackDamage: 10, attackInterval: 3e3, attack: true, health: true, currentHealth: 120 },
    4: { speed: 0.8, maxHealth: 150, attackDamage: 15, attackInterval: 4e3, attack: true, heal: true },
    5: { speed: 1.8, maxHealth: 80, attackDamage: 10, attackInterval: 3e3, attack: true, stealth: true }
  };
  var SPRITE_FRAMES2 = 60;
  var SPRITE_COLS2 = 8;
  var SPRITE_FPS2 = 10;
  var FRAME_W2 = 64;
  var FRAME_H2 = 64;
  var MARGIN_TOP2 = 70;
  var MARGIN_BOTTOM_OFFSET2 = 100;
  var MARGIN_SIDE2 = 10;
  var UFO = class extends Sprite {
    constructor(ufoType = 1) {
      super();
      this.mosquitoType = ufoType;
      this.id = ufoType;
      this.width = 52;
      this.height = 52;
      this.vx = 0;
      this.vy = 0;
      this.anim = null;
      this.img = null;
      this.imgLoaded = false;
      const props = UFO_PROPS[ufoType] || UFO_PROPS[1];
      this.properties = {
        ...props,
        currentHealth: props.currentHealth || props.maxHealth,
        lastAttackTime: 0
      };
      this.speed = props.speed;
      this.opacity = 1;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.markAsCloned = function() {
        this.properties.hasCloned = true;
      };
    }
    init() {
      this.isActive = true;
      this.visible = true;
      this.opacity = 1;
      const src = `images/jingui${this.mosquitoType}_spritesheet.png`;
      this.img = resloader_default.get(src);
      if (this.img) {
        this.imgLoaded = true;
        this.anim = new Animation(this.img, Math.floor(this.img.naturalWidth / SPRITE_COLS2), Math.floor(this.img.naturalHeight / Math.ceil(SPRITE_FRAMES2 / SPRITE_COLS2)), SPRITE_COLS2, SPRITE_FRAMES2, SPRITE_FPS2);
      } else {
        resloader_default.loadImage(src).then((img) => {
          this.img = img;
          this.imgLoaded = true;
          this.anim = new Animation(img, Math.floor(img.naturalWidth / SPRITE_COLS2), Math.floor(img.naturalHeight / Math.ceil(SPRITE_FRAMES2 / SPRITE_COLS2)), SPRITE_COLS2, SPRITE_FRAMES2, SPRITE_FPS2);
        }).catch(() => {
        });
      }
      this.x = MARGIN_SIDE2 + Math.random() * (SCREEN_WIDTH - this.width - MARGIN_SIDE2 * 2);
      this.y = MARGIN_TOP2 + Math.random() * (SCREEN_HEIGHT - this.height - MARGIN_TOP2 - MARGIN_BOTTOM_OFFSET2);
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }
    update() {
      if (!this.isActive) return;
      if (this.anim) this.anim.update();
      if (this.chargeState) return;
      this.moveTimer++;
      if (this.moveTimer >= this.moveChangeInterval) {
        this.moveTimer = 0;
        this.moveChangeInterval = 60 + Math.random() * 120;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.moveAngle) * this.speed;
        this.vy = Math.sin(this.moveAngle) * this.speed;
      }
      const speedMod = this.speedModifier || 1;
      this.x += this.vx * speedMod;
      this.y += this.vy * speedMod;
      if (this.speedModifier && this.speedModifier < 1) {
        this.speedModifier = Math.min(1, this.speedModifier + 5e-3);
      }
      const _db = GameGlobal.databus;
      const _isBig = _db.selectedCategory === "mosquito_bigmap";
      const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH;
      const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
      const _ms = _isBig ? 0 : MARGIN_SIDE2;
      const _mtop = _isBig ? 0 : MARGIN_TOP2;
      const bottomBound = _bh - (_isBig ? 0 : MARGIN_BOTTOM_OFFSET2);
      if (this.x < _ms) {
        this.x = _ms;
        this.vx = Math.abs(this.vx) * 0.8;
      }
      if (this.x + this.width > _bw - _ms) {
        this.x = _bw - _ms - this.width;
        this.vx = -Math.abs(this.vx) * 0.8;
      }
      if (this.y < _mtop) {
        this.y = _mtop;
        this.vy = Math.abs(this.vy) * 0.8;
      }
      if (this.y + this.height > bottomBound) {
        this.y = bottomBound - this.height;
        this.vy = -Math.abs(this.vy) * 0.8;
      }
    }
    render(ctx3) {
      if (!this.isActive || !this.visible) return;
      ctx3.save();
      ctx3.globalAlpha = this.opacity;
      if (this.imgLoaded && this.anim) {
        var _fw = this.anim.frameW, _fh = this.anim.frameH; var _sc = Math.min(this.width / _fw, this.height / _fh); var _dw = _fw * _sc, _dh = _fh * _sc; this.anim.drawToCanvas(ctx3, this.x + this.width / 2 - _dw / 2, this.y + this.height / 2 - _dh / 2, _dw, _dh, this.opacity, Math.PI / 2, 1);
      } else {
        ctx3.fillStyle = "#FFD700";
        ctx3.beginPath();
        ctx3.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx3.fill();
        ctx3.fillStyle = "#000";
        ctx3.font = "10px Arial";
        ctx3.textAlign = "center";
        ctx3.fillText(`G${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
      }
      {
        const barW = this.width;
        const barH = 4;
        const barX = this.x;
        const barY = this.y - 8;
        const hpRatio = this.properties.currentHealth / this.properties.maxHealth;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(barX, barY, barW, barH);
        ctx3.fillStyle = hpRatio > 0.5 ? "#4f4" : hpRatio > 0.25 ? "#ff0" : "#f44";
        ctx3.fillRect(barX, barY, barW * hpRatio, barH);
      }
      ctx3.restore();
    }
    takeDamage(amount) {
      if (!this.isActive) return;
      this.properties.currentHealth -= amount;
      if (this.properties.currentHealth <= 0) this.die();
    }
    heal(amount) {
      this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth);
    }
    die() {
      this.isActive = false;
      this.visible = false;
      const databus = GameGlobal.databus;
      databus.killCount = (databus.killCount || 0) + 1;
      databus.score += 30;
      databus.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 15);
    }
  };

  // js/npc/fjg.js
  init_resloader();
  init_render();
  var FJG_PROPS = {
    1: { speed: 1.3, maxHealth: 110, attackDamage: 12, attackInterval: 3200, attack: true },
    2: { speed: 1, maxHealth: 400, attackDamage: 18, attackInterval: 5e3, attack: true },
    3: { speed: 1.6, maxHealth: 130, attackDamage: 10, attackInterval: 2800, attack: true, health: true, currentHealth: 130 },
    4: { speed: 0.9, maxHealth: 140, attackDamage: 14, attackInterval: 4500, attack: true, heal: true },
    5: { speed: 1.9, maxHealth: 70, attackDamage: 10, attackInterval: 3e3, attack: true, stealth: true }
  };
  var SPRITE_FRAMES3 = 60;
  var SPRITE_COLS3 = 8;
  var SPRITE_FPS3 = 10;
  var FRAME_W3 = 64;
  var FRAME_H3 = 64;
  var MARGIN_TOP3 = 70;
  var MARGIN_BOTTOM_OFFSET3 = 100;
  var MARGIN_SIDE3 = 10;
  var Fjg = class extends Sprite {
    constructor(type = 1) {
      super();
      this.mosquitoType = type;
      this.id = type;
      this.width = 50;
      this.height = 50;
      this.vx = 0;
      this.vy = 0;
      this.anim = null;
      this.img = null;
      this.imgLoaded = false;
      const props = FJG_PROPS[type] || FJG_PROPS[1];
      this.properties = { ...props, currentHealth: props.currentHealth || props.maxHealth, lastAttackTime: 0 };
      this.speed = props.speed;
      this.opacity = 1;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.markAsCloned = function() {
        this.properties.hasCloned = true;
      };
    }
    init() {
      this.isActive = true;
      this.visible = true;
      this.opacity = 1;
      const src = `images/fjg${this.mosquitoType}_spritesheet.png`;
      this.img = resloader_default.get(src);
      if (this.img) {
        this.imgLoaded = true;
        this.anim = new Animation(this.img, Math.floor(this.img.naturalWidth / SPRITE_COLS3), Math.floor(this.img.naturalHeight / Math.ceil(SPRITE_FRAMES3 / SPRITE_COLS3)), SPRITE_COLS3, SPRITE_FRAMES3, SPRITE_FPS3);
      } else {
        resloader_default.loadImage(src).then((img) => {
          this.img = img;
          this.imgLoaded = true;
          this.anim = new Animation(img, Math.floor(img.naturalWidth / SPRITE_COLS3), Math.floor(img.naturalHeight / Math.ceil(SPRITE_FRAMES3 / SPRITE_COLS3)), SPRITE_COLS3, SPRITE_FRAMES3, SPRITE_FPS3);
        }).catch(() => {
        });
      }
      this.x = MARGIN_SIDE3 + Math.random() * (SCREEN_WIDTH - this.width - MARGIN_SIDE3 * 2);
      this.y = MARGIN_TOP3 + Math.random() * (SCREEN_HEIGHT - this.height - MARGIN_TOP3 - MARGIN_BOTTOM_OFFSET3);
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }
    update() {
      if (!this.isActive) return;
      if (this.anim) this.anim.update();
      if (this.sweeping) return;
      this.moveTimer++;
      if (this.moveTimer >= this.moveChangeInterval) {
        this.moveTimer = 0;
        this.moveChangeInterval = 60 + Math.random() * 120;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.moveAngle) * this.speed;
        this.vy = Math.sin(this.moveAngle) * this.speed;
      }
      const sm = this.speedModifier || 1;
      this.x += this.vx * sm;
      this.y += this.vy * sm;
      if (this.speedModifier && this.speedModifier < 1) this.speedModifier = Math.min(1, this.speedModifier + 5e-3);
      const _db = GameGlobal.databus;
      const _isBig = _db.selectedCategory === "mosquito_bigmap";
      const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH;
      const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
      const _ms = _isBig ? 0 : MARGIN_SIDE3;
      const _mtop = _isBig ? 0 : MARGIN_TOP3;
      const bb = _bh - (_isBig ? 0 : MARGIN_BOTTOM_OFFSET3);
      if (this.x < _ms) {
        this.x = _ms;
        this.vx = Math.abs(this.vx) * 0.8;
      }
      if (this.x + this.width > _bw - _ms) {
        this.x = _bw - _ms - this.width;
        this.vx = -Math.abs(this.vx) * 0.8;
      }
      if (this.y < _mtop) {
        this.y = _mtop;
        this.vy = Math.abs(this.vy) * 0.8;
      }
      if (this.y + this.height > bb) {
        this.y = bb - this.height;
        this.vy = -Math.abs(this.vy) * 0.8;
      }
    }
    render(ctx3) {
      if (!this.isActive || !this.visible) return;
      ctx3.save();
      ctx3.globalAlpha = this.opacity;
      if (this.imgLoaded && this.anim) {
        var _fw = this.anim.frameW, _fh = this.anim.frameH; var _sc = Math.min(this.width / _fw, this.height / _fh); var _dw = _fw * _sc, _dh = _fh * _sc; this.anim.drawToCanvas(ctx3, this.x + this.width / 2 - _dw / 2, this.y + this.height / 2 - _dh / 2, _dw, _dh, this.opacity, Math.PI / 2, 1);
      } else {
        ctx3.fillStyle = "#8B4513";
        ctx3.fillRect(this.x, this.y, this.width, this.height);
        ctx3.fillStyle = "#fff";
        ctx3.font = "10px Arial";
        ctx3.textAlign = "center";
        ctx3.fillText(`F${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
      }
      {
        const bw = this.width, bh = 4, bx = this.x, by = this.y - 8, r = this.properties.currentHealth / this.properties.maxHealth;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(bx, by, bw, bh);
        ctx3.fillStyle = r > 0.5 ? "#4f4" : r > 0.25 ? "#ff0" : "#f44";
        ctx3.fillRect(bx, by, bw * r, bh);
      }
      ctx3.restore();
    }
    takeDamage(amount) {
      if (!this.isActive) return;
      this.properties.currentHealth -= amount;
      if (this.properties.currentHealth <= 0) this.die();
    }
    heal(amount) {
      this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth);
    }
    die() {
      this.isActive = false;
      this.visible = false;
      const d = GameGlobal.databus;
      d.killCount = (d.killCount || 0) + 1;
      d.score += 25;
      d.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12);
    }
  };

  // js/npc/jia.js
  init_resloader();
  init_render();
  var PROPS = {
    1: { speed: 1.1, maxHealth: 120, attackDamage: 12, attackInterval: 3500, attack: true },
    2: { speed: 0.9, maxHealth: 450, attackDamage: 20, attackInterval: 5e3, attack: true },
    3: { speed: 1.4, maxHealth: 150, attackDamage: 10, attackInterval: 3e3, attack: true, health: true, currentHealth: 150 },
    4: { speed: 0.8, maxHealth: 160, attackDamage: 14, attackInterval: 4500, attack: true, heal: true },
    5: { speed: 1.7, maxHealth: 80, attackDamage: 10, attackInterval: 3e3, attack: true, stealth: true }
  };
  var SF = 60;
  var SC = 8;
  var SFP = 10;
  var FW = 64;
  var FH = 64;
  var MT = 70;
  var MBO = 100;
  var MS = 10;
  var Jia = class extends Sprite {
    constructor(type = 1) {
      super();
      this.mosquitoType = type;
      this.id = type;
      this.width = 50;
      this.height = 50;
      this.vx = 0;
      this.vy = 0;
      this.anim = null;
      this.img = null;
      this.imgLoaded = false;
      const p = PROPS[type] || PROPS[1];
      this.properties = { ...p, currentHealth: p.currentHealth || p.maxHealth, lastAttackTime: 0 };
      this.speed = p.speed;
      this.opacity = 1;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.markAsCloned = function() {
        this.properties.hasCloned = true;
      };
    }
    init() {
      this.isActive = true;
      this.visible = true;
      this.opacity = 1;
      const src = `images/jia${this.mosquitoType}_spritesheet.png`;
      this.img = resloader_default.get(src);
      if (this.img) {
        this.imgLoaded = true;
        this.anim = new Animation(this.img, Math.floor(this.img.naturalWidth / SC), Math.floor(this.img.naturalHeight / Math.ceil(SF / SC)), SC, SF, SFP);
      } else {
        resloader_default.loadImage(src).then((img) => {
          this.img = img;
          this.imgLoaded = true;
          this.anim = new Animation(img, Math.floor(img.naturalWidth / SC), Math.floor(img.naturalHeight / Math.ceil(SF / SC)), SC, SF, SFP);
        }).catch(() => {
        });
      }
      this.x = MS + Math.random() * (SCREEN_WIDTH - this.width - MS * 2);
      this.y = MT + Math.random() * (SCREEN_HEIGHT - this.height - MT - MBO);
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }
    update() {
      if (!this.isActive) return;
      if (this.anim) this.anim.update();
      if (this.sweeping) return;
      this.moveTimer++;
      if (this.moveTimer >= this.moveChangeInterval) {
        this.moveTimer = 0;
        this.moveChangeInterval = 60 + Math.random() * 120;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.moveAngle) * this.speed;
        this.vy = Math.sin(this.moveAngle) * this.speed;
      }
      const sm = this.speedModifier || 1;
      this.x += this.vx * sm;
      this.y += this.vy * sm;
      if (this.speedModifier && this.speedModifier < 1) this.speedModifier = Math.min(1, this.speedModifier + 5e-3);
      const _db = GameGlobal.databus;
      const _isBig = _db.selectedCategory === "mosquito_bigmap";
      const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH;
      const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
      const _sm2 = _isBig ? 0 : MS;
      const _mt2 = _isBig ? 0 : MT;
      const bb = _bh - (_isBig ? 0 : MBO);
      if (this.x < _sm2) {
        this.x = _sm2;
        this.vx = Math.abs(this.vx) * 0.8;
      }
      if (this.x + this.width > _bw - _sm2) {
        this.x = _bw - _sm2 - this.width;
        this.vx = -Math.abs(this.vx) * 0.8;
      }
      if (this.y < _mt2) {
        this.y = _mt2;
        this.vy = Math.abs(this.vy) * 0.8;
      }
      if (this.y + this.height > bb) {
        this.y = bb - this.height;
        this.vy = -Math.abs(this.vy) * 0.8;
      }
    }
    render(ctx3) {
      if (!this.isActive || !this.visible) return;
      ctx3.save();
      ctx3.globalAlpha = this.opacity;
      if (this.imgLoaded && this.anim) {
        var _fw = this.anim.frameW, _fh = this.anim.frameH; var _sc = Math.min(this.width / _fw, this.height / _fh); var _dw = _fw * _sc, _dh = _fh * _sc; this.anim.drawToCanvas(ctx3, this.x + this.width / 2 - _dw / 2, this.y + this.height / 2 - _dh / 2, _dw, _dh, this.opacity, Math.PI / 2, 1);
      } else {
        ctx3.fillStyle = "#2E8B57";
        ctx3.fillRect(this.x, this.y, this.width, this.height);
        ctx3.fillStyle = "#fff";
        ctx3.font = "10px Arial";
        ctx3.textAlign = "center";
        ctx3.fillText(`J${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
      }
      {
        const bw = this.width, bh = 4, bx = this.x, by = this.y - 8, r = this.properties.currentHealth / this.properties.maxHealth;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(bx, by, bw, bh);
        ctx3.fillStyle = r > 0.5 ? "#4f4" : r > 0.25 ? "#ff0" : "#f44";
        ctx3.fillRect(bx, by, bw * r, bh);
      }
      ctx3.restore();
    }
    takeDamage(amount) {
      if (!this.isActive) return;
      this.properties.currentHealth -= amount;
      if (this.properties.currentHealth <= 0) this.die();
    }
    heal(amount) {
      this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth);
    }
    die() {
      this.isActive = false;
      this.visible = false;
      const d = GameGlobal.databus;
      d.killCount = (d.killCount || 0) + 1;
      d.score += 25;
      d.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12);
    }
  };

  // js/npc/piao.js
  init_resloader();
  init_render();
  var PROPS2 = {
    1: { speed: 1.4, maxHealth: 90, attackDamage: 10, attackInterval: 3e3, attack: true },
    2: { speed: 1.1, maxHealth: 380, attackDamage: 18, attackInterval: 5e3, attack: true },
    3: { speed: 1.7, maxHealth: 110, attackDamage: 8, attackInterval: 2800, attack: true, health: true, currentHealth: 110 },
    4: { speed: 0.9, maxHealth: 130, attackDamage: 12, attackInterval: 4e3, attack: true, heal: true },
    5: { speed: 2, maxHealth: 65, attackDamage: 10, attackInterval: 3e3, attack: true, stealth: true }
  };
  var SF2 = 60;
  var SC2 = 8;
  var SFP2 = 10;
  var FW2 = 64;
  var FH2 = 64;
  var MT2 = 70;
  var MBO2 = 100;
  var MS2 = 10;
  var Piao = class extends Sprite {
    constructor(type = 1) {
      super();
      this.mosquitoType = type;
      this.id = type;
      this.width = 46;
      this.height = 46;
      this.vx = 0;
      this.vy = 0;
      this.anim = null;
      this.img = null;
      this.imgLoaded = false;
      const p = PROPS2[type] || PROPS2[1];
      this.properties = { ...p, currentHealth: p.currentHealth || p.maxHealth, lastAttackTime: 0 };
      this.speed = p.speed;
      this.opacity = 1;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.markAsCloned = function() {
        this.properties.hasCloned = true;
      };
    }
    init() {
      this.isActive = true;
      this.visible = true;
      this.opacity = 1;
      const src = `images/piao${this.mosquitoType}_spritesheet.png`;
      this.img = resloader_default.get(src);
      if (this.img) {
        this.imgLoaded = true;
        this.anim = new Animation(this.img, Math.floor(this.img.naturalWidth / SC2), Math.floor(this.img.naturalHeight / Math.ceil(SF2 / SC2)), SC2, SF2, SFP2);
      } else {
        resloader_default.loadImage(src).then((img) => {
          this.img = img;
          this.imgLoaded = true;
          this.anim = new Animation(img, Math.floor(img.naturalWidth / SC2), Math.floor(img.naturalHeight / Math.ceil(SF2 / SC2)), SC2, SF2, SFP2);
        }).catch(() => {
        });
      }
      this.x = MS2 + Math.random() * (SCREEN_WIDTH - this.width - MS2 * 2);
      this.y = MT2 + Math.random() * (SCREEN_HEIGHT - this.height - MT2 - MBO2);
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }
    update() {
      if (!this.isActive) return;
      if (this.anim) this.anim.update();
      if (this.sweeping || this.stormCasting) return;
      this.moveTimer++;
      if (this.moveTimer >= this.moveChangeInterval) {
        this.moveTimer = 0;
        this.moveChangeInterval = 60 + Math.random() * 120;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.moveAngle) * this.speed;
        this.vy = Math.sin(this.moveAngle) * this.speed;
      }
      const sm = this.speedModifier || 1;
      this.x += this.vx * sm;
      this.y += this.vy * sm;
      if (this.speedModifier && this.speedModifier < 1) this.speedModifier = Math.min(1, this.speedModifier + 5e-3);
      const _db = GameGlobal.databus;
      const _isBig = _db.selectedCategory === "mosquito_bigmap";
      const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH;
      const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
      const _sm2 = _isBig ? 0 : MS2;
      const _mt2 = _isBig ? 0 : MT2;
      const bb = _bh - (_isBig ? 0 : MBO2);
      if (this.x < _sm2) {
        this.x = _sm2;
        this.vx = Math.abs(this.vx) * 0.8;
      }
      if (this.x + this.width > _bw - _sm2) {
        this.x = _bw - _sm2 - this.width;
        this.vx = -Math.abs(this.vx) * 0.8;
      }
      if (this.y < _mt2) {
        this.y = _mt2;
        this.vy = Math.abs(this.vy) * 0.8;
      }
      if (this.y + this.height > bb) {
        this.y = bb - this.height;
        this.vy = -Math.abs(this.vy) * 0.8;
      }
    }
    render(ctx3) {
      if (!this.isActive || !this.visible) return;
      ctx3.save();
      ctx3.globalAlpha = this.opacity;
      if (this.imgLoaded && this.anim) {
        var _fw = this.anim.frameW, _fh = this.anim.frameH; var _sc = Math.min(this.width / _fw, this.height / _fh); var _dw = _fw * _sc, _dh = _fh * _sc; this.anim.drawToCanvas(ctx3, this.x + this.width / 2 - _dw / 2, this.y + this.height / 2 - _dh / 2, _dw, _dh, this.opacity, Math.PI / 2, 1);
      } else {
        ctx3.fillStyle = "#FF1493";
        ctx3.fillRect(this.x, this.y, this.width, this.height);
        ctx3.fillStyle = "#fff";
        ctx3.font = "10px Arial";
        ctx3.textAlign = "center";
        ctx3.fillText(`P${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
      }
      {
        const bw = this.width, bh = 4, bx = this.x, by = this.y - 8, r = this.properties.currentHealth / this.properties.maxHealth;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(bx, by, bw, bh);
        ctx3.fillStyle = r > 0.5 ? "#4f4" : r > 0.25 ? "#ff0" : "#f44";
        ctx3.fillRect(bx, by, bw * r, bh);
      }
      ctx3.restore();
    }
    takeDamage(amount) {
      if (!this.isActive) return;
      this.properties.currentHealth -= amount;
      if (this.properties.currentHealth <= 0) this.die();
    }
    heal(amount) {
      this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth);
    }
    die() {
      this.isActive = false;
      this.visible = false;
      const d = GameGlobal.databus;
      d.killCount = (d.killCount || 0) + 1;
      d.score += 25;
      d.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12);
    }
  };

  // js/npc/gudao.js
  init_resloader();
  init_render();
  var PROPS3 = {
    1: { speed: 1.3, maxHealth: 100, attackDamage: 10, attackInterval: 3e3, attack: true },
    2: { speed: 1, maxHealth: 420, attackDamage: 20, attackInterval: 5e3, attack: true },
    3: { speed: 1.6, maxHealth: 130, attackDamage: 8, attackInterval: 2800, attack: true, health: true, currentHealth: 130 },
    4: { speed: 0.8, maxHealth: 140, attackDamage: 12, attackInterval: 4500, attack: true, heal: true },
    5: { speed: 1.8, maxHealth: 70, attackDamage: 10, attackInterval: 3e3, attack: true, stealth: true }
  };
  var SF3 = 60;
  var SC3 = 8;
  var SFP3 = 10;
  var FW3 = 64;
  var FH3 = 64;
  var MT3 = 70;
  var MBO3 = 100;
  var MS3 = 10;
  var Gudao = class extends Sprite {
    constructor(type = 1) {
      super();
      this.mosquitoType = type;
      this.id = type;
      this.width = 48;
      this.height = 48;
      this.vx = 0;
      this.vy = 0;
      this.anim = null;
      this.img = null;
      this.imgLoaded = false;
      const p = PROPS3[type] || PROPS3[1];
      this.properties = { ...p, currentHealth: p.currentHealth || p.maxHealth, lastAttackTime: 0 };
      this.speed = p.speed;
      this.opacity = 1;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.markAsCloned = function() {
        this.properties.hasCloned = true;
      };
    }
    init() {
      this.isActive = true;
      this.visible = true;
      this.opacity = 1;
      const src = `images/gudao${this.mosquitoType}_spritesheet.png`;
      this.img = resloader_default.get(src);
      if (this.img) {
        this.imgLoaded = true;
        this.anim = new Animation(this.img, Math.floor(this.img.naturalWidth / SC3), Math.floor(this.img.naturalHeight / Math.ceil(SF3 / SC3)), SC3, SF3, SFP3);
      } else {
        resloader_default.loadImage(src).then((img) => {
          this.img = img;
          this.imgLoaded = true;
          this.anim = new Animation(img, Math.floor(img.naturalWidth / SC3), Math.floor(img.naturalHeight / Math.ceil(SF3 / SC3)), SC3, SF3, SFP3);
        }).catch(() => {
        });
      }
      this.x = MS3 + Math.random() * (SCREEN_WIDTH - this.width - MS3 * 2);
      this.y = MT3 + Math.random() * (SCREEN_HEIGHT - this.height - MT3 - MBO3);
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }
    update() {
      if (!this.isActive) return;
      if (this.anim) this.anim.update();
      if (this.sweeping) return;
      this.moveTimer++;
      if (this.moveTimer >= this.moveChangeInterval) {
        this.moveTimer = 0;
        this.moveChangeInterval = 60 + Math.random() * 120;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.moveAngle) * this.speed;
        this.vy = Math.sin(this.moveAngle) * this.speed;
      }
      const sm = this.speedModifier || 1;
      this.x += this.vx * sm;
      this.y += this.vy * sm;
      if (this.speedModifier && this.speedModifier < 1) this.speedModifier = Math.min(1, this.speedModifier + 5e-3);
      const _db = GameGlobal.databus;
      const _isBig = _db.selectedCategory === "mosquito_bigmap";
      const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH;
      const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
      const _sm2 = _isBig ? 0 : MS3;
      const _mt2 = _isBig ? 0 : MT3;
      const bb = _bh - (_isBig ? 0 : MBO3);
      if (this.x < _sm2) {
        this.x = _sm2;
        this.vx = Math.abs(this.vx) * 0.8;
      }
      if (this.x + this.width > _bw - _sm2) {
        this.x = _bw - _sm2 - this.width;
        this.vx = -Math.abs(this.vx) * 0.8;
      }
      if (this.y < _mt2) {
        this.y = _mt2;
        this.vy = Math.abs(this.vy) * 0.8;
      }
      if (this.y + this.height > bb) {
        this.y = bb - this.height;
        this.vy = -Math.abs(this.vy) * 0.8;
      }
    }
    render(ctx3) {
      if (!this.isActive || !this.visible) return;
      ctx3.save();
      ctx3.globalAlpha = this.opacity;
      if (this.imgLoaded && this.anim) {
        var _fw = this.anim.frameW, _fh = this.anim.frameH; var _sc = Math.min(this.width / _fw, this.height / _fh); var _dw = _fw * _sc, _dh = _fh * _sc; this.anim.drawToCanvas(ctx3, this.x + this.width / 2 - _dw / 2, this.y + this.height / 2 - _dh / 2, _dw, _dh, this.opacity, Math.PI / 2, 1);
      } else {
        ctx3.fillStyle = "#32CD32";
        ctx3.fillRect(this.x, this.y, this.width, this.height);
        ctx3.fillStyle = "#fff";
        ctx3.font = "10px Arial";
        ctx3.textAlign = "center";
        ctx3.fillText(`G${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
      }
      {
        const bw = this.width, bh = 4, bx = this.x, by = this.y - 8, r = this.properties.currentHealth / this.properties.maxHealth;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(bx, by, bw, bh);
        ctx3.fillStyle = r > 0.5 ? "#4f4" : r > 0.25 ? "#ff0" : "#f44";
        ctx3.fillRect(bx, by, bw * r, bh);
      }
      ctx3.restore();
    }
    takeDamage(amount) {
      if (!this.isActive) return;
      this.properties.currentHealth -= amount;
      if (this.properties.currentHealth <= 0) this.die();
    }
    heal(amount) {
      this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth);
    }
    die() {
      this.isActive = false;
      this.visible = false;
      const d = GameGlobal.databus;
      d.killCount = (d.killCount || 0) + 1;
      d.score += 25;
      d.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12);
    }
  };

  // js/npc/ying.js
  init_resloader();
  init_render();
  var PROPS4 = {
    1: { speed: 1.2, maxHealth: 90, attackDamage: 10, attackInterval: 3e3, attack: true },
    2: { speed: 1, maxHealth: 360, attackDamage: 18, attackInterval: 5e3, attack: true },
    3: { speed: 1.5, maxHealth: 100, attackDamage: 8, attackInterval: 2800, attack: true, health: true, currentHealth: 100 },
    4: { speed: 0.8, maxHealth: 120, attackDamage: 12, attackInterval: 4e3, attack: true, heal: true },
    5: { speed: 1.8, maxHealth: 60, attackDamage: 10, attackInterval: 3e3, attack: true, stealth: true }
  };
  var SF4 = 60;
  var SC4 = 8;
  var SFP4 = 10;
  var FW4 = 64;
  var FH4 = 64;
  var MT4 = 70;
  var MBO4 = 100;
  var MS4 = 10;
  var Ying = class extends Sprite {
    constructor(type = 1) {
      super();
      this.mosquitoType = type;
      this.id = type;
      this.width = 46;
      this.height = 46;
      this.vx = 0;
      this.vy = 0;
      this.anim = null;
      this.img = null;
      this.imgLoaded = false;
      const p = PROPS4[type] || PROPS4[1];
      this.properties = { ...p, currentHealth: p.currentHealth || p.maxHealth, lastAttackTime: 0 };
      this.speed = p.speed;
      this.opacity = 1;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.markAsCloned = function() {
        this.properties.hasCloned = true;
      };
    }
    init() {
      this.isActive = true;
      this.visible = true;
      this.opacity = 1;
      const src = `images/ying${this.mosquitoType}_spritesheet.png`;
      this.img = resloader_default.get(src);
      if (this.img) {
        this.imgLoaded = true;
        this.anim = new Animation(this.img, Math.floor(this.img.naturalWidth / SC4), Math.floor(this.img.naturalHeight / Math.ceil(SF4 / SC4)), SC4, SF4, SFP4);
      } else {
        resloader_default.loadImage(src).then((img) => {
          this.img = img;
          this.imgLoaded = true;
          this.anim = new Animation(img, Math.floor(img.naturalWidth / SC4), Math.floor(img.naturalHeight / Math.ceil(SF4 / SC4)), SC4, SF4, SFP4);
        }).catch(() => {
        });
      }
      this.x = MS4 + Math.random() * (SCREEN_WIDTH - this.width - MS4 * 2);
      this.y = MT4 + Math.random() * (SCREEN_HEIGHT - this.height - MT4 - MBO4);
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }
    update() {
      if (!this.isActive) return;
      if (this.anim) this.anim.update();
      if (this.sweeping || this.stormCasting) return;
      this.moveTimer++;
      if (this.moveTimer >= this.moveChangeInterval) {
        this.moveTimer = 0;
        this.moveChangeInterval = 60 + Math.random() * 120;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.moveAngle) * this.speed;
        this.vy = Math.sin(this.moveAngle) * this.speed;
      }
      const sm = this.speedModifier || 1;
      this.x += this.vx * sm;
      this.y += this.vy * sm;
      if (this.speedModifier && this.speedModifier < 1) this.speedModifier = Math.min(1, this.speedModifier + 5e-3);
      const _db = GameGlobal.databus;
      const _isBig = _db.selectedCategory === "mosquito_bigmap";
      const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH;
      const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
      const _sm2 = _isBig ? 0 : MS4;
      const _mt2 = _isBig ? 0 : MT4;
      const bb = _bh - (_isBig ? 0 : MBO4);
      if (this.x < _sm2) {
        this.x = _sm2;
        this.vx = Math.abs(this.vx) * 0.8;
      }
      if (this.x + this.width > _bw - _sm2) {
        this.x = _bw - _sm2 - this.width;
        this.vx = -Math.abs(this.vx) * 0.8;
      }
      if (this.y < _mt2) {
        this.y = _mt2;
        this.vy = Math.abs(this.vy) * 0.8;
      }
      if (this.y + this.height > bb) {
        this.y = bb - this.height;
        this.vy = -Math.abs(this.vy) * 0.8;
      }
    }
    render(ctx3) {
      if (!this.isActive || !this.visible) return;
      ctx3.save();
      ctx3.globalAlpha = this.opacity;
      if (this.imgLoaded && this.anim) {
        var _fw = this.anim.frameW, _fh = this.anim.frameH; var _sc = Math.min(this.width / _fw, this.height / _fh); var _dw = _fw * _sc, _dh = _fh * _sc; this.anim.drawToCanvas(ctx3, this.x + this.width / 2 - _dw / 2, this.y + this.height / 2 - _dh / 2, _dw, _dh, this.opacity, Math.PI / 2, 1);
      } else {
        ctx3.fillStyle = "#FFD700";
        ctx3.fillRect(this.x, this.y, this.width, this.height);
        ctx3.fillStyle = "#000";
        ctx3.font = "10px Arial";
        ctx3.textAlign = "center";
        ctx3.fillText(`Y${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
      }
      {
        const bw = this.width, bh = 4, bx = this.x, by = this.y - 8, r = this.properties.currentHealth / this.properties.maxHealth;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(bx, by, bw, bh);
        ctx3.fillStyle = r > 0.5 ? "#4f4" : r > 0.25 ? "#ff0" : "#f44";
        ctx3.fillRect(bx, by, bw * r, bh);
      }
      ctx3.restore();
    }
    takeDamage(amount) {
      if (!this.isActive) return;
      this.properties.currentHealth -= amount;
      if (this.properties.currentHealth <= 0) this.die();
    }
    heal(amount) {
      this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth);
    }
    die() {
      this.isActive = false;
      this.visible = false;
      const d = GameGlobal.databus;
      d.killCount = (d.killCount || 0) + 1;
      d.score += 25;
      d.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12);
    }
  };

  // js/npc/ding.js
  init_resloader();
  init_render();
  var PROPS5 = {
    1: { speed: 1.5, maxHealth: 80, attackDamage: 10, attackInterval: 2800, attack: true },
    2: { speed: 1.2, maxHealth: 350, attackDamage: 20, attackInterval: 4500, attack: true },
    3: { speed: 1.8, maxHealth: 100, attackDamage: 8, attackInterval: 2500, attack: true, health: true, currentHealth: 100 },
    4: { speed: 1, maxHealth: 110, attackDamage: 12, attackInterval: 4e3, attack: true, heal: true },
    5: { speed: 2, maxHealth: 55, attackDamage: 10, attackInterval: 2800, attack: true, stealth: true }
  };
  var SF5 = 60;
  var SC5 = 8;
  var SFP5 = 12;
  var FW5 = 64;
  var FH5 = 64;
  var MT5 = 70;
  var MBO5 = 100;
  var MS5 = 10;
  var Ding = class extends Sprite {
    constructor(type = 1) {
      super();
      this.mosquitoType = type;
      this.id = type;
      this.width = 48;
      this.height = 48;
      this.vx = 0;
      this.vy = 0;
      this.anim = null;
      this.img = null;
      this.imgLoaded = false;
      const p = PROPS5[type] || PROPS5[1];
      this.properties = { ...p, currentHealth: p.currentHealth || p.maxHealth, lastAttackTime: 0 };
      this.speed = p.speed;
      this.opacity = 1;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.markAsCloned = function() {
        this.properties.hasCloned = true;
      };
    }
    init() {
      this.isActive = true;
      this.visible = true;
      this.opacity = 1;
      const src = `images/ding${this.mosquitoType}_spritesheet.png`;
      this.img = resloader_default.get(src);
      if (this.img) {
        this.imgLoaded = true;
        this.anim = new Animation(this.img, Math.floor(this.img.naturalWidth / SC5), Math.floor(this.img.naturalHeight / Math.ceil(SF5 / SC5)), SC5, SF5, SFP5);
      } else {
        resloader_default.loadImage(src).then((img) => {
          this.img = img;
          this.imgLoaded = true;
          this.anim = new Animation(img, Math.floor(img.naturalWidth / SC5), Math.floor(img.naturalHeight / Math.ceil(SF5 / SC5)), SC5, SF5, SFP5);
        }).catch(() => {
        });
      }
      this.x = MS5 + Math.random() * (SCREEN_WIDTH - this.width - MS5 * 2);
      this.y = MT5 + Math.random() * (SCREEN_HEIGHT - this.height - MT5 - MBO5);
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }
    update() {
      if (!this.isActive) return;
      if (this.anim) this.anim.update();
      if (this.sweeping || this.stormCasting) return;
      this.moveTimer++;
      if (this.moveTimer >= this.moveChangeInterval) {
        this.moveTimer = 0;
        this.moveChangeInterval = 60 + Math.random() * 120;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.moveAngle) * this.speed;
        this.vy = Math.sin(this.moveAngle) * this.speed;
      }
      const sm = this.speedModifier || 1;
      this.x += this.vx * sm;
      this.y += this.vy * sm;
      if (this.speedModifier && this.speedModifier < 1) this.speedModifier = Math.min(1, this.speedModifier + 5e-3);
      const _db = GameGlobal.databus;
      const _isBig = _db.selectedCategory === "mosquito_bigmap";
      const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH;
      const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
      const _sm2 = _isBig ? 0 : MS5;
      const _mt2 = _isBig ? 0 : MT5;
      const bb = _bh - (_isBig ? 0 : MBO5);
      if (this.x < _sm2) {
        this.x = _sm2;
        this.vx = Math.abs(this.vx) * 0.8;
      }
      if (this.x + this.width > _bw - _sm2) {
        this.x = _bw - _sm2 - this.width;
        this.vx = -Math.abs(this.vx) * 0.8;
      }
      if (this.y < _mt2) {
        this.y = _mt2;
        this.vy = Math.abs(this.vy) * 0.8;
      }
      if (this.y + this.height > bb) {
        this.y = bb - this.height;
        this.vy = -Math.abs(this.vy) * 0.8;
      }
    }
    render(ctx3) {
      if (!this.isActive || !this.visible) return;
      ctx3.save();
      ctx3.globalAlpha = this.opacity;
      if (this.imgLoaded && this.anim) {
        var _fw = this.anim.frameW, _fh = this.anim.frameH; var _sc = Math.min(this.width / _fw, this.height / _fh); var _dw = _fw * _sc, _dh = _fh * _sc; this.anim.drawToCanvas(ctx3, this.x + this.width / 2 - _dw / 2, this.y + this.height / 2 - _dh / 2, _dw, _dh, this.opacity, Math.PI / 2, 1);
      } else {
        ctx3.fillStyle = "#00CED1";
        ctx3.fillRect(this.x, this.y, this.width, this.height);
        ctx3.fillStyle = "#fff";
        ctx3.font = "10px Arial";
        ctx3.textAlign = "center";
        ctx3.fillText(`D${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
      }
      {
        const bw = this.width, bh = 4, bx = this.x, by = this.y - 8, r = this.properties.currentHealth / this.properties.maxHealth;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(bx, by, bw, bh);
        ctx3.fillStyle = r > 0.5 ? "#4f4" : r > 0.25 ? "#ff0" : "#f44";
        ctx3.fillRect(bx, by, bw * r, bh);
      }
      ctx3.restore();
    }
    takeDamage(amount) {
      if (!this.isActive) return;
      this.properties.currentHealth -= amount;
      if (this.properties.currentHealth <= 0) this.die();
    }
    heal(amount) {
      this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth);
    }
    die() {
      this.isActive = false;
      this.visible = false;
      const d = GameGlobal.databus;
      d.killCount = (d.killCount || 0) + 1;
      d.score += 25;
      d.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12);
    }
  };

  // js/npc/die.js
  init_resloader();
  init_render();
  var PROPS6 = {
    1: { speed: 1.6, maxHealth: 70, attackDamage: 10, attackInterval: 2500, attack: true },
    2: { speed: 1.3, maxHealth: 340, attackDamage: 18, attackInterval: 4500, attack: true },
    3: { speed: 1.9, maxHealth: 90, attackDamage: 8, attackInterval: 2200, attack: true, health: true, currentHealth: 90 },
    4: { speed: 1, maxHealth: 100, attackDamage: 12, attackInterval: 3500, attack: true, heal: true },
    5: { speed: 2.1, maxHealth: 50, attackDamage: 10, attackInterval: 2500, attack: true, stealth: true }
  };
  var SF6 = 60;
  var SC6 = 8;
  var SFP6 = 12;
  var FW6 = 64;
  var FH6 = 64;
  var MT6 = 70;
  var MBO6 = 100;
  var MS6 = 10;
  var Die = class extends Sprite {
    constructor(type = 1) {
      super();
      this.mosquitoType = type;
      this.id = type;
      this.width = 46;
      this.height = 46;
      this.vx = 0;
      this.vy = 0;
      this.anim = null;
      this.img = null;
      this.imgLoaded = false;
      const p = PROPS6[type] || PROPS6[1];
      this.properties = { ...p, currentHealth: p.currentHealth || p.maxHealth, lastAttackTime: 0 };
      this.speed = p.speed;
      this.opacity = 1;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.markAsCloned = function() {
        this.properties.hasCloned = true;
      };
    }
    init() {
      this.isActive = true;
      this.visible = true;
      this.opacity = 1;
      const src = `images/die${this.mosquitoType}_spritesheet.png`;
      this.img = resloader_default.get(src);
      if (this.img) {
        this.imgLoaded = true;
        this.anim = new Animation(this.img, Math.floor(this.img.naturalWidth / SC6), Math.floor(this.img.naturalHeight / Math.ceil(SF6 / SC6)), SC6, SF6, SFP6);
      } else {
        resloader_default.loadImage(src).then((img) => {
          this.img = img;
          this.imgLoaded = true;
          this.anim = new Animation(img, Math.floor(img.naturalWidth / SC6), Math.floor(img.naturalHeight / Math.ceil(SF6 / SC6)), SC6, SF6, SFP6);
        }).catch(() => {
        });
      }
      this.x = MS6 + Math.random() * (SCREEN_WIDTH - this.width - MS6 * 2);
      this.y = MT6 + Math.random() * (SCREEN_HEIGHT - this.height - MT6 - MBO6);
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }
    update() {
      if (!this.isActive) return;
      if (this.anim) this.anim.update();
      if (this.sweeping || this.stormCasting) return;
      this.moveTimer++;
      if (this.moveTimer >= this.moveChangeInterval) {
        this.moveTimer = 0;
        this.moveChangeInterval = 60 + Math.random() * 120;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.moveAngle) * this.speed;
        this.vy = Math.sin(this.moveAngle) * this.speed;
      }
      const sm = this.speedModifier || 1;
      this.x += this.vx * sm;
      this.y += this.vy * sm;
      if (this.speedModifier && this.speedModifier < 1) this.speedModifier = Math.min(1, this.speedModifier + 5e-3);
      const _db = GameGlobal.databus;
      const _isBig = _db.selectedCategory === "mosquito_bigmap";
      const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH;
      const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
      const _sm2 = _isBig ? 0 : MS6;
      const _mt2 = _isBig ? 0 : MT6;
      const bb = _bh - (_isBig ? 0 : MBO6);
      if (this.x < _sm2) {
        this.x = _sm2;
        this.vx = Math.abs(this.vx) * 0.8;
      }
      if (this.x + this.width > _bw - _sm2) {
        this.x = _bw - _sm2 - this.width;
        this.vx = -Math.abs(this.vx) * 0.8;
      }
      if (this.y < _mt2) {
        this.y = _mt2;
        this.vy = Math.abs(this.vy) * 0.8;
      }
      if (this.y + this.height > bb) {
        this.y = bb - this.height;
        this.vy = -Math.abs(this.vy) * 0.8;
      }
    }
    render(ctx3) {
      if (!this.isActive || !this.visible) return;
      ctx3.save();
      ctx3.globalAlpha = this.opacity;
      if (this.imgLoaded && this.anim) {
        var _fw = this.anim.frameW, _fh = this.anim.frameH; var _sc = Math.min(this.width / _fw, this.height / _fh); var _dw = _fw * _sc, _dh = _fh * _sc; this.anim.drawToCanvas(ctx3, this.x + this.width / 2 - _dw / 2, this.y + this.height / 2 - _dh / 2, _dw, _dh, this.opacity, Math.PI / 2, 1);
      } else {
        ctx3.fillStyle = "#FF69B4";
        ctx3.fillRect(this.x, this.y, this.width, this.height);
        ctx3.fillStyle = "#fff";
        ctx3.font = "10px Arial";
        ctx3.textAlign = "center";
        ctx3.fillText(`B${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
      }
      {
        const bw = this.width, bh = 4, bx = this.x, by = this.y - 8, r = this.properties.currentHealth / this.properties.maxHealth;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(bx, by, bw, bh);
        ctx3.fillStyle = r > 0.5 ? "#4f4" : r > 0.25 ? "#ff0" : "#f44";
        ctx3.fillRect(bx, by, bw * r, bh);
      }
      ctx3.restore();
    }
    takeDamage(amount) {
      if (!this.isActive) return;
      this.properties.currentHealth -= amount;
      if (this.properties.currentHealth <= 0) this.die();
    }
    heal(amount) {
      this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth);
    }
    die() {
      this.isActive = false;
      this.visible = false;
      const d = GameGlobal.databus;
      d.killCount = (d.killCount || 0) + 1;
      d.score += 25;
      d.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12);
    }
  };

  // js/libs/tinyemitter.js
  var TinyEmitter = class {
    constructor() {
      this._listeners = {};
    }
    on(event, fn, ctx3) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push({ fn, ctx: ctx3 });
      return this;
    }
    once(event, fn, ctx3) {
      const wrapper = (...args) => {
        this.off(event, wrapper);
        fn.apply(ctx3, args);
      };
      return this.on(event, wrapper, ctx3);
    }
    off(event, fn) {
      if (!this._listeners[event]) return this;
      if (!fn) {
        delete this._listeners[event];
        return this;
      }
      this._listeners[event] = this._listeners[event].filter((l) => l.fn !== fn);
      return this;
    }
    emit(event, ...args) {
      if (!this._listeners[event]) return this;
      this._listeners[event].forEach((l) => {
        l.fn.apply(l.ctx, args);
      });
      return this;
    }
  };

  // js/runtime/gameinfo.js
  init_render();
  init_resloader();
  var BOTTLE_CONFIG = {
    10: { name: "\u5927\u5730\u56FE", category: "mosquito_bigmap", icon: "images/tiaozhan.png", desc: "\u81EA\u7531\u63A2\u7D22" }
  };
  var GameInfo = class extends TinyEmitter {
    constructor() {
      super();
      this._bottleBtns = [];
      this._oceanOff = 0;
      this._crystalState = null;
      this._bottleScrollY = 0;
      this._scrollTouchY = null;
      this._hasScrolled = false;
    }
    render(ctx3, databus) {
      if (databus.gamePhase === "bottle_select") {
        this._renderBottleSelect(ctx3);
        return;
      }
      this._renderGameHUD(ctx3, databus);
      databus.enemys.forEach((e) => {
        if (e.visible) e.render ? e.render(ctx3) : e.drawToCanvas && e.drawToCanvas(ctx3);
      });
      if (databus.isShowManual) this._renderManual(ctx3);
      if (databus.isShowPedia) {
        const { renderPedia: renderPedia2 } = (init_pedia(), __toCommonJS(pedia_exports));
        renderPedia2(ctx3, databus);
      }
      if (databus.isGameOver) this._renderGameOver(ctx3, databus);
      if (databus.gamePhase === "category_complete") this._renderCategoryComplete(ctx3, databus);
    }
    _renderBottleSelect(ctx3) {
      if (IS_PC) {
        ctx3.save();
        const cx = SCREEN_WIDTH / 2, cy = SCREEN_HEIGHT / 2;
        ctx3.translate(cx, cy);
        ctx3.rotate(-Math.PI / 2);
        const s = Math.min(SCREEN_WIDTH / SCREEN_HEIGHT, SCREEN_HEIGHT / SCREEN_WIDTH);
        ctx3.scale(s, s);
        ctx3.translate(-cx, -cy);
      }
      const coverImg = resloader_default.getImage("images/dawenzi_cover.jpg");
      if (coverImg) {
        const iw = coverImg.width, ih = coverImg.height;
        const scale = Math.max(SCREEN_WIDTH / iw, SCREEN_HEIGHT / ih);
        const dw = iw * scale, dh = ih * scale;
        ctx3.drawImage(coverImg, (SCREEN_WIDTH - dw) / 2, (SCREEN_HEIGHT - dh) / 2, dw, dh);
      } else {
        const g = ctx3.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
        g.addColorStop(0, "#2a1a0e");
        g.addColorStop(1, "#0d0604");
        ctx3.fillStyle = g;
        ctx3.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }
      this._bottleBtns = [];
      const bw = 56, bh = 160;
      const bx = 22, by = SCREEN_HEIGHT - bh - 22;
      ctx3.save();
      const bgGrad = ctx3.createLinearGradient(bx, by, bx, by + bh);
      bgGrad.addColorStop(0, "rgba(60,30,12,0.82)");
      bgGrad.addColorStop(1, "rgba(30,14,4,0.88)");
      ctx3.fillStyle = bgGrad;
      ctx3.beginPath();
      ctx3.roundRect(bx, by, bw, bh, 10);
      ctx3.fill();
      ctx3.strokeStyle = "#e8c878";
      ctx3.lineWidth = 2;
      ctx3.stroke();
      ctx3.strokeStyle = "rgba(232,200,120,0.4)";
      ctx3.lineWidth = 1;
      ctx3.beginPath();
      ctx3.roundRect(bx + 4, by + 4, bw - 8, bh - 8, 7);
      ctx3.stroke();
      ctx3.fillStyle = "#f5e0a8";
      ctx3.font = "bold 26px 'KaiTi','STKaiti','SimSun',serif";
      ctx3.textAlign = "center";
      ctx3.textBaseline = "middle";
      ctx3.save();
      ctx3.translate(bx + bw / 2, by + bh * 0.32);
      ctx3.rotate(Math.PI / 2);
      ctx3.fillText("\u6253", 0, 0);
      ctx3.restore();
      ctx3.save();
      ctx3.translate(bx + bw / 2, by + bh * 0.68);
      ctx3.rotate(Math.PI / 2);
      ctx3.fillText("\u5f00", 0, 0);
      ctx3.restore();
      ctx3.strokeStyle = "rgba(232,200,120,0.6)";
      ctx3.lineWidth = 1;
      ctx3.beginPath();
      ctx3.moveTo(bx + bw * 0.3, by + bh * 0.5);
      ctx3.lineTo(bx + bw * 0.7, by + bh * 0.5);
      ctx3.stroke();
      ctx3.restore();
      this._bottleBtns.push({ x: bx, y: by, w: bw, h: bh, bottleId: 10, category: "mosquito_bigmap" });
      ctx3.textAlign = "left";
      ctx3.textBaseline = "alphabetic";
      if (IS_PC) ctx3.restore();
    }
    handleBottleTouch(x, y) {
      let tx = x, ty = y;
      if (IS_PC) {
        const cx = SCREEN_WIDTH / 2, cy = SCREEN_HEIGHT / 2;
        const s = Math.min(SCREEN_WIDTH / SCREEN_HEIGHT, SCREEN_HEIGHT / SCREEN_WIDTH);
        const dx = x - cx, dy = y - cy;
        tx = cx - dy / s;
        ty = cy + dx / s;
      }
      const adjustedY = ty + this._bottleScrollY;
      for (const b of this._bottleBtns) {
        if (tx >= b.x && tx <= b.x + b.w && adjustedY >= b.y && adjustedY <= b.y + b.h) return b;
      }
      return null;
    }
    handleBottleScrollStart(y) {
      this._scrollTouchY = y;
      this._hasScrolled = false;
    }
    handleBottleScrollMove(y) {
      if (this._scrollTouchY === null) return;
      const dy = this._scrollTouchY - y;
      if (Math.abs(dy) > 5) this._hasScrolled = true;
      this._bottleScrollY += dy;
      this._scrollTouchY = y;
    }
    handleBottleScrollEnd() {
      this._scrollTouchY = null;
    }
    _renderGameHUD(ctx3, d) {
      const isBigmap = d.selectedCategory === "mosquito_bigmap";
      if (!isBigmap) {
        ctx3.fillStyle = "rgba(0,0,0,0.4)";
        ctx3.fillRect(0, 0, SCREEN_WIDTH, 70);
        const p2 = 10, bw2 = 100, bh2 = 10;
        ctx3.fillStyle = "#FFF";
        ctx3.font = "bold 14px Arial";
        ctx3.textAlign = "left";
        ctx3.fillText("\u7B49\u7EA7", p2, 20);
        ctx3.fillStyle = "#2196F3";
        ctx3.font = "bold 18px Arial";
        ctx3.fillText(`${d.level}`, p2 + 35, 20);
        ctx3.fillStyle = "#FFF";
        ctx3.font = "bold 14px Arial";
        ctx3.fillText("\u5206\u6570", p2 + 80, 20);
        ctx3.fillStyle = "#4CAF50";
        ctx3.font = "bold 16px Arial";
        ctx3.fillText(`${d.score}`, p2 + 115, 20);
        ctx3.fillStyle = "#FF9800";
        ctx3.font = "12px Arial";
        ctx3.fillText(`/${d.highScore}`, p2 + 160, 20);
        ctx3.fillStyle = "#FFF";
        ctx3.font = "12px Arial";
        ctx3.fillText(`\u51FB\u6740:${d.killCount || 0}`, p2 + 220, 20);
        const s2 = d.activeState();
        this._bar(ctx3, p2 + 22, 32, bw2, bh2, s2.playerHealth / s2.maxPlayerHealth, "#f44336", "#ff5722");
        ctx3.fillStyle = "#FFF";
        ctx3.font = "10px Arial";
        ctx3.fillText("HP", p2, 40);
        this._bar(ctx3, p2 + 28, 48, bw2, bh2, s2.energy / s2.maxEnergy, "#2196F3", "#03A9F4");
        ctx3.fillStyle = "#FFF";
        ctx3.fillText("\u80FD\u91CF", p2, 56);
        this._bar(ctx3, p2 + 28, 64, bw2, bh2, s2.power / s2.maxPower, "#4CAF50", "#8BC34A");
        ctx3.fillStyle = "#FFF";
        ctx3.fillText("\u7535\u529B", p2, 72);
        const r = s2.power / s2.maxPower;
        ctx3.font = "16px Arial";
        for (let i = 0; i < 3; i++) {
          ctx3.globalAlpha = r >= (i + 1) / 3 ? 1 : 0.2;
          ctx3.fillText("\u{1F680}", p2 + 140 + i * 22, 72);
        }
        ctx3.globalAlpha = 1;
        ctx3.textAlign = "left";
        return;
      }
      const s = d.activeState();
      if (IS_PC) {
        const bh = 12, bw = 80;
        const hpX = 15, hpY = 15;
        ctx3.save();
        ctx3.fillStyle = "#333";
        ctx3.fillRect(hpX, hpY, bw, bh);
        const hpRatio = Math.max(0, Math.min(1, s.playerHealth / s.maxPlayerHealth));
        const g = ctx3.createLinearGradient(hpX, hpY, hpX + bw, hpY);
        g.addColorStop(0, "#f44336");
        g.addColorStop(1, "#ff5722");
        ctx3.fillStyle = g;
        ctx3.fillRect(hpX, hpY, bw * hpRatio, bh);
        ctx3.strokeStyle = "#555";
        ctx3.lineWidth = 1;
        ctx3.strokeRect(hpX, hpY, bw, bh);
        ctx3.fillStyle = "#FFF";
        ctx3.font = "bold 10px Arial";
        ctx3.textAlign = "left";
        ctx3.fillText("HP", hpX + bw + 6, hpY + 10);
        const _p = window.__game.player;
        if (_p && _p.shieldActive && _p.shieldDefense > 0) {
          const defMax = 100;
          const defRatio = Math.max(0, Math.min(1, _p.shieldDefense / defMax));
          const defX = hpX, defY = hpY + bh + 6;
          ctx3.fillStyle = "#333";
          ctx3.fillRect(defX, defY, bw, bh);
          const g2 = ctx3.createLinearGradient(defX, defY, defX + bw, defY);
          g2.addColorStop(0, "#2196F3");
          g2.addColorStop(1, "#03A9F4");
          ctx3.fillStyle = g2;
          ctx3.fillRect(defX, defY, bw * defRatio, bh);
          ctx3.strokeStyle = "#555";
          ctx3.lineWidth = 1;
          ctx3.strokeRect(defX, defY, bw, bh);
          ctx3.fillStyle = "#FFF";
          ctx3.font = "bold 10px Arial";
          ctx3.fillText("\u9632", defX + bw + 6, defY + 10);
        }
        ctx3.font = "bold 11px Arial";
        ctx3.fillStyle = "rgba(255,255,255,0.85)";
        const tx = hpX + bw + 40;
        ctx3.fillText("\u65B9\u5411: WASD", tx, hpY + 4);
        ctx3.fillText("\u53D1\u5C04: J", tx, hpY + 20);
        ctx3.fillText("\u62A4\u76FE: K", tx, hpY + 36);
        const killIcon = resloader_default.getImage("images/tubiao.png");
        if (killIcon) {
          const kiw = 28, kih = 28;
          const kix = SCREEN_WIDTH / 2 - kiw / 2 - 30;
          ctx3.drawImage(killIcon, kix, 10, kiw, kih);
          ctx3.fillStyle = "#FFF";
          ctx3.font = "bold 14px Arial";
          ctx3.textAlign = "left";
          ctx3.fillText(d.killCount || 0, kix + kiw + 8, 10 + kih / 2 + 5);
          ctx3.textAlign = "left";
        }
        ctx3.restore();
        this._renderMinimap(ctx3, d);
        return;
      }
      const bw = 12, bh = 90;
      const hpX = SCREEN_WIDTH - 30, hpY = SCREEN_HEIGHT - bh - 15;
      ctx3.save();
      ctx3.fillStyle = "#333";
      ctx3.fillRect(hpX, hpY, bw, bh);
      const hpRatio = Math.max(0, Math.min(1, s.playerHealth / s.maxPlayerHealth));
      const g = ctx3.createLinearGradient(hpX, hpY + bh, hpX, hpY);
      g.addColorStop(0, "#f44336");
      g.addColorStop(1, "#ff5722");
      ctx3.fillStyle = g;
      ctx3.fillRect(hpX, hpY + bh * (1 - hpRatio), bw, bh * hpRatio);
      ctx3.strokeStyle = "#555";
      ctx3.lineWidth = 1;
      ctx3.strokeRect(hpX, hpY, bw, bh);
      ctx3.fillStyle = "#FFF";
      ctx3.font = "bold 10px Arial";
      ctx3.textAlign = "center";
      ctx3.fillText("HP", hpX + bw / 2, hpY - 4);
      const _p = window.__game.player;
      if (_p && _p.shieldActive && _p.shieldDefense > 0) {
        const defMax = 100;
        const defRatio = Math.max(0, Math.min(1, _p.shieldDefense / defMax));
        const defX = hpX - 22, defY = hpY;
        ctx3.fillStyle = "#333";
        ctx3.fillRect(defX, defY, bw, bh);
        const g2 = ctx3.createLinearGradient(defX, defY + bh, defX, defY);
        g2.addColorStop(0, "#2196F3");
        g2.addColorStop(1, "#03A9F4");
        ctx3.fillStyle = g2;
        ctx3.fillRect(defX, defY + bh * (1 - defRatio), bw, bh * defRatio);
        ctx3.strokeStyle = "#555";
        ctx3.lineWidth = 1;
        ctx3.strokeRect(defX, defY, bw, bh);
        ctx3.fillStyle = "#FFF";
        ctx3.font = "bold 10px Arial";
        ctx3.fillText("\u9632", defX + bw / 2, defY - 4);
      }
      ctx3.restore();
      const killIcon = resloader_default.getImage("images/tubiao.png");
      if (killIcon) {
        const iw = 40, ih = 40;
        const ix = SCREEN_WIDTH - iw - 5, iy = SCREEN_HEIGHT / 2 - ih / 2;
        ctx3.save();
        ctx3.translate(ix + iw / 2, iy + ih / 2);
        ctx3.rotate(Math.PI / 2);
        ctx3.drawImage(killIcon, -iw / 2, -ih / 2, iw, ih);
        ctx3.restore();
        ctx3.save();
        ctx3.translate(ix + iw / 2, iy + ih + 18);
        ctx3.rotate(Math.PI / 2);
        ctx3.fillStyle = "#FFF";
        ctx3.font = "bold 18px Arial";
        ctx3.textAlign = "center";
        ctx3.textBaseline = "middle";
        ctx3.fillText(d.killCount || 0, 0, 0);
        ctx3.restore();
      }
      this._renderMinimap(ctx3, d);
    }
    _renderMinimap(ctx3, d) {
      const mw = 120, mh = 120, mx = SCREEN_WIDTH - mw - 10, my = 10;
      ctx3.save();
      ctx3.fillStyle = "rgba(0,0,0,0.5)";
      ctx3.beginPath();
      ctx3.roundRect(mx, my, mw, mh, 8);
      ctx3.fill();
      ctx3.strokeStyle = "rgba(255,255,255,0.3)";
      ctx3.lineWidth = 1;
      ctx3.stroke();
      const ww = d.worldWidth || SCREEN_WIDTH * 12;
      const wh = d.worldHeight || SCREEN_HEIGHT * 12;
      const cx = d.camera ? d.camera.x : ww / 2;
      const cy = d.camera ? d.camera.y : wh / 2;
      const px = d.playerCenterX || cx;
      const py = d.playerCenterY || cy;
      const scaleX = mw / ww;
      const scaleY = mh / wh;
      const camW = SCREEN_WIDTH;
      const camH = SCREEN_HEIGHT;
      const camX = (cx - camW / 2) * scaleX;
      const camY = (cy - camH / 2) * scaleY;
      const camWScaled = camW * scaleX;
      const camHScaled = camH * scaleY;
      ctx3.fillStyle = "rgba(255,255,255,0.1)";
      ctx3.fillRect(mx + camX, my + camY, camWScaled, camHScaled);
      ctx3.strokeStyle = "rgba(255,255,255,0.3)";
      ctx3.lineWidth = 1;
      ctx3.strokeRect(mx + camX, my + camY, camWScaled, camHScaled);
      const playerMapX = mx + px * scaleX;
      const playerMapY = my + py * scaleY;
      ctx3.fillStyle = "#4FC3F7";
      ctx3.beginPath();
      ctx3.arc(playerMapX, playerMapY, 5, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.strokeStyle = "#FFF";
      ctx3.lineWidth = 1;
      ctx3.stroke();
      if (d.enemys) {
        d.enemys.forEach((e) => {
          if (!e.isActive) return;
          const ex = e.x || 0, ey = e.y || 0;
          const enemyMapX = mx + ex * scaleX;
          const enemyMapY = my + ey * scaleY;
          ctx3.fillStyle = "#f44336";
          ctx3.beginPath();
          ctx3.arc(enemyMapX, enemyMapY, 3, 0, Math.PI * 2);
          ctx3.fill();
        });
      }
      ctx3.restore();
      const bbx = mx, bby = my + mh + 4, bbw = mw, bbh = 22;
      ctx3.fillStyle = "rgba(60,30,12,0.85)";
      ctx3.beginPath();
      ctx3.roundRect(bbx, bby, bbw, bbh, 6);
      ctx3.fill();
      ctx3.strokeStyle = "#e8c878";
      ctx3.lineWidth = 1;
      ctx3.stroke();
      ctx3.fillStyle = "#f5e0a8";
      ctx3.textAlign = "center";
      ctx3.textBaseline = "middle";
      if (IS_PC) {
        ctx3.font = "bold 13px Arial";
        ctx3.fillText("\u2190 \u56de\u8fd4", bbx + bbw / 2, bby + bbh / 2);
      } else {
        ctx3.font = "bold 13px Arial";
        const t0 = "\u2190 ", t1 = "\u56de", t2 = "\u8fd4";
        const w0 = ctx3.measureText(t0).width;
        const w1 = ctx3.measureText(t1).width;
        const w2 = ctx3.measureText(t2).width;
        const totalW = w0 + w1 + w2;
        const startX = bbx + bbw / 2 - totalW / 2;
        ctx3.fillText(t0, startX + w0 / 2, bby + bbh / 2);
        ctx3.save();
        ctx3.translate(startX + w0 + w1 / 2, bby + bbh / 2);
        ctx3.rotate(Math.PI / 2);
        ctx3.fillText(t1, 0, 0);
        ctx3.restore();
        ctx3.save();
        ctx3.translate(startX + w0 + w1 + w2 / 2, bby + bbh / 2);
        ctx3.rotate(Math.PI / 2);
        ctx3.fillText(t2, 0, 0);
        ctx3.restore();
      }
      ctx3.textAlign = "left";
      ctx3.textBaseline = "alphabetic";
    }
    _bar(ctx3, x, y, w, h, ratio, c1, c2) {
      ctx3.fillStyle = "#333";
      ctx3.fillRect(x, y, w, h);
      const g = ctx3.createLinearGradient(x, y, x + w, y);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      ctx3.fillStyle = g;
      ctx3.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), h);
      ctx3.strokeStyle = "#555";
      ctx3.lineWidth = 1;
      ctx3.strokeRect(x, y, w, h);
    }
    _renderGameOver(ctx3, d) {
      ctx3.fillStyle = "rgba(0,0,0,0.7)";
      ctx3.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx3.fillStyle = "#FFF";
      ctx3.font = "bold 28px Arial";
      ctx3.textAlign = "center";
      ctx3.fillText(d.gameOverReason === "win" ? "\u{1F389} \u5168\u90E8\u6D88\u706D\uFF01" : "\u{1F480} \u6E38\u620F\u7ED3\u675F", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 60);
      ctx3.font = "18px Arial";
      ctx3.fillText(`\u5F97\u5206: ${d.score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);
      ctx3.fillText(`\u6700\u9AD8\u5206: ${d.highScore}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 10);
      const bw = 160, bh = 45, bx = (SCREEN_WIDTH - bw) / 2, by = SCREEN_HEIGHT / 2 + 40;
      ctx3.fillStyle = "#4CAF50";
      ctx3.beginPath();
      ctx3.roundRect(bx, by, bw, bh, 10);
      ctx3.fill();
      ctx3.fillStyle = "#FFF";
      ctx3.font = "bold 18px Arial";
      ctx3.fillText("\u91CD\u65B0\u5F00\u59CB", SCREEN_WIDTH / 2, by + 30);
      if (d.gameOverReason !== "win") {
        const ry = by + 60;
        ctx3.fillStyle = "#FF9800";
        ctx3.beginPath();
        ctx3.roundRect(bx, ry, bw, bh, 10);
        ctx3.fill();
        ctx3.fillStyle = "#FFF";
        ctx3.fillText("\u770B\u5E7F\u544A\u590D\u6D3B", SCREEN_WIDTH / 2, ry + 30);
      }
      ctx3.textAlign = "left";
    }
    _renderCategoryComplete(ctx3, d) {
      ctx3.fillStyle = "rgba(0,0,0,0.7)";
      ctx3.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx3.fillStyle = "#FFF";
      ctx3.font = "bold 28px Arial";
      ctx3.textAlign = "center";
      ctx3.fillText("\u{1F3C6} \u901A\u5173\uFF01", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 60);
      ctx3.font = "18px Arial";
      ctx3.fillText(`\u6700\u7EC8\u5F97\u5206: ${d.score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);
      const bw = 160, bh = 45, bx = (SCREEN_WIDTH - bw) / 2, by = SCREEN_HEIGHT / 2 + 20;
      ctx3.fillStyle = "#4CAF50";
      ctx3.beginPath();
      ctx3.roundRect(bx, by, bw, bh, 10);
      ctx3.fill();
      ctx3.fillStyle = "#FFF";
      ctx3.font = "bold 18px Arial";
      ctx3.fillText("\u518D\u6765\u4E00\u6B21", SCREEN_WIDTH / 2, by + 30);
      const by2 = by + 60;
      ctx3.fillStyle = "#2196F3";
      ctx3.beginPath();
      ctx3.roundRect(bx, by2, bw, bh, 10);
      ctx3.fill();
      ctx3.fillStyle = "#FFF";
      ctx3.fillText("\u8FD4\u56DE\u74F6\u5B50", SCREEN_WIDTH / 2, by2 + 30);
      ctx3.textAlign = "left";
    }
    _renderManual(ctx3) {
      ctx3.fillStyle = "rgba(0,0,0,0.6)";
      ctx3.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      const mw = SCREEN_WIDTH * 0.85, mh = SCREEN_HEIGHT * 0.7, mx = (SCREEN_WIDTH - mw) / 2, my = (SCREEN_HEIGHT - mh) / 2;
      ctx3.fillStyle = "#FFF";
      ctx3.beginPath();
      ctx3.roundRect(mx, my, mw, mh, 10);
      ctx3.fill();
      ctx3.fillStyle = "#333";
      ctx3.font = "bold 18px Arial";
      ctx3.textAlign = "center";
      ctx3.fillText("\u6E38\u620F\u8BF4\u660E\u4E66", SCREEN_WIDTH / 2, my + 30);
      const lines = ["\u3010\u64CD\u4F5C\u8BF4\u660E\u3011", "\u2022 \u62D6\u52A8\uFF1A\u8F6C\u52A8\u70AE\u7B52\u7784\u51C6", "\u2022 \u5355\u51FB\uFF1A\u53D1\u5C04\u70AE\u5F39", "\u2022 \u957F\u6309\uFF1A\u53D1\u5C04\u6FC0\u5149", "\u2022 \u70B9\u51FB\u868A\u5B50\uFF1A\u53D1\u5C04\u8FFD\u8E2A\u5F39", "", "\u3010\u5927\u5730\u56FE\u6A21\u5F0F\u3011", "\u2022 \u5DE6\u4E0A\u6447\u6746\uFF1A\u79FB\u52A8", "\u2022 \u53F3\u534A\u8FB9\uFF1A\u5C04\u51FB", "\u2022 \u5DE6\u4E0B\u62A4\u76FE\u6309\u94AE\uFF1A\u6FC0\u6D3B\u62A4\u76FE"];
      ctx3.font = "13px Arial";
      ctx3.textAlign = "left";
      let ty = my + 60;
      lines.forEach((l) => {
        ctx3.fillText(l, mx + 20, ty);
        ty += 20;
      });
      ctx3.fillStyle = "#f44336";
      ctx3.beginPath();
      ctx3.arc(mx + mw - 20, my + 20, 15, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.fillStyle = "#FFF";
      ctx3.font = "bold 18px Arial";
      ctx3.textAlign = "center";
      ctx3.fillText("\xD7", mx + mw - 20, my + 26);
      ctx3.textAlign = "left";
    }
    showCrystalBallReward(level, callback) {
      this._crystalState = { level, callback, phase: "enter", startTime: Date.now(), ballY: -200, targetY: SCREEN_HEIGHT * 0.35, opened: false };
    }
    updateCrystalBall(ctx3) {
      const cs = this._crystalState;
      if (!cs) return false;
      const elapsed = Date.now() - cs.startTime;
      if (cs.phase === "enter") {
        cs.ballY = Math.min(cs.targetY, cs.ballY + (cs.targetY - cs.ballY) * 0.08);
        if (Math.abs(cs.ballY - cs.targetY) < 2) cs.phase = "wait";
      }
      ctx3.fillStyle = "rgba(0,0,0,0.5)";
      ctx3.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      const cx = SCREEN_WIDTH / 2, r = 60;
      const glow = 0.3 + Math.sin(Date.now() / 300) * 0.2;
      ctx3.save();
      ctx3.globalAlpha = glow;
      ctx3.fillStyle = "rgba(100,180,255,0.4)";
      ctx3.beginPath();
      ctx3.arc(cx, cs.ballY, r + 20, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.restore();
      const grad = ctx3.createRadialGradient(cx - 15, cs.ballY - 15, 5, cx, cs.ballY, r);
      grad.addColorStop(0, "rgba(180,220,255,0.9)");
      grad.addColorStop(0.5, "rgba(80,140,220,0.7)");
      grad.addColorStop(1, "rgba(30,70,150,0.9)");
      ctx3.fillStyle = grad;
      ctx3.beginPath();
      ctx3.arc(cx, cs.ballY, r, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.fillStyle = "#FFF";
      ctx3.font = "bold 18px Arial";
      ctx3.textAlign = "center";
      ctx3.fillText(`\u7B2C${cs.level}\u5173\u901A\u5173\uFF01`, cx, cs.ballY - 10);
      ctx3.font = "14px Arial";
      ctx3.fillText("\u70B9\u51FB\u6C34\u6676\u7403\u9886\u53D6\u5956\u52B1", cx, cs.ballY + 15);
      ctx3.textAlign = "left";
      return true;
    }
    handleCrystalTouch(x, y) {
      const cs = this._crystalState;
      if (!cs || cs.phase !== "wait") return false;
      const cx = SCREEN_WIDTH / 2, dx = x - cx, dy = y - cs.ballY;
      if (Math.sqrt(dx * dx + dy * dy) < 70) {
        cs.opened = true;
        this._crystalState = null;
        if (cs.callback) cs.callback();
        return true;
      }
      return false;
    }
    handleTouch(x, y, d) {
      if (d.isShowManual) {
        const mw = SCREEN_WIDTH * 0.85, mh = SCREEN_HEIGHT * 0.7, mx = (SCREEN_WIDTH - mw) / 2, my = (SCREEN_HEIGHT - mh) / 2;
        if (Math.sqrt((x - mx - mw + 20) ** 2 + (y - my - 20) ** 2) < 15) {
          d.isShowManual = false;
          return "closeManual";
        }
      }
      if (d.isGameOver) {
        const bw = 160, bh = 45, bx = (SCREEN_WIDTH - bw) / 2, by = SCREEN_HEIGHT / 2 + 40;
        if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
          this.emit("restart");
          return "restart";
        }
        const ry = by + 60;
        if (x >= bx && x <= bx + bw && y >= ry && y <= ry + bh) {
          this.emit("revive");
          return "revive";
        }
      }
      if (d.gamePhase === "category_complete") {
        const bw = 160, bh = 45, bx = (SCREEN_WIDTH - bw) / 2, by = SCREEN_HEIGHT / 2 + 20;
        if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
          this.emit("categoryRestart");
          return "categoryRestart";
        }
        const by2 = by + 60;
        if (x >= bx && x <= bx + bw && y >= by2 && y <= by2 + bh) {
          this.emit("backToBottleSelect");
          return "backToBottleSelect";
        }
      }
      return null;
    }
  };

  // js/runtime/music.js
  var Music = class {
    constructor() {
      this.bgm = null;
      this.sfx = {};
      this._muted = false;
    }
    init() {
      try {
        this.bgm = wx.createInnerAudioContext();
        this.bgm.src = "audio/weng.mp3";
        this.bgm.loop = true;
        this.bgm.volume = 0.3;
        this.sfx.zapper = wx.createInnerAudioContext();
        this.sfx.zapper.src = "audio/zapper.mp3";
        this.sfx.zapper.volume = 0.5;
        this.sfx.meizidan = wx.createInnerAudioContext();
        this.sfx.meizidan.src = "audio/meizidan.mp3";
        this.sfx.meizidan.volume = 0.5;
      } catch (e) {
      }
    }
    playBGM() {
      if (!this._muted && this.bgm) this.bgm.play().catch(() => {
      });
    }
    stopBGM() {
      if (this.bgm) this.bgm.stop();
    }
    pauseBGM() {
      if (this.bgm) this.bgm.pause();
    }
    resumeBGM() {
      if (!this._muted && this.bgm) this.bgm.play().catch(() => {
      });
    }
    playZapper() {
      if (!this._muted && this.sfx.zapper) {
        this.sfx.zapper.stop();
        this.sfx.zapper.play().catch(() => {
        });
      }
    }
    playMeizidan() {
      if (!this._muted && this.sfx.meizidan) {
        this.sfx.meizidan.stop();
        this.sfx.meizidan.play().catch(() => {
        });
      }
    }
    toggleMute() {
      this._muted = !this._muted;
      if (this._muted) this.pauseBGM();
      else this.resumeBGM();
      return this._muted;
    }
  };

  // js/databus.js
  init_render();

  // js/camera.js
  init_render();
  var Camera = class {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.worldWidth = SCREEN_WIDTH;
      this.worldHeight = SCREEN_HEIGHT;
    }
    setWorldSize(w, h) {
      this.worldWidth = w;
      this.worldHeight = h;
    }
    follow(targetX, targetY) {
      this.x = targetX - SCREEN_WIDTH / 2;
      this.y = targetY - SCREEN_HEIGHT / 2;
      this.x = Math.max(0, Math.min(this.x, this.worldWidth - SCREEN_WIDTH));
      this.y = Math.max(0, Math.min(this.y, this.worldHeight - SCREEN_HEIGHT));
    }
    applyTransform(ctx3) {
      ctx3.save();
      ctx3.translate(-this.x, -this.y);
    }
    restoreTransform(ctx3) {
      ctx3.restore();
    }
    screenToWorld(sx, sy) {
      return { x: sx + this.x, y: sy + this.y };
    }
    worldToScreen(wx2, wy) {
      return { x: wx2 - this.x, y: wy - this.y };
    }
    isVisible(x, y, w, h) {
      return x + w > this.x && x < this.x + SCREEN_WIDTH && y + h > this.y && y < this.y + SCREEN_HEIGHT;
    }
  };

  // js/databus.js
  var DataBus = class {
    constructor() {
      this.reset();
      this.gamePhase = "bottle_select";
      this.animations = [];
      this.camera = new Camera();
    }
    reset(keepScore = false) {
      const savedScore = keepScore ? this.score : 0;
      const savedCategory = this.selectedCategory;
      const savedBottle = this.currentBottle;
      const savedPhase = this.gamePhase;
      this.frame = 0;
      this.score = savedScore;
      this.enemys = [];
      this.bullets = [];
      this.missiles = [];
      this.lasers = [];
      this.explosions = [];
      this.attackBullets = [];
      this.enemyAttacks = [];
      this.ufoAttackLasers = [];
      this.ultimates = [];
      this.animations = [];
      this.level = 1;
      this.killCount = 0;
      this.isGameOver = false;
      this.gameOverReason = null;
      this.isPaused = false;
      this.playerHealth = 100;
      this.maxPlayerHealth = 100;
      this.hasShield = false;
      this.shieldHP = 0;
      this.maxShieldHP = 0;
      this.shieldCooldown = false;
      this.shieldCooldownTimer = 0;
      this.selectedWeapon = "normal";
      this.shotgunTier = 0;
      this.hasTrackingMissile = false;
      this.hasLaser = false;
      this.laserTier = 0;
      this.hasBomb = false;
      this.bombCounter = 0;
      this.power = 100;
      this.maxPower = 100;
      this.ultimateCharge = 0;
      this.shotCount = 0;
      this.turretFrozen = false;
      this.turretFrozenTimer = 0;
      this.playerCenterX = 0;
      this.playerCenterY = 0;
      this.selectedCategory = savedCategory || null;
      this.currentBottle = savedBottle || null;
      this.gamePhase = savedPhase || "bottle_select";
    }
    /**
     * 大地图独立状态
     */
    resetBigmap() {
      this.bigmapState = {
        playerHealth: 200,
        maxPlayerHealth: 200,
        hasShield: false,
        shieldHP: 0,
        maxShieldHP: 0,
        shieldCooldown: false,
        shieldCooldownTimer: 0,
        shieldVisible: false,
        invincibleTimer: 0,
        turretFrozen: false,
        turretFrozenTimer: 0,
        power: 100,
        maxPower: 100
      };
      this.worldWidth = SCREEN_WIDTH * 12;
      this.worldHeight = SCREEN_HEIGHT * 12;
      this.killCount = 0;
      this.terrainData = null;
      this.terrainChunks = {};
      this._terrainChunkQueue = [];
    }
    /**
     * 获取当前活跃状态（大地图 or 普通）
     */
    activeState() {
      if (this.selectedCategory === "mosquito_bigmap" && this.bigmapState) {
        return this.bigmapState;
      }
      return this;
    }
    /**
     * 游戏结束
     */
    gameOver(reason) {
      this.isGameOver = true;
      this.gameOverReason = reason;
    }
    /**
     * 移除敌人
     */
    removeEnemy(enemy) {
      const idx = this.enemys.indexOf(enemy);
      if (idx > -1) {
        this.enemys.splice(idx, 1);
      }
    }
    /**
     * 移除激光
     */
    removeLaser(laser) {
      const idx = this.lasers.indexOf(laser);
      if (idx > -1) {
        this.lasers.splice(idx, 1);
      }
    }
    /**
     * 创建爆炸粒子
     */
    createExplosion(x, y, count = 8) {
      const colors = ["#FF4444", "#FF8800", "#FFDD00", "#FF6600", "#FF0000"];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        this.explosions.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 5,
          life: 1,
          decay: 0.02 + Math.random() * 0.03,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    /**
     * 初始化开放数据域（排行榜）
     */
    initOpenDataContext() {
    }
    /**
     * 显示排行榜
     */
    showLeaderboard(callback) {
      if (callback) callback();
    }
    /**
     * 标记瓶子通关
     */
    completeBottle(bottleId) {
      try {
        const progress = wx.getStorageSync("bottle_progress") || {};
        progress[bottleId] = true;
        wx.setStorageSync("bottle_progress", progress);
      } catch (e) {
      }
    }
    /**
     * 获取已通关瓶子
     */
    getCompletedBottles() {
      try {
        return wx.getStorageSync("bottle_progress") || {};
      } catch (e) {
        return {};
      }
    }
  };

  // js/main.js
  init_resloader();

  // js/admanager.js
  var AdManager = class {
    constructor() {
      this.hasPlayed = false;
      this._rewardedAd = null;
    }
    /**
     * 模拟播放激励视频广告
     * @returns {Promise<boolean>} 是否完整观看
     */
    showRewardedAd() {
      return new Promise((resolve) => {
        if (this._rewardedAd) {
          this._rewardedAd.show().then(() => {
            this.hasPlayed = true;
            resolve(true);
          }).catch(() => {
            resolve(false);
          });
        } else {
          const watched = window.confirm('\u89C2\u770B\u5E7F\u544A\u53EF\u83B7\u5F97\u5956\u52B1\uFF08\u6A21\u62DF\uFF09\n\u70B9\u51FB"\u786E\u5B9A"\u5B8C\u6210\u89C2\u770B');
          this.hasPlayed = watched;
          resolve(watched);
        }
      });
    }
    resetPlayedStatus() {
      this.hasPlayed = false;
    }
    createAd() {
      if (typeof wx !== "undefined" && wx.createRewardedVideoAd) {
        this._rewardedAd = wx.createRewardedVideoAd();
      }
    }
  };

  // js/terrain.js
  var SimplexNoise = class {
    constructor(seed = 42) {
      this.grad3 = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1]
      ];
      this.perm = new Uint8Array(512);
      this.seed(seed);
    }
    seed(s) {
      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) p[i] = i;
      let r = s;
      const rng = () => {
        r = r * 16807 % 2147483647;
        return r / 2147483647;
      };
      for (let i = 255; i > 0; i--) {
        const j = rng() * (i + 1) | 0;
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
      if (t0 > 0) {
        t0 *= t0;
        n0 = t0 * t0 * dot(this.grad3[this.perm[ii + this.perm[jj]] % 12], x0, y0);
      }
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 > 0) {
        t1 *= t1;
        n1 = t1 * t1 * dot(this.grad3[this.perm[ii + i1 + this.perm[jj + j1]] % 12], x1, y1);
      }
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 > 0) {
        t2 *= t2;
        n2 = t2 * t2 * dot(this.grad3[this.perm[ii + 1 + this.perm[jj + 1]] % 12], x2, y2);
      }
      return 70 * (n0 + n1 + n2);
    }
    fbm(x, y, oct, lac, gain) {
      let sum = 0, amp = 1, freq = 1, max = 0;
      for (let i = 0; i < oct; i++) {
        sum += this.noise2D(x * freq, y * freq) * amp;
        max += amp;
        amp *= gain;
        freq *= lac;
      }
      return sum / max;
    }
  };
  var CHUNK_W = 256;
  var CHUNK_H = 256;
  var TILE = 4;
  var TERRAIN_SCALE = 3;
  var BIOME = {
    water: [[0, 30, 60], [0, 50, 100], [20, 80, 140]],
    beach: [190, 170, 120],
    grass: [[40, 120, 40], [60, 140, 50], [80, 160, 60]],
    forest: [[20, 80, 20], [30, 100, 30], [15, 70, 25]],
    rock: [[120, 110, 100], [140, 130, 120], [100, 95, 85]],
    snow: [240, 245, 255],
    treeColor: [[20, 70, 15], [35, 90, 25], [45, 110, 30]]
  };
  function mulberry32(a) {
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
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
      r = BIOME.beach[0];
      g = BIOME.beach[1];
      b = BIOME.beach[2];
    } else if (h < 0.55) {
      const t = (h - 0.35) / 0.2;
      const mi = Math.max(0, Math.min(2, m * 2.5 | 0));
      const hi = Math.max(0, Math.min(2, m * 1.25 | 0));
      const gb = BIOME.grass[mi], fh = BIOME.forest[hi];
      r = gb[0] + (fh[0] - gb[0]) * t;
      g = gb[1] + (fh[1] - gb[1]) * t;
      b = gb[2] + (fh[2] - gb[2]) * t;
    } else if (h < 0.7) {
      const t = (h - 0.55) / 0.15;
      const mi = Math.max(0, Math.min(2, m * 2.5 | 0));
      const f = BIOME.forest[mi], rk = BIOME.rock[1];
      r = f[0] + (rk[0] - f[0]) * t;
      g = f[1] + (rk[1] - f[1]) * t;
      b = f[2] + (rk[2] - f[2]) * t;
    } else if (h < 0.85) {
      const t = (h - 0.7) / 0.15;
      const ri = Math.max(0, Math.min(2, t * 2.5 | 0));
      const c = BIOME.rock[ri];
      r = c[0];
      g = c[1];
      b = c[2];
    } else {
      const t = Math.min(1, (h - 0.85) / 0.15);
      const rk = BIOME.rock[2];
      r = rk[0] + (BIOME.snow[0] - rk[0]) * t;
      g = rk[1] + (BIOME.snow[1] - rk[1]) * t;
      b = rk[2] + (BIOME.snow[2] - rk[2]) * t;
    }
    return [r | 0, g | 0, b | 0];
  }
  function getChunkSize() {
    return CHUNK_W;
  }
  async function generateTerrainGrid(worldWidth, worldHeight, seed = 42) {
    return { seed, worldWidth, worldHeight, grid: true };
  }
  function renderTerrainChunk(terrainData, startCol, startRow, chunkW, chunkH) {
    chunkW = chunkW || CHUNK_W;
    chunkH = chunkH || CHUNK_H;
    const seed = terrainData && terrainData.seed || 42;
    const noise = new SimplexNoise(seed);
    const offscreen = document.createElement("canvas");
    offscreen.width = chunkW;
    offscreen.height = chunkH;
    const octx = offscreen.getContext("2d");
    const tw = chunkW / TILE;
    const th = chunkH / TILE;
    const imgData = octx.createImageData(chunkW, chunkH);
    const data = imgData.data;
    for (let ty = 0; ty < th; ty++) {
      for (let tx = 0; tx < tw; tx++) {
        const wx2 = startCol * chunkW + tx * TILE + (TILE >> 1);
        const wy = startRow * chunkH + ty * TILE + (TILE >> 1);
        const nx = wx2 * TERRAIN_SCALE / 1e3;
        const ny = wy * TERRAIN_SCALE / 1e3;
        const warpX = noise.fbm(nx + 5.2, ny + 1.3, 3, 2, 0.5) * 0.4;
        const warpY = noise.fbm(nx + 9.1, ny + 4.7, 3, 2, 0.5) * 0.4;
        let h = noise.fbm(nx + warpX, ny + warpY, 6, 2, 0.5) * 0.5 + 0.5;
        h = Math.max(0, Math.min(1, h));
        let m = noise.fbm(nx + 20, ny + 20, 4, 2, 0.5) * 0.5 + 0.5;
        m = Math.max(0, Math.min(1, m));
        const rgb = terrainRGB(h, m);
        for (let py = 0; py < TILE; py++) {
          for (let px = 0; px < TILE; px++) {
            const idx = ((ty * TILE + py) * chunkW + (tx * TILE + px)) * 4;
            data[idx] = rgb[0];
            data[idx + 1] = rgb[1];
            data[idx + 2] = rgb[2];
            data[idx + 3] = 255;
          }
        }
      }
    }
    octx.putImageData(imgData, 0, 0);
    _drawTrees(octx, startCol, startRow, chunkW, chunkH, noise, seed);
    return offscreen;
  }
  function _drawTrees(octx, col, row, cw, ch, noise, baseSeed) {
    const rng = mulberry32(baseSeed + col * 7919 + row * 104729);
    const count = cw * ch * 0.35 * 0.02 | 0;
    for (let i = 0; i < count; i++) {
      const lx = rng() * cw;
      const ly = rng() * ch;
      const wx2 = col * cw + lx;
      const wy = row * ch + ly;
      const nx = wx2 * TERRAIN_SCALE / 1e3;
      const ny = wy * TERRAIN_SCALE / 1e3;
      const wX = noise.fbm(nx + 5.2, ny + 1.3, 3, 2, 0.5) * 0.4;
      const wY = noise.fbm(nx + 9.1, ny + 4.7, 3, 2, 0.5) * 0.4;
      const h = Math.max(0, Math.min(1, noise.fbm(nx + wX, ny + wY, 6, 2, 0.5) * 0.5 + 0.5));
      const m = Math.max(0, Math.min(1, noise.fbm(nx + 20, ny + 20, 4, 2, 0.5) * 0.5 + 0.5));
      if (h <= 0.35 || h >= 0.75 || m <= 0.3) continue;
      const size = 2 + rng() * 3;
      const shade = 0.7 + rng() * 0.3;
      const ci = (lx * 7 + ly * 13 | 0) % BIOME.treeColor.length;
      const c = BIOME.treeColor[ci];
      if (!c) continue;
      const r = c[0] * shade | 0;
      const g = c[1] * shade | 0;
      const b = c[2] * shade | 0;
      if (rng() > 0.7) {
        octx.fillStyle = `rgb(${r},${g},${b})`;
        octx.beginPath();
        octx.moveTo(lx, ly - size * 2);
        octx.lineTo(lx - size, ly + size * 0.5);
        octx.lineTo(lx + size, ly + size * 0.5);
        octx.fill();
        octx.fillStyle = `rgb(${r * 0.4 | 0},${g * 0.3 | 0},${b * 0.2 | 0})`;
        octx.fillRect(lx - 1, ly, 2, size);
      } else {
        octx.fillStyle = `rgb(${r},${g},${b})`;
        octx.beginPath();
        octx.arc(lx, ly - size, size * 1.2, 0, Math.PI * 2);
        octx.fill();
        octx.fillStyle = `rgb(${r * 0.4 | 0},${g * 0.3 | 0},${b * 0.2 | 0})`;
        octx.fillRect(lx - 1, ly - size, 2, size * 1.5);
      }
    }
  }

  // js/main.js
  var ctx2 = canvas.getContext("2d");
  GameGlobal.databus = new DataBus();
  GameGlobal.musicManager = new Music();
  GameGlobal.adManager = new AdManager();
  var levelConfigs = {
    1: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
    2: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1 },
    3: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 1 },
    4: { 1: 2, 2: 2, 3: 2, 4: 1, 5: 1 },
    5: { 1: 3, 2: 2, 3: 2, 4: 2, 5: 1 },
    6: { 1: 3, 2: 3, 3: 2, 4: 2, 5: 2 },
    7: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 2 },
    8: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3 }
  };
  var ENEMY_CLASSES = { mosquito: Enemy, ufo: UFO, zone3: Fjg, zone4: Jia, zone5: Piao, zone6: Gudao, zone7: Ying, zone8: Ding, zone9: Die };
  var BIGMAP_CLASSES = [Enemy, UFO, Fjg, Ding, Piao, Jia, Gudao, Ying, Die];
  var BIGMAP_TYPES = BIGMAP_CLASSES.flatMap((cls) => [1, 2, 3, 4, 5].map((id) => ({ cls, id })));
  var BIGMAP_COUNT = 10;
  var Main = class {
    constructor() {
      this.player = new Player();
      this.gameInfo = new GameInfo();
      this.aniId = 0;
      this.spriteImages = {};
      this._lastShoot = 0;
      this._shootCD = 250;
      this._touchStartTime = 0;
      this._touchStartPos = { x: 0, y: 0 };
      this._isLongPress = false;
      this._longPressTimer = null;
      this._bigmapSpawnCooldown = 0;
      this._timers = [];
      this.gameInfo.on("restart", () => this.startPlaying(false));
      this.gameInfo.on("categoryRestart", () => this.startPlaying(true));
      this.gameInfo.on("backToBottleSelect", () => this.backToBottleSelect());
      this.gameInfo.on("revive", () => this.revivePlayer());
      this._loadResources().then(() => {
        GameGlobal.databus.gamePhase = "bottle_select";
        this._bindEvents();
        this.aniId = requestAnimationFrame(this.loop.bind(this));
      });
    }
    async _loadResources() {
      await resloader_default.preloadAll();
    }
    _bindEvents() {
      canvas.onTouchStart((e) => {
        const t = e.touches[0];
        this._touchStartTime = Date.now();
        this._touchStartPos = { x: t.clientX, y: t.clientY };
        this._isLongPress = false;
        this._longPressTimer = setTimeout(() => {
          this._isLongPress = true;
          this._handleLongPress(t.clientX, t.clientY);
        }, 800);
        this._handleTouchDown(t.clientX, t.clientY, e);
      });
      canvas.onTouchMove((e) => {
        const t = e.touches[0];
        if (this._longPressTimer) {
          clearTimeout(this._longPressTimer);
          this._longPressTimer = null;
        }
        this._handleTouchMove(t.clientX, t.clientY, e);
      });
      canvas.onTouchEnd((e) => {
        if (this._longPressTimer) {
          clearTimeout(this._longPressTimer);
          this._longPressTimer = null;
        }
        const t = e.changedTouches[0];
        const dt = Date.now() - this._touchStartTime;
        const dx = t.clientX - this._touchStartPos.x, dy = t.clientY - this._touchStartPos.y;
        if (!this._isLongPress && dt < 300 && Math.sqrt(dx * dx + dy * dy) < 20) this._handleTap(t.clientX, t.clientY);
        this._handleTouchEnd(t.clientX, t.clientY, e);
      });
      this._keys = {};
      window.addEventListener("keydown", (e) => {
        if (this._keys[e.code]) return;
        this._keys[e.code] = true;
        if (e.code === "KeyJ") {
          if (this.player && this.player.isBigmap) this.player._fireBigmap();
        }
        if (e.code === "KeyK") {
          if (this.player && this.player.isBigmap) this.player._activateShield();
        }
      });
      window.addEventListener("keyup", (e) => {
        this._keys[e.code] = false;
      });
    }
    _handleTouchDown(x, y, rawEvent) {
      const d = GameGlobal.databus;
      if (d.gamePhase === "bottle_select") {
        this.gameInfo.handleBottleScrollStart(y);
        return;
      }
      if (d.isGameOver || d.isShowManual || d.isShowPedia) return;
      if (d.selectedCategory === "mosquito_bigmap") {
        this.player.handleTouchStart(rawEvent);
        return;
      }
      this.player.handleTouchStart({ touches: [{ clientX: x, clientY: y }] });
    }
    _handleTouchMove(x, y, rawEvent) {
      const d = GameGlobal.databus;
      if (d.gamePhase === "bottle_select") {
        this.gameInfo.handleBottleScrollMove(y);
        return;
      }
      if (d.isGameOver || d.isShowManual || d.isShowPedia) return;
      if (d.selectedCategory === "mosquito_bigmap") {
        this.player.handleTouchMove(rawEvent);
        return;
      }
      this.player.handleTouchMove({ touches: [{ clientX: x, clientY: y }] });
    }
    _handleTouchEnd(x, y, rawEvent) {
      const d = GameGlobal.databus;
      if (d.gamePhase === "bottle_select") {
        this.gameInfo.handleBottleScrollEnd();
        return;
      }
      if (d.selectedCategory === "mosquito_bigmap") {
        this.player.handleTouchEnd(rawEvent);
        return;
      }
      this.player.handleTouchEnd({ changedTouches: [{ clientX: x, clientY: y }] });
    }
    _handleTap(x, y) {
      const d = GameGlobal.databus;
      if (this.gameInfo.handleCrystalTouch(x, y)) return;
      if (d.gamePhase === "bottle_select") {
        if (this.gameInfo._hasScrolled) return;
        const btn = this.gameInfo.handleBottleTouch(x, y);
        if (btn) this.startWithCategory(btn.category);
        return;
      }
      const ui = this.gameInfo.handleTouch(x, y, d);
      if (ui === "manual" || ui === "closeManual") return;
      if (ui === "restart" || ui === "revive" || ui === "categoryRestart" || ui === "backToBottleSelect") return;
      if (d.isShowManual || d.isGameOver || d.gamePhase === "category_complete") return;
      if (d.isShowPedia) {
        const { handlePediaTouch: handlePediaTouch2 } = (init_pedia(), __toCommonJS(pedia_exports));
        handlePediaTouch2(x, y, d);
        return;
      }
      if (d.selectedCategory === "mosquito_bigmap") {
        const mw = 120, mx = SCREEN_WIDTH - mw - 10, my = 10, mh = 120;
        const bbx = mx, bby = my + mh + 4, bbw = mw, bbh = 22;
        if (x >= bbx && x <= bbx + bbw && y >= bby && y <= bby + bbh) {
          this.backToBottleSelect();
        }
        return;
      }
      if (d.gamePhase === "playing") {
        const now = Date.now();
        if (now - this._lastShoot < this._shootCD) return;
        this._lastShoot = now;
        const s = d.activeState();
        if (s.power >= 5) {
          s.power -= 5;
          this.player.shoot();
          GameGlobal.musicManager.playZapper();
        } else {
          GameGlobal.musicManager.playMeizidan();
        }
      }
    }
    _handleLongPress(x, y) {
      const d = GameGlobal.databus;
      if (d.gamePhase !== "playing" || d.isPaused || d.isGameOver) return;
      if (d.selectedCategory === "mosquito_bigmap") return;
      const s = d.activeState();
      if (s.energy >= 30) {
        s.energy -= 30;
        this.player.fireLaser();
      }
    }
    // ─── 游戏流程 ───
    startWithCategory(category) {
      const d = GameGlobal.databus;
      d.reset();
      d.selectedCategory = category;
      d.gamePhase = "playing";
      this.player.init();
      this._clearTimers();
      if (category === "mosquito_bigmap") {
        this.player.initBigmap();
        d.resetBigmap();
        this.initTerrain();
        this.spawnBigmapEnemies(10);
      } else {
        this._spawnForCategory(category);
      }
      this._startTimers();
      GameGlobal.musicManager.init();
      GameGlobal.musicManager.playBGM();
      this.aniId = requestAnimationFrame(this.loop.bind(this));
    }
    startPlaying(keepScore) {
      const d = GameGlobal.databus;
      const cat = d.selectedCategory;
      const prevS = keepScore ? d.score : 0;
      const prevH = d.highScore;
      d.reset();
      if (keepScore) {
        d.score = prevS;
        d.highScore = prevH;
      }
      d.selectedCategory = cat;
      d.gamePhase = "playing";
      this.player.init();
      this._clearTimers();
      if (cat === "mosquito_bigmap") {
        this.player.initBigmap();
        d.resetBigmap();
        this.initTerrain();
        this.spawnBigmapEnemies(10);
      } else {
        this._spawnForCategory(cat);
      }
      this._startTimers();
      this.aniId = requestAnimationFrame(this.loop.bind(this));
    }
    backToBottleSelect() {
      const d = GameGlobal.databus;
      d.reset();
      d.selectedCategory = null;
      d.currentBottle = null;
      d.gamePhase = "bottle_select";
      this._clearTimers();
      GameGlobal.musicManager.stopBGM();
      this.aniId = requestAnimationFrame(this.loop.bind(this));
    }
    revivePlayer() {
      const d = GameGlobal.databus;
      const s = d.activeState();
      s.playerHealth = s.maxPlayerHealth;
      d.isGameOver = false;
      d.gameOverReason = null;
      s.power = s.maxPower;
      s.energy = s.maxEnergy;
      this.player.invincibleTimer = 120;
      this.aniId = requestAnimationFrame(this.loop.bind(this));
      GameGlobal.musicManager.playBGM();
    }
    _clearTimers() {
      this._timers.forEach((t) => clearInterval(t));
      this._timers = [];
    }
    _startTimers() {
      this._timers.push(setInterval(() => {
        const s = GameGlobal.databus.activeState();
        if (s.playerHealth < s.maxPlayerHealth) s.playerHealth = Math.min(s.playerHealth + 5, s.maxPlayerHealth);
      }, 1e3));
      this._timers.push(setInterval(() => {
        const s = GameGlobal.databus.activeState();
        if (s.power < s.maxPower) s.power = Math.min(s.power + 3, s.maxPower);
      }, 1e3));
      this._timers.push(setInterval(() => this._enemyAttackTick(), 1e3 / 60));
    }
    _spawnForCategory(category) {
      const d = GameGlobal.databus;
      const lv = d.level;
      const cfg = lv <= 8 ? { ...levelConfigs[lv] } : { 1: 4 + lv - 8, 2: 3, 3: 3 + lv - 8, 4: 3, 5: 3 };
      const Cls = ENEMY_CLASSES[category] || Enemy;
      for (let id = 1; id <= 5; id++) {
        for (let i = 0; i < (cfg[id] || 0); i++) {
          const e = new Cls(id);
          e.init();
          d.enemys.push(e);
        }
      }
    }
    // ─── 敌人攻击 ───
    _enemyAttackTick() {
      const d = GameGlobal.databus;
      if (d.isPaused || d.isGameOver) return;
      const now = Date.now();
      let _atkCount = 0;
      d.enemys.forEach((e) => {
        if (!e.visible || !e.isActive) return;
        if (e.chargeState || e.stormCasting || e.sweeping) { this._executeEnemyAttack(e); return; }
        const p = e.properties || {};
        if (!p.attack) return;
        const interval = p.attackInterval || 3e3;
        const last = p.lastAttackTime || 0;
        if (now - last < interval) return;
        p.lastAttackTime = now;
        this._executeEnemyAttack(e);
          _atkCount++;
      });
      if (d.frame % 180 === 0) {
        const _total2 = d.enemys.filter(e => e && e.visible && (e.mosquitoType === 2 || e.id === 2)).length;
        console.log("[DIAG_TICK] frame=" + d.frame + " totalEnemies=" + d.enemys.length + " type2Count=" + _total2 + " attacksThisTick=" + _atkCount);
      }
    }
    _executeEnemyAttack(attacker) {
      const d = GameGlobal.databus;
      const isBigmap = d.selectedCategory === "mosquito_bigmap";
      const targetX = isBigmap ? this.player.testBall.x : this.player.x + this.player.width / 2;
      const targetY = isBigmap ? this.player.testBall.y : this.player.y;
      const cx = attacker.x + (attacker.width || 0) / 2, cy = attacker.y + (attacker.height || 0) / 2;
      const dx = targetX - cx, dy = targetY - cy, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) return;
      const speed = 4;
      if (!d.attackBullets) d.attackBullets = [];
      if (!d.enemyAttacks) d.enemyAttacks = [];
      const type = attacker.mosquitoType || attacker.id || 1;
      const clsName = attacker.constructor.name;
      if (isBigmap && type === 2) {
        if (d.frame % 120 === 0) console.log("[DIAG_ATK] class=" + clsName + " type=" + type + " chargeState=" + !!attacker.chargeState + " stormCasting=" + !!attacker.stormCasting + " sweeping=" + !!attacker.sweeping);
        if (attacker.chargeState) { this._chargeDash(attacker, targetX, targetY); return; }
        if (attacker.sweeping) return;
        if (attacker.stormCasting) { this._scaleStorm(attacker, targetX, targetY); return; }
        if (attacker instanceof UFO) { this._chargeDash(attacker, targetX, targetY); }
        else if (attacker instanceof Fjg) { this._goldShell2(attacker, targetX, targetY); }
        else if (attacker instanceof Jia) { this._poisonBall(attacker, targetX, targetY); }
        else if (attacker instanceof Piao) { this._waterDrop(attacker, targetX, targetY); }
        else if (attacker instanceof Gudao) { this._phaseBlade(attacker, targetX, targetY); }
        else if (attacker instanceof Ying) { this._slimeBall(attacker, targetX, targetY); }
        else if (attacker instanceof Die) { this._scaleStorm(attacker, targetX, targetY); }
        else if (attacker instanceof Ding) { this._pierceBeam(attacker, targetX, targetY); }
        else { this._normalAttack(cx, cy, dx, dy, dist, speed, attacker); }
      } else if (type === 2) {
        if (attacker instanceof UFO) { this._goldShell(attacker); }
        else if (attacker instanceof Fjg) { this._antennaSlash(attacker); }
        else if (attacker instanceof Piao) { this._sonicRing(attacker); }
        else if (attacker instanceof Ding) { this._pierceBeam(attacker, targetX, targetY); }
        else { this._normalAttack(cx, cy, dx, dy, dist, speed, attacker); }
      } else {
        this._normalAttack(cx, cy, dx, dy, dist, speed, attacker);
      }
      attacker.properties = attacker.properties || {};
      attacker.properties.lastAttackTime = Date.now();
    }
    _normalAttack(cx, cy, dx, dy, dist, speed, attacker) {
      GameGlobal.databus.attackBullets.push({ x: cx, y: cy, vx: dx / dist * speed, vy: dy / dist * speed, width: 10, height: 10, damage: attacker.attackDamage || 10 });
    }
    _goldShell(attacker) {
      const d = GameGlobal.databus;
      const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
      for (let i = 0; i < 8; i++) {
        const a = Math.PI * 2 / 8 * i;
        d.attackBullets.push({ x: cx, y: cy, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, width: 8, height: 8, damage: 15, color: "#FFD700" });
      }
    }
    _chargeDash(attacker, tx, ty) {
      const d = GameGlobal.databus;
      if (!attacker.chargeState) {
        const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
        const ang = Math.atan2(ty - cy, tx - cx);
        attacker.chargeState = { phase: "warning", timer: 0, angle: ang, warningFrames: 45, dashFrames: 30, dashSpeed: 8, vx: 0, vy: 0, hit: false };
        d.enemyAttacks.push({ type: "chargeRing", x: cx, y: cy, radius: 5, maxRadius: 30, color: "#FF4444", life: 0, maxLife: 45, alpha: 0.8 });
        return;
      }
      const cs = attacker.chargeState;
      cs.timer++;
      if (cs.phase === "warning") {
        if (cs.timer >= cs.warningFrames) {
          cs.phase = "dash";
          cs.timer = 0;
          cs.vx = Math.cos(cs.angle) * cs.dashSpeed;
          cs.vy = Math.sin(cs.angle) * cs.dashSpeed;
        }
      } else if (cs.phase === "dash") {
        attacker.x += cs.vx;
        attacker.y += cs.vy;
        if (cs.timer % 3 === 0) {
          const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
          d.enemyAttacks.push({ type: "chargeTrail", x: cx, y: cy, radius: 12, color: "#FF4444", life: 0, maxLife: 20, alpha: 0.6 });
        }
        if (cs.timer >= cs.dashFrames) {
          cs.phase = "burst";
          cs.timer = 0;
          const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
          d.enemyAttacks.push({ type: "chargeBurst", x: cx, y: cy, radius: 10, maxRadius: 80, color: "#FF6644", life: 0, maxLife: 25, alpha: 0.9, damage: 15 });
        }
      } else if (cs.phase === "burst") {
        if (cs.timer >= 20) {
          attacker.chargeState = null;
          attacker.properties = attacker.properties || {};
          attacker.properties.lastAttackTime = Date.now();
        }
      }
    }
    _goldShell2(attacker, tx, ty) {
      const d = GameGlobal.databus;
      const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
      const ang = Math.atan2(ty - cy, tx - cx);
      for (let i = 0; i < 3; i++) {
        const spread = (i - 1) * 0.2;
        const a = ang + spread;
        d.enemyAttacks.push({ type: "goldShell", x: cx, y: cy, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, radius: 8, damage: 15, life: 0, maxLife: 180, alpha: 1, targetX: tx, targetY: ty, tracking: true, trackStrength: 0.03 });
      }
    }
    _poisonBall(attacker, tx, ty) {
      const d = GameGlobal.databus;
      const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
      const ang = Math.atan2(ty - cy, tx - cx);
      d.enemyAttacks.push({ type: "poisonBall", x: cx, y: cy, vx: Math.cos(ang) * 2.5, vy: Math.sin(ang) * 2.5, radius: 14, damage: 10, life: 0, maxLife: 200, alpha: 0.8, landed: false, landX: 0, landY: 0, landLife: 0, landMaxLife: 180 });
    }
    _waterDrop(attacker, tx, ty) {
      const d = GameGlobal.databus;
      const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
      const ang = Math.atan2(ty - cy, tx - cx);
      d.enemyAttacks.push({ type: "waterDrop", x: cx, y: cy, vx: Math.cos(ang) * 4, vy: Math.sin(ang) * 4, radius: 10, damage: 12, life: 0, maxLife: 150, alpha: 0.9, trail: [] });
    }
    _phaseBlade(attacker, tx, ty) {
      const d = GameGlobal.databus;
      const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
      const ang = Math.atan2(ty - cy, tx - cx);
      d.enemyAttacks.push({ type: "phaseBlade", x: cx, y: cy, vx: Math.cos(ang) * 3.5, vy: Math.sin(ang) * 3.5, radius: 16, damage: 18, life: 0, maxLife: 160, alpha: 0.9, rotation: 0, rotSpeed: 0.15 });
    }
    _slimeBall(attacker, tx, ty) {
      const d = GameGlobal.databus;
      const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
      const ang = Math.atan2(ty - cy, tx - cx);
      d.enemyAttacks.push({ type: "slimeBall", x: cx, y: cy, vx: Math.cos(ang) * 3, vy: Math.sin(ang) * 3, radius: 12, damage: 10, life: 0, maxLife: 200, alpha: 0.85 });
    }
    _scaleStorm(attacker, tx, ty) {
      const d = GameGlobal.databus;
      if (attacker.stormCasting) {
        const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
        if (d.frame % 5 === 0) {
          for (let i = 0; i < 2; i++) {
            const ang = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1;
            d.enemyAttacks.push({ type: "scaleParticle", x: cx + Math.cos(ang) * 30, y: cy + Math.sin(ang) * 30, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed + 0.5 + Math.random() * 0.5, radius: 3 + Math.random() * 3, damage: 5, life: 0, maxLife: 300, alpha: 0.7, color: Math.random() > 0.5 ? "#E0B0FF" : "#FFB0C0" });
          }
        }
        return;
      }
      attacker.stormCasting = true;
      attacker.stormDuration = 180;
      d.enemyAttacks.push({ type: "scaleStorm", x: attacker.x + attacker.width / 2, y: attacker.y + attacker.height / 2, attackerId: attacker.id || attacker.mosquitoType, radius: 50, life: 0, maxLife: 180, alpha: 0.6, damage: 5, attackerRef: attacker });
    }
    _antennaSlash(attacker) {
      const d = GameGlobal.databus;
      const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
      d.enemyAttacks.push({ type: "antennaSlash", x: cx, y: cy, dir: -1, radius: 0, maxRadius: 650, alpha: 0.85, life: 0, maxLife: 70 });
      d.enemyAttacks.push({ type: "antennaSlash", x: cx, y: cy, dir: 1, radius: 0, maxRadius: 650, alpha: 0.85, life: 0, maxLife: 70 });
    }
    _sonicRing(attacker) {
      const d = GameGlobal.databus;
      const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
      d.enemyAttacks.push({ type: "sonicRing", x: cx, y: cy, radius: 15, maxRadius: 700, radiusSpeed: 7, alpha: 0.8, life: 0, maxLife: 100 });
    }
    _pierceBeam(attacker, tx, ty) {
      const d = GameGlobal.databus;
      const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
      const dx = tx - cx, dy = ty - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      d.enemyAttacks.push({ type: "pierceBeam", x1: cx, y1: cy, x2: tx + dx / dist * 300, y2: ty + dy / dist * 300, alpha: 1, life: 0, maxLife: 50, damage: 20, warnFrames: 20, hasHit: false });
    }
    // ─── 大地图刷怪 ───
    spawnBigmapEnemies(count) {
      for (let i = 0; i < count; i++) this._spawnBigmapOne();
    }
    _spawnBigmapOne() {
      const d = GameGlobal.databus;
      const counts = {};
      d.enemys.forEach((e2) => {
        if (e2 && e2.visible) {
          const k = e2.constructor.name + "_" + e2.type;
          counts[k] = (counts[k] || 0) + 1;
        }
      });
      let min = Infinity, candidates = [];
      BIGMAP_TYPES.forEach(({ cls, id }) => {
        const k = cls.name + "_" + id, c = counts[k] || 0;
        if (c < min) {
          min = c;
          candidates = [{ cls, id }];
        } else if (c === min) candidates.push({ cls, id });
      });
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      const e = new chosen.cls(chosen.id);
      e.init();
      e.x = Math.random() * (d.worldWidth - 100) + 50;
      e.y = Math.random() * (d.worldHeight - 100) + 50;
      e.maxHealth = (e.maxHealth || 100) * 2;
      e.health = e.maxHealth;
      d.enemys.push(e);
    }
    _maintainBigmapEnemies() {
      const d = GameGlobal.databus;
      d.enemys = d.enemys.filter((e) => e && e.visible);
      if (d.enemys.length < BIGMAP_COUNT) {
        if (this._bigmapSpawnCooldown <= 0) {
          this._spawnBigmapOne();
          this._bigmapSpawnCooldown = 60;
        }
      }
      if (this._bigmapSpawnCooldown > 0) this._bigmapSpawnCooldown--;
    }
    // ─── 地形 ───
    initTerrain() {
      const ww = SCREEN_WIDTH * 12, wh = SCREEN_HEIGHT * 12;
      const d = GameGlobal.databus;
      d.worldWidth = ww;
      d.worldHeight = wh;
      d.camera.setWorldSize(ww, wh);
      d.camera.follow(ww / 2, wh / 2);
      console.log("[terrain] initTerrain start, world:", ww, "x", wh, "camera:", d.camera.x | 0, d.camera.y | 0);
      generateTerrainGrid(ww, wh, 42).then((td) => {
        console.log("[terrain] grid resolved, td:", !!td, "grid:", td && td.grid);
        if (!td || !td.grid) return;
        this.terrainData = td;
        d.terrainData = td;
        d.terrainChunks = {};
        d._terrainChunkQueue = [];
        const cs = getChunkSize();
        const cc = Math.floor(d.camera.x / cs);
        const cr = Math.floor(d.camera.y / cs);
        const tc = Math.ceil(ww / cs), tr = Math.ceil(wh / cs);
        console.log("[terrain] cs:", cs, "center chunk:", cc, cr, "total chunks:", tc, "x", tr);
        const ordered = [];
        const maxR = Math.max(tc, tr);
        for (let r = 0; r <= maxR; r++) {
          for (let dc = -r; dc <= r; dc++) {
            for (let dr = -r; dr <= r; dr++) {
              if (Math.abs(dc) !== r && Math.abs(dr) !== r) continue;
              const c = cc + dc, row = cr + dr;
              if (c >= 0 && row >= 0 && c < tc && row < tr) ordered.push({ col: c, row });
            }
          }
        }
        d._terrainChunkQueue = ordered;
        console.log("[terrain] queue built, length:", ordered.length, "first 3:", ordered.slice(0, 3));
      }).catch((e) => console.error("[terrain] generateTerrainGrid error:", e));
    }
    _processNextTerrainChunk() {
      try {
        const d = GameGlobal.databus;
        if (d.selectedCategory !== "mosquito_bigmap") return;
        const q = d._terrainChunkQueue;
        if (!q || q.length === 0) return;
        const td = this.terrainData;
        if (!td) return;
        const cs = getChunkSize();
        for (let i = 0; i < Math.min(4, q.length); i++) {
          const { col, row } = q.shift();
          const key = `${col}_${row}`;
          if (!d.terrainChunks[key]) {
            const cvs = renderTerrainChunk(td, col, row);
            if (cvs) {
              d.terrainChunks[key] = { canvas: cvs, x: col * cs, y: row * cs };
              if (Object.keys(d.terrainChunks).length <= 4) console.log("[terrain] chunk rendered:", key, "chunks total:", Object.keys(d.terrainChunks).length);
            }
          }
        }
      } catch (e) {
        console.error("[terrain] chunk error:", e);
      }
    }
    renderTerrain(ctx3) {
      const d = GameGlobal.databus;
      const chunks = d.terrainChunks;
      if (!chunks) return;
      const cam = d.camera;
      const cs = getChunkSize();
      const keys = Object.keys(chunks);
      if (keys.length > 0 && !this._terrainLogged) {
        this._terrainLogged = true;
        console.log("[terrain] renderTerrain drawing", keys.length, "chunks, cs:", cs);
      }
      keys.forEach((k) => {
        const ch = chunks[k];
        const sp = cam.worldToScreen(ch.x, ch.y);
        if (sp.x + cs > 0 && sp.x < SCREEN_WIDTH && sp.y + cs > 0 && sp.y < SCREEN_HEIGHT) ctx3.drawImage(ch.canvas, sp.x, sp.y);
      });
    }
    // ─── 碰撞检测 ───
    _collisionDetection() {
      const d = GameGlobal.databus;
      const s = d.activeState();
      const _bigSrc = d.selectedCategory === "mosquito_bigmap" ? d.bullets : [];
      [...this.player.bullets, ...this.player.missiles, ..._bigSrc].forEach((b) => {
        d.enemys.forEach((e) => {
          if (e.isActive && b.checkHit && b.checkHit(e)) {
            e.takeDamage ? e.takeDamage(b.damage) : e.properties.currentHealth -= b.damage;
            b.visible = false;
          }
        });
      });
      this.player.lasers.forEach((l) => {
        d.enemys.forEach((e) => {
          if (e.isActive && l.checkHit && l.checkHit(e)) {
            e.takeDamage ? e.takeDamage(l.damage) : e.properties.currentHealth -= l.damage;
          }
        });
      });
      if (d.attackBullets) {
        for (let i = d.attackBullets.length - 1; i >= 0; i--) {
          const b = d.attackBullets[i];
          const px = d.selectedCategory === "mosquito_bigmap" ? this.player.testBall.x : this.player.x + this.player.width / 2;
          const py = d.selectedCategory === "mosquito_bigmap" ? this.player.testBall.y : this.player.y;
          const pr = d.selectedCategory === "mosquito_bigmap" ? this.player.testBall.r : 20;
          if (Math.sqrt((b.x - px) ** 2 + (b.y - py) ** 2) < pr + b.width / 2) {
            if (this.player.invincibleTimer <= 0) {
              if (this.player.shieldActive) {
                this.player.shieldDefense -= b.damage;
                if (this.player.shieldDefense <= 0) {
                  this.player.shieldDefense = 0;
                  this.player.shieldActive = false;
                  console.log("[shield] BROKEN by attackBullet");
                }
              } else {
                s.playerHealth -= b.damage;
                if (s.playerHealth <= 0) {
                  s.playerHealth = 0;
                  d.isGameOver = true;
                  d.gameOverReason = "dead";
                  d.saveHighScore();
                  GameGlobal.musicManager.stopBGM();
                }
              }
              d.attackBullets.splice(i, 1);
            }
          }
        }
      }
      this._collideEnemyAttacks();
      if (d.selectedCategory === "mosquito_bigmap") {
        d.enemys.forEach((e) => {
          if (!e.visible) return;
          const ex = e.x + e.width / 2, ey = e.y + e.height / 2;
          if (Math.sqrt((ex - this.player.testBall.x) ** 2 + (ey - this.player.testBall.y) ** 2) < this.player.testBall.r + e.width / 2) {
            if (this.player.invincibleTimer <= 0) {
              if (this.player.shieldActive) {
                this.player.shieldDefense -= 5;
                if (this.player.shieldDefense <= 0) {
                  this.player.shieldDefense = 0;
                  this.player.shieldActive = false;
                  console.log("[shield] BROKEN by body contact");
                }
              } else {
                s.playerHealth -= 5;
                if (s.playerHealth <= 0) {
                  s.playerHealth = 0;
                  d.isGameOver = true;
                  d.gameOverReason = "dead";
                  d.saveHighScore();
                  GameGlobal.musicManager.stopBGM();
                }
              }
              this.player.invincibleTimer = 30;
            }
          }
        });
      }
    }
    _collideEnemyAttacks() {
      const d = GameGlobal.databus;
      const s = d.activeState();
      if (!d.enemyAttacks) return;
      const px = d.selectedCategory === "mosquito_bigmap" ? this.player.testBall.x : this.player.x + this.player.width / 2;
      const py = d.selectedCategory === "mosquito_bigmap" ? this.player.testBall.y : this.player.y;
      const pr = this.player.testBall && this.player.testBall.r ? this.player.testBall.r : 15;
      const dealDmg = (dmg, srcName) => {
        if (this.player.invincibleTimer > 0) return false;
        if (this.player.shieldActive) {
          this.player.shieldDefense -= dmg;
          if (this.player.shieldDefense <= 0) {
            this.player.shieldDefense = 0;
            this.player.shieldActive = false;
          }
          this.player.invincibleTimer = 30;
          return true;
        }
        s.playerHealth -= dmg;
        if (s.playerHealth <= 0) {
          s.playerHealth = 0;
          d.isGameOver = true;
          d.gameOverReason = "dead";
          d.saveHighScore();
          GameGlobal.musicManager.stopBGM();
        }
        this.player.invincibleTimer = 30;
        return true;
      };
      d.enemyAttacks.forEach((atk) => {
        if (atk.type === "sonicRing") {
          const dist = Math.sqrt((atk.x - px) ** 2 + (atk.y - py) ** 2);
          if (Math.abs(dist - atk.radius) < 30) dealDmg(10, "sonicRing");
        }
        if (atk.type === "pierceBeam") {
          if (atk.life < (atk.warnFrames || 0)) return;
          if (atk.hasHit) return;
          const dist = this._pointToLineDist(px, py, atk.x1, atk.y1, atk.x2, atk.y2);
          if (dist < 15 + pr) {
            if (dealDmg(atk.damage || 20, "pierceBeam")) atk.hasHit = true;
          }
        }
        if (atk.type === "chargeBurst") {
          const dist = Math.sqrt((atk.x - px) ** 2 + (atk.y - py) ** 2);
          if (dist < atk.radius + pr) dealDmg(atk.damage || 15, "chargeBurst");
        }
        if (atk.type === "goldShell") {
          const dist = Math.sqrt((atk.x - px) ** 2 + (atk.y - py) ** 2);
          if (dist < atk.radius + pr) {
            if (dealDmg(atk.damage || 15, "goldShell")) atk.life = atk.maxLife + 1;
          }
        }
        if (atk.type === "poisonBall") {
          if (atk.landed) {
            const dist = Math.sqrt((atk.landX - px) ** 2 + (atk.landY - py) ** 2);
            if (dist < 35 + pr) dealDmg(5, "poisonCloud");
          } else {
            const dist = Math.sqrt((atk.x - px) ** 2 + (atk.y - py) ** 2);
            if (dist < atk.radius + pr) {
              if (dealDmg(atk.damage || 10, "poisonBall")) atk.life = atk.maxLife + 1;
            }
          }
        }
        if (atk.type === "waterDrop") {
          const dist = Math.sqrt((atk.x - px) ** 2 + (atk.y - py) ** 2);
          if (dist < atk.radius + pr) {
            if (dealDmg(atk.damage || 12, "waterDrop")) atk.life = atk.maxLife + 1;
          }
        }
        if (atk.type === "phaseBlade") {
          const dist = Math.sqrt((atk.x - px) ** 2 + (atk.y - py) ** 2);
          if (dist < atk.radius + pr) {
            if (dealDmg(atk.damage || 18, "phaseBlade")) atk.life = atk.maxLife + 1;
          }
        }
        if (atk.type === "slimeBall") {
          const dist = Math.sqrt((atk.x - px) ** 2 + (atk.y - py) ** 2);
          if (dist < atk.radius + pr) {
            if (dealDmg(atk.damage || 10, "slimeBall")) atk.life = atk.maxLife + 1;
          }
        }
        if (atk.type === "scaleParticle") {
          const dist = Math.sqrt((atk.x - px) ** 2 + (atk.y - py) ** 2);
          if (dist < atk.radius + pr) {
            if (dealDmg(atk.damage || 5, "scaleParticle")) atk.life = atk.maxLife + 1;
          }
        }
      });
    }
    _pointToLineDist(px, py, x1, y1, x2, y2) {
      const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1, dot = A * C + B * D, len = C * C + D * D;
      let p = len !== 0 ? dot / len : -1, xx, yy;
      if (p < 0) {
        xx = x1;
        yy = y1;
      } else if (p > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + p * C;
        yy = y1 + p * D;
      }
      return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
    }
    _spawnExplosion(x, y) {
      const d = GameGlobal.databus;
      if (!d.explosions) d.explosions = [];
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2, spd = 1 + Math.random() * 3;
        d.explosions.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, size: 3 + Math.random() * 5, life: 1, decay: 0.02 + Math.random() * 0.03, color: ["#FF5722", "#FF9800", "#FFD700", "#FF4081"][Math.floor(Math.random() * 4)] });
      }
    }
    // ─── 胜利检测 ───
    _checkVictory() {
      const d = GameGlobal.databus;
      if (d.selectedCategory === "mosquito_bigmap") return;
      const alive = d.enemys.filter((e) => e && e.visible);
      if (alive.length === 0 && !d.isGameOver && !this.gameInfo._crystalState) {
        if (d.level >= 8) {
          d.gamePhase = "category_complete";
          d.isGameOver = true;
          d.gameOverReason = "win";
          d.saveHighScore();
          GameGlobal.musicManager.stopBGM();
        } else {
          this.gameInfo.showCrystalBallReward(d.level, () => {
            d.level++;
            this._spawnForCategory(d.selectedCategory);
          });
        }
      }
    }
    // ─── 主循环 ───
    loop() {
      try {
        const d = GameGlobal.databus;
        if (!d.isPaused) this.update();
        this.render();
        this._processNextTerrainChunk();
      } catch (e) {
        console.error("[loop] error:", e);
      }
      this.aniId = requestAnimationFrame(this.loop.bind(this));
    }
    update() {
      const d = GameGlobal.databus;
      d.frame++;
      if (d.isGameOver || d.gamePhase !== "playing") return;
      if (this.gameInfo._crystalState) return;
      const s = d.activeState();
      if (this.player.invincibleTimer > 0) this.player.invincibleTimer--;
      if (this.player.shieldCooldown && this.player.shieldCooldownTimer > 0) {
        this.player.shieldCooldownTimer--;
        if (this.player.shieldCooldownTimer <= 0) this.player.shieldCooldown = false;
      }
      this.player.update();
      d.playerCenterX = d.selectedCategory === "mosquito_bigmap" ? this.player.testBall.x : this.player.x + this.player.width / 2;
      d.playerCenterY = d.selectedCategory === "mosquito_bigmap" ? this.player.testBall.y : this.player.y;
      d.bullets.forEach((b) => b.update ? b.update() : null);
      d.bullets = d.bullets.filter((b) => b.visible !== false);
      d.missiles.forEach((m) => m.update ? m.update() : null);
      d.missiles = d.missiles.filter((m) => m.visible !== false);
      d.lasers.forEach((l) => l.update ? l.update() : null);
      d.lasers = d.lasers.filter((l) => l.isActive !== false);
      d.enemys.forEach((e) => {
        if (e.isActive) e.update(d.playerCenterX, d.playerCenterY);
      });
      if (d.attackBullets) {
        d.attackBullets.forEach((b) => {
          b.x += b.vx;
          b.y += b.vy;
        });
        const isBigmap = d.selectedCategory === "mosquito_bigmap";
        const cw = isBigmap ? d.worldWidth : SCREEN_WIDTH;
        const ch = isBigmap ? d.worldHeight : SCREEN_HEIGHT;
        d.attackBullets = d.attackBullets.filter((b) => b.x > -50 && b.x < cw + 50 && b.y > -50 && b.y < ch + 50);
      }
      if (d.explosions) {
        d.explosions.forEach((e) => {
          e.x += e.vx;
          e.y += e.vy;
          e.vx *= 0.95;
          e.vy *= 0.95;
          e.life -= e.decay;
        });
        d.explosions = d.explosions.filter((e) => e.life > 0);
      }
      this._updateEnemyAttacks();
      this._collisionDetection();
      this._checkVictory();
      if (d.selectedCategory === "mosquito_bigmap") this._maintainBigmapEnemies();
      d.enemys = d.enemys.filter((e) => e && e.visible);
    }
    _updateEnemyAttacks() {
      const d = GameGlobal.databus;
      if (!d.enemyAttacks) return;
      for (let i = d.enemyAttacks.length - 1; i >= 0; i--) {
        const a = d.enemyAttacks[i];
        a.life++;
        if (a.type === "antennaSlash") {
          a.radius = a.life / a.maxLife * a.maxRadius;
        }
        if (a.type === "sonicRing") {
          a.radius += a.radiusSpeed;
        }
        if (a.type === "chargeRing") {
          a.radius = 5 + (a.life / a.maxLife) * 25;
          a.alpha = 0.5 + 0.5 * Math.sin(a.life * 0.3);
        }
        if (a.type === "chargeTrail") {
          a.alpha = 0.6 * (1 - a.life / a.maxLife);
        }
        if (a.type === "chargeBurst") {
          a.radius = 10 + (a.life / a.maxLife) * 70;
          a.alpha = 0.9 * (1 - a.life / a.maxLife);
        }
        if (a.type === "goldShell") {
          if (a.tracking && a.targetX !== undefined) {
            const tdx = a.targetX - a.x, tdy = a.targetY - a.y;
            const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
            if (tdist > 1) {
              a.vx += (tdx / tdist) * a.trackStrength;
              a.vy += (tdy / tdist) * a.trackStrength;
              const sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
              const maxSp = 4;
              if (sp > maxSp) { a.vx = a.vx / sp * maxSp; a.vy = a.vy / sp * maxSp; }
            }
          }
          a.x += a.vx;
          a.y += a.vy;
          a.alpha = 0.7 + 0.3 * Math.sin(a.life * 0.2);
        }
        if (a.type === "poisonBall") {
          if (!a.landed) {
            a.x += a.vx;
            a.y += a.vy;
            a.vy += 0.02;
            const tdx = a.targetX - a.x, tdy = a.targetY - a.y;
            if (a.life > 30 && (Math.abs(tdx) < 10 && Math.abs(tdy) < 10 || a.life > 100)) {
              a.landed = true;
              a.landX = a.x;
              a.landY = a.y;
              a.landLife = 0;
            }
          } else {
            a.landLife++;
            a.alpha = 0.5 + 0.3 * Math.sin(a.life * 0.1);
            if (a.landLife >= a.landMaxLife) d.enemyAttacks.splice(i, 1);
          }
        }
        if (a.type === "waterDrop") {
          a.x += a.vx;
          a.y += a.vy;
          a.trail.push({ x: a.x, y: a.y, life: 0 });
          if (a.trail.length > 8) a.trail.shift();
          a.trail.forEach(t => t.life++);
        }
        if (a.type === "phaseBlade") {
          a.x += a.vx;
          a.y += a.vy;
          a.rotation += a.rotSpeed;
        }
        if (a.type === "slimeBall") {
          a.x += a.vx;
          a.y += a.vy;
          a.vx *= 0.99;
          a.vy *= 0.99;
        }
        if (a.type === "scaleStorm") {
          if (a.attackerRef && a.attackerRef.visible && a.attackerRef.isActive) {
            a.x = a.attackerRef.x + a.attackerRef.width / 2;
            a.y = a.attackerRef.y + a.attackerRef.height / 2;
          }
          if (a.life >= a.maxLife) {
            if (a.attackerRef) a.attackerRef.stormCasting = false;
            d.enemyAttacks.splice(i, 1);
            continue;
          }
        }
        if (a.type === "scaleParticle") {
          a.x += a.vx;
          a.y += a.vy;
          a.vy += 0.02;
          if (a.life > a.maxLife * 0.7) a.alpha = 0.7 * (1 - (a.life - a.maxLife * 0.7) / (a.maxLife * 0.3));
        }
        if (a.life >= a.maxLife && a.type !== "poisonBall" && a.type !== "scaleStorm") d.enemyAttacks.splice(i, 1);
      }
    }
    render() {
      ctx2.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      const d = GameGlobal.databus;
      if (d.gamePhase === "bottle_select") {
        this.gameInfo.render(ctx2, d);
        return;
      }
      if (d.selectedCategory === "mosquito_bigmap") {
        this.renderTerrain(ctx2);
        d.camera.applyTransform(ctx2);
        this.player.renderWorld(ctx2);
        d.bullets.forEach((b) => b.render && b.render(ctx2));
        d.missiles.forEach((m) => m.render && m.render(ctx2));
        d.lasers.forEach((l) => l.render && l.render(ctx2));
        if (d.attackBullets) d.attackBullets.forEach((b) => {
          ctx2.fillStyle = b.color || "#ff0000";
          ctx2.beginPath();
          ctx2.arc(b.x, b.y, b.width / 2, 0, Math.PI * 2);
          ctx2.fill();
        });
        d.enemys.forEach((e) => {
          if (e.isActive) e.drawToCanvas ? e.drawToCanvas(ctx2) : e.render && e.render(ctx2);
        });
        this._renderEnemyAttacks(ctx2);
        if (d.explosions) d.explosions.forEach((e) => {
          ctx2.save();
          ctx2.globalAlpha = e.life;
          ctx2.fillStyle = e.color;
          ctx2.beginPath();
          ctx2.arc(e.x, e.y, e.size * e.life, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.restore();
        });
        d.camera.restoreTransform(ctx2);
        this.player.renderUI(ctx2);
        this.gameInfo._renderGameHUD(ctx2, d);
        return;
      }
      const bgIdx = Math.min(d.level, 9);
      for (const ext of ["jpg", "png"]) {
        const img = resloader_default.getImage(`images/background${bgIdx}.${ext}`);
        if (img) {
          ctx2.drawImage(img, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
          break;
        }
      }
      d.enemys.forEach((e) => {
        if (e.isActive) e.drawToCanvas ? e.drawToCanvas(ctx2) : e.render && e.render(ctx2);
      });
      this.player.render(ctx2);
      d.bullets.forEach((b) => b.render && b.render(ctx2));
      d.missiles.forEach((m) => m.render && m.render(ctx2));
      d.lasers.forEach((l) => l.render && l.render(ctx2));
      if (d.attackBullets) d.attackBullets.forEach((b) => {
        ctx2.fillStyle = b.color || "#ff0000";
        ctx2.beginPath();
        ctx2.arc(b.x, b.y, b.width / 2, 0, Math.PI * 2);
        ctx2.fill();
      });
      this._renderEnemyAttacks(ctx2);
      if (d.explosions) d.explosions.forEach((e) => {
        ctx2.save();
        ctx2.globalAlpha = e.life;
        ctx2.fillStyle = e.color;
        ctx2.beginPath();
        ctx2.arc(e.x, e.y, e.size * e.life, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.restore();
      });
      this.gameInfo._renderGameHUD(ctx2, d);
      if (d.isShowManual) this.gameInfo._renderManual(ctx2);
      if (d.isGameOver) this.gameInfo._renderGameOver(ctx2, d);
      if (d.gamePhase === "category_complete") this.gameInfo._renderCategoryComplete(ctx2, d);
      this.gameInfo.updateCrystalBall(ctx2);
    }
    _renderEnemyAttacks(ctx3) {
      const d = GameGlobal.databus;
      if (!d.enemyAttacks) return;
      d.enemyAttacks.forEach((a) => {
        ctx3.save();
        ctx3.globalAlpha = a.alpha !== undefined ? a.alpha : 0.8;
        if (a.type === "antennaSlash") {
          ctx3.strokeStyle = "#FF5722";
          ctx3.lineWidth = 8;
          ctx3.beginPath();
          ctx3.arc(a.x, a.y, a.radius, a.dir > 0 ? 0.2 : Math.PI + 0.2, a.dir > 0 ? Math.PI - 0.2 : Math.PI * 2 - 0.2);
          ctx3.stroke();
        }
        if (a.type === "sonicRing") {
          ctx3.strokeStyle = "#00BCD4";
          ctx3.lineWidth = 4;
          ctx3.beginPath();
          ctx3.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
          ctx3.stroke();
        }
        if (a.type === "pierceBeam") {
          const warning = a.life < (a.warnFrames || 0);
          if (warning) {
            ctx3.globalAlpha = 0.3 + Math.sin(a.life * 0.5) * 0.2;
            ctx3.strokeStyle = "#ef4444";
            ctx3.lineWidth = 1.5;
            ctx3.setLineDash([6, 4]);
            ctx3.beginPath();
            ctx3.moveTo(a.x1, a.y1);
            ctx3.lineTo(a.x2, a.y2);
            ctx3.stroke();
            ctx3.setLineDash([]);
          } else {
            const flicker = 0.7 + Math.sin(a.life * 0.8) * 0.3;
            ctx3.globalAlpha = (a.alpha || 1) * flicker;
            ctx3.strokeStyle = "#ef4444";
            ctx3.lineWidth = 2;
            ctx3.beginPath();
            ctx3.moveTo(a.x1, a.y1);
            ctx3.lineTo(a.x2, a.y2);
            ctx3.stroke();
            ctx3.strokeStyle = "#fca5a5";
            ctx3.lineWidth = 0.8;
            ctx3.beginPath();
            ctx3.moveTo(a.x1, a.y1);
            ctx3.lineTo(a.x2, a.y2);
            ctx3.stroke();
          }
        }
        if (a.type === "chargeRing") {
          ctx3.strokeStyle = a.color || "#FF4444";
          ctx3.lineWidth = 3;
          ctx3.shadowColor = a.color || "#FF4444";
          ctx3.shadowBlur = 8;
          ctx3.beginPath();
          ctx3.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
          ctx3.stroke();
        }
        if (a.type === "chargeTrail") {
          ctx3.fillStyle = a.color || "#FF4444";
          ctx3.shadowColor = a.color || "#FF4444";
          ctx3.shadowBlur = 6;
          ctx3.beginPath();
          ctx3.arc(a.x, a.y, a.radius * (1 - a.life / a.maxLife), 0, Math.PI * 2);
          ctx3.fill();
        }
        if (a.type === "chargeBurst") {
          ctx3.strokeStyle = a.color || "#FF6644";
          ctx3.lineWidth = 4;
          ctx3.shadowColor = a.color || "#FF6644";
          ctx3.shadowBlur = 12;
          ctx3.beginPath();
          ctx3.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
          ctx3.stroke();
        }
        if (a.type === "goldShell") {
          ctx3.fillStyle = "#FFD700";
          ctx3.shadowColor = "#FFD700";
          ctx3.shadowBlur = 8;
          ctx3.beginPath();
          ctx3.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
          ctx3.fill();
          ctx3.fillStyle = "#FFF8DC";
          ctx3.beginPath();
          ctx3.arc(a.x - a.radius * 0.3, a.y - a.radius * 0.3, a.radius * 0.4, 0, Math.PI * 2);
          ctx3.fill();
        }
        if (a.type === "poisonBall") {
          if (!a.landed) {
            ctx3.fillStyle = "#8B008B";
            ctx3.shadowColor = "#9932CC";
            ctx3.shadowBlur = 10;
            ctx3.beginPath();
            ctx3.ellipse(a.x, a.y, a.radius, a.radius * 1.2, 0, 0, Math.PI * 2);
            ctx3.fill();
            ctx3.fillStyle = "#BA55D3";
            ctx3.beginPath();
            ctx3.ellipse(a.x - a.radius * 0.3, a.y - a.radius * 0.3, a.radius * 0.4, a.radius * 0.5, 0, 0, Math.PI * 2);
            ctx3.fill();
          } else {
            const lProg = a.landLife / a.landMaxLife;
            const landAlpha = lProg < 0.2 ? lProg / 0.2 : (lProg > 0.8 ? (1 - lProg) / 0.2 : 1);
            ctx3.globalAlpha = landAlpha * 0.5;
            ctx3.fillStyle = "#9932CC";
            ctx3.beginPath();
            ctx3.ellipse(a.landX, a.landY, 40, 20, 0, 0, Math.PI * 2);
            ctx3.fill();
            ctx3.fillStyle = "#8B008B";
            ctx3.beginPath();
            ctx3.ellipse(a.landX, a.landY, 25, 12, 0, 0, Math.PI * 2);
            ctx3.fill();
          }
        }
        if (a.type === "waterDrop") {
          if (a.trail && a.trail.length > 0) {
            a.trail.forEach((t, idx) => {
              const tAlpha = (idx / a.trail.length) * 0.5;
              ctx3.globalAlpha = tAlpha;
              ctx3.fillStyle = "#4FC3F7";
              ctx3.beginPath();
              ctx3.arc(t.x, t.y, a.radius * (idx / a.trail.length) * 0.6, 0, Math.PI * 2);
              ctx3.fill();
            });
            ctx3.globalAlpha = a.alpha;
          }
          ctx3.fillStyle = "#29B6F6";
          ctx3.shadowColor = "#03A9F4";
          ctx3.shadowBlur = 10;
          ctx3.beginPath();
          ctx3.moveTo(a.x, a.y - a.radius * 1.2);
          ctx3.quadraticCurveTo(a.x + a.radius, a.y, a.x, a.y + a.radius);
          ctx3.quadraticCurveTo(a.x - a.radius, a.y, a.x, a.y - a.radius * 1.2);
          ctx3.fill();
          ctx3.fillStyle = "#B3E5FC";
          ctx3.beginPath();
          ctx3.arc(a.x - a.radius * 0.2, a.y - a.radius * 0.2, a.radius * 0.3, 0, Math.PI * 2);
          ctx3.fill();
        }
        if (a.type === "phaseBlade") {
          ctx3.save();
          ctx3.translate(a.x, a.y);
          ctx3.rotate(a.rotation || 0);
          ctx3.fillStyle = "#00E676";
          ctx3.shadowColor = "#00C853";
          ctx3.shadowBlur = 15;
          ctx3.beginPath();
          ctx3.moveTo(a.radius, 0);
          ctx3.quadraticCurveTo(0, -a.radius * 0.6, -a.radius * 0.7, 0);
          ctx3.quadraticCurveTo(0, a.radius * 0.6, a.radius, 0);
          ctx3.fill();
          ctx3.strokeStyle = "#69F0AE";
          ctx3.lineWidth = 2;
          ctx3.stroke();
          ctx3.restore();
        }
        if (a.type === "slimeBall") {
          ctx3.fillStyle = "#76FF03";
          ctx3.shadowColor = "#64DD17";
          ctx3.shadowBlur = 8;
          ctx3.beginPath();
          ctx3.ellipse(a.x, a.y, a.radius, a.radius * 0.85, 0, 0, Math.PI * 2);
          ctx3.fill();
          ctx3.fillStyle = "#B9F6CA";
          ctx3.beginPath();
          ctx3.ellipse(a.x - a.radius * 0.3, a.y - a.radius * 0.3, a.radius * 0.35, a.radius * 0.25, -0.3, 0, Math.PI * 2);
          ctx3.fill();
        }
        if (a.type === "scaleStorm") {
          ctx3.strokeStyle = "#CE93D8";
          ctx3.lineWidth = 2;
          ctx3.setLineDash([5, 5]);
          ctx3.beginPath();
          ctx3.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
          ctx3.stroke();
          ctx3.setLineDash([]);
        }
        if (a.type === "scaleParticle") {
          ctx3.fillStyle = a.color || "#E0B0FF";
          ctx3.shadowColor = a.color || "#E0B0FF";
          ctx3.shadowBlur = 4;
          ctx3.beginPath();
          ctx3.ellipse(a.x, a.y, a.radius, a.radius * 0.5, a.life * 0.05, 0, Math.PI * 2);
          ctx3.fill();
        }
        ctx3.restore();
      });
    }
  };

  // game.js
  window.__game = new Main();
})();
