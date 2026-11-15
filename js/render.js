import { COLS, ROWS, SKINS, POWERS } from './data.js';
const TAU=Math.PI*2;
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
export class OceanRenderer {
  constructor(canvas,settings) {this.canvas=canvas;this.ctx=canvas.getContext('2d');this.settings=settings;this.particles=[];this.popups=[];this.width=0;this.height=0;this.low=false;this.last=0;this.slowFrames=0;}
  resize(){
    const r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;
    const dpr=Math.min(window.devicePixelRatio||1,this.low?1.5:2);
    if(this.width!==r.width||this.height!==r.height||this.dpr!==dpr){this.width=r.width;this.height=r.height;this.dpr=dpr;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);}
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  background(t,hero=false) {
    const c=this.ctx,w=this.width,h=this.height,reduced=this.settings.reduced;
    const grad=c.createLinearGradient(0,0,w,h);grad.addColorStop(0,hero?'#124c5c':'#093d4b');grad.addColorStop(.55,hero?'#0e3d52':'#0c3546');grad.addColorStop(1,'#082a3d');c.fillStyle=grad;c.fillRect(0,0,w,h);
    c.save();c.globalAlpha=.06;c.fillStyle='#b5ffe4';
    for(let i=0;i<4;i++){const x=w*(.12+i*.24)+(reduced?0:Math.sin(t*.13+i)*15);c.beginPath();c.moveTo(x,-10);c.lineTo(x+30,-10);c.lineTo(x+w*.22,h);c.lineTo(x-w*.08,h);c.fill();}c.restore();
    for(let i=0;i<26;i++){
      const x=((i*127.3)%997)/997*w;
      const y=reduced?((i*83)%h):h-((i*93.8+t*(4+i%4))%(h+25));
      c.strokeStyle=`rgba(150,229,225,${.07+(i%3)*.025})`;c.lineWidth=1;c.beginPath();c.arc(x,y,2+i%4,0,TAU);c.stroke();
    }
    if(hero)this.reef(t);
  }
  reef(t){
    const c=this.ctx,w=this.width,h=this.height;
    for(let layer=0;layer<3;layer++){
      c.fillStyle=['#164955','#0a3546','#092b3d'][layer];
      c.beginPath();c.moveTo(0,h);for(let x=0;x<=w+20;x+=20)c.lineTo(x,h-30-layer*8-Math.sin(x*.013+layer*2)*18);c.lineTo(w,h);c.fill();
    }
    const coral=(x,y,size,color)=>{c.save();c.translate(x,y);c.strokeStyle=color;c.lineWidth=size*.12;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(0,-size);c.moveTo(0,-size*.4);c.lineTo(-size*.25,-size*.65);c.lineTo(-size*.25,-size*.95);c.moveTo(0,-size*.65);c.lineTo(size*.24,-size*.83);c.lineTo(size*.24,-size*1.18);c.moveTo(-size*.25,-size*.72);c.lineTo(-size*.45,-size*.85);c.stroke();c.restore();};
    coral(w*.06,h,65,'#2a787b');coral(w*.92,h+3,100,'#477b89');coral(w*.83,h+7,55,'#b67e9c');
    for(let i=0;i<10;i++){const x=w*(.02+(i%5)*.022)+(i>4?w*.82:0);c.strokeStyle=i%2?'#397f80':'#215b65';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(x,h);c.bezierCurveTo(x-10,h-25,x+18,h-50,x+Math.sin(t*.7+i)*5,h-40-(i%4)*14);c.stroke();}
  }
  pearl(x,y,r,gold,t){
    const c=this.ctx;
    const glow=c.createRadialGradient(x,y,1,x,y,r*3);glow.addColorStop(0,gold?'#f9d17c50':'#b8fff22e');glow.addColorStop(1,'transparent');c.fillStyle=glow;c.beginPath();c.arc(x,y,r*3,0,TAU);c.fill();
    const g=c.createRadialGradient(x-r*.3,y-r*.4,0,x,y,r);g.addColorStop(0,'#fffef3');g.addColorStop(.4,gold?'#ffe7a7':'#ecfff9');g.addColorStop(1,gold?'#dbaa54':'#80cfc9');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
    c.strokeStyle=gold?'#fff5c5':'#d7fff3';c.lineWidth=1;c.beginPath();c.arc(x,y,r*.75,Math.PI*1.08,Math.PI*1.6);c.stroke();
    if(gold){c.fillStyle='#ffeac1';for(let i=0;i<4;i++){const a=i*TAU/4+t*.5;c.beginPath();c.arc(x+Math.cos(a)*r*1.7,y+Math.sin(a)*r*1.7,1.2,0,TAU);c.fill();}}
  }
  snake(points,skin,cell,direction,t,shield=false){
    const c=this.ctx,[light,dark]=skin.colors;
    if(points.length<2)return;
    c.save();c.lineJoin='round';c.lineCap='round';
    const path=()=>{c.beginPath();points.slice().reverse().forEach((p,i)=>{if(i===0)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);});};
    path();c.strokeStyle='#021e3135';c.lineWidth=cell*.9;c.stroke();
    const grad=c.createLinearGradient(0,points[0].y-cell,0,points[0].y+cell);grad.addColorStop(0,light);grad.addColorStop(1,dark);
    path();c.strokeStyle=grad;c.lineWidth=cell*.79;c.stroke();
    path();c.strokeStyle=light;c.globalAlpha=.3;c.lineWidth=cell*.23;c.stroke();c.globalAlpha=1;
    const tail=points.at(-1),before=points.at(-2),a=Math.atan2(tail.y-before.y,tail.x-before.x);
    c.save();c.translate(tail.x,tail.y);c.rotate(a);c.fillStyle=dark;c.beginPath();c.moveTo(-2,0);c.quadraticCurveTo(cell*.7,-cell*.85,cell*.9,-cell*.6);c.quadraticCurveTo(cell*.8,0,cell*.3,0);c.quadraticCurveTo(cell*.8,0,cell*.9,cell*.6);c.quadraticCurveTo(cell*.7,cell*.85,-2,0);c.fill();c.restore();
    for(let i=3;i<points.length-1;i+=5){const p=points[i],q=points[i-1];c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(q.y-p.y,q.x-p.x));c.fillStyle=dark;c.beginPath();c.moveTo(-cell*.3,-cell*.15);c.quadraticCurveTo(-cell*.4,-cell*.95,cell*.3,-cell*.2);c.fill();c.restore();}
    const head=points[0],rot={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[direction];
    c.save();c.translate(head.x,head.y);c.rotate(rot);
    c.fillStyle=light;c.beginPath();c.ellipse(0,0,cell*.5,cell*.46,0,0,TAU);c.fill();
    for(const y of [-cell*.21,cell*.21]){c.fillStyle='#f4fff8';c.beginPath();c.ellipse(cell*.14,y,cell*.16,cell*.14,0,0,TAU);c.fill();c.fillStyle='#123543';c.beginPath();c.arc(cell*.19,y,cell*.085,0,TAU);c.fill();c.fillStyle='white';c.beginPath();c.arc(cell*.21,y-cell*.025,cell*.026,0,TAU);c.fill();}
    c.strokeStyle='#407c7b';c.lineWidth=Math.max(1,cell*.035);c.beginPath();c.arc(cell*.32,0,cell*.08,-Math.PI/2,Math.PI/2);c.stroke();
    c.fillStyle='#f3a5ba80';c.beginPath();c.ellipse(0,cell*.35,cell*.12,cell*.055,0,0,TAU);c.fill();c.restore();
    if(shield){c.strokeStyle='#a2e6ff';c.lineWidth=1.5;c.fillStyle='#b8eaff12';c.beginPath();c.arc(head.x,head.y,cell*.85,0,TAU);c.fill();c.stroke();}
    c.restore();
  }
  burst(e){
    if(!('x'in e))return;
    const cell=this.width/COLS;
    this.popups.push({x:(e.x+.5)*cell,y:(e.y+.5)*this.height/ROWS,life:.8,points:e.points});
    if(this.settings.reduced)return;
    const count=this.low?5:12;
    for(let i=0;i<count&&this.particles.length<100;i++)this.particles.push({x:(e.x+.5)*cell,y:(e.y+.5)*this.height/ROWS,vx:(Math.random()-.5)*95,vy:(Math.random()-.5)*95,life:.65,color:e.gold?'#ffe4a0':'#b8ffeb'});
  }
  draw(g,alpha,t,skinId='lagoon') {
    this.resize();const c=this.ctx,w=this.width,h=this.height,cw=w/COLS,ch=h/ROWS;
    this.background(t);
    c.strokeStyle=this.settings.contrast?'#86d5d51c':'#a4e4dc09';c.lineWidth=.6;
    c.beginPath();for(let x=1;x<COLS;x++){c.moveTo(x*cw,0);c.lineTo(x*cw,h);}for(let y=1;y<ROWS;y++){c.moveTo(0,y*ch);c.lineTo(w,y*ch);}c.stroke();
    for(const p of g.walls){c.fillStyle=this.settings.contrast?'#efb7e3':'#976eaa';round(c,p.x*cw+1,p.y*ch+1,cw-2,ch-2,Math.min(4,cw*.2));c.fillStyle='#e7b8df70';round(c,p.x*cw+cw*.24,p.y*ch+ch*.15,cw*.4,ch*.2,2);}
    for(const p of g.food)this.pearl((p.x+.5)*cw,(p.y+.5)*ch,cw*.32,p.gold,t);
    if(g.item){const p=g.item,pow=POWERS[p.type],x=(p.x+.5)*cw,y=(p.y+.5)*ch;c.fillStyle=pow.color+'25';c.strokeStyle=pow.color;c.lineWidth=1.5;c.beginPath();c.arc(x,y,cw*.43,0,TAU);c.fill();c.stroke();c.fillStyle=pow.color;c.textAlign='center';c.textBaseline='middle';c.font=`bold ${cw*.48}px system-ui`;c.fillText(pow.symbol,x,y);}
    const points=g.snake.map((p,i)=>{const old=g.previous[i]||g.previous.at(-1)||p;const distance=Math.abs(old.x-p.x)+Math.abs(old.y-p.y);const a=distance>1?1:alpha;return{x:(old.x+(p.x-old.x)*a+.5)*cw,y:(old.y+(p.y-old.y)*a+.5)*ch};});
    this.snake(points,SKINS.find(s=>s.id===skinId)||SKINS[0],cw,g.direction,t,g.effects.shield);
    const dt=this.last?Math.min(.05,t-this.last):.016;this.last=t;
    for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;c.globalAlpha=Math.max(0,p.life/.65);c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,2,0,TAU);c.fill();}c.globalAlpha=1;this.particles=this.particles.filter(p=>p.life>0);
    c.textAlign='center';c.font=`bold ${Math.max(11,cw*.65)}px system-ui`;c.fillStyle='#efffe1';
    for(const p of this.popups){p.life-=dt;if(!this.settings.reduced)p.y-=dt*16;c.globalAlpha=Math.min(1,Math.max(0,p.life*3));c.fillText(`+${p.points}`,Math.min(w-18,Math.max(18,p.x)),Math.max(16,p.y-10));}c.globalAlpha=1;this.popups=this.popups.filter(p=>p.life>0);
    if(dt>.027){if(++this.slowFrames>60)this.low=true;}else this.slowFrames=Math.max(0,this.slowFrames-1);
    if(g.partyUntil>g.elapsed){c.strokeStyle='#e6b6ff';c.lineWidth=5;c.strokeRect(2.5,2.5,w-5,h-5);}
  }
  hero(t,skinId='lagoon') {
    this.resize();const c=this.ctx,w=this.width,h=this.height;this.background(t,true);
    // An illustrated, continuous mermaid snake, independent of gameplay.
    const points=[];
    for(let i=0;i<72;i++){const p=i/71,x=w*(.81-p*.59),y=h*(.47+Math.sin(p*TAU*1.15+.2)*.2)+(this.settings.reduced?0:Math.sin(t*.8+p*5)*3);points.push({x,y});}
    this.snake(points,SKINS.find(s=>s.id===skinId)||SKINS[0],Math.min(w*.079,48),'right',t);
    this.pearl(w*.91,h*.4,Math.min(w*.02,11),true,t);this.pearl(w*.18,h*.35,5,false,t);this.pearl(w*.57,h*.18,4,false,t);
    c.fillStyle='#b9e5e62b';for(let i=0;i<6;i++){const x=w*(.08+i*.16),y=h*(.18+(i%3)*.25);c.beginPath();c.moveTo(x-4,y);c.lineTo(x+4,y);c.moveTo(x,y-4);c.lineTo(x,y+4);c.strokeStyle='#c2fff073';c.lineWidth=1;c.stroke();}
  }
}
