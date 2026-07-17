/**
 * 游戏主循环 —— 参考 dawenzi-wb 微信小游戏重写
 */
import './render';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './render';
import Player from './player/index';
import Enemy from './npc/enemy';
import UFO from './npc/ufo';
import Fjg from './npc/fjg';
import Jia from './npc/jia';
import Piao from './npc/piao';
import Gudao from './npc/gudao';
import Ying from './npc/ying';
import Ding from './npc/ding';
import Die from './npc/die';
import GameInfo from './runtime/gameinfo';
import Music from './runtime/music';
import DataBus from './databus';
import resloader from './resloader';
import AdManager from './admanager';
import Camera from './camera';
import { generateTerrainGrid, renderTerrainChunk, getChunkSize } from './terrain';

const ctx = canvas.getContext('2d');
GameGlobal.databus = new DataBus();
GameGlobal.musicManager = new Music();
GameGlobal.adManager = new AdManager();

// 关卡配置
const levelConfigs = {
  1:{1:1,2:1,3:1,4:1,5:1}, 2:{1:2,2:1,3:1,4:1,5:1}, 3:{1:2,2:2,3:1,4:1,5:1}, 4:{1:2,2:2,3:2,4:1,5:1},
  5:{1:3,2:2,3:2,4:2,5:1}, 6:{1:3,2:3,3:2,4:2,5:2}, 7:{1:4,2:3,3:3,4:2,5:2}, 8:{1:4,2:3,3:3,4:3,5:3},
};

const ENEMY_CLASSES = { mosquito: Enemy, ufo: UFO, zone3: Fjg, zone4: Jia, zone5: Piao, zone6: Gudao, zone7: Ying, zone8: Ding, zone9: Die };
const BIGMAP_CLASSES = [Enemy, UFO, Fjg, Ding, Piao, Jia, Gudao, Ying, Die];
const BIGMAP_TYPES = BIGMAP_CLASSES.flatMap(cls => [1, 2, 3, 4, 5].map(id => ({ cls, id })));
const BIGMAP_COUNT = 10;

export default class Main {
  constructor() {
    this.player = new Player();
    this.gameInfo = new GameInfo();
    this.aniId = 0;
    this.spriteImages = {};
    this._lastShoot = 0; this._shootCD = 250;
    this._touchStartTime = 0; this._touchStartPos = { x: 0, y: 0 };
    this._isLongPress = false; this._longPressTimer = null;
    this._bigmapSpawnCooldown = 0;
    this._timers = [];

    // 事件监听
    this.gameInfo.on('restart', () => this.startPlaying(false));
    this.gameInfo.on('categoryRestart', () => this.startPlaying(true));
    this.gameInfo.on('backToBottleSelect', () => this.backToBottleSelect());
    this.gameInfo.on('revive', () => this.revivePlayer());

    // 加载资源后启动
    this._loadResources().then(() => {
      GameGlobal.databus.gamePhase = 'bottle_select';
      this._bindEvents();
      this.aniId = requestAnimationFrame(this.loop.bind(this));
    });
  }

  async _loadResources() {
    await resloader.preloadAll();
    // spriteImages 已通过 resloader 缓存，NPC 直接用 resloader.get() 获取
  }

  _bindEvents() {
    canvas.onTouchStart(e => {
      const t = e.touches[0]; this._touchStartTime = Date.now(); this._touchStartPos = { x: t.clientX, y: t.clientY };
      this._isLongPress = false;
      this._longPressTimer = setTimeout(() => { this._isLongPress = true; this._handleLongPress(t.clientX, t.clientY); }, 800);
      this._handleTouchDown(t.clientX, t.clientY, e);
    });
    canvas.onTouchMove(e => {
      const t = e.touches[0];
      if (this._longPressTimer) { clearTimeout(this._longPressTimer); this._longPressTimer = null; }
      this._handleTouchMove(t.clientX, t.clientY, e);
    });
    canvas.onTouchEnd(e => {
      if (this._longPressTimer) { clearTimeout(this._longPressTimer); this._longPressTimer = null; }
      const t = e.changedTouches[0]; const dt = Date.now() - this._touchStartTime;
      const dx = t.clientX - this._touchStartPos.x, dy = t.clientY - this._touchStartPos.y;
      if (!this._isLongPress && dt < 300 && Math.sqrt(dx*dx+dy*dy) < 20) this._handleTap(t.clientX, t.clientY);
      this._handleTouchEnd(t.clientX, t.clientY, e);
    });
  }

