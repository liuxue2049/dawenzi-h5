/**
 * databus.js — 全局状态管理
 */
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './render';
import Camera from './camera';

export default class DataBus {
  constructor() {
    this.reset();
    this.gamePhase = 'bottle_select'; // bottle_select | playing | category_complete
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

    // 玩家状态
    this.playerHealth = 100;
    this.maxPlayerHealth = 100;

    // 防御罩
    this.hasShield = false;
    this.shieldHP = 0;
    this.maxShieldHP = 0;
    this.shieldCooldown = false;
    this.shieldCooldownTimer = 0;

    // 武器系统
    this.selectedWeapon = 'normal'; // normal | shotgun | laser
    this.shotgunTier = 0;
    this.hasTrackingMissile = false;
    this.hasLaser = false;
    this.laserTier = 0;
    this.hasBomb = false;
    this.bombCounter = 0;

    // 电力
    this.power = 100;
    this.maxPower = 100;

    // 大招
    this.ultimateCharge = 0;
    this.shotCount = 0;

    // 粘液冻结
    this.turretFrozen = false;
    this.turretFrozenTimer = 0;

    // 玩家中心坐标
    this.playerCenterX = 0;
    this.playerCenterY = 0;

    // 恢复保存的 category
    this.selectedCategory = savedCategory || null;
    this.currentBottle = savedBottle || null;
    this.gamePhase = savedPhase || 'bottle_select';
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
      maxPower: 100,
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
    if (this.selectedCategory === 'mosquito_bigmap' && this.bigmapState) {
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
    const colors = ['#FF4444', '#FF8800', '#FFDD00', '#FF6600', '#FF0000'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.explosions.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  /**
   * 初始化开放数据域（排行榜）
   */
  initOpenDataContext() {
    // H5 模拟：不需要真实开放数据域
  }

  /**
   * 显示排行榜
   */
  showLeaderboard(callback) {
    // H5 模拟
    if (callback) callback();
  }

  /**
   * 标记瓶子通关
   */
  completeBottle(bottleId) {
    try {
      const progress = wx.getStorageSync('bottle_progress') || {};
      progress[bottleId] = true;
      wx.setStorageSync('bottle_progress', progress);
    } catch (e) { /* ignore */ }
  }

  /**
   * 获取已通关瓶子
   */
  getCompletedBottles() {
    try {
      return wx.getStorageSync('bottle_progress') || {};
    } catch (e) {
      return {};
    }
  }
}
