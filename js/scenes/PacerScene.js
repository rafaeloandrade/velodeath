class PacerScene extends Phaser.Scene {
  constructor(){
    super('PacerScene');
    this.track={leftX:250,rightX:710,cy:330,outerR:206,innerR:140,blackR:148,redR:162,blueR:190,rideR:176};
    this.riderColors=[
      {n:1,name:'WHITE',color:0xf5f2e8,text:'#101010'},
      {n:2,name:'BLACK',color:0x171717,text:'#ffffff'},
      {n:3,name:'RED',color:0xd92929,text:'#ffffff'},
      {n:4,name:'BLUE',color:0x2467d9,text:'#ffffff'},
      {n:5,name:'YELLOW',color:0xffd331,text:'#101010'},
      {n:6,name:'GREEN',color:0x1c9d41,text:'#ffffff'},
      {n:7,name:'ORANGE',color:0xef7c1b,text:'#101010'}
    ];
    this.playerSlot=3;
  }
  create(){
    this.cameras.main.setBackgroundColor('#090b12');
    this.makeBackground(); this.drawTrack(); this.makeHUD(); this.makeRacers(); this.bindInput(); this.resetRun();
    this.showCenterMessage('FOLLOW DEATH','Alterne ← → para pedalar\nMantenha o ritmo sem destruir a stamina\n\nESPAÇO para começar');
  }
  get straightLength(){return this.track.rightX-this.track.leftX}
  perimeter(radius){return this.straightLength*2+Math.PI*radius*2}
  pointAt(distance,radius){
    const per=this.perimeter(radius); let d=Phaser.Math.Wrap(distance,0,per); const s=this.straightLength, arc=Math.PI*radius;
    if(d<s)return{x:this.track.rightX-d,y:this.track.cy-radius}; d-=s;
    if(d<arc){const a=-Math.PI/2-d/radius;return{x:this.track.leftX+Math.cos(a)*radius,y:this.track.cy+Math.sin(a)*radius}} d-=arc;
    if(d<s)return{x:this.track.leftX+d,y:this.track.cy+radius}; d-=s;
    const a=Math.PI/2-d/radius;return{x:this.track.rightX+Math.cos(a)*radius,y:this.track.cy+Math.sin(a)*radius};
  }
  tangentAt(distance,radius){const p1=this.pointAt(distance-1,radius),p2=this.pointAt(distance+1,radius);return Math.atan2(p2.y-p1.y,p2.x-p1.x)}
  graphicsStadium(g,r,fill,line,lw=0){
    const x1=this.track.leftX,x2=this.track.rightX,cy=this.track.cy;
    if(fill!==null){g.fillStyle(fill,1);g.fillRect(x1,cy-r,x2-x1,r*2);g.fillCircle(x1,cy,r);g.fillCircle(x2,cy,r)}
    if(line!==null&&lw>0){
      g.lineStyle(lw,line,1);g.beginPath();g.moveTo(x2,cy-r);g.lineTo(x1,cy-r);
      for(let i=0;i<=40;i++){const a=-Math.PI/2-(i/40)*Math.PI;g.lineTo(x1+Math.cos(a)*r,cy+Math.sin(a)*r)}
      g.lineTo(x2,cy+r);
      for(let i=0;i<=40;i++){const a=Math.PI/2-(i/40)*Math.PI;g.lineTo(x2+Math.cos(a)*r,cy+Math.sin(a)*r)}
      g.closePath();g.strokePath();
    }
  }
  makeBackground(){
    this.add.rectangle(480,360,960,720,0x090b12);
    const f=this.add.graphics();f.lineStyle(3,0xff2b6d,1);f.strokeRect(8,8,944,704);f.lineStyle(1,0x283248,1);f.strokeRect(14,14,932,692);
  }
  drawTrack(){
    const g=this.add.graphics();
    this.graphicsStadium(g,this.track.outerR,0xb77c3c,0xe8ad5e,3);
    this.graphicsStadium(g,194,0xcf9854,null,0);
    this.graphicsStadium(g,this.track.blueR,null,0x235cff,2);
    this.graphicsStadium(g,this.track.redR,null,0xd82424,2);
    this.graphicsStadium(g,this.track.blackR,null,0x111111,2);
    this.graphicsStadium(g,this.track.innerR,0x171d2a,0x3e495e,2);
    const fx=475;g.lineStyle(4,0xffffff,1);g.beginPath();g.moveTo(fx,this.track.cy-this.track.outerR);g.lineTo(fx,this.track.cy-this.track.innerR);g.strokePath();
  }
  makeHUD(){
    this.add.text(28,24,'☠ VELODEATH',{fontFamily:'monospace',fontSize:'26px',color:'#f4eed7',fontStyle:'bold'});
    this.add.text(212,28,'KEIRIN',{fontFamily:'monospace',fontSize:'20px',color:'#ff2b6d',fontStyle:'bold'});
    this.phaseText=this.add.text(930,29,'DEATH PACER',{fontFamily:'monospace',fontSize:'13px',color:'#22d9ff'}).setOrigin(1,0);
    this.add.rectangle(480,668,892,58,0x101622,.96).setStrokeStyle(2,0x30394a);
    this.speedText=this.hudLabel(48,650,'SPD','0 km/h');this.cadenceText=this.hudLabel(200,650,'CAD','0 rpm');this.distanceText=this.hudLabel(352,650,'GAP','0 m');
    this.makeMeter(526,643,'STM',0x2467d9,'stamina');this.makeMeter(727,643,'FLW',0xff2b6d,'flow');
    this.tipText=this.add.text(480,620,'← → PEDAL',{fontFamily:'monospace',fontSize:'12px',color:'#9ba4b7'}).setOrigin(.5);
  }
  hudLabel(x,y,label,value){
    this.add.text(x,y,label,{fontFamily:'monospace',fontSize:'11px',color:'#9ba4b7'});
    return this.add.text(x+38,y-2,value,{fontFamily:'monospace',fontSize:'14px',color:'#f4eed7',fontStyle:'bold'});
  }
  makeMeter(x,y,label,color,key){
    this.add.text(x,y+7,label,{fontFamily:'monospace',fontSize:'11px',color:'#9ba4b7'});
    this.add.rectangle(x+90,y+14,126,14,0x252c3a).setStrokeStyle(1,0xffffff);
    this[key+'Bar']=this.add.rectangle(x+28,y+14,124,12,color).setOrigin(0,.5);
  }
  makeRacers(){this.death=this.makeDeathPacer();this.riders=this.riderColors.map((r,i)=>this.makeRider(r,i))}
  makeDeathPacer(){
    const c=this.add.container(0,0),rear=this.add.rectangle(-14,0,18,8,0x101010),frame=this.add.rectangle(1,0,34,7,0x777777),front=this.add.rectangle(23,0,13,5,0x101010),cloak=this.add.rectangle(-2,0,20,18,0x050509),skull=this.add.circle(5,0,6,0xe8dfca),sc=this.add.graphics();
    sc.lineStyle(2,0xbac2cc,1);sc.beginPath();sc.moveTo(2,-7);sc.lineTo(18,-22);sc.strokePath();sc.beginPath();sc.arc(18,-18,8,-1.7,.8,false);sc.strokePath();c.add([rear,frame,front,cloak,skull,sc]);c.setDepth(20);return c;
  }
  makeRider(data,slot){
    const c=this.add.container(0,0),rear=this.add.rectangle(-7,0,8,3,0x101010),frame=this.add.rectangle(1,0,18,2,0xd8d8d8),front=this.add.rectangle(9,0,8,3,0x101010),body=this.add.rectangle(0,0,9,9,data.color),helmet=this.add.circle(-1,0,5,data.color),num=this.add.text(0,0,String(data.n),{fontFamily:'monospace',fontSize:'7px',color:data.text,fontStyle:'bold'}).setOrigin(.5);
    c.add([rear,frame,front,body,helmet,num]);c.setDepth(slot===this.playerSlot?18:15);
    if(slot===this.playerSlot){const m=this.add.graphics();m.lineStyle(2,0x22d9ff,1);m.strokeCircle(0,0,10);c.add(m)}
    return c;
  }
  positionObject(obj,d){const p=this.pointAt(d,this.track.rideR);obj.setPosition(p.x,p.y);obj.setRotation(this.tangentAt(d,this.track.rideR))}
  resetRun(){
    this.running=false;this.failed=false;this.pacerDistance=120;this.pacerTravel=0;this.pacerKmh=36;this.playerDistance=this.pacerDistance-(this.playerSlot+1)*34;this.playerSpeed=this.kmhToPixels(36);
    this.stamina=100;this.flow=45;this.cadence=0;this.lastPedalKey=null;this.lastPedalTime=0;this.intervals=[];this.currentLap=1;this.updateFormationPositions();this.updateHUD();
  }
  kmhToPixels(k){return k*3.25} pixelsToKmh(px){return px/3.25}
  targetPacerKmh(){const p=Phaser.Math.Clamp(this.pacerTravel/(this.perimeter(this.track.rideR)*3),0,1);return Phaser.Math.Linear(36,48,p)}
  handlePedal(code){
    if(!this.running||this.failed)return;const now=this.time.now;if(this.lastPedalKey===code){this.flow=Math.max(0,this.flow-7);return}
    if(this.lastPedalTime>0){const int=now-this.lastPedalTime;if(int<1200){this.intervals.push(int);if(this.intervals.length>8)this.intervals.shift();const avg=this.intervals.reduce((a,b)=>a+b,0)/this.intervals.length;this.cadence=Phaser.Math.Clamp(30000/avg,0,190);const v=this.intervals.reduce((s,x)=>s+Math.abs(x-avg),0)/this.intervals.length;const cons=Phaser.Math.Clamp(1-v/150,0,1);this.flow=Phaser.Math.Clamp(this.flow+4*cons-1.2*(1-cons),0,100)}}
    this.lastPedalKey=code;this.lastPedalTime=now;const sf=.45+this.stamina/100*.55,ff=.78+this.flow/100*.32;this.playerSpeed+=7.8*sf*ff;this.playerSpeed=Math.min(this.playerSpeed,this.kmhToPixels(62));
  }
  updateGameplay(dt){
    if(!this.running||this.failed)return;
    const target=this.targetPacerKmh();this.pacerKmh=Phaser.Math.Linear(this.pacerKmh,target,.7*dt);const ps=this.kmhToPixels(this.pacerKmh);this.pacerDistance+=ps*dt;this.pacerTravel+=ps*dt;
    this.playerSpeed*=Math.exp(-.68*dt);this.playerSpeed=Math.max(this.playerSpeed,this.kmhToPixels(18));const pk=this.pixelsToKmh(this.playerSpeed);
    if(this.cadence>112||pk>50){const effort=Math.max((this.cadence-105)/70,(pk-48)/16);this.stamina-=(3.7+effort*5.5)*dt}else if(this.cadence<88&&pk<43){this.stamina+=4.8*dt}else this.stamina+=.55*dt;
    this.stamina=Phaser.Math.Clamp(this.stamina,0,100);if(this.stamina<=1)this.playerSpeed=Math.min(this.playerSpeed,this.kmhToPixels(43));
    const idle=this.time.now-this.lastPedalTime;if(idle>420){this.cadence=Phaser.Math.Linear(this.cadence,0,2.3*dt);this.flow=Math.max(0,this.flow-2.2*dt)}
    this.playerDistance+=this.playerSpeed*dt;this.updateFormationPositions();
    const desired=this.pacerDistance-(this.playerSlot+1)*34,gap=desired-this.playerDistance;
    if(gap<-10){this.playerDistance=desired+10;this.playerSpeed=Math.min(this.playerSpeed,ps*1.02)}
    if(gap>145)this.failRun();
    this.currentLap=Math.min(3,1+Math.floor(this.pacerTravel/this.perimeter(this.track.rideR)));
    if(this.pacerTravel>=this.perimeter(this.track.rideR)*3){this.running=false;this.showCenterMessage('DEATH IS LEAVING','Você acompanhou o pacer.\nProtótipo 03 concluído.\n\nR para reiniciar')}
    this.updateHUD(gap);
  }
  updateFormationPositions(){
    this.positionObject(this.death,this.pacerDistance);
    this.riders.forEach((r,i)=>this.positionObject(r,i===this.playerSlot?this.playerDistance:this.pacerDistance-(i+1)*34));
  }
  updateHUD(gap=0){
    this.speedText.setText(`${Math.round(this.pixelsToKmh(this.playerSpeed))} km/h`);this.cadenceText.setText(`${Math.round(this.cadence)} rpm`);this.distanceText.setText(`${Math.max(0,Math.round(gap/3))} m`);
    this.staminaBar.width=124*(this.stamina/100);this.flowBar.width=124*(this.flow/100);this.phaseText.setText(`DEATH PACER // LAP ${this.currentLap}/3`);
    if(this.stamina<25){this.tipText.setText('LOW STAMINA — reduza a cadência');this.tipText.setColor('#ffcc33')}else if(this.flow>75){this.tipText.setText('FLOW — ritmo sincronizado');this.tipText.setColor('#ff2b6d')}else{this.tipText.setText('← → PEDAL // FOLLOW DEATH');this.tipText.setColor('#9ba4b7')}
  }
  failRun(){this.failed=true;this.running=false;this.showCenterMessage('DROPPED','A Morte abriu uma lacuna.\nUse um ritmo mais constante.\n\nR para tentar novamente')}
  showCenterMessage(title,subtitle){
    if(this.messageGroup)this.messageGroup.destroy(true);
    const panel=this.add.rectangle(480,330,410,160,0x080a10,.94).setStrokeStyle(3,0xff2b6d).setDepth(100),tt=this.add.text(480,294,title,{fontFamily:'monospace',fontSize:'27px',color:'#f4eed7',fontStyle:'bold'}).setOrigin(.5).setDepth(101),st=this.add.text(480,346,subtitle,{fontFamily:'monospace',fontSize:'13px',align:'center',color:'#b5bdcb',lineSpacing:5}).setOrigin(.5).setDepth(101);
    this.messageGroup=this.add.container(0,0,[panel,tt,st]).setDepth(100);
  }
  hideCenterMessage(){if(this.messageGroup){this.messageGroup.destroy(true);this.messageGroup=null}}
  startRun(){if(this.running)return;if(this.failed||this.pacerTravel>0)this.resetRun();this.running=true;this.hideCenterMessage()}
  bindInput(){
    this.input.keyboard.on('keydown-SPACE',()=>this.startRun());
    this.input.keyboard.on('keydown-R',()=>{this.resetRun();this.showCenterMessage('FOLLOW DEATH','Alterne ← → para pedalar\nMantenha o ritmo sem destruir a stamina\n\nESPAÇO para começar')});
    this.input.keyboard.on('keydown-LEFT',()=>this.handlePedal('LEFT'));
    this.input.keyboard.on('keydown-RIGHT',()=>this.handlePedal('RIGHT'));
  }
  update(time,delta){this.updateGameplay(Math.min(delta/1000,.05))}
}