  _handleTouchDown(x, y, rawEvent) {
    const d = GameGlobal.databus;
    if (d.gamePhase === 'bottle_select') { this.gameInfo.handleBottleScrollStart(y); return; }
    if (d.isGameOver || d.isShowManual || d.isShowPedia) return;
    if (d.selectedCategory === 'mosquito_bigmap') { this.player.handleTouchStart(rawEvent); return; }
    this.player.handleTouchStart({ touches: [{ clientX: x, clientY: y }] });
  }
  _handleTouchMove(x, y, rawEvent) {
    const d = GameGlobal.databus;
    if (d.gamePhase === 'bottle_select') { this.gameInfo.handleBottleScrollMove(y); return; }
    if (d.isGameOver || d.isShowManual || d.isShowPedia) return;
    if (d.selectedCategory === 'mosquito_bigmap') { this.player.handleTouchMove(rawEvent); return; }
    this.player.handleTouchMove({ touches: [{ clientX: x, clientY: y }] });
  }
  _handleTouchEnd(x, y, rawEvent) {
    const d = GameGlobal.databus;
    if (d.gamePhase === 'bottle_select') { this.gameInfo.handleBottleScrollEnd(); return; }
    if (d.selectedCategory === 'mosquito_bigmap') { this.player.handleTouchEnd(rawEvent); return; }
    this.player.handleTouchEnd({ changedTouches: [{ clientX: x, clientY: y }] });
  }

  _handleTap(x, y) {
    const d = GameGlobal.databus;
    // 水晶球
    if (this.gameInfo.handleCrystalTouch(x, y)) return;
    // 瓶子选择
    if (d.gamePhase === 'bottle_select') {
      if (this.gameInfo._hasScrolled) return; // 滚动后不触发选择
      const btn = this.gameInfo.handleBottleTouch(x, y);
      if (btn) this.startWithCategory(btn.category);
      return;
    }
    // UI按钮
    const ui = this.gameInfo.handleTouch(x, y, d);
    if (ui === 'manual' || ui === 'closeManual') return;
    if (ui === 'restart' || ui === 'revive' || ui === 'categoryRestart' || ui === 'backToBottleSelect') return;
    if (d.isShowManual || d.isGameOver || d.gamePhase === 'category_complete') return;
    // 图鉴
    if (d.isShowPedia) { const { handlePediaTouch } = require('./runtime/pedia'); handlePediaTouch(x, y, d); return; }
    // 大地图射击在player里处理
    if (d.selectedCategory === 'mosquito_bigmap') return;
    // 闯关模式：射击
    if (d.gamePhase === 'playing') {
      const now = Date.now(); if (now - this._lastShoot < this._shootCD) return; this._lastShoot = now;
      const s = d.activeState();
      if (s.power >= 5) { s.power -= 5; this.player.shoot(); GameGlobal.musicManager.playZapper(); }
      else { GameGlobal.musicManager.playMeizidan(); }
    }
  }

  _handleLongPress(x, y) {
    const d = GameGlobal.databus;
    if (d.gamePhase !== 'playing' || d.isPaused || d.isGameOver) return;
    if (d.selectedCategory === 'mosquito_bigmap') return;
    const s = d.activeState();
    if (s.energy >= 30) { s.energy -= 30; this.player.fireLaser(); }
  }

  // ─── 游戏流程 ───
  startWithCategory(category) {
    const d = GameGlobal.databus; d.reset(); d.selectedCategory = category; d.gamePhase = 'playing';
    this.player.init(); this._clearTimers();
    if (category === 'mosquito_bigmap') { this.player.initBigmap(); d.resetBigmap(); this.initTerrain(); this.spawnBigmapEnemies(10); }
    else { this._spawnForCategory(category); }
    this._startTimers(); GameGlobal.musicManager.init(); GameGlobal.musicManager.playBGM();
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }

