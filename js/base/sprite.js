/**
 * sprite.js — 精灵基类
 */
export default class Sprite {
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

  init() {}

  update() {}

  render(ctx) {}

  isCollide(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}
