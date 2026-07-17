/**
 * piao.js — 瓢虫（5种变体）
 */
import Sprite from '../base/sprite';
import Animation from '../base/animatoin';
import resloader from '../resloader';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const PROPS = {
  1: { speed: 1.4, maxHealth: 90, attackDamage: 10, attackInterval: 3000, attack: true },
  2: { speed: 1.1, maxHealth: 380, attackDamage: 18, attackInterval: 5000, attack: true },
  3: { speed: 1.7, maxHealth: 110, attackDamage: 8, attackInterval: 2800, attack: true, health: true, currentHealth: 110 },
  4: { speed: 0.9, maxHealth: 130, attackDamage: 12, attackInterval: 4000, attack: true, heal: true },
  5: { speed: 2.0, maxHealth: 65, attackDamage: 10, attackInterval: 3000, attack: true, stealth: true },
};
const SF = 60, SC = 8, SFP = 10, FW = 64, FH = 64;
const MT = 70, MBO = 100, MS = 10;

export default class Piao extends Sprite {
  constructor(type = 1) {
    super();
    this.mosquitoType = type; this.id = type; this.width = 46; this.height = 46;
    this.vx = 0; this.vy = 0; this.anim = null; this.img = null; this.imgLoaded = false;
    const p = PROPS[type] || PROPS[1];
    this.properties = { ...p, currentHealth: p.currentHealth || p.maxHealth, lastAttackTime: 0 };
    this.speed = p.speed; this.opacity = 1;
    this.moveAngle = Math.random() * Math.PI * 2; this.moveTimer = 0; this.moveChangeInterval = 60 + Math.random() * 120;
    this.markAsCloned = function () { this.properties.hasCloned = true; };
  }

  init() {
    this.isActive = true; this.visible = true; this.opacity = 1;
    const src = `images/piao${this.mosquitoType}_spritesheet.png`;
    this.img = resloader.get(src);
    if (this.img) { this.imgLoaded = true; this.anim = new Animation(this.img, FW, FH, SC, SF, SFP); }
    else { resloader.loadImage(src).then(img => { this.img = img; this.imgLoaded = true; this.anim = new Animation(img, FW, FH, SC, SF, SFP); }).catch(() => {}); }
    this.x = MS + Math.random() * (SCREEN_WIDTH - this.width - MS * 2);
    this.y = MT + Math.random() * (SCREEN_HEIGHT - this.height - MT - MBO);
    this.moveAngle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(this.moveAngle) * this.speed; this.vy = Math.sin(this.moveAngle) * this.speed;
  }

  update() {
    if (!this.isActive) return;
    if (this.anim) this.anim.update();
    if (this.sweeping || this.stormCasting) return;
    this.moveTimer++;
    if (this.moveTimer >= this.moveChangeInterval) { this.moveTimer = 0; this.moveChangeInterval = 60 + Math.random() * 120; this.moveAngle = Math.random() * Math.PI * 2; this.vx = Math.cos(this.moveAngle) * this.speed; this.vy = Math.sin(this.moveAngle) * this.speed; }
    const sm = this.speedModifier || 1; this.x += this.vx * sm; this.y += this.vy * sm;
    if (this.speedModifier && this.speedModifier < 1) this.speedModifier = Math.min(1, this.speedModifier + 0.005);
    const _db = GameGlobal.databus; const _isBig = _db.selectedCategory === 'mosquito_bigmap';
    const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH; const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
    const _sm2 = _isBig ? 0 : MS; const _mt2 = _isBig ? 0 : MT;
    const bb = _bh - (_isBig ? 0 : MBO);
    if (this.x < _sm2) { this.x = _sm2; this.vx = Math.abs(this.vx) * 0.8; }
    if (this.x + this.width > _bw - _sm2) { this.x = _bw - _sm2 - this.width; this.vx = -Math.abs(this.vx) * 0.8; }
    if (this.y < _mt2) { this.y = _mt2; this.vy = Math.abs(this.vy) * 0.8; }
    if (this.y + this.height > bb) { this.y = bb - this.height; this.vy = -Math.abs(this.vy) * 0.8; }
  }

  render(ctx) {
    if (!this.isActive || !this.visible) return;
    ctx.save(); ctx.globalAlpha = this.opacity;
    if (this.imgLoaded && this.anim) { this.anim.drawToCanvas(ctx, this.x, this.y, this.width, this.height, this.opacity); }
    else { ctx.fillStyle = '#FF1493'; ctx.fillRect(this.x, this.y, this.width, this.height); ctx.fillStyle = '#fff'; ctx.font = '10px Arial'; ctx.textAlign = 'center'; ctx.fillText(`P${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4); }
    if (this.properties.currentHealth < this.properties.maxHealth) { const bw = this.width, bh = 4, bx = this.x, by = this.y - 8, r = this.properties.currentHealth / this.properties.maxHealth; ctx.fillStyle = '#333'; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = r > 0.5 ? '#4f4' : (r > 0.25 ? '#ff0' : '#f44'); ctx.fillRect(bx, by, bw * r, bh); }
    ctx.restore();
  }

  takeDamage(amount) { if (!this.isActive) return; this.properties.currentHealth -= amount; if (this.properties.currentHealth <= 0) this.die(); }
  heal(amount) { this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth); }
  die() { this.isActive = false; this.visible = false; const d = GameGlobal.databus; d.killCount = (d.killCount || 0) + 1; d.score += 25; d.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12); }
}
