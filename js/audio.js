export class OceanAudio {
  constructor(settings) {this.settings=settings;this.context=null;this.timer=null;this.note=0;}
  unlock() {
    try {
      if(!this.context)this.context=new (window.AudioContext||window.webkitAudioContext)();
      if(this.context.state==='suspended')this.context.resume().catch(()=>{});
    }catch{}
  }
  tone(freq,duration=.12,type='sine',volume=.05,delay=0) {
    if(!this.context||this.context.state!=='running')return;
    const t=this.context.currentTime+delay,o=this.context.createOscillator(),g=this.context.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+duration);
    o.connect(g);g.connect(this.context.destination);o.start(t);o.stop(t+duration+.02);
  }
  effect(type,combo=1) {
    if(!this.settings.sound)return;
    if(type==='eat'){this.tone(440+combo*90,.16);this.tone(660+combo*80,.13,'sine',.025,.07);}
    else if(type==='recover'||type==='end'){this.tone(220,.22,'triangle');this.tone(165,.3,'triangle',.035,.12);}
    else if(['win','party','power'].includes(type)){[523,659,784,1047].forEach((f,i)=>this.tone(f,.23,'sine',.04,i*.085));}
    else this.tone(540,.08,'sine',.025);
  }
  play() {
    if(this.timer||!this.settings.music)return;
    const scale=[261.6,329.6,392,523.2,392,329.6,293.7,392];
    const tick=()=>{if(this.settings.music){this.tone(scale[this.note++%scale.length],1.1,'sine',.014);this.tone(130.8,1.4,'sine',.009);}};
    tick();this.timer=setInterval(tick,1100);
  }
  stop() {clearInterval(this.timer);this.timer=null;}
  suspend(){this.stop();this.context?.suspend().catch(()=>{});}
}
