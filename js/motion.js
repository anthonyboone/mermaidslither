import { advance, interval, step, turn, DIRS } from './engine.js';

export const TURN_GRACE_MS=35;
const EPSILON=1e-7;

// The logical snake stays at the start of the currently visible travel leg.
// Commit a cell only on arrival, not one full animation interval in advance.
export class GridMotion {
  constructor(game){this.game=game;this.progressMs=0;this.beginLeg();}
  beginLeg(){
    const g=this.game;
    this.steered=g.queue.length>0;
    if(g.queue.length)g.direction=g.queue.shift();
    this.durationMs=interval(g);
  }
  get progress(){return Math.min(1,this.progressMs/this.durationMs);}
  get graceMs(){return Math.min(TURN_GRACE_MS,this.durationMs*.25);}
  turn(direction){
    const g=this.game,hadQueued=g.queue.length>0;
    if(!turn(g,direction))return false;
    // A near-centre key/swipe can still use this corner. Never re-plan a leg
    // twice, skip an earlier queued turn, reverse, or grant a free extra move.
    if(!hadQueued&&!this.steered&&this.progressMs<=this.graceMs+EPSILON){
      g.direction=g.queue.shift();this.steered=true;
    }
    return true;
  }
  update(milliseconds){
    if(!Number.isFinite(milliseconds)||milliseconds<=0)return;
    const g=this.game;
    let remaining=milliseconds;
    while(remaining>EPSILON&&!g.ended){
      const used=Math.min(remaining,this.durationMs-this.progressMs);
      const before=g.elapsed;advance(g,used/1000);
      this.progressMs+=(g.elapsed-before)*1000;remaining-=used;
      if(g.ended)break;
      if(this.progressMs+EPSILON>=this.durationMs){
        step(g,{consumeTurn:false});this.progressMs=0;
        if(!g.ended)this.beginLeg();
      }
    }
  }
}

export function snakePositions(g,progress){
  const a=Math.max(0,Math.min(1,progress));
  const d=DIRS[g.direction];
  return g.snake.map((p,i)=>{
    const target=i===0?{x:p.x+d.x,y:p.y+d.y}:g.snake[i-1];
    return {x:p.x+(target.x-p.x)*a,y:p.y+(target.y-p.y)*a};
  });
}
