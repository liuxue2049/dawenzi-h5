import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
export default class Missile {
  constructor() {
    this.x=0;this.y=0;this.width=10;this.height=10;this.vx=0;this.vy=0;
    this.speed=6;this.damage=80;this.visible=true;this.target=null;this.turnRate=0.08;
    this.angle=0;this.trail=[];this.maxTrail=15;
  }
  init(x,y,target,damage) {
    this.x=x;this.y=y;this.target=target;this.damage=damage||80;this.visible=true;this.trail=[];
    this.angle=0;
    if(target){const dx=target.x+target.width/2-x,dy=target.y+target.height/2-y;this.angle=Math.atan2(dy,dx);}
    this.vx=Math.cos(this.angle)*this.speed;this.vy=Math.sin(this.angle)*this.speed;
  }
  update() {
    if(!this.visible)return;
    if(this.target&&this.target.visible){
      const tx=this.target.x+this.target.width/2,ty=this.target.y+this.target.height/2;
      const dx=tx-this.x,dy=ty-this.y,ta=Math.atan2(dy,dx);
      let ad=ta-this.angle;while(ad>Math.PI)ad-=Math.PI*2;while(ad<-Math.PI)ad+=Math.PI*2;
      this.angle+=Math.sign(ad)*Math.min(Math.abs(ad),this.turnRate);
    }
    this.vx=Math.cos(this.angle)*this.speed;this.vy=Math.sin(this.angle)*this.speed;
    this.x+=this.vx;this.y+=this.vy;
    this.trail.push({x:this.x,y:this.y});if(this.trail.length>this.maxTrail)this.trail.shift();
    if(this.x<-50||this.x>SCREEN_WIDTH+50||this.y<-50||this.y>SCREEN_HEIGHT+50)this.visible=false;
  }
  render(ctx) {
    if(!this.visible)return;ctx.save();
    if(this.trail.length>1){for(let i=0;i<this.trail.length-1;i++){ctx.globalAlpha=i/this.trail.length*0.5;ctx.strokeStyle='#FF6600';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(this.trail[i].x,this.trail[i].y);ctx.lineTo(this.trail[i+1].x,this.trail[i+1].y);ctx.stroke();}}
    ctx.globalAlpha=1;ctx.fillStyle='#FF4500';ctx.shadowColor='#FF6600';ctx.shadowBlur=10;
    ctx.beginPath();ctx.arc(this.x,this.y,this.width/2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#FFD700';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(this.x,this.y);
    ctx.lineTo(this.x+Math.cos(this.angle)*12,this.y+Math.sin(this.angle)*12);ctx.stroke();ctx.restore();
  }
  checkHit(t) {
    if(!this.visible||!t||!t.visible)return false;
    const dx=this.x-(t.x+t.width/2),dy=this.y-(t.y+t.height/2);
    return Math.sqrt(dx*dx+dy*dy)<(this.width+t.width)/2+5;
  }
}
