/**
 * 玩家类 —— 炮台模式 + 大地图testBall模式 + 虚拟摇杆
 */
import Bullet from './bullet';
import Animation from '../base/animatoin';
import Missile from './missile';
import Laser from './laser';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

export default class Player {
  constructor() {
    this.x = SCREEN_WIDTH / 2 - 40; this.y = SCREEN_HEIGHT - 60;
    this.width = 80; this.height = 45;
    this.barrelLength = 50; this.barrelWidth = 18;
    this.angle = -Math.PI / 2; this.targetAngle = -Math.PI / 2;
    this.isAiming = false;
    this.testBall = { x: 0, y: 0, r: 18, vx: 0, vy: 0, speed: 4 };
    this.bullets = []; this.missiles = []; this.lasers = [];
    this.bulletDamage = 20; this.missileDamage = 80; this.laserDamage = 100;
    this._lastShoot = 0; this._shootCD = 250;
    this._joystick = { active: false, touchId: -1, baseX: 0, baseY: 0, curX: 0, curY: 0, dx: 0, dy: 0 };
    this._joystickRadius = 50; this._stickRadius = 20;
    this.ultimates = []; this.shotCount = 0;
    this.shieldActive = false; this.shieldCooldown = false; this.shieldCooldownTimer = 0;
    this.shieldPower = 0.3; this._shieldDuration = 0; this._shieldMaxDuration = 180;
    this.invincibleTimer = 0;
    this.isBigmap = false;
    this._ballAnim = null;
    this._ballImg = null;
    this._ballFw = 0;
    this._ballFh = 0;
    this._autoFire = false;
    this._joyTouchId = -1;
    // 固定摇杆（左上角）
    this._joystickBase = { x: 80, y: 100, r: 50 };
    // 按钮定义（左下角）
    this._fireBtn = { x: 80, y: SCREEN_HEIGHT - 80, r: 35 };
    this._shieldBtn = { x: 210, y: SCREEN_HEIGHT - 150, r: 25 };
    const resloader = require("../resloader").default;
    const img = resloader.getImage("images/testball_spritesheet.png");
    if (img) { this._ballImg = img; this._ballFw = Math.floor(img.naturalWidth / 8); this._ballFh = Math.floor(img.naturalHeight / 8); this._ballAnim = new Animation(img, this._ballFw, this._ballFh, 8, 60, 6); }
    else { resloader.loadImage("images/testball_spritesheet.png").then(i => { if(i){ this._ballImg = i; this._ballFw = Math.floor(i.naturalWidth / 8); this._ballFh = Math.floor(i.naturalHeight / 8); this._ballAnim = new Animation(i, this._ballFw, this._ballFh, 8, 60, 6); }}).catch(()=>{}); } this._autoFireTimer = null;
  }

  init() {
    this.x = SCREEN_WIDTH / 2 - 40; this.y = SCREEN_HEIGHT - 60;
    this.angle = -Math.PI / 2; this.targetAngle = -Math.PI / 2;
    this.bullets = []; this.missiles = []; this.lasers = []; this.ultimates = [];
    this.isAiming = false; this.shotCount = 0;
    this.shieldActive = false; this.shieldCooldown = false; this.shieldCooldownTimer = 0;
    this.invincibleTimer = 0;
  }

  initBigmap() {
    this.isBigmap = true;
    this.testBall.x = SCREEN_WIDTH * 6; this.testBall.y = SCREEN_HEIGHT * 6;
    this.testBall.vx = 0; this.testBall.vy = 0;
    this.bullets = []; this.missiles = []; this.lasers = []; this.ultimates = [];
    this._autoFire = false;
  }

