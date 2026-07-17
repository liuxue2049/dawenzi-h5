/**
 * 游戏UI —— 瓶子选择 + 游戏HUD + 结算 + 水晶球奖励
 */
import TinyEmitter from '../libs/tinyemitter';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import resloader from '../resloader';

const BOTTLE_CONFIG = {
  1:{name:'蚊子瓶',category:'mosquito',icon:'images/tiaozhan1.png',desc:'经典蚊子'},
  2:{name:'金龟子瓶',category:'ufo',icon:'images/tiaozhan2.png',desc:'激光金龟子'},
  3:{name:'飞甲瓶',category:'zone3',icon:'images/tiaozhan3.png',desc:'飞甲虫'},
  4:{name:'甲虫瓶',category:'zone4',icon:'images/tiaozhan4.png',desc:'厚甲防御'},
  5:{name:'瓢虫瓶',category:'zone5',icon:'images/tiaozhan5.png',desc:'快速瓢虫'},
  6:{name:'古道瓶',category:'zone6',icon:'images/tiaozhan6.png',desc:'古道昆虫'},
  7:{name:'萤火虫瓶',category:'zone7',icon:'images/tiaozhan7.png',desc:'发光萤火虫'},
  8:{name:'蜻蜓瓶',category:'zone8',icon:'images/tiaozhan8.png',desc:'环绕蜻蜓'},
  9:{name:'蝶瓶',category:'zone9',icon:'images/tiaozhan9.png',desc:'波浪蝶'},
  10:{name:'大地图',category:'mosquito_bigmap',icon:'images/tiaozhan.png',desc:'自由探索'},
};

export default class GameInfo extends TinyEmitter {
  constructor() { super();this._bottleBtns=[];this._oceanOff=0;this._crystalState=null;this._bottleScrollY=0;this._scrollTouchY=null;this._hasScrolled=false; }

  render(ctx, databus) {
    if (databus.gamePhase === 'bottle_select') { this._renderBottleSelect(ctx); return; }
    this._renderGameHUD(ctx, databus);
    databus.enemys.forEach(e => { if (e.visible) e.render ? e.render(ctx) : e.drawToCanvas && e.drawToCanvas(ctx); });
    if (databus.isShowManual) this._renderManual(ctx);
    if (databus.isShowPedia) { const {renderPedia} = require('./pedia'); renderPedia(ctx, databus); }
    if (databus.isGameOver) this._renderGameOver(ctx, databus);
    if (databus.gamePhase === 'category_complete') this._renderCategoryComplete(ctx, databus);
  }

