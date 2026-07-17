import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import resloader from '../resloader';
export default class Background {
  constructor() { this.bgImage=null;this.bgIndex=1; }
  setBackground(index) {
    this.bgIndex=index;
    for(const ext of ['jpg','png']) {
      const img=resloader.getImage(`images/background${index}.${ext}`);
      if(img){this.bgImage=img;return;}
    }
    this.bgImage=resloader.getImage('images/background1.jpg');
  }
  drawToCanvas(ctx) {
    if(this.bgImage){ctx.drawImage(this.bgImage,0,0,SCREEN_WIDTH,SCREEN_HEIGHT);}
    else{const g=ctx.createLinearGradient(0,0,0,SCREEN_HEIGHT);g.addColorStop(0,'#87CEEB');g.addColorStop(0.7,'#98FB98');g.addColorStop(1,'#228B22');ctx.fillStyle=g;ctx.fillRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);}
  }
}
