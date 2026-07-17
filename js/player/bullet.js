import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
export default class Bullet {
  constructor() {
    this.x=0;this.y=0;this.width=12;this.height=12;this.vx=0;this.vy=0;
    this.speed=12;this.damage=20;this.visible=true;this.color='#FFD700';
  }
  init(x,y,angle,damage) {
    this.x=x;this.y=y;this.vx=Math.cos(angle)*this.speed;this.vy=Math.sin(angle)*this.speed;
    this.damage=damage||20;this.visible=true;
  }
  update() {
    if(!this.visible)return;this.x+=this.vx;this.y+=this.vy;
    const _d=GameGlobal.databus;const _big=_d.selectedCategory==='mosquito_bigmap';
    const _bw=_big?_d.worldWidth:SCREEN_WIDTH;const _bh=_big?_d.worldHeight:SCREEN_HEIGHT;
    if(this.x<-20||this.x>_bw+20||this.y<-20||this.y>_bh+20)this.visible=false;
  }
  render(ctx) {
    if(!this.visible)return;ctx.save();ctx.fillStyle=this.color;ctx.shadowColor='#FFD700';ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(this.x,this.y,this.width/2,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  checkHit(t) {
    if(!this.visible||!t||!t.visible)return false;
    const dx=this.x-(t.x+t.width/2),dy=this.y-(t.y+t.height/2);
    return Math.sqrt(dx*dx+dy*dy)<(this.width+t.width)/2+5;
  }
}
