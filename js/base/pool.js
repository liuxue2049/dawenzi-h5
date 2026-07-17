/**
 * pool.js — 对象池
 */
export default class Pool {
  constructor() {
    this.pool = [];
  }

  get(createFn) {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return createFn();
  }

  release(obj) {
    this.pool.push(obj);
  }

  clear() {
    this.pool = [];
  }
}
