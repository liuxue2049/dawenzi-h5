import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
export default class Laser {
  constructor() {
    this.x=0;this.y=0;this.angle=0;this.length=0;this.width=3;this.damage=50;
    this.isActive=false;this.duration=200;this.startTime=0;
  }
  init(x,y,angle,damage) {
    this.x=x;this.y=y;this.angle=angle;this.damage=damage||50;
    this.isActive=true;this.startTime=Date.now();this.length=Math.max(SCREEN_WIDTH,SCREEN_HEIGHT)*1.5;
  }
  update() { if(this.isActive&&Date.now()-this.startTime>this.duration)this.isActive=false; }
  render(ctx) {
    if(!this.isActive)return;
    const alpha=1-(Date.now()-this.startTime)/this.duration;
    ctx.save();ctx.globalAlpha=Math.max(0,alpha);
    ctx.strokeStyle='#00FF00';ctx.lineWidth=this.width;ctx.shadowColor='#00FF00';ctx.shadowBlur=15;
    ctx.beginPath();ctx.moveTo(this.x,this.y);
    ctx.lineTo(this.x+Math.cos(this.angle)*this.length,this.y+Math.sin(this.angle)*this.length);
    ctx.stroke();
    ctx.strokeStyle='#FFF';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(this.x,this.y);
    ctx.lineTo(this.x+Math.cos(this.angle)*this.length,this.y+Math.sin(this.angle)*this.length);
    ctx.stroke();ctx.restore();
  }
  checkHit(t) {
    if(!this.isActive||!t||!t.visible)return false;
    const ex=this.x+Math.cos(this.angle)*this.length,ey=this.y+Math.sin(this.angle)*this.length;
    const cx=t.x+t.width/2,cy=t.y+t.height/2;
    return this._ptDist(cx,cy,this.x,this.y,ex,ey)<t.width/2+10;
  }
  _ptDist(px,py,x1,y1,x2,y2) {
    const A=px-x1,B=py-y1,C=x2-x1,D=y2-y1,dot=A*C+B*D,len=C*C+D*D;
    let p=len!==0?dot/len:-1,xx,yy;
    if(p<0){xx=x1;yy=y1;}else if(p>1){xx=x2;yy=y2;}else{xx=x1+p*C;yy=y1+p*D;}
    return Math.sqrt((px-xx)**2+(py-yy)**2);
  }
}
