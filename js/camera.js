/**
 * camera.js — 大地图相机系统
 */
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './render';

export default class Camera {
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
    // 居中跟随目标
    this.x = targetX - SCREEN_WIDTH / 2;
    this.y = targetY - SCREEN_HEIGHT / 2;
    // 边界约束
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - SCREEN_WIDTH));
    this.y = Math.max(0, Math.min(this.y, this.worldHeight - SCREEN_HEIGHT));
  }

  applyTransform(ctx) {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }

  restoreTransform(ctx) {
    ctx.restore();
  }

  screenToWorld(sx, sy) {
    return { x: sx + this.x, y: sy + this.y };
  }

  worldToScreen(wx, wy) {
    return { x: wx - this.x, y: wy - this.y };
  }

  isVisible(x, y, w, h) {
    return (
      x + w > this.x &&
      x < this.x + SCREEN_WIDTH &&
      y + h > this.y &&
      y < this.y + SCREEN_HEIGHT
    );
  }
}