  startPlaying(keepScore) {
    const d = GameGlobal.databus; const cat = d.selectedCategory; const prevS = keepScore ? d.score : 0; const prevH = d.highScore;
    d.reset(); if (keepScore) { d.score = prevS; d.highScore = prevH; }
    d.selectedCategory = cat; d.gamePhase = 'playing'; this.player.init(); this._clearTimers();
    if (cat === 'mosquito_bigmap') { this.player.initBigmap(); d.resetBigmap(); this.initTerrain(); this.spawnBigmapEnemies(10); }
    else { this._spawnForCategory(cat); }
    this._startTimers(); this.aniId = requestAnimationFrame(this.loop.bind(this));
  }

  backToBottleSelect() {
    const d = GameGlobal.databus; d.reset(); d.selectedCategory = null; d.currentBottle = null; d.gamePhase = 'bottle_select';
    this._clearTimers(); GameGlobal.musicManager.stopBGM(); this.aniId = requestAnimationFrame(this.loop.bind(this));
  }

  revivePlayer() {
    const d = GameGlobal.databus; const s = d.activeState();
    s.playerHealth = s.maxPlayerHealth; d.isGameOver = false; d.gameOverReason = null;
    s.power = s.maxPower; s.energy = s.maxEnergy; this.player.invincibleTimer = 120;
    this.aniId = requestAnimationFrame(this.loop.bind(this)); GameGlobal.musicManager.playBGM();
  }

  _clearTimers() { this._timers.forEach(t => clearInterval(t)); this._timers = []; }
  _startTimers() {
    // 血量回复
    this._timers.push(setInterval(() => { const s = GameGlobal.databus.activeState(); if (s.playerHealth < s.maxPlayerHealth) s.playerHealth = Math.min(s.playerHealth + 5, s.maxPlayerHealth); }, 1000));
    // 电力回复
    this._timers.push(setInterval(() => { const s = GameGlobal.databus.activeState(); if (s.power < s.maxPower) s.power = Math.min(s.power + 3, s.maxPower); }, 1000));
    // 敌人攻击
    this._timers.push(setInterval(() => this._enemyAttackTick(), 1000 / 60));
  }

  _spawnForCategory(category) {
    const d = GameGlobal.databus; const lv = d.level;
    const cfg = lv <= 8 ? { ...levelConfigs[lv] } : { 1: 4 + lv - 8, 2: 3, 3: 3 + lv - 8, 4: 3, 5: 3 };
    const Cls = ENEMY_CLASSES[category] || Enemy;
    for (let id = 1; id <= 5; id++) { for (let i = 0; i < (cfg[id] || 0); i++) { const e = new Cls(id); e.init(); d.enemys.push(e); } }
  }

  // ─── 敌人攻击 ───
  _enemyAttackTick() {
    const d = GameGlobal.databus; if (d.isPaused || d.isGameOver) return;
    d.enemys.forEach(e => {
      if (!e.visible || !e.canAttack || !e.canAttack()) return;
      this._executeEnemyAttack(e);
    });
  }

  _executeEnemyAttack(attacker) {
    const d = GameGlobal.databus; const isBigmap = d.selectedCategory === 'mosquito_bigmap';
    const targetX = isBigmap ? this.player.testBall.x : this.player.x + this.player.width / 2;
    const targetY = isBigmap ? this.player.testBall.y : this.player.y;
    const cx = attacker.x + (attacker.width || 0) / 2, cy = attacker.y + (attacker.height || 0) / 2;
    const dx = targetX - cx, dy = targetY - cy, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;
    const speed = 4;
    if (!d.attackBullets) d.attackBullets = [];
    // 不同敌人不同攻击
    if (attacker.type === 2) {
      // 特殊攻击
      if (attacker instanceof UFO) { this._goldShell(attacker); }
      else if (attacker instanceof Fjg) { this._antennaSlash(attacker); }
      else if (attacker instanceof Piao) { this._sonicRing(attacker); }
      else if (attacker instanceof Ding) { this._pierceBeam(attacker, targetX, targetY); }
      else { this._normalAttack(cx, cy, dx, dy, dist, speed, attacker); }
    } else {
      this._normalAttack(cx, cy, dx, dy, dist, speed, attacker);
    }
    attacker.lastAttackTime = Date.now();
  }

