/**
 * ufo.js — 金龟子（5种变体）
 */
import Sprite from '../base/sprite';
import Animation from '../base/animatoin';
import resloader from '../resloader';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const UFO_PROPS = {
  1: { speed: 1.2, maxHealth: 100, attackDamage: 12, attackInterval: 3500, attack: true },
  2: { speed: 1.0, maxHealth: 500, attackDamage: 20, attackInterval: 5000, attack: true },
  3: { speed: 1.5, maxHealth: 120, attackDamage: 10, attackInterval: 3000, attack: true, health: true, currentHealth: 120 },
  4: { speed: 0.8, maxHealth: 150, attackDamage: 15, attackInterval: 4000, attack: true, heal: true },
  5: { speed: 1.8, maxHealth: 80, attackDamage: 10, attackInterval: 3000, attack: true, stealth: true },
};

const SPRITE_FRAMES = 60;
const SPRITE_COLS = 8;
const SPRITE_FPS = 10;
const FRAME_W = 64;
const FRAME_H = 64;

const MARGIN_TOP = 70;
const MARGIN_BOTTOM_OFFSET = 100;
const MARGIN_SIDE = 10;

export default class UFO extends Sprite {
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
      lastAttackTime: 0,
    };
    this.speed = props.speed;
    this.opacity = 1;

    this.moveAngle = Math.random() * Math.PI * 2;
    this.moveTimer = 0;
    this.moveChangeInterval = 60 + Math.random() * 120;
    this.markAsCloned = function () { this.properties.hasCloned = true; };
  }

  init() {
    this.isActive = true;
    this.visible = true;
    this.opacity = 1;

    const src = `images/jingui${this.mosquitoType}_spritesheet.png`;
    this.img = resloader.get(src);
    if (this.img) {
      this.imgLoaded = true;
      this.anim = new Animation(this.img, FRAME_W, FRAME_H, SPRITE_COLS, SPRITE_FRAMES, SPRITE_FPS);
    } else {
      resloader.loadImage(src).then(img => {
        this.img = img;
        this.imgLoaded = true;
        this.anim = new Animation(img, FRAME_W, FRAME_H, SPRITE_COLS, SPRITE_FRAMES, SPRITE_FPS);
      }).catch(() => {});
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

    // 冲刺状态不移动
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
      this.speedModifier = Math.min(1, this.speedModifier + 0.005);
    }

    const _db = GameGlobal.databus; const _isBig = _db.selectedCategory === 'mosquito_bigmap';
    const _bw = _isBig ? _db.worldWidth : SCREEN_WIDTH; const _bh = _isBig ? _db.worldHeight : SCREEN_HEIGHT;
    const _ms = _isBig ? 0 : MARGIN_SIDE; const _mtop = _isBig ? 0 : MARGIN_TOP;
    const bottomBound = _bh - (_isBig ? 0 : MARGIN_BOTTOM_OFFSET);
    if (this.x < _ms) { this.x = _ms; this.vx = Math.abs(this.vx) * 0.8; }
    if (this.x + this.width > _bw - _ms) { this.x = _bw - _ms - this.width; this.vx = -Math.abs(this.vx) * 0.8; }
    if (this.y < _mtop) { this.y = _mtop; this.vy = Math.abs(this.vy) * 0.8; }
    if (this.y + this.height > bottomBound) { this.y = bottomBound - this.height; this.vy = -Math.abs(this.vy) * 0.8; }
  }

  render(ctx) {
    if (!this.isActive || !this.visible) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.imgLoaded && this.anim) {
      this.anim.drawToCanvas(ctx, this.x, this.y, this.width, this.height, this.opacity);
    } else {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`G${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
    }

    if (this.properties.currentHealth < this.properties.maxHealth) {
      const barW = this.width;
      const barH = 4;
      const barX = this.x;
      const barY = this.y - 8;
      const hpRatio = this.properties.currentHealth / this.properties.maxHealth;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = hpRatio > 0.5 ? '#4f4' : (hpRatio > 0.25 ? '#ff0' : '#f44');
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
    }

    ctx.restore();
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
}
