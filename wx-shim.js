/**
 * wx-shim.js — 微信小游戏 API → 浏览器兼容层
 * 模拟 wx.* 系列 API，让微信小游戏代码在浏览器中运行
 */

(function () {
  'use strict';

  // ── GameGlobal ──
  window.GameGlobal = window.GameGlobal || {};

  // ── Canvas ──
  const canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.style.display = 'block';
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  canvas.style.margin = '0';
  canvas.style.padding = '0';
  canvas.style.background = '#000';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  window.canvas = canvas;

  // ── wx namespace ──
  const wx = {};

  // createCanvas — 返回同一个 canvas（微信小游戏只有主 canvas）
  wx.createCanvas = function () {
    return canvas;
  };

  // createImage
  wx.createImage = function () {
    return new Image();
  };

  // createInnerAudioContext → HTMLAudioElement
  wx.createInnerAudioContext = function () {
    const audio = new Audio();
    audio.autoplay = false;
    audio.loop = false;
    const ctx = {
      src: '',
      autoplay: false,
      loop: false,
      volume: 1,
      startTime: 0,
      _audio: audio,
      get paused() { return audio.paused; },
      play() { return audio.play().catch(() => {}); },
      pause() { audio.pause(); },
      stop() { audio.pause(); audio.currentTime = 0; },
      seek(s) { audio.currentTime = s; },
      destroy() { audio.pause(); audio.src = ''; },
      onEnded(fn) { audio.addEventListener('ended', fn); },
      offEnded(fn) { audio.removeEventListener('ended', fn); },
      onError(fn) { audio.addEventListener('error', fn); },
      offError(fn) { audio.removeEventListener('error', fn); },
    };
    Object.defineProperty(ctx, 'src', {
      get() { return audio.src; },
      set(v) { audio.src = v; },
    });
    Object.defineProperty(ctx, 'loop', {
      get() { return audio.loop; },
      set(v) { audio.loop = v; },
    });
    Object.defineProperty(ctx, 'volume', {
      get() { return audio.volume; },
      set(v) { audio.volume = v; },
    });
    return ctx;
  };

  // Storage
  wx.getStorageSync = function (key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : '';
    } catch (e) {
      return localStorage.getItem(key) || '';
    }
  };
  wx.setStorageSync = function (key, value) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) { /* ignore */ }
  };
  wx.removeStorageSync = function (key) {
    localStorage.removeItem(key);
  };

  // Window info
  wx.getWindowInfo = function () {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
    };
  };
  wx.getSystemInfoSync = function () {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      platform: 'browser',
      model: navigator.userAgent,
    };
  };

  // Touch events → canvas touch/mouse adapters
  const _touchStartListeners = [];
  const _touchMoveListeners = [];
  const _touchEndListeners = [];
  const _touchCancelListeners = [];

  function wrapTouch(e) {
    const rect = canvas.getBoundingClientRect();
    function toTouchList(list) {
      const result = [];
      if (!list) return result;
      for (let i = 0; i < list.length; i++) {
        const t = list[i];
        result.push({
          identifier: t.identifier || 0,
          clientX: t.clientX - rect.left,
          clientY: t.clientY - rect.top,
          pageX: t.pageX,
          pageY: t.pageY,
        });
      }
      return result;
    }
    return {
      touches: toTouchList(e.touches),
      changedTouches: toTouchList(e.changedTouches),
      timeStamp: e.timeStamp,
    };
  }

  function wrapMouse(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      touches: [{
        identifier: 0,
        clientX: e.clientX - rect.left,
        clientY: e.clientY - rect.top,
        pageX: e.pageX,
        pageY: e.pageY,
      }],
      changedTouches: [{
        identifier: 0,
        clientX: e.clientX - rect.left,
        clientY: e.clientY - rect.top,
        pageX: e.pageX,
        pageY: e.pageY,
      }],
      timeStamp: e.timeStamp,
    };
  }

  // 触摸事件：只绑 document，避免 canvas+document 冒泡导致重复触发
  function bindTouch(el) {
    el.addEventListener('touchstart', (e) => { try { e.preventDefault(); e.stopPropagation(); } catch(x) {} _lastTouchTime = Date.now(); const wrapped = wrapTouch(e); _touchStartListeners.forEach(fn => fn(wrapped)); }, false);
    el.addEventListener('touchmove', (e) => { try { e.preventDefault(); e.stopPropagation(); } catch(x) {} _lastTouchTime = Date.now(); const wrapped = wrapTouch(e); _touchMoveListeners.forEach(fn => fn(wrapped)); }, false);
    el.addEventListener('touchend', (e) => { try { e.preventDefault(); e.stopPropagation(); } catch(x) {} _lastTouchTime = Date.now(); const wrapped = wrapTouch(e); _touchEndListeners.forEach(fn => fn(wrapped)); }, false);
    el.addEventListener('touchcancel', (e) => { try { e.preventDefault(); e.stopPropagation(); } catch(x) {} _lastTouchTime = Date.now(); const wrapped = wrapTouch(e); _touchCancelListeners.forEach(fn => fn(wrapped)); }, false);
  }
  bindTouch(document);

  // Mouse + click fallback (仅桌面端使用，移动端用触摸事件)
  let _mouseDown = false;
  let _lastTouchTime = 0;
  function bindMouse(el) {
    el.addEventListener('mousedown', (e) => {
      // 跳过触摸合成的鼠标事件（300ms内的鼠标事件视为合成）
      if (Date.now() - _lastTouchTime < 500) return;
      _mouseDown = true; const wrapped = wrapMouse(e); _touchStartListeners.forEach(fn => fn(wrapped));
    });
    el.addEventListener('mousemove', (e) => {
      if (!_mouseDown) return;
      if (Date.now() - _lastTouchTime < 500) return;
      const wrapped = wrapMouse(e); _touchMoveListeners.forEach(fn => fn(wrapped));
    });
    el.addEventListener('mouseup', (e) => {
      if (Date.now() - _lastTouchTime < 500) return;
      _mouseDown = false; const wrapped = wrapMouse(e); _touchEndListeners.forEach(fn => fn(wrapped));
    });
    el.addEventListener('click', (e) => {
      if (Date.now() - _lastTouchTime < 500) return;
      const wrapped = wrapMouse(e); _touchEndListeners.forEach(fn => fn(wrapped));
    });
  }
  bindMouse(canvas);
  canvas.addEventListener('mouseleave', (e) => {
    if (_mouseDown) {
      _mouseDown = false;
      const wrapped = wrapMouse(e);
      _touchCancelListeners.forEach(fn => fn(wrapped));
    }
  });

  wx.onTouchStart = function (fn) { _touchStartListeners.push(fn); };
  wx.onTouchMove = function (fn) { _touchMoveListeners.push(fn); };
  wx.onTouchEnd = function (fn) { _touchEndListeners.push(fn); };
  wx.onTouchCancel = function (fn) { _touchCancelListeners.push(fn); };

  // 微信小游戏的 canvas 对象本身有 onTouchStart 等方法，浏览器没有，补上
  canvas.onTouchStart = function (fn) { _touchStartListeners.push(fn); };
  canvas.onTouchMove = function (fn) { _touchMoveListeners.push(fn); };
  canvas.onTouchEnd = function (fn) { _touchEndListeners.push(fn); };
  canvas.onTouchCancel = function (fn) { _touchCancelListeners.push(fn); };

  // Vibration
  wx.vibrateShort = function () {
    if (navigator.vibrate) navigator.vibrate(15);
  };
  wx.vibrateLong = function () {
    if (navigator.vibrate) navigator.vibrate(400);
  };

  // Toast
  wx.showToast = function (opts) {
    const div = document.createElement('div');
    div.textContent = opts.title || '';
    div.style.cssText = 'position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.75);color:#fff;padding:12px 24px;border-radius:8px;font-size:16px;z-index:99999;pointer-events:none;';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), opts.duration || 1500);
  };

  // Modal (confirm dialog)
  wx.showModal = function (opts) {
    const result = window.confirm(opts.content || opts.title || '');
    if (opts.success) opts.success({ confirm: result, cancel: !result });
  };

  // Rewarded video ad → simulated with confirm
  wx.createRewardedVideoAd = function () {
    return {
      show() {
        return new Promise((resolve) => {
          const watched = window.confirm('观看广告可获得奖励（模拟）\n点击"确定"完成观看');
          if (watched) {
            resolve();
          }
        });
      },
      onLoad() {},
      onError() {},
      onClose(fn) { this._closeHandler = fn; },
      offClose() {},
      load() { return Promise.resolve(); },
      destroy() {},
    };
  };

  // Share
  wx.shareAppMessage = function () {};

  // requestAnimationFrame / cancelAnimationFrame (standard)
  wx.requestAnimationFrame = function (fn) {
    return requestAnimationFrame(fn);
  };
  wx.cancelAnimationFrame = function (id) {
    cancelAnimationFrame(id);
  };

  // getOpenDataContext (排行榜模拟)
  wx.getOpenDataContext = function () {
    return {
      canvas: null,
      postMessage() {},
    };
  };

  // setPreferredFramesPerSecond
  wx.setPreferredFramesPerSecond = function () {};

  // Window resize handler
  window.addEventListener('resize', () => {
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Update global screen dimensions
    if (typeof GameGlobal.__onResize === 'function') {
      GameGlobal.__onResize(window.innerWidth, window.innerHeight);
    }
  });

  // Keyboard events (for debug)
  const _keyDownListeners = [];
  const _keyUpListeners = [];
  wx.onKeyDown = function (fn) { _keyDownListeners.push(fn); };
  wx.onKeyUp = function (fn) { _keyUpListeners.push(fn); };
  window.addEventListener('keydown', (e) => {
    _keyDownListeners.forEach(fn => fn({ keyCode: e.keyCode, key: e.key }));
  });
  window.addEventListener('keyup', (e) => {
    _keyUpListeners.forEach(fn => fn({ keyCode: e.keyCode, key: e.key }));
  });

  // Expose wx globally
  window.wx = wx;

  // Styles
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.background = '#000';
})();