  _normalAttack(cx, cy, dx, dy, dist, speed, attacker) {
    GameGlobal.databus.attackBullets.push({ x: cx, y: cy, vx: dx / dist * speed, vy: dy / dist * speed, width: 10, height: 10, damage: attacker.attackDamage || 10 });
  }

  _goldShell(attacker) {
    const d = GameGlobal.databus; const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
    for (let i = 0; i < 8; i++) { const a = (Math.PI * 2 / 8) * i; d.attackBullets.push({ x: cx, y: cy, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, width: 8, height: 8, damage: 15, color: '#FFD700' }); }
  }

  _antennaSlash(attacker) {
    const d = GameGlobal.databus; const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
    d.enemyAttacks.push({ type: 'antennaSlash', x: cx, y: cy, dir: -1, radius: 0, maxRadius: 650, alpha: 0.85, life: 0, maxLife: 70 });
    d.enemyAttacks.push({ type: 'antennaSlash', x: cx, y: cy, dir: 1, radius: 0, maxRadius: 650, alpha: 0.85, life: 0, maxLife: 70 });
  }

  _sonicRing(attacker) {
    const d = GameGlobal.databus; const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
    d.enemyAttacks.push({ type: 'sonicRing', x: cx, y: cy, radius: 15, maxRadius: 700, radiusSpeed: 7, alpha: 0.8, life: 0, maxLife: 100 });
  }

  _pierceBeam(attacker, tx, ty) {
    const d = GameGlobal.databus; const cx = attacker.x + attacker.width / 2, cy = attacker.y + attacker.height / 2;
    const angle = Math.atan2(ty - cy, tx - cx);
    d.enemyAttacks.push({ type: 'pierceBeam', x: cx, y: cy, angle, length: 800, width: 6, alpha: 0.9, life: 0, maxLife: 30, damage: 25 });
  }

  // ─── 大地图刷怪 ───
  spawnBigmapEnemies(count) { for (let i = 0; i < count; i++) this._spawnBigmapOne(); }
  _spawnBigmapOne() {
    const d = GameGlobal.databus; const counts = {};
    d.enemys.forEach(e => { if (e && e.visible) { const k = e.constructor.name + '_' + e.type; counts[k] = (counts[k] || 0) + 1; } });
    let min = Infinity, candidates = [];
    BIGMAP_TYPES.forEach(({ cls, id }) => { const k = cls.name + '_' + id, c = counts[k] || 0; if (c < min) { min = c; candidates = [{ cls, id }]; } else if (c === min) candidates.push({ cls, id }); });
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const e = new chosen.cls(chosen.id); e.init();
    e.x = Math.random() * (d.worldWidth - 100) + 50; e.y = Math.random() * (d.worldHeight - 100) + 50;
    e.maxHealth = (e.maxHealth || 100) * 2; e.health = e.maxHealth;
    d.enemys.push(e);
  }

  _maintainBigmapEnemies() {
    const d = GameGlobal.databus;
    d.enemys = d.enemys.filter(e => e && e.visible);
    if (d.enemys.length < BIGMAP_COUNT) { if (this._bigmapSpawnCooldown <= 0) { this._spawnBigmapOne(); this._bigmapSpawnCooldown = 60; } }
    if (this._bigmapSpawnCooldown > 0) this._bigmapSpawnCooldown--;
  }

  // ─── 地形 ───
  initTerrain() {
    const ww = SCREEN_WIDTH * 12, wh = SCREEN_HEIGHT * 12;
    const d = GameGlobal.databus; d.worldWidth = ww; d.worldHeight = wh;
    d.camera.setWorldSize(ww, wh); d.camera.follow(ww / 2, wh / 2);
    console.log('[terrain] initTerrain start, world:', ww, 'x', wh, 'camera:', d.camera.x|0, d.camera.y|0);
    generateTerrainGrid(ww, wh, 42).then(td => {
      console.log('[terrain] grid resolved, td:', !!td, 'grid:', td && td.grid);
      if (!td || !td.grid) return; this.terrainData = td; d.terrainData = td;
      d.terrainChunks = {}; d._terrainChunkQueue = [];
      const cs = getChunkSize(); const cc = Math.floor(d.camera.x / cs); const cr = Math.floor(d.camera.y / cs);
      const tc = Math.ceil(ww / cs), tr = Math.ceil(wh / cs);
      console.log('[terrain] cs:', cs, 'center chunk:', cc, cr, 'total chunks:', tc, 'x', tr);
      const ordered = []; const maxR = Math.max(tc, tr);
      for (let r = 0; r <= maxR; r++) { for (let dc = -r; dc <= r; dc++) { for (let dr = -r; dr <= r; dr++) {
        if (Math.abs(dc) !== r && Math.abs(dr) !== r) continue;
        const c = cc + dc, row = cr + dr; if (c >= 0 && row >= 0 && c < tc && row < tr) ordered.push({ col: c, row });
      }}}
      d._terrainChunkQueue = ordered;
      console.log('[terrain] queue built, length:', ordered.length, 'first 3:', ordered.slice(0, 3));
    }).catch(e => console.error('[terrain] generateTerrainGrid error:', e));
  }

