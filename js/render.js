/**
 * render.js — Canvas 初始化 + 屏幕尺寸
 */

export let SCREEN_WIDTH = window.innerWidth;
export let SCREEN_HEIGHT = window.innerHeight;

export const canvas = window.canvas;
export const ctx = canvas.getContext('2d');

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// Resize handler
GameGlobal.__onResize = (w, h) => {
  SCREEN_WIDTH = w;
  SCREEN_HEIGHT = h;
  canvas.width = w;
  canvas.height = h;
};

export default { canvas, ctx, SCREEN_WIDTH, SCREEN_HEIGHT };
