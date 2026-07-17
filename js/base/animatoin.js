/**
 * animatoin.js — 帧动画系统
 */
export default class Animation {
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

  update(dt = 1000 / 60) {
    if (!this.isPlaying) return;
    this.elapsed += dt;
    const frameDuration = 1000 / this.fps;
    if (this.elapsed >= frameDuration) {
      this.elapsed -= frameDuration;
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
    }
  }

  drawToCanvas(ctx, x, y, w, h, opacity = 1) {
    if (!this.img || !this.img.complete || !this.img.naturalWidth) return;
    const col = this.currentFrame % this.cols;
    const row = Math.floor(this.currentFrame / this.cols);
    const sx = col * this.frameW;
    const sy = row * this.frameH;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(
      this.img,
      sx, sy, this.frameW, this.frameH,
      x, y, w || this.frameW, h || this.frameH
    );
    ctx.restore();
  }

  reset() {
    this.currentFrame = 0;
    this.elapsed = 0;
    this.isPlaying = true;
  }
}