  _processNextTerrainChunk() {
    try {
      const d = GameGlobal.databus; if (d.selectedCategory !== 'mosquito_bigmap') return;
      const q = d._terrainChunkQueue; if (!q || q.length === 0) return;
      const td = this.terrainData; if (!td) return; const cs = getChunkSize();
      for (let i = 0; i < Math.min(4, q.length); i++) { const { col, row } = q.shift(); const key = `${col}_${row}`; if (!d.terrainChunks[key]) { const cvs = renderTerrainChunk(td, col, row); if (cvs) { d.terrainChunks[key] = { canvas: cvs, x: col * cs, y: row * cs }; if (Object.keys(d.terrainChunks).length <= 4) console.log('[terrain] chunk rendered:', key, 'chunks total:', Object.keys(d.terrainChunks).length); } } }
    } catch (e) {
      console.error('[terrain] chunk error:', e);
    }
  }

  renderTerrain(ctx) {
    const d = GameGlobal.databus; const chunks = d.terrainChunks; if (!chunks) return;
    const cam = d.camera; const cs = getChunkSize();
    const keys = Object.keys(chunks);
    if (keys.length > 0 && !this._terrainLogged) { this._terrainLogged = true; console.log('[terrain] renderTerrain drawing', keys.length, 'chunks, cs:', cs); }
    keys.forEach(k => {
      const ch = chunks[k];
      const sp = cam.worldToScreen(ch.x, ch.y);
      if (sp.x + cs > 0 && sp.x < SCREEN_WIDTH && sp.y + cs > 0 && sp.y < SCREEN_HEIGHT) ctx.drawImage(ch.canvas, sp.x, sp.y);
    });
  }

  // ─── 碰撞检测 ───
  _collisionDetection() {
    const d = GameGlobal.databus; const s = d.activeState();
    // 子弹 vs 敌人
    const _bigSrc = d.selectedCategory === 'mosquito_bigmap' ? d.bullets : [];
    [...this.player.bullets, ...this.player.missiles, ..._bigSrc].forEach(b => {
      d.enemys.forEach(e => {
        if (e.isActive && b.checkHit && b.checkHit(e)) {
          e.takeDamage ? e.takeDamage(b.damage) : (e.properties.currentHealth -= b.damage);
          b.visible = false;
        }
      });
    });
    // 激光 vs 敌人
    this.player.lasers.forEach(l => {
      d.enemys.forEach(e => {
        if (e.isActive && l.checkHit && l.checkHit(e)) {
          e.takeDamage ? e.takeDamage(l.damage) : (e.properties.currentHealth -= l.damage);
        }
      });
    });
    // 攻击子弹 vs 玩家
    if (d.attackBullets) {
      for (let i = d.attackBullets.length - 1; i >= 0; i--) {
        const b = d.attackBullets[i];
        const px = d.selectedCategory === 'mosquito_bigmap' ? this.player.testBall.x : this.player.x + this.player.width / 2;
        const py = d.selectedCategory === 'mosquito_bigmap' ? this.player.testBall.y : this.player.y;
        const pr = d.selectedCategory === 'mosquito_bigmap' ? this.player.testBall.r : 20;
        if (Math.sqrt((b.x - px) ** 2 + (b.y - py) ** 2) < pr + b.width / 2) {
          if (this.player.invincibleTimer <= 0) {
            if (this.player.shieldActive) {
              // 护盾抵挡攻击并破碎
              this.player.shieldActive = false;
              console.log('[shield] BROKEN by attackBullet');
            } else {
              s.playerHealth -= b.damage;
              if (s.playerHealth <= 0) { s.playerHealth = 0; d.isGameOver = true; d.gameOverReason = 'dead'; d.saveHighScore(); GameGlobal.musicManager.stopBGM(); }
            }
            d.attackBullets.splice(i, 1);
          }
        }
      }
    }
    // 敌人特殊攻击 vs 玩家
    this._collideEnemyAttacks();
    // 玩家移动碰撞（大地图）
    if (d.selectedCategory === 'mosquito_bigmap') {
      d.enemys.forEach(e => {
        if (!e.visible) return;
        const ex = e.x + e.width / 2, ey = e.y + e.height / 2;
        if (Math.sqrt((ex - this.player.testBall.x) ** 2 + (ey - this.player.testBall.y) ** 2) < this.player.testBall.r + e.width / 2) {
          if (this.player.invincibleTimer <= 0) {
            if (this.player.shieldActive) {
              this.player.shieldActive = false;
              console.log('[shield] BROKEN by body contact');
            } else {
              s.playerHealth -= 5;
              if (s.playerHealth <= 0) { s.playerHealth = 0; d.isGameOver = true; d.gameOverReason = 'dead'; d.saveHighScore(); GameGlobal.musicManager.stopBGM(); }
            }
            this.player.invincibleTimer = 30;
          }
        }
      });
    }
  }

