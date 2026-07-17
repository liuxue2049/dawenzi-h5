/**
 * fjg.js — 飞甲/天牛（5种变体）
 */
import Sprite from '../base/sprite';
import Animation from '../base/animatoin';
import resloader from '../resloader';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const FJG_PROPS = {
  1: { speed: 1.3, maxHealth: 110, attackDamage: 12, attackInterval: 3200, attack: true },
  2: { speed: 1.0, maxHealth: 400, attackDamage: 18, attackInterval: 5000, attack: true },
  3: { speed: 1.6, maxHealth: 130, attackDamage: 10, attackInterval: 2800, attack: true, health: true, currentHealth: 130 },
  4: { speed: 0.9, maxHealth: 140, attackDamage: 14, attackInterval: 4500, attack: true, heal: true },
  5: { speed: 1.9, maxHealth: 70, attackDamage: 10, attackInterval: 3000, attack: true, stealth: true },
};

const SPRITE_FRAMES = 60, SPRITE_COLS = 8, SPRITE_FPS = 10, FRAME_W = 64, FRAME_H = 64;
const MARGIN_TOP = 70, MARGIN_BOTTOM_OFFSET = 100, MARGIN_SIDE = 10;

export default class Fjg extends Sprite {
  constructor(type = 1) {
    super();
    this.mosquitoType = type;
    this.id = type;
    this.width = 50;
    this.height = 50;
    this.vx = 0; this.vy = 0;
    this.anim = null; this.img = null; this.imgLoaded = false;
    const props = FJG_PROPS[type] || FJG_PROPS[1];
    this.properties = { ...props, currentHealth: props.currentHealth || props.maxHealth, lastAttackTime: 0 };
    this.speed = props.speed;
    this.opacity = 1;
    this.moveAngle = Math.random() * Math.PI * 2;
    this.moveTimer = 0;
    this.moveChangeInterval = 60 + Math.random() * 120;
    this.markAsCloned = function () { this.properties.hasCloned = true; };
  }

  init() {
    this.isActive = true; this.visible = true; this.opacity = 1;
    const src = `images/fjg${this.mosquitoType}_spritesheet.png`;
    this.img = resloader.get(src);
    if (this.img) { this.imgLoaded = true; this.anim = new Animation(this.img, FRAME_W, FRAME_H, SPRITE_COLS, SPRITE_FRAMES, SPRITE_FPS); }
    else { resloader.loadImage(src).then(img => { this.img = img; this.imgLoaded = true; this.anim = new Animation(img, FRAME_W, FRAME_H, SPRITE_COLS, SPRITE_FRAMES, SPRITE_FPS); }).catch(() => {}); }
    this.x = MARGIN_SIDE + Math.random() * (SCREEN_WIDTH - this.width - MARGIN_SIDE * 2);
    this.y = MARGIN_TOP + Math.random() * (SCREEN_HEIGHT - this.height - MARGIN_TOP - MARGIN_BOTTOM_OFFSET);
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
    this.x += this.vx * sm; this.y += this.vy * sm;
    if (this.speedModifier && this.speedModifier < 1) this.speedModifier = Math.min(1, this.speedModifier + 0.005);
    const _db = GameGlobal.databus; const _isBig = _db.selectedCategory === 'mosquito_bigmap';
    const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH; const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
    const _ms = _isBig ? 0 : MARGIN_SIDE; const _mtop = _isBig ? 0 : MARGIN_TOP;
    const bb = _bh - (_isBig ? 0 : MARGIN_BOTTOM_OFFSET);
    if (this.x < _ms) { this.x = _ms; this.vx = Math.abs(this.vx) * 0.8; }
    if (this.x + this.width > _bw - _ms) { this.x = _bw - _ms - this.width; this.vx = -Math.abs(this.vx) * 0.8; }
    if (this.y < _mtop) { this.y = _mtop; this.vy = Math.abs(this.vy) * 0.8; }
    if (this.y + this.height > bb) { this.y = bb - this.height; this.vy = -Math.abs(this.vy) * 0.8; }
  }

  render(ctx) {
    if (!this.isActive || !this.visible) return;
    ctx.save(); ctx.globalAlpha = this.opacity;
    if (this.imgLoaded && this.anim) { this.anim.drawToCanvas(ctx, this.x, this.y, this.width, this.height, this.opacity); }
    else { ctx.fillStyle = '#8B4513'; ctx.fillRect(this.x, this.y, this.width, this.height); ctx.fillStyle = '#fff'; ctx.font = '10px Arial'; ctx.textAlign = 'center'; ctx.fillText(`F${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4); }
    if (this.properties.currentHealth < this.properties.maxHealth) { const bw = this.width, bh = 4, bx = this.x, by = this.y - 8, r = this.properties.currentHealth / this.properties.maxHealth; ctx.fillStyle = '#333'; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = r > 0.5 ? '#4f4' : (r > 0.25 ? '#ff0' : '#f44'); ctx.fillRect(bx, by, bw * r, bh); }
    ctx.restore();
  }

  takeDamage(amount) { if (!this.isActive) return; this.properties.currentHealth -= amount; if (this.properties.currentHealth <= 0) this.die(); }
  heal(amount) { this.properties.currentHealth = Math.min(this.properties.currentHealth + amount, this.properties.maxHealth); }
  die() { this.isActive = false; this.visible = false; const d = GameGlobal.databus; d.killCount = (d.killCount || 0) + 1; d.score += 25; d.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 12); }
}
