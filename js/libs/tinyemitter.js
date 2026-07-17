/**
 * tinyemitter.js — 轻量事件发射器
 */
export default class TinyEmitter {
  constructor() {
    this._listeners = {};
  }

  on(event, fn, ctx) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push({ fn, ctx });
    return this;
  }

  once(event, fn, ctx) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      fn.apply(ctx, args);
    };
    return this.on(event, wrapper, ctx);
  }

  off(event, fn) {
    if (!this._listeners[event]) return this;
    if (!fn) {
      delete this._listeners[event];
      return this;
    }
    this._listeners[event] = this._listeners[event].filter(l => l.fn !== fn);
    return this;
  }

  emit(event, ...args) {
    if (!this._listeners[event]) return this;
    this._listeners[event].forEach(l => {
      l.fn.apply(l.ctx, args);
    });
    return this;
  }
}
