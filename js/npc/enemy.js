/**
 * enemy.js — 蚊子（5种变体）
 */
import Sprite from '../base/sprite';
import Animation from '../base/animatoin';
import resloader from '../resloader';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

// 蚊子属性配置
const MOSQUITO_PROPS = {
  1: { speed: 1.5, maxHealth: 80, attackDamage: 10, attackInterval: 3000, attack: true, label: '普通蚊' },
  2: { speed: 1.2, maxHealth: 120, attackDamage: 15, attackInterval: 4000, attack: true, clone: true, hasCloned: false, label: '分身蚊' },
  3: { speed: 1.8, maxHealth: 200, attackDamage: 8, attackInterval: 2500, attack: true, health: true, currentHealth: 200, maxHealth: 200, label: '厚血蚊' },
  4: { speed: 1.0, maxHealth: 100, attackDamage: 12, attackInterval: 5000, attack: true, heal: true, label: '治疗蚊' },
  5: { speed: 2.0, maxHealth: 60, attackDamage: 10, attackInterval: 3500, attack: true, stealth: true, label: '隐身蚊' },
};

const SPRITE_FRAMES = 60;
const SPRITE_COLS = 8;
const SPRITE_FPS = 12;
const FRAME_W = 64;
const FRAME_H = 64;

// 活动区间
const MARGIN_TOP = 70;
const MARGIN_BOTTOM_OFFSET = 100;
const MARGIN_SIDE = 10;

export default class Enemy extends Sprite {
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

    // 属性系统
    const props = MOSQUITO_PROPS[mosquitoType] || MOSQUITO_PROPS[1];
    this.properties = {
      ...props,
      currentHealth: props.health ? props.maxHealth : props.maxHealth,
      lastAttackTime: 0,
    };
    this.speed = props.speed;
    this.opacity = 1;

    // 运动相关
    this.moveAngle = Math.random() * Math.PI * 2;
    this.moveTimer = 0;
    this.moveChangeInterval = 60 + Math.random() * 120;

    // 分身标记
    this.markAsCloned = function () { this.properties.hasCloned = true; };
  }

  init() {
    this.isActive = true;
    this.visible = true;
    this.opacity = 1;

    // 加载精灵表
    const src = `images/wenzi${this.mosquitoType}_spritesheet.png`;
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

    // 随机位置
    this.x = MARGIN_SIDE + Math.random() * (SCREEN_WIDTH - this.width - MARGIN_SIDE * 2);
    this.y = MARGIN_TOP + Math.random() * (SCREEN_HEIGHT - this.height - MARGIN_TOP - MARGIN_BOTTOM_OFFSET);

    // 随机速度方向
    this.moveAngle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(this.moveAngle) * this.speed;
    this.vy = Math.sin(this.moveAngle) * this.speed;
  }

  update() {
    if (!this.isActive) return;

    // 更新动画
    if (this.anim) this.anim.update();

    // 运动
    this.moveTimer++;
    if (this.moveTimer >= this.moveChangeInterval) {
      this.moveTimer = 0;
      this.moveChangeInterval = 60 + Math.random() * 120;
      this.moveAngle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.moveAngle) * this.speed;
      this.vy = Math.sin(this.moveAngle) * this.speed;
    }

    // 应用速度修改器
    const speedMod = this.speedModifier || 1;
    this.x += this.vx * speedMod;
    this.y += this.vy * speedMod;

    // 重置速度修改器
    if (this.speedModifier && this.speedModifier < 1) {
      this.speedModifier = Math.min(1, this.speedModifier + 0.005);
    }

    // 活动区间约束 + 柔和反弹
    const databus = GameGlobal.databus;
    const isBigmap = databus.selectedCategory === 'mosquito_bigmap';
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

  render(ctx) {
    if (!this.isActive || !this.visible) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.imgLoaded && this.anim) {
      this.anim.drawToCanvas(ctx, this.x, this.y, this.width, this.height, this.opacity);
    } else {
      // Fallback: 绘制简单图形
      ctx.fillStyle = '#FF6B35';
      ctx.beginPath();
      ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.mosquitoType}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
    }

    // 血条
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
}
