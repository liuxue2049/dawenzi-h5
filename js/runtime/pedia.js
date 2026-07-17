import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
const DATA={
  mosquito:{name:'蚊子',entries:[{id:1,name:'极速蚊子',desc:'飞行速度极快'},{id:2,name:'分身蚊子',desc:'可制造分身'},{id:3,name:'加血蚊子',desc:'给同伴加血'},{id:4,name:'厚血蚊子',desc:'血量极高'},{id:5,name:'隐身蚊子',desc:'会隐身'}]},
  ufo:{name:'金龟子',entries:[{id:1,name:'金龟子A'},{id:2,name:'金龟子B'},{id:3,name:'金龟子C'},{id:4,name:'金龟子D'},{id:5,name:'金龟子E'}]},
  ding:{name:'蜻蜓',entries:[{id:1,name:'蜻蜓A'},{id:2,name:'蜻蜓B'},{id:3,name:'蜻蜓C'},{id:4,name:'蜻蜓D'},{id:5,name:'蜻蜓E'}]},
  die:{name:'蝶',entries:[{id:1,name:'蝶A'},{id:2,name:'蝶B'},{id:3,name:'蝶C'},{id:4,name:'蝶D'},{id:5,name:'蝶E'}]},
};
export function renderPedia(ctx,databus){
  const collected=databus.collectedInsects||[];
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
  ctx.fillStyle='#FFF';ctx.font='bold 22px Arial';ctx.textAlign='center';ctx.fillText('📖 昆虫图鉴',SCREEN_WIDTH/2,40);
  let sy=70;
  Object.entries(DATA).forEach(([cat,data])=>{
    ctx.fillStyle='#4CAF50';ctx.font='bold 16px Arial';ctx.textAlign='left';ctx.fillText(`【${data.name}】`,20,sy);sy+=25;
    data.entries.forEach((e,i)=>{
      const col=i%2,row=Math.floor(i/2),cw=(SCREEN_WIDTH-60)/2,cx=15+col*(cw+10),cy=sy+row*68;
      const key=`${cat}_${e.id}`,ok=collected.includes(key);
      ctx.fillStyle=ok?'rgba(76,175,80,0.3)':'rgba(255,255,255,0.1)';ctx.beginPath();ctx.roundRect(cx,cy,cw,60,6);ctx.fill();
      ctx.fillStyle=ok?'#FFF':'#666';ctx.font='bold 14px Arial';ctx.fillText(ok?e.name:'未收集',cx+20,cy+35);
    });
    sy+=Math.ceil(data.entries.length/2)*68+15;
  });
  ctx.fillStyle='#f44336';ctx.beginPath();ctx.arc(SCREEN_WIDTH-25,25,15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFF';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText('×',SCREEN_WIDTH-25,31);ctx.textAlign='left';
}
export function handlePediaTouch(x,y,databus){
  if(Math.sqrt((x-SCREEN_WIDTH+25)**2+(y-25)**2)<15){databus.isShowPedia=false;return'close';}return null;
}
