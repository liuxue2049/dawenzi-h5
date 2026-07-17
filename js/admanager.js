/**
 * admanager.js — 广告管理（H5模拟版）
 */
export default class AdManager {
  constructor() {
    this.hasPlayed = false;
    this._rewardedAd = null;
  }

  /**
   * 模拟播放激励视频广告
   * @returns {Promise<boolean>} 是否完整观看
   */
  showRewardedAd() {
    return new Promise((resolve) => {
      if (this._rewardedAd) {
        this._rewardedAd.show().then(() => {
          this.hasPlayed = true;
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      } else {
        // Fallback: use confirm dialog
        const watched = window.confirm('观看广告可获得奖励（模拟）\n点击"确定"完成观看');
        this.hasPlayed = watched;
        resolve(watched);
      }
    });
  }

  resetPlayedStatus() {
    this.hasPlayed = false;
  }

  createAd() {
    if (typeof wx !== 'undefined' && wx.createRewardedVideoAd) {
      this._rewardedAd = wx.createRewardedVideoAd();
    }
  }
}
