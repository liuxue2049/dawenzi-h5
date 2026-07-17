export default class Music {
  constructor() { this.bgm=null;this.sfx={};this._muted=false; }
  init() {
    try {
      this.bgm=wx.createInnerAudioContext();this.bgm.src='audio/weng.mp3';this.bgm.loop=true;this.bgm.volume=0.3;
      this.sfx.zapper=wx.createInnerAudioContext();this.sfx.zapper.src='audio/zapper.mp3';this.sfx.zapper.volume=0.5;
      this.sfx.meizidan=wx.createInnerAudioContext();this.sfx.meizidan.src='audio/meizidan.mp3';this.sfx.meizidan.volume=0.5;
    } catch(e) {}
  }
  playBGM() { if(!this._muted&&this.bgm) this.bgm.play().catch(()=>{}); }
  stopBGM() { if(this.bgm) this.bgm.stop(); }
  pauseBGM() { if(this.bgm) this.bgm.pause(); }
  resumeBGM() { if(!this._muted&&this.bgm) this.bgm.play().catch(()=>{}); }
  playZapper() { if(!this._muted&&this.sfx.zapper){this.sfx.zapper.stop();this.sfx.zapper.play().catch(()=>{});} }
  playMeizidan() { if(!this._muted&&this.sfx.meizidan){this.sfx.meizidan.stop();this.sfx.meizidan.play().catch(()=>{});} }
  toggleMute() { this._muted=!this._muted;if(this._muted)this.pauseBGM();else this.resumeBGM();return this._muted; }
}
