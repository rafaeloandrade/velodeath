class PacerScene extends Phaser.Scene {
  constructor() {
    super('PacerScene');
    this.track = {
      leftX: 250, rightX: 710, cy: 330,
      outerR: 206, innerR: 140,
      blackR: 148, redR: 162, blueR: 190,
      laneRadii: [156, 176, 196],
      referenceR: 176
    };
    this.riderColors = [
      { n:1, name:'WHITE',  color:0xf5f2e8, text:'#101010' },
      { n:2, name:'BLACK',  color:0x171717, text:'#ffffff' },
      { n:3, name:'RED',    color:0xd92929, text:'#ffffff' },
      { n:4, name:'BLUE',   color:0x2467d9, text:'#ffffff' },
      { n:5, name:'YELLOW', color:0xffd331, text:'#101010' },
      { n:6, name:'GREEN',  color:0x1c9d41, text:'#ffffff' },
      { n:7, name:'ORANGE', color:0xef7c1b, text:'#ffffff' }
    ];
    this.playerIndex = 3;
    this.totalPacerLaps = 1;
    this.totalOpenLaps = 2;
  }

  create() {
    this.cameras.main.setBackgroundColor('#090b12');
    this.makeBackground();
    this.drawTrack();
    this.makeHUD();
    this.makeRacers();
    this.bindInput();
    this.resetGame();
    this.showCenterMessage(
      'FOLLOW DEATH',
      '1 volta com pacer.\n← → = cadência\nMantenha o Flow e preserve stamina.\n\nESPAÇO para começar'
    );
  }

  get straightLength() { return this.track.rightX - this.track.leftX; }
  perimeter(radius) { return this.straightLength * 2 + Math.PI * radius * 2; }

  pointAtProgress(progress, radius) {
    const lapProgress = Phaser.Math.Wrap(progress, 0, 1);
    let d = lapProgress * this.perimeter(radius);
    const straight = this.straightLength;
    const arc = Math.PI * radius;

    if (d < straight) return { x:this.track.rightX-d, y:this.track.cy-radius };
    d -= straight;
    if (d < arc) {
      const a = -Math.PI/2 - d/radius;
      return { x:this.track.leftX + Math.cos(a)*radius, y:this.track.cy + Math.sin(a)*radius };
    }
    d -= arc;
    if (d < straight) return { x:this.track.leftX+d, y:this.track.cy+radius };
    d -= straight;
    const a = Math.PI/2 - d/radius;
    return { x:this.track.rightX + Math.cos(a)*radius, y:this.track.cy + Math.sin(a)*radius };
  }

  tangentAtProgress(progress, radius) {
    const e = 0.0005;
    const a = this.pointAtProgress(progress-e, radius);
    const b = this.pointAtProgress(progress+e, radius);
    return Math.atan2(b.y-a.y, b.x-a.x);
  }

  laneRadius(laneVisual) {
    const v = Phaser.Math.Clamp(laneVisual, 0, 2);
    if (v <= 1) return Phaser.Math.Linear(this.track.laneRadii[0], this.track.laneRadii[1], v);
    return Phaser.Math.Linear(this.track.laneRadii[1], this.track.laneRadii[2], v-1);
  }

  progressPerSecond(kmh) {
    return (kmh * 3.25) / this.perimeter(this.track.referenceR);
  }

  longitudinalPixels(progressDelta) {
    return progressDelta * this.perimeter(this.track.referenceR);
  }

  graphicsStadium(g, radius, fillColor, lineColor, lineWidth=0) {
    const x1=this.track.leftX, x2=this.track.rightX, cy=this.track.cy;
    if (fillColor !== null) {
      g.fillStyle(fillColor,1);
      g.fillRect(x1,cy-radius,x2-x1,radius*2);
      g.fillCircle(x1,cy,radius); g.fillCircle(x2,cy,radius);
    }
    if (lineColor !== null && lineWidth>0) {
      g.lineStyle(lineWidth,lineColor,1); g.beginPath();
      g.moveTo(x2,cy-radius); g.lineTo(x1,cy-radius);
      for(let i=0;i<=48;i++){
        const a=-Math.PI/2-(i/48)*Math.PI;
        g.lineTo(x1+Math.cos(a)*radius,cy+Math.sin(a)*radius);
      }
      g.lineTo(x2,cy+radius);
      for(let i=0;i<=48;i++){
        const a=Math.PI/2-(i/48)*Math.PI;
        g.lineTo(x2+Math.cos(a)*radius,cy+Math.sin(a)*radius);
      }
      g.closePath(); g.strokePath();
    }
  }

  makeBackground(){
    this.add.rectangle(480,360,960,720,0x090b12);
    const f=this.add.graphics();
    f.lineStyle(3,0xff2b6d,1); f.strokeRect(8,8,944,704);
    f.lineStyle(1,0x283248,1); f.strokeRect(14,14,932,692);
  }

  drawTrack(){
    const g=this.add.graphics();
    this.graphicsStadium(g,this.track.outerR,0xb77c3c,0xe8ad5e,3);
    this.graphicsStadium(g,198,0xcf9854,null,0);
    this.graphicsStadium(g,this.track.innerR,0x171d2a,0x3e495e,2);
    this.graphicsStadium(g,this.track.blackR,null,0x111111,2);
    this.graphicsStadium(g,this.track.redR,null,0xd82424,2);
    this.graphicsStadium(g,this.track.blueR,null,0x235cff,2);
    const finishX=475;
    g.lineStyle(4,0xffffff,1); g.beginPath();
    g.moveTo(finishX,this.track.cy-this.track.outerR);
    g.lineTo(finishX,this.track.cy-this.track.innerR); g.strokePath();
  }

  makeHUD(){
    this.add.text(28,24,'☠ VELODEATH',{fontFamily:'monospace',fontSize:'26px',color:'#f4eed7',fontStyle:'bold'});
    this.add.text(212,28,'KEIRIN',{fontFamily:'monospace',fontSize:'20px',color:'#ff2b6d',fontStyle:'bold'});
    this.phaseText=this.add.text(930,29,'DEATH PACER',{fontFamily:'monospace',fontSize:'13px',color:'#22d9ff'}).setOrigin(1,0);
    this.add.rectangle(480,668,892,58,0x101622,.96).setStrokeStyle(2,0x30394a);
    this.speedText=this.hudLabel(42,650,'SPD','0 km/h');
    this.cadenceText=this.hudLabel(184,650,'CAD','0 rpm');
    this.statusText=this.hudLabel(330,650,'GAP','0 m');
    this.lineText=this.hudLabel(465,650,'LINE','--');
    this.makeMeter(590,643,'STM',0x2467d9,'stamina');
    this.makeMeter(775,643,'FLW',0xff2b6d,'flow');
    this.tipText=this.add.text(480,616,'← → PEDAL',{fontFamily:'monospace',fontSize:'12px',color:'#9ba4b7'}).setOrigin(.5);
    this.attackText=this.add.text(480,585,'',{fontFamily:'monospace',fontSize:'21px',color:'#ff2b6d',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(925,616,'GEAR 49x14',{fontFamily:'monospace',fontSize:'11px',color:'#22d9ff'}).setOrigin(1,.5);
  }

  hudLabel(x,y,label,value){
    this.add.text(x,y,label,{fontFamily:'monospace',fontSize:'11px',color:'#9ba4b7'});
    return this.add.text(x+40,y-2,value,{fontFamily:'monospace',fontSize:'14px',color:'#f4eed7',fontStyle:'bold'});
  }

  makeMeter(x,y,label,color,key){
    this.add.text(x,y+7,label,{fontFamily:'monospace',fontSize:'11px',color:'#9ba4b7'});
    this.add.rectangle(x+78,y+14,108,14,0x252c3a).setStrokeStyle(1,0xffffff);
    this[key+'Bar']=this.add.rectangle(x+25,y+14,106,12,color).setOrigin(0,.5);
  }

  makeRacers(){
    this.death=this.makeDeathPacer();
    this.riders=this.riderColors.map((data,index)=>({
      data, sprite:this.makeRiderSprite(data,index), progress:0,
      speedKmh:0, cadence:90, lane:1, laneVisual:1, laneTarget:1,
      decisionTimer:0.8+Math.random()*1.4
    }));
  }

  makeDeathPacer(){
    const c=this.add.container(0,0);
    const rear=this.add.rectangle(-14,0,18,8,0x101010);
    const frame=this.add.rectangle(1,0,34,7,0x777777);
    const front=this.add.rectangle(23,0,13,5,0x101010);
    const cloak=this.add.rectangle(-2,0,20,18,0x050509);
    const skull=this.add.circle(5,0,6,0xe8dfca);
    const scythe=this.add.graphics();
    scythe.lineStyle(2,0xbac2cc,1); scythe.beginPath(); scythe.moveTo(2,-7); scythe.lineTo(18,-22); scythe.strokePath();
    scythe.beginPath(); scythe.arc(18,-18,8,-1.7,.8,false); scythe.strokePath();
    c.add([rear,frame,front,cloak,skull,scythe]); c.setDepth(20); return c;
  }

  makeRiderSprite(data,index){
    const c=this.add.container(0,0);
    const rear=this.add.rectangle(-7,0,8,3,0x101010);
    const frame=this.add.rectangle(1,0,18,2,0xd8d8d8);
    const front=this.add.rectangle(9,0,8,3,0x101010);
    const body=this.add.rectangle(0,0,9,9,data.color);
    const helmet=this.add.circle(-1,0,5,data.color);
    const num=this.add.text(0,0,String(data.n),{fontFamily:'monospace',fontSize:'7px',color:data.text,fontStyle:'bold'}).setOrigin(.5);
    c.add([rear,frame,front,body,helmet,num]); c.setDepth(index===this.playerIndex?18:15);
    if(index===this.playerIndex){ const m=this.add.graphics(); m.lineStyle(2,0x22d9ff,1); m.strokeCircle(0,0,10); c.add(m); }
    return c;
  }

  renderRacer(r){
    const radius=this.laneRadius(r.laneVisual);
    const p=this.pointAtProgress(r.progress,radius);
    r.sprite.setPosition(p.x,p.y);
    r.sprite.setRotation(this.tangentAtProgress(r.progress,radius));
  }

  renderAllRacers(){
    this.riders.forEach(r=>this.renderRacer(r));
    if(this.phase==='PACER' && this.death.visible){
      const p=this.pointAtProgress(this.pacerProgress,this.track.referenceR);
      this.death.setPosition(p.x,p.y);
      this.death.setRotation(this.tangentAtProgress(this.pacerProgress,this.track.referenceR));
    }
  }

  resetGame(){
    this.phase='PACER'; this.running=false; this.finished=false;
    this.stamina=100; this.flow=82; this.cadence=82;
    this.lastPedalKey=null; this.lastPedalTime=0; this.intervals=[];
    this.pacerProgress=.10; this.pacerSpeedKmh=35; this.pacerStartProgress=this.pacerProgress;
    const spacing=34/this.perimeter(this.track.referenceR);
    this.riders.forEach((r,i)=>{
      r.progress=this.pacerProgress-spacing*(i+1); r.speedKmh=35; r.cadence=82;
      r.lane=1; r.laneVisual=1; r.laneTarget=1; r.decisionTimer=.8+Math.random()*1.4;
    });
    this.openRaceStartProgress=0; this.openRaceFinishProgress=0;
    this.attackCooldown=0; this.attackIntentTimer=0;
    this.death.setVisible(true); this.phaseText.setText('DEATH PACER  //  LAP 1/1');
    this.lineText.setText('--'); this.attackText.setText('');
    this.renderAllRacers(); this.updateHUD();
  }

  startGame(){
    if(this.running)return;
    if(this.finished)this.resetGame();
    this.hideCenterMessage(); this.running=true;
  }

  cadenceToKmh(cadence){
    const ratio=49/14, wheel=2.096;
    return cadence*ratio*wheel*60/1000;
  }

  handlePedal(code){
    if(!this.running||this.finished)return;
    const now=this.time.now;
    if(this.lastPedalKey===code){ this.flow=Math.max(0,this.flow-1.5); return; }
    if(this.lastPedalTime>0){
      const interval=now-this.lastPedalTime;
      if(interval>=120&&interval<1800){
        this.intervals.push(interval); if(this.intervals.length>6)this.intervals.shift();
        const avg=this.intervals.reduce((a,b)=>a+b,0)/this.intervals.length;
        this.cadence=Phaser.Math.Clamp(30000/avg,0,145);
        const variance=this.intervals.reduce((s,v)=>s+Math.abs(v-avg),0)/this.intervals.length;
        const consistency=Phaser.Math.Clamp(1-variance/220,0,1);
        this.flow=Phaser.Math.Clamp(this.flow+2.2*consistency-.3*(1-consistency),0,100);
      }
    }
    this.lastPedalKey=code; this.lastPedalTime=now;
  }

  changeLane(direction){
    if(!this.running||this.phase!=='RACE'||this.finished)return;
    const p=this.riders[this.playerIndex];
    const next=Phaser.Math.Clamp(p.laneTarget+direction,0,2);
    if(next!==p.laneTarget){ p.laneTarget=next; p.lane=next; this.attackIntentTimer=1.4; }
  }

  updateLaneVisuals(dt){
    this.riders.forEach(r=>{
      const diff=r.laneTarget-r.laneVisual;
      if(Math.abs(diff)<.005){ r.laneVisual=r.laneTarget; return; }
      const move=4.5*dt; r.laneVisual+=Phaser.Math.Clamp(diff,-move,move);
    });
  }

  pacerTargetKmh(){
    const p=Phaser.Math.Clamp(this.pacerProgress-this.pacerStartProgress,0,1);
    return Phaser.Math.Linear(35,40,p);
  }

  updatePacerPhase(dt){
    const player=this.riders[this.playerIndex];
    this.pacerSpeedKmh=Phaser.Math.Linear(this.pacerSpeedKmh,this.pacerTargetKmh(),.8*dt);
    this.pacerProgress+=this.progressPerSecond(this.pacerSpeedKmh)*dt;
    const spacing=34/this.perimeter(this.track.referenceR);
    this.riders.forEach((r,i)=>{
      if(i===this.playerIndex)return;
      r.progress=this.pacerProgress-spacing*(i+1); r.speedKmh=this.pacerSpeedKmh; r.cadence=82;
    });
    const desired=this.pacerProgress-spacing*(this.playerIndex+1);
    const gapPx=this.longitudinalPixels(desired-player.progress);
    const gapM=Math.max(0,gapPx/3);
    const targetByCad=this.cadenceToKmh(this.cadence);
    const targetKmh=Math.min(this.getStaminaSpeedCap(),Math.max(28,targetByCad*Phaser.Math.Linear(.955,.995,this.flow/100)));
    player.speedKmh=this.approach(player.speedKmh,targetKmh,6*dt,2.6*dt);
    player.progress+=this.progressPerSecond(player.speedKmh)*dt;
    if(gapPx<-8){ player.progress=desired+8/this.perimeter(this.track.referenceR); player.speedKmh=Math.min(player.speedKmh,this.pacerSpeedKmh*1.005); }
    let staminaRate=0;
    if(gapM<=4.5&&this.flow>=58){ staminaRate=this.cadence<=112?2.5:.4; this.flow=Math.min(100,this.flow+2.4*dt); }
    else if(gapM<=7.5){ staminaRate=0; this.flow=Math.max(0,this.flow-.25*dt); }
    else if(gapM<=11){ staminaRate=-(.8+Math.max(0,this.cadence-103)*.02); this.flow=Math.max(0,this.flow-1.2*dt); }
    else { staminaRate=-(1.8+Math.max(0,this.cadence-98)*.035); this.flow=Math.max(0,this.flow-2.4*dt); }
    this.stamina=Phaser.Math.Clamp(this.stamina+staminaRate*dt,0,100);
    this.decayCadence(dt,2200,7);
    if(this.pacerProgress-this.pacerStartProgress>=1){ this.beginOpenRace(); return; }
    this.statusText.setText(`${Math.max(0,Math.round(gapM))} m`); this.lineText.setText('--');
    if(gapM>10){ this.tipText.setText('GAP — recupere o Flow'); this.tipText.setColor('#ffcc33'); }
    else if(this.flow>75){ this.tipText.setText('FLOW — stamina protegida'); this.tipText.setColor('#ff2b6d'); }
    else { this.tipText.setText('49x14  //  ~82–95 RPM'); this.tipText.setColor('#9ba4b7'); }
  }

  beginOpenRace(){
    this.running=false;
    this.showCenterMessage('DEATH IS LEAVING','2 voltas abertas.\n↑ linha externa   ↓ linha interna\nUltrapasse — não atravesse.');
    this.time.delayedCall(1050,()=>{
      this.phase='RACE'; this.death.setVisible(false);
      const player=this.riders[this.playerIndex];
      this.openRaceStartProgress=player.progress; this.openRaceFinishProgress=player.progress+2;
      this.riders.forEach((r,i)=>{ r.lane=1;r.laneVisual=1;r.laneTarget=1; if(i!==this.playerIndex){r.speedKmh=40+Math.random()*3;r.cadence=92+Math.random()*10;} });
      this.hideCenterMessage(); this.running=true; this.tipText.setText('↑ OUT   ↓ IN   //   ← → PEDAL'); this.tipText.setColor('#9ba4b7');
    });
  }

  updateOpenRace(dt){
    const player=this.riders[this.playerIndex];
    const targetKmh=Math.min(this.getStaminaSpeedCap(),Math.max(27,this.cadenceToKmh(this.cadence)*Phaser.Math.Linear(.95,1.01,this.flow/100)));
    player.speedKmh=this.approach(player.speedKmh,targetKmh,7*dt,3*dt);
    const proposed=player.progress+this.progressPerSecond(player.speedKmh)*dt;
    const blocker=this.findBlocker(this.playerIndex,player.lane,proposed);
    if(blocker){ player.progress=blocker.progress-27/this.perimeter(this.track.referenceR); player.speedKmh=Math.min(player.speedKmh,blocker.speedKmh*.985); this.tipText.setText('BLOCKED — USE ↑ / ↓'); this.tipText.setColor('#ffcc33'); }
    else player.progress=proposed;

    let cost=.15; if(this.cadence>105)cost=1; if(this.cadence>118)cost=2.8+(this.cadence-118)*.075; if(this.flow>78)cost*=.78;
    this.stamina=Phaser.Math.Clamp(this.stamina-cost*dt,0,100);

    this.updateCPUs(dt);
    if(this.attackCooldown>0)this.attackCooldown-=dt; if(this.attackIntentTimer>0)this.attackIntentTimer-=dt;
    const nearby=this.findNearestAhead(this.playerIndex,.08);
    if(this.cadence>=115&&this.stamina>7&&this.attackCooldown<=0&&(this.attackIntentTimer>0||nearby)){ this.showAttack(); this.attackCooldown=2.2; }
    this.decayCadence(dt,1900,8);

    const travel=player.progress-this.openRaceStartProgress;
    const lap=Math.min(2,1+Math.floor(Math.max(0,travel)));
    this.phaseText.setText(`OPEN RACE  //  LAP ${lap}/2`);
    this.statusText.setText(`POS ${this.computePosition()}/7`);
    this.lineText.setText(['IN','MID','OUT'][player.lane]);
    if(this.stamina<=1){ this.tipText.setText('EXHAUSTED — MAX ~34 km/h'); this.tipText.setColor('#ff5a5a'); }
    const winner=this.riders.find(r=>r.progress>=this.openRaceFinishProgress);
    if(winner)this.finishRace(winner);
  }

  updateCPUs(dt){
    this.riders.forEach((r,i)=>{
      if(i===this.playerIndex)return;
      r.decisionTimer-=dt;
      if(r.decisionTimer<=0){
        r.decisionTimer=.75+Math.random()*1.7;
        const roll=Math.random();
        r.cadence=roll<.20?113+Math.random()*11:roll<.60?96+Math.random()*9:88+Math.random()*8;
        if(Math.random()<.24){ r.laneTarget=Phaser.Math.Clamp(r.laneTarget+(Math.random()<.5?-1:1),0,2); r.lane=r.laneTarget; }
      }
      const target=Phaser.Math.Clamp(this.cadenceToKmh(r.cadence),36,56);
      r.speedKmh=this.approach(r.speedKmh,target,4.6*dt,2.8*dt);
      const proposed=r.progress+this.progressPerSecond(r.speedKmh)*dt;
      const blocker=this.findBlocker(i,r.lane,proposed);
      if(blocker){
        r.progress=blocker.progress-24/this.perimeter(this.track.referenceR); r.speedKmh=Math.min(r.speedKmh,blocker.speedKmh*.99);
        if(Math.random()<.10){ r.laneTarget=Phaser.Math.Clamp(r.lane+(Math.random()<.5?-1:1),0,2); r.lane=r.laneTarget; }
      } else r.progress=proposed;
    });
  }

  findBlocker(index,lane,proposed){
    const threshold=30/this.perimeter(this.track.referenceR); let nearest=null,deltaMin=Infinity;
    this.riders.forEach((o,j)=>{ if(j===index||o.lane!==lane)return; const d=o.progress-proposed; if(d>0&&d<threshold&&d<deltaMin){nearest=o;deltaMin=d;} });
    return nearest;
  }

  findNearestAhead(index,maxDelta){
    const r=this.riders[index]; let nearest=null,deltaMin=Infinity;
    this.riders.forEach((o,j)=>{ if(j===index)return; const d=o.progress-r.progress; if(d>0&&d<maxDelta&&d<deltaMin){nearest=o;deltaMin=d;} });
    return nearest;
  }

  computePosition(){
    const sorted=[...this.riders].sort((a,b)=>b.progress-a.progress);
    return sorted.indexOf(this.riders[this.playerIndex])+1;
  }

  finishRace(winner){
    if(this.finished)return; this.finished=true; this.running=false;
    const pos=this.computePosition();
    this.showCenterMessage(winner===this.riders[this.playerIndex]?'YOU WIN':'FINISH',`POSIÇÃO ${pos}/7\nStamina: ${Math.round(this.stamina)}%\n\nR para reiniciar`);
  }

  getStaminaSpeedCap(){
    if(this.stamina<=1)return 34;
    if(this.stamina<20)return Phaser.Math.Linear(34,47,this.stamina/20);
    if(this.stamina<50)return Phaser.Math.Linear(47,59,(this.stamina-20)/30);
    return 59;
  }

  approach(current,target,up,down){ return current<target?Math.min(target,current+up):Math.max(target,current-down); }

  decayCadence(dt,delay,rate){
    if(this.time.now-this.lastPedalTime>delay){ this.cadence=Math.max(0,this.cadence-rate*dt); this.flow=Math.max(0,this.flow-.4*dt); }
  }

  showAttack(){
    this.attackText.setText('☠ ATTACK ☠'); this.attackText.setScale(1.35);
    this.tweens.add({targets:this.attackText,scale:1,duration:230,ease:'Back.Out'});
    this.time.delayedCall(850,()=>{ if(this.attackText.text==='☠ ATTACK ☠')this.attackText.setText(''); });
  }

  updateHUD(){
    const p=this.riders[this.playerIndex];
    this.speedText.setText(`${Math.round(p.speedKmh)} km/h`); this.cadenceText.setText(`${Math.round(this.cadence)} rpm`);
    this.staminaBar.width=106*(this.stamina/100); this.flowBar.width=106*(this.flow/100);
    if(this.phase==='PACER'){
      const spacing=34/this.perimeter(this.track.referenceR); const desired=this.pacerProgress-spacing*(this.playerIndex+1);
      const gap=Math.max(0,this.longitudinalPixels(desired-p.progress)/3); this.statusText.setText(`${Math.round(gap)} m`);
    } else this.statusText.setText(`POS ${this.computePosition()}/7`);
  }

  showCenterMessage(title,subtitle){
    if(this.messageGroup)this.messageGroup.destroy(true);
    const panel=this.add.rectangle(480,330,470,188,0x080a10,.95).setStrokeStyle(3,0xff2b6d).setDepth(100);
    const t=this.add.text(480,290,title,{fontFamily:'monospace',fontSize:'28px',color:'#f4eed7',fontStyle:'bold'}).setOrigin(.5).setDepth(101);
    const s=this.add.text(480,352,subtitle,{fontFamily:'monospace',fontSize:'13px',align:'center',color:'#b5bdcb',lineSpacing:5}).setOrigin(.5).setDepth(101);
    this.messageGroup=this.add.container(0,0,[panel,t,s]).setDepth(100);
  }

  hideCenterMessage(){ if(this.messageGroup){this.messageGroup.destroy(true);this.messageGroup=null;} }

  bindInput(){
    this.input.keyboard.on('keydown-SPACE',()=>this.startGame());
    this.input.keyboard.on('keydown-LEFT',()=>this.handlePedal('LEFT'));
    this.input.keyboard.on('keydown-RIGHT',()=>this.handlePedal('RIGHT'));
    this.input.keyboard.on('keydown-UP',()=>this.changeLane(+1));
    this.input.keyboard.on('keydown-DOWN',()=>this.changeLane(-1));
    this.input.keyboard.on('keydown-R',()=>{
      this.hideCenterMessage(); this.resetGame();
      this.showCenterMessage('FOLLOW DEATH','1 volta com pacer.\n← → = cadência\nPoupe stamina para as duas voltas finais.\n\nESPAÇO para começar');
    });
  }

  update(time,delta){
    const dt=Math.min(delta/1000,.05);
    if(this.running&&!this.finished){ if(this.phase==='PACER')this.updatePacerPhase(dt); else this.updateOpenRace(dt); }
    this.updateLaneVisuals(dt); this.renderAllRacers(); this.updateHUD();
  }
}