  handleTouchStart(e) {
    if (!this.isBigmap) {
      const t = e.touches[0]; this.isAiming = true; this._updateAngle(t.clientX, t.clientY); return;
    }
    const j = this._joystick;
    const jb = this._joystickBase;
    // 1. 先检查所有手指是否点到底部按钮（按钮优先）
    let hitButton = false;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      // 射击按钮
      const fd = Math.sqrt((t.clientX - this._fireBtn.x) ** 2 + (t.clientY - this._fireBtn.y) ** 2);
      if (fd < this._fireBtn.r + 10) { this._fireBigmap(); hitButton = true; continue; }
      // 护盾按钮
      const sd = Math.sqrt((t.clientX - this._shieldBtn.x) ** 2 + (t.clientY - this._shieldBtn.y) ** 2);
      if (sd < this._shieldBtn.r + 10) { this._activateShield(); hitButton = true; continue; }
    }
    // 2. 再找摇杆手指（必须在固定摇杆区域内，且摇杆未激活，且不在按钮上）
    if (!j.active) {
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        // 排除按钮区域的触摸
        const fd = Math.sqrt((t.clientX - this._fireBtn.x) ** 2 + (t.clientY - this._fireBtn.y) ** 2);
        const sd = Math.sqrt((t.clientX - this._shieldBtn.x) ** 2 + (t.clientY - this._shieldBtn.y) ** 2);
        if (fd < this._fireBtn.r + 10 || sd < this._shieldBtn.r + 10) continue;
        // 检查是否在固定摇杆区域内
        const jd = Math.sqrt((t.clientX - jb.x) ** 2 + (t.clientY - jb.y) ** 2);
        if (jd < jb.r + 20) {
          j.active = true; j.touchId = t.identifier;
          j.baseX = jb.x; j.baseY = jb.y;
          j.curX = t.clientX; j.curY = t.clientY;
          j.dx = 0; j.dy = 0; break;
        }
      }
    }
  }
  handleTouchMove(e) {
    if (!this.isBigmap) {
      if (!this.isAiming) return; const t = e.touches[0]; this._updateAngle(t.clientX, t.clientY); return;
    }
    const j = this._joystick; if (!j.active) return;
    // 只跟踪摇杆手指
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      if (t.identifier === j.touchId) {
        j.curX = t.clientX; j.curY = t.clientY;
        let dx = j.curX - j.baseX, dy = j.curY - j.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > this._joystickRadius) { dx = dx / dist * this._joystickRadius; dy = dy / dist * this._joystickRadius; }
        j.dx = dx / this._joystickRadius; j.dy = dy / this._joystickRadius;
        break;
      }
    }
  }
  handleTouchEnd(e) {
    if (!this.isBigmap) { this.isAiming = false; return; }
    const j = this._joystick;
    // 检查松开的 finger 是否是摇杆手指
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === j.touchId) {
        j.active = false; j.touchId = -1; j.dx = 0; j.dy = 0;
      }
    }
    // 如果还有其他手指在屏幕上，保持 autoFire 状态由后续 touchStart 控制
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
    databus.enemys.forEach(e => {
      if (!e || !e.visible) return;
      const ex = e.x + (e.width || 0) / 2, ey = e.y + (e.height || 0) / 2;
      const d = Math.sqrt((ex - this.testBall.x) ** 2 + (ey - this.testBall.y) ** 2);
      if (d < minDist) { minDist = d; nearest = { x: ex, y: ey, dist: d }; }
    });
    this._aimTarget = nearest;
    if (nearest) return Math.atan2(nearest.y - this.testBall.y, nearest.x - this.testBall.x);
    return null;
  }

  _fireBigmap() {
    const databus = GameGlobal.databus; const s = databus.activeState();
    if (s.power < 5) return; s.power -= 5;
    const angle = this._getBigmapAimAngle();
    if (angle === null) return;
    const b = new Bullet(); b.init(this.testBall.x, this.testBall.y, angle, this.bulletDamage);
    databus.bullets.push(b);
  }

  _activateShield() {
    if (this.shieldActive) return;
    this.shieldActive = true;
  }

  shoot(damage) {
    const mx = this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength;
    const my = this.y + Math.sin(this.angle) * this.barrelLength;
    const b = new Bullet(); b.init(mx, my, this.angle, damage || this.bulletDamage); this.bullets.push(b);
    this.shotCount++; return b;
  }
  shootSpread(count, damage) {
    const mx = this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength;
    const my = this.y + Math.sin(this.angle) * this.barrelLength;
    const sa = Math.PI / 8, start = this.angle - (sa * (count - 1)) / 2;
    for (let i = 0; i < count; i++) { const b = new Bullet(); b.init(mx, my, start + i * sa, damage || this.bulletDamage); this.bullets.push(b); }
    this.shotCount += count;
  }
  fireMissile(target, damage) {
    const mx = this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength;
    const my = this.y + Math.sin(this.angle) * this.barrelLength;
    const m = new Missile(); m.init(mx, my, target, damage || this.missileDamage); this.missiles.push(m); return m;
  }
  fireLaser(damage) {
    const mx = this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength;
    const my = this.y + Math.sin(this.angle) * this.barrelLength;
    const l = new Laser(); l.init(mx, my, this.angle, damage || this.laserDamage); this.lasers.push(l); return l;
  }

  update() {
    const databus = GameGlobal.databus;
    if (this.isBigmap) {
      const j = this._joystick; const s = databus.activeState();
      this.testBall.x += j.dx * this.testBall.speed;
      this.testBall.y += j.dy * this.testBall.speed;
      this.testBall.x = Math.max(this.testBall.r, Math.min(databus.worldWidth - this.testBall.r, this.testBall.x));
      this.testBall.y = Math.max(this.testBall.r, Math.min(databus.worldHeight - this.testBall.r, this.testBall.y));
      databus.camera.follow(this.testBall.x, this.testBall.y);
      // 护盾不再有持续时间，被攻击才破碎
    } else {
      let diff = this.targetAngle - this.angle; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
      this.angle += diff * 0.15;
    }
    this.bullets.forEach(b => b.update()); this.bullets = this.bullets.filter(b => b.visible);
    this.missiles.forEach(m => m.update()); this.missiles = this.missiles.filter(m => m.visible);
    this.lasers.forEach(l => l.update()); this.lasers = this.lasers.filter(l => l.isActive);
    this.ultimates.forEach(u => u.update()); this.ultimates = this.ultimates.filter(u => u.active);
    if (this.shieldCooldown && this.shieldCooldownTimer > 0) { this.shieldCooldownTimer--; if (this.shieldCooldownTimer <= 0) this.shieldCooldown = false; }
    if (this.invincibleTimer > 0) this.invincibleTimer--;
  }

  render(ctx) {
    const databus = GameGlobal.databus;
    if (this.isBigmap) { this.renderWorld(ctx); this.renderUI(ctx); return; }
    ctx.save();
    const bx = this.x + this.width / 2, by = this.y;
    const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
    grad.addColorStop(0, '#555'); grad.addColorStop(0.5, '#777'); grad.addColorStop(1, '#555');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(this.x, this.y, this.width, this.height, [12, 12, 4, 4]); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(bx, by); ctx.rotate(this.angle);
    const bg = ctx.createLinearGradient(0, -this.barrelWidth / 2, this.barrelLength, this.barrelWidth / 2);
    bg.addColorStop(0, '#444'); bg.addColorStop(0.5, '#666'); bg.addColorStop(1, '#444');
    ctx.fillStyle = bg; ctx.fillRect(0, -this.barrelWidth / 2, this.barrelLength, this.barrelWidth);
    ctx.fillStyle = '#333'; ctx.fillRect(this.barrelLength - 5, -12, 18, 24);
    ctx.restore();
    ['#FFD700', '#FFA500', '#FF8C00'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bx - 15 + i * 15, by + this.height + 8, 5, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
    if (this.shieldActive) { ctx.save(); ctx.strokeStyle = `rgba(100,180,255,${0.4 + Math.sin(Date.now() / 200) * 0.2})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx, by, 40, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    this.bullets.forEach(b => b.render(ctx)); this.missiles.forEach(m => m.render(ctx)); this.lasers.forEach(l => l.render(ctx));
    this.ultimates.forEach(u => u.render(ctx));
  }

  renderWorld(ctx) {
    const sp = this.testBall;
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) return;
    ctx.save();
    if (this._ballImg && this._ballAnim) {
      this._ballAnim.update();
      const sz = this.testBall.r * 2.5;
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(Math.PI / 2);
      this._ballAnim.drawToCanvas(ctx, -sz / 2, -sz / 2, sz, sz);
      ctx.restore();
    } else {
      ctx.fillStyle = '#4FC3F7'; ctx.beginPath(); ctx.arc(sp.x, sp.y, this.testBall.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0288D1'; ctx.lineWidth = 2; ctx.stroke();
    }
    // 护盾在精灵之后、外层ctx.restore()之前绘制，使用世界坐标
    if (this.shieldActive) {
      const shieldRadius = this.testBall.r + 25;
      const pulse = Math.sin(Date.now() / 120) * 0.15;
      ctx.save();
      ctx.shadowColor = '#2196F3'; ctx.shadowBlur = 25;
      ctx.strokeStyle = `rgba(33,150,243,${0.9 + pulse})`; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, shieldRadius, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(100,180,255,${0.25 + pulse * 0.4})`;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, shieldRadius, 0, Math.PI * 2); ctx.fill();
      const rot = Date.now() / 500;
      ctx.strokeStyle = `rgba(255,255,255,${0.6 + pulse})`; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const a = rot + i * Math.PI / 2;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, shieldRadius - 4, a, a + 0.5); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  renderUI(ctx) {
    if (!this.isBigmap) return;
    const j = this._joystick;
    const jb = this._joystickBase;
    // 固定摇杆底座（始终可见）
    ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(jb.x, jb.y, jb.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.4; ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(jb.x, jb.y, jb.r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    // 摇杆旋钮（激活时显示）
    if (j.active) {
      const hx = j.baseX + j.dx * this._joystickRadius, hy = j.baseY + j.dy * this._joystickRadius;
      ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(hx, hy, this._stickRadius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    // 射击按钮
    const fb = this._fireBtn;
    ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = '#f44336'; ctx.beginPath(); ctx.arc(fb.x, fb.y, fb.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(fb.x, fb.y); ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; ctx.fillText('射击', 0, 5);
    ctx.restore();
    // 护盾按钮
    const sb = this._shieldBtn;
    ctx.save(); ctx.globalAlpha = this.shieldActive ? 0.6 : 0.4; ctx.fillStyle = '#2196F3'; ctx.beginPath(); ctx.arc(sb.x, sb.y, sb.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(sb.x, sb.y); ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#FFF'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.fillText('护盾', 0, 4);
    ctx.restore();
    // 瞄准方向指示线（需转换到屏幕坐标）
    if (this._aimTarget) {
      const databus = GameGlobal.databus;
      const cam = databus.camera;
      const sp = cam.worldToScreen(this.testBall.x, this.testBall.y);
      const angle = Math.atan2(this._aimTarget.y - this.testBall.y, this._aimTarget.x - this.testBall.x);
      const lineLen = 50;
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,0,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(sp.x + Math.cos(angle) * lineLen, sp.y + Math.sin(angle) * lineLen);
      ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }
    ctx.textAlign = 'left';
  }

  getMuzzle() { return { x: this.x + this.width / 2 + Math.cos(this.angle) * this.barrelLength, y: this.y + Math.sin(this.angle) * this.barrelLength }; }
}