  _renderBottleSelect(ctx) {
    this._oceanOff += 0.02;
    const g = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    g.addColorStop(0, '#1a237e'); g.addColorStop(0.5, '#0d47a1'); g.addColorStop(1, '#01579b');
    ctx.fillStyle = g; ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); for (let x = 0; x <= SCREEN_WIDTH; x += 10) { const y = SCREEN_HEIGHT * 0.3 + i * 80 + Math.sin(x * 0.01 + this._oceanOff + i) * 20; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'center'; ctx.fillText('🌊 选择生态瓶', SCREEN_WIDTH / 2, 50);
    const cols = 3, px = 20, py = 10, cw = (SCREEN_WIDTH - px * (cols + 1)) / cols, ch = cw * 1.2, sy = 80;
    // 计算内容高度并限制滚动范围
    const totalRows = Math.ceil(Object.keys(BOTTLE_CONFIG).length / cols);
    const contentBottom = sy + totalRows * (ch + py);
    const maxScroll = Math.max(0, contentBottom - SCREEN_HEIGHT + 20);
    this._bottleScrollY = Math.max(0, Math.min(this._bottleScrollY, maxScroll));
    this._bottleBtns = [];
    Object.entries(BOTTLE_CONFIG).forEach(([id, cfg], idx) => {
      const col = idx % cols, row = Math.floor(idx / cols), x = px + col * (cw + px), y = sy + row * (ch + py) - this._bottleScrollY;
      if (y + ch < 0 || y > SCREEN_HEIGHT) return; // 跳过不可见行
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 10); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
      const img = resloader.getImage(cfg.icon);
      if (img) { const sz = Math.min(cw * 0.5, ch * 0.4); ctx.drawImage(img, x + (cw - sz) / 2, y + ch * 0.05, sz, sz); }
      else { ctx.fillStyle = '#FFF'; ctx.font = `${cw * 0.3}px Arial`; ctx.fillText('?', x + cw / 2, y + ch * 0.35); }
      ctx.fillStyle = '#FFF'; ctx.font = `bold ${Math.max(12, cw * 0.12)}px Arial`; ctx.fillText(cfg.name, x + cw / 2, y + ch * 0.6);
      ctx.fillStyle = '#CCC'; ctx.font = `${Math.max(10, cw * 0.09)}px Arial`; ctx.fillText(cfg.desc, x + cw / 2, y + ch * 0.78);
      this._bottleBtns.push({ x, y, w: cw, h: ch, bottleId: parseInt(id), category: cfg.category });
    });
    // 滚动指示器
    if (maxScroll > 0) {
      const scrollRatio = this._bottleScrollY / maxScroll;
      const barH = 40, barY = 80 + (SCREEN_HEIGHT - 100 - barH) * scrollRatio;
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.roundRect(SCREEN_WIDTH - 8, barY, 4, barH, 2); ctx.fill();
    }
    ctx.textAlign = 'left';
  }

  handleBottleTouch(x, y) {
    // 点击坐标需要加上滚动偏移，因为瓶子渲染时y减去了scrollY
    const adjustedY = y + this._bottleScrollY;
    for (const b of this._bottleBtns) { if (x >= b.x && x <= b.x + b.w && adjustedY >= b.y && adjustedY <= b.y + b.h) return b; }
    return null;
  }

  handleBottleScrollStart(y) {
    this._scrollTouchY = y;
    this._hasScrolled = false;
  }

  handleBottleScrollMove(y) {
    if (this._scrollTouchY === null) return;
    const dy = this._scrollTouchY - y;
    if (Math.abs(dy) > 5) this._hasScrolled = true;
    this._bottleScrollY += dy;
    this._scrollTouchY = y;
  }

  handleBottleScrollEnd() {
    this._scrollTouchY = null;
  }

  _renderGameHUD(ctx, d) {
    const isBigmap = d.selectedCategory === 'mosquito_bigmap';
    if (!isBigmap) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, SCREEN_WIDTH, 70);
      const p = 10, bw = 100, bh = 10;
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'left';
      ctx.fillText('等级', p, 20); ctx.fillStyle = '#2196F3'; ctx.font = 'bold 18px Arial'; ctx.fillText(`${d.level}`, p + 35, 20);
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 14px Arial'; ctx.fillText('分数', p + 80, 20);
      ctx.fillStyle = '#4CAF50'; ctx.font = 'bold 16px Arial'; ctx.fillText(`${d.score}`, p + 115, 20);
      ctx.fillStyle = '#FF9800'; ctx.font = '12px Arial'; ctx.fillText(`/${d.highScore}`, p + 160, 20);
      ctx.fillStyle = '#FFF'; ctx.font = '12px Arial'; ctx.fillText(`击杀:${d.killCount||0}`, p + 220, 20);
      const s = d.activeState();
      this._bar(ctx, p + 22, 32, bw, bh, s.playerHealth / s.maxPlayerHealth, '#f44336', '#ff5722');
      ctx.fillStyle = '#FFF'; ctx.font = '10px Arial'; ctx.fillText('HP', p, 40);
      this._bar(ctx, p + 28, 48, bw, bh, s.energy / s.maxEnergy, '#2196F3', '#03A9F4');
      ctx.fillStyle = '#FFF'; ctx.fillText('能量', p, 56);
      this._bar(ctx, p + 28, 64, bw, bh, s.power / s.maxPower, '#4CAF50', '#8BC34A');
      ctx.fillStyle = '#FFF'; ctx.fillText('电力', p, 72);
      const r = s.power / s.maxPower;
      ctx.font = '16px Arial';
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = r >= (i + 1) / 3 ? 1 : 0.2; ctx.fillText('🚀', p + 140 + i * 22, 72); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#f0f0f0'; ctx.fillRect(SCREEN_WIDTH - 90, 10, 35, 28); ctx.fillStyle = '#333'; ctx.font = '14px Arial'; ctx.textAlign = 'center'; ctx.fillText('📖', SCREEN_WIDTH - 72, 29);
      ctx.textAlign = 'left';
      return;
    }
    const s = d.activeState();
    const p = SCREEN_WIDTH - 110, bw = 90, bh = 12;
    this._bar(ctx, p + 20, SCREEN_HEIGHT - 35, bw, bh, s.playerHealth / s.maxPlayerHealth, '#f44336', '#ff5722');
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'right';
    ctx.fillText('HP', p, SCREEN_HEIGHT - 25);
    ctx.textAlign = 'left';
    this._renderMinimap(ctx, d);
  }

  _renderMinimap(ctx, d) {
    const mw = 120, mh = 120, mx = SCREEN_WIDTH - mw - 10, my = 10;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.roundRect(mx, my, mw, mh, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    const ww = d.worldWidth || SCREEN_WIDTH * 12;
    const wh = d.worldHeight || SCREEN_HEIGHT * 12;
    const cx = d.camera ? d.camera.x : ww / 2;
    const cy = d.camera ? d.camera.y : wh / 2;
    const px = d.playerCenterX || cx;
    const py = d.playerCenterY || cy;
    const scaleX = mw / ww;
    const scaleY = mh / wh;
    const camW = SCREEN_WIDTH;
    const camH = SCREEN_HEIGHT;
    const camX = (cx - camW / 2) * scaleX;
    const camY = (cy - camH / 2) * scaleY;
    const camWScaled = camW * scaleX;
    const camHScaled = camH * scaleY;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(mx + camX, my + camY, camWScaled, camHScaled);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
    ctx.strokeRect(mx + camX, my + camY, camWScaled, camHScaled);
    const playerMapX = mx + px * scaleX;
    const playerMapY = my + py * scaleY;
    ctx.fillStyle = '#4FC3F7';
    ctx.beginPath(); ctx.arc(playerMapX, playerMapY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FFF'; ctx.lineWidth = 1; ctx.stroke();
    if (d.enemys) {
      d.enemys.forEach(e => {
        if (!e.isActive) return;
        const ex = e.x || 0, ey = e.y || 0;
        const enemyMapX = mx + ex * scaleX;
        const enemyMapY = my + ey * scaleY;
        ctx.fillStyle = '#f44336';
        ctx.beginPath(); ctx.arc(enemyMapX, enemyMapY, 3, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.restore();
  }

  _bar(ctx, x, y, w, h, ratio, c1, c2) {
    ctx.fillStyle = '#333'; ctx.fillRect(x, y, w, h);
    const g = ctx.createLinearGradient(x, y, x + w, y); g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), h);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  }

  _renderGameOver(ctx, d) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center';
    ctx.fillText(d.gameOverReason === 'win' ? '🎉 全部消灭！' : '💀 游戏结束', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 60);
    ctx.font = '18px Arial'; ctx.fillText(`得分: ${d.score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);
    ctx.fillText(`最高分: ${d.highScore}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 10);
    const bw = 160, bh = 45, bx = (SCREEN_WIDTH - bw) / 2, by = SCREEN_HEIGHT / 2 + 40;
    ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 10); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 18px Arial'; ctx.fillText('重新开始', SCREEN_WIDTH / 2, by + 30);
    if (d.gameOverReason !== 'win') {
      const ry = by + 60; ctx.fillStyle = '#FF9800'; ctx.beginPath(); ctx.roundRect(bx, ry, bw, bh, 10); ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.fillText('看广告复活', SCREEN_WIDTH / 2, ry + 30);
    }
    ctx.textAlign = 'left';
  }

  _renderCategoryComplete(ctx, d) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center';
    ctx.fillText('🏆 通关！', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 60);
    ctx.font = '18px Arial'; ctx.fillText(`最终得分: ${d.score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);
    const bw = 160, bh = 45, bx = (SCREEN_WIDTH - bw) / 2, by = SCREEN_HEIGHT / 2 + 20;
    ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 10); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 18px Arial'; ctx.fillText('再来一次', SCREEN_WIDTH / 2, by + 30);
    const by2 = by + 60; ctx.fillStyle = '#2196F3'; ctx.beginPath(); ctx.roundRect(bx, by2, bw, bh, 10); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.fillText('返回瓶子', SCREEN_WIDTH / 2, by2 + 30);
    ctx.textAlign = 'left';
  }

  _renderManual(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const mw = SCREEN_WIDTH * 0.85, mh = SCREEN_HEIGHT * 0.7, mx = (SCREEN_WIDTH - mw) / 2, my = (SCREEN_HEIGHT - mh) / 2;
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.roundRect(mx, my, mw, mh, 10); ctx.fill();
    ctx.fillStyle = '#333'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center'; ctx.fillText('游戏说明书', SCREEN_WIDTH / 2, my + 30);
    const lines = ['【操作说明】', '• 拖动：转动炮筒瞄准', '• 单击：发射炮弹', '• 长按：发射激光', '• 点击蚊子：发射追踪弹', '', '【大地图模式】', '• 左上摇杆：移动', '• 右半边：射击', '• 左下护盾按钮：激活护盾'];
    ctx.font = '13px Arial'; ctx.textAlign = 'left'; let ty = my + 60;
    lines.forEach(l => { ctx.fillText(l, mx + 20, ty); ty += 20; });
    ctx.fillStyle = '#f44336'; ctx.beginPath(); ctx.arc(mx + mw - 20, my + 20, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center'; ctx.fillText('×', mx + mw - 20, my + 26); ctx.textAlign = 'left';
  }

  showCrystalBallReward(level, callback) {
    this._crystalState = { level, callback, phase: 'enter', startTime: Date.now(), ballY: -200, targetY: SCREEN_HEIGHT * 0.35, opened: false };
  }

  updateCrystalBall(ctx) {
    const cs = this._crystalState; if (!cs) return false;
    const elapsed = Date.now() - cs.startTime;
    if (cs.phase === 'enter') {
      cs.ballY = Math.min(cs.targetY, cs.ballY + (cs.targetY - cs.ballY) * 0.08);
      if (Math.abs(cs.ballY - cs.targetY) < 2) cs.phase = 'wait';
    }
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const cx = SCREEN_WIDTH / 2, r = 60;
    const glow = 0.3 + Math.sin(Date.now() / 300) * 0.2;
    ctx.save(); ctx.globalAlpha = glow; ctx.fillStyle = 'rgba(100,180,255,0.4)'; ctx.beginPath(); ctx.arc(cx, cs.ballY, r + 20, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const grad = ctx.createRadialGradient(cx - 15, cs.ballY - 15, 5, cx, cs.ballY, r);
    grad.addColorStop(0, 'rgba(180,220,255,0.9)'); grad.addColorStop(0.5, 'rgba(80,140,220,0.7)'); grad.addColorStop(1, 'rgba(30,70,150,0.9)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cs.ballY, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
    ctx.fillText(`第${cs.level}关通关！`, cx, cs.ballY - 10);
    ctx.font = '14px Arial'; ctx.fillText('点击水晶球领取奖励', cx, cs.ballY + 15);
    ctx.textAlign = 'left';
    return true;
  }

  handleCrystalTouch(x, y) {
    const cs = this._crystalState; if (!cs || cs.phase !== 'wait') return false;
    const cx = SCREEN_WIDTH / 2, dx = x - cx, dy = y - cs.ballY;
    if (Math.sqrt(dx * dx + dy * dy) < 70) {
      cs.opened = true; this._crystalState = null;
      if (cs.callback) cs.callback();
      return true;
    }
    return false;
  }

  handleTouch(x, y, d) {
    if (x >= SCREEN_WIDTH - 90 && x <= SCREEN_WIDTH - 55 && y >= 10 && y <= 38) { d.isShowManual = !d.isShowManual; return 'manual'; }
    if (d.isShowManual) {
      const mw = SCREEN_WIDTH * 0.85, mh = SCREEN_HEIGHT * 0.7, mx = (SCREEN_WIDTH - mw) / 2, my = (SCREEN_HEIGHT - mh) / 2;
      if (Math.sqrt((x - mx - mw + 20) ** 2 + (y - my - 20) ** 2) < 15) { d.isShowManual = false; return 'closeManual'; }
    }
    if (d.isGameOver) {
      const bw = 160, bh = 45, bx = (SCREEN_WIDTH - bw) / 2, by = SCREEN_HEIGHT / 2 + 40;
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) { this.emit('restart'); return 'restart'; }
      const ry = by + 60;
      if (x >= bx && x <= bx + bw && y >= ry && y <= ry + bh) { this.emit('revive'); return 'revive'; }
    }
    if (d.gamePhase === 'category_complete') {
      const bw = 160, bh = 45, bx = (SCREEN_WIDTH - bw) / 2, by = SCREEN_HEIGHT / 2 + 20;
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) { this.emit('categoryRestart'); return 'categoryRestart'; }
      const by2 = by + 60;
      if (x >= bx && x <= bx + bw && y >= by2 && y <= by2 + bh) { this.emit('backToBottleSelect'); return 'backToBottleSelect'; }
    }
    return null;
  }
}