  _collideEnemyAttacks() {
    const d = GameGlobal.databus; const s = d.activeState(); if (!d.enemyAttacks) return;
    const px = d.selectedCategory === 'mosquito_bigmap' ? this.player.testBall.x : this.player.x + this.player.width / 2;
    const py = d.selectedCategory === 'mosquito_bigmap' ? this.player.testBall.y : this.player.y;
    d.enemyAttacks.forEach(atk => {
      if (atk.type === 'sonicRing') {
        const dist = Math.sqrt((atk.x - px) ** 2 + (atk.y - py) ** 2);
        if (Math.abs(dist - atk.radius) < 30 && this.player.invincibleTimer <= 0) {
          if (this.player.shieldActive) {
            this.player.shieldActive = false;
            console.log('[shield] BROKEN by sonicRing');
          } else {
            s.playerHealth -= 10;
            if (s.playerHealth <= 0) { s.playerHealth = 0; d.isGameOver = true; d.gameOverReason = 'dead'; d.saveHighScore(); GameGlobal.musicManager.stopBGM(); }
          }
          this.player.invincibleTimer = 30;
        }
      }
      if (atk.type === 'pierceBeam') {
        const dist = this._pointToLineDist(px, py, atk.x, atk.y, atk.x + Math.cos(atk.angle) * atk.length, atk.y + Math.sin(atk.angle) * atk.length);
        if (dist < 20 && this.player.invincibleTimer <= 0) {
          if (this.player.shieldActive) {
            this.player.shieldActive = false;
            console.log('[shield] BROKEN by pierceBeam');
          } else {
            s.playerHealth -= atk.damage;
            if (s.playerHealth <= 0) { s.playerHealth = 0; d.isGameOver = true; d.gameOverReason = 'dead'; d.saveHighScore(); GameGlobal.musicManager.stopBGM(); }
          }
          this.player.invincibleTimer = 30;
        }
      }
    });
  }

  _pointToLineDist(px, py, x1, y1, x2, y2) {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1, dot = A * C + B * D, len = C * C + D * D;
    let p = len !== 0 ? dot / len : -1, xx, yy;
    if (p < 0) { xx = x1; yy = y1; } else if (p > 1) { xx = x2; yy = y2; } else { xx = x1 + p * C; yy = y1 + p * D; }
    return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
  }

  _spawnExplosion(x, y) {
    const d = GameGlobal.databus; if (!d.explosions) d.explosions = [];
    for (let i = 0; i < 12; i++) { const a = Math.random() * Math.PI * 2, spd = 1 + Math.random() * 3; d.explosions.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, size: 3 + Math.random() * 5, life: 1, decay: 0.02 + Math.random() * 0.03, color: ['#FF5722', '#FF9800', '#FFD700', '#FF4081'][Math.floor(Math.random() * 4)] }); }
  }

  // ─── 胜利检测 ───
  _checkVictory() {
    const d = GameGlobal.databus; if (d.selectedCategory === 'mosquito_bigmap') return;
    const alive = d.enemys.filter(e => e && e.visible);
    if (alive.length === 0 && !d.isGameOver && !this.gameInfo._crystalState) {
      if (d.level >= 8) {
        d.gamePhase = 'category_complete'; d.isGameOver = true; d.gameOverReason = 'win'; d.saveHighScore(); GameGlobal.musicManager.stopBGM();
      } else {
        // 水晶球奖励
        this.gameInfo.showCrystalBallReward(d.level, () => { d.level++; this._spawnForCategory(d.selectedCategory); });
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
      console.error('[loop] error:', e);
    }
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }

  update() {
    const d = GameGlobal.databus; d.frame++;
    if (d.isGameOver || d.gamePhase !== 'playing') return;
    if (this.gameInfo._crystalState) return; // 水晶球动画中暂停游戏
    const s = d.activeState();
    if (this.player.invincibleTimer > 0) this.player.invincibleTimer--;
    if (this.player.shieldCooldown && this.player.shieldCooldownTimer > 0) { this.player.shieldCooldownTimer--; if (this.player.shieldCooldownTimer <= 0) this.player.shieldCooldown = false; }

    this.player.update();
    d.playerCenterX = d.selectedCategory === 'mosquito_bigmap' ? this.player.testBall.x : this.player.x + this.player.width / 2;
    d.playerCenterY = d.selectedCategory === 'mosquito_bigmap' ? this.player.testBall.y : this.player.y;

    // 更新子弹/飞弹/激光
    d.bullets.forEach(b => b.update ? b.update() : null); d.bullets = d.bullets.filter(b => b.visible !== false);
    d.missiles.forEach(m => m.update ? m.update() : null); d.missiles = d.missiles.filter(m => m.visible !== false);
    d.lasers.forEach(l => l.update ? l.update() : null); d.lasers = d.lasers.filter(l => l.isActive !== false);
    // 更新敌人
    d.enemys.forEach(e => { if (e.isActive) e.update(d.playerCenterX, d.playerCenterY); });
    // 更新攻击子弹
    if (d.attackBullets) { d.attackBullets.forEach(b => { b.x += b.vx; b.y += b.vy; }); const isBigmap = d.selectedCategory === 'mosquito_bigmap'; const cw = isBigmap ? d.worldWidth : SCREEN_WIDTH; const ch = isBigmap ? d.worldHeight : SCREEN_HEIGHT; d.attackBullets = d.attackBullets.filter(b => b.x > -50 && b.x < cw + 50 && b.y > -50 && b.y < ch + 50); }
    // 更新爆炸
    if (d.explosions) { d.explosions.forEach(e => { e.x += e.vx; e.y += e.vy; e.vx *= 0.95; e.vy *= 0.95; e.life -= e.decay; }); d.explosions = d.explosions.filter(e => e.life > 0); }
    // 更新特殊攻击
    this._updateEnemyAttacks();
    // 碰撞
    this._collisionDetection();
    // 胜利
    this._checkVictory();
    // 大地图维持敌人
    if (d.selectedCategory === 'mosquito_bigmap') this._maintainBigmapEnemies();
    // 清理
    d.enemys = d.enemys.filter(e => e && e.visible);
  }

  _updateEnemyAttacks() {
    const d = GameGlobal.databus; if (!d.enemyAttacks) return;
    for (let i = d.enemyAttacks.length - 1; i >= 0; i--) {
      const a = d.enemyAttacks[i]; a.life++;
      if (a.type === 'antennaSlash') { a.radius = (a.life / a.maxLife) * a.maxRadius; }
      if (a.type === 'sonicRing') { a.radius += a.radiusSpeed; }
      if (a.life >= a.maxLife) d.enemyAttacks.splice(i, 1);
    }
  }

  render() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const d = GameGlobal.databus;
    // 瓶子选择
    if (d.gamePhase === 'bottle_select') { this.gameInfo.render(ctx, d); return; }
    // 大地图
    if (d.selectedCategory === 'mosquito_bigmap') {
      this.renderTerrain(ctx);
      d.camera.applyTransform(ctx);
      // 玩家
      this.player.renderWorld(ctx);
      // 子弹
      d.bullets.forEach(b => b.render && b.render(ctx));
      d.missiles.forEach(m => m.render && m.render(ctx));
      d.lasers.forEach(l => l.render && l.render(ctx));
      // 攻击子弹
      if (d.attackBullets) d.attackBullets.forEach(b => { ctx.fillStyle = b.color || '#ff0000'; ctx.beginPath(); ctx.arc(b.x, b.y, b.width / 2, 0, Math.PI * 2); ctx.fill(); });
      // 敌人
      d.enemys.forEach(e => { if (e.isActive) e.drawToCanvas ? e.drawToCanvas(ctx) : e.render && e.render(ctx); });
      // 特殊攻击
      this._renderEnemyAttacks(ctx);
      // 爆炸
      if (d.explosions) d.explosions.forEach(e => { ctx.save(); ctx.globalAlpha = e.life; ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(e.x, e.y, e.size * e.life, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
      d.camera.restoreTransform(ctx);
      // UI
      this.player.renderUI(ctx);
      // 返回按钮
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(SCREEN_WIDTH - 28, 106, 22, 50);
      ctx.save(); ctx.translate(SCREEN_WIDTH - 17, 131); ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#FFF'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.fillText('返回', 0, 0); ctx.restore();
      // HUD
      this.gameInfo._renderGameHUD(ctx, d);
      return;
    }
    // 闯关模式
    // 背景
    const bgIdx = Math.min(d.level, 9);
    for (const ext of ['jpg', 'png']) { const img = resloader.getImage(`images/background${bgIdx}.${ext}`); if (img) { ctx.drawImage(img, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); break; } }
    // 敌人
    d.enemys.forEach(e => { if (e.isActive) e.drawToCanvas ? e.drawToCanvas(ctx) : e.render && e.render(ctx); });
    // 玩家
    this.player.render(ctx);
    // 子弹
    d.bullets.forEach(b => b.render && b.render(ctx));
    d.missiles.forEach(m => m.render && m.render(ctx));
    d.lasers.forEach(l => l.render && l.render(ctx));
    // 攻击子弹
    if (d.attackBullets) d.attackBullets.forEach(b => { ctx.fillStyle = b.color || '#ff0000'; ctx.beginPath(); ctx.arc(b.x, b.y, b.width / 2, 0, Math.PI * 2); ctx.fill(); });
    // 特殊攻击
    this._renderEnemyAttacks(ctx);
    // 爆炸
    if (d.explosions) d.explosions.forEach(e => { ctx.save(); ctx.globalAlpha = e.life; ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(e.x, e.y, e.size * e.life, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
    // HUD
    this.gameInfo._renderGameHUD(ctx, d);
    // 弹窗
    if (d.isShowManual) this.gameInfo._renderManual(ctx);
    if (d.isGameOver) this.gameInfo._renderGameOver(ctx, d);
    if (d.gamePhase === 'category_complete') this.gameInfo._renderCategoryComplete(ctx, d);
    // 水晶球
    this.gameInfo.updateCrystalBall(ctx);
  }

  _renderEnemyAttacks(ctx) {
    const d = GameGlobal.databus; if (!d.enemyAttacks) return;
    d.enemyAttacks.forEach(a => {
      ctx.save(); ctx.globalAlpha = a.alpha || 0.8;
      if (a.type === 'antennaSlash') {
        ctx.strokeStyle = '#FF5722'; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.radius, a.dir > 0 ? 0.2 : Math.PI + 0.2, a.dir > 0 ? Math.PI - 0.2 : Math.PI * 2 - 0.2); ctx.stroke();
      }
      if (a.type === 'sonicRing') { ctx.strokeStyle = '#00BCD4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2); ctx.stroke(); }
      if (a.type === 'pierceBeam') {
        ctx.strokeStyle = '#E040FB'; ctx.lineWidth = a.width; ctx.shadowColor = '#E040FB'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + Math.cos(a.angle) * a.length, a.y + Math.sin(a.angle) * a.length); ctx.stroke();
      }
      ctx.restore();
    });
  }
}
