const KEYS={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
export function keyboardDirection(event){
  if(event.repeat||event.ctrlKey||event.altKey||event.metaKey)return null;
  return KEYS[event.key]||null;
}

// One gesture may contain several deliberate corners. Rebase after each
// threshold crossing, never wait for finger-up, and ignore secondary fingers.
export class SwipeGesture {
  constructor(threshold=12){this.threshold=threshold;this.reset();}
  reset(){this.pointer=null;}
  start(id,x,y){if(this.pointer)return false;this.pointer={id,x,y};return true;}
  move(id,x,y){
    const p=this.pointer;if(!p||p.id!==id)return null;
    const dx=x-p.x,dy=y-p.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<this.threshold)return null;
    const direction=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';
    p.x=x;p.y=y;return direction;
  }
  end(id){if(this.pointer?.id===id)this.reset();}
}
