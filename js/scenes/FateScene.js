class FateScene extends Phaser.Scene {
  constructor(){ super('FateScene'); }

  create(){
    this.cameras.main.setBackgroundColor('#080a10');

    this.riders = [
      {id:1,name:'WHITE', color:0xf5f2e8},
      {id:2,name:'BLACK', color:0x171717},
      {id:3,name:'RED', color:0xd92929},
      {id:4,name:'BLUE', color:0x2467d9},
      {id:5,name:'YELLOW', color:0xffd331},
      {id:6,name:'GREEN', color:0x1c9d41},
      {id:7,name:'ORANGE', color:0xef7c1b}
    ];

    this.selectedIndex = this.registry.get('selectedRiderIndex') ?? 0;
    this.results = [];
    this.rolling = false;
    this.phase = 'FATE';

    this.drawHeader();
    this.drawFateScreen();

    this.input.keyboard.on('keydown-SPACE',()=>this.handleAction());
    this.input.keyboard.on('keydown-ENTER',()=>this.handleAction());
    this.input.keyboard.on('keydown-ESC',()=>{
      if(!this.rolling) this.scene.start('RiderSelectScene');
    });
  }

  drawHeader(){
    this.add.text(32,24,'☠ VELODEATH KEIRIN',{
      fontFamily:'monospace',fontSize:'26px',color:'#f4eed7',fontStyle:'bold'
    });

    this.add.text(480,28,'運命 / FATE DRAW',{
      fontFamily:'monospace',fontSize:'18px',color:'#22d9ff'
    }).setOrigin(.5,0);

    this.add.text(930,28,'2D6 PER RIDER',{
      fontFamily:'monospace',fontSize:'14px',color:'#ff2b6d'
    }).setOrigin(1,0);
  }

  drawFateScreen(){
    this.panelLeft=this.add.rectangle(250,350,430,530,0x0e1420,.98)
      .setStrokeStyle(2,0x343e55);

    this.panelRight=this.add.rectangle(700,350,410,530,0x0e1420,.98)
      .setStrokeStyle(2,0x343e55);

    this.add.text(54,102,'RIDERS',{
      fontFamily:'monospace',fontSize:'17px',color:'#ff2b6d',fontStyle:'bold'
    });

    this.rows=[];

    this.riders.forEach((r,i)=>{
      const y=140+i*57;
      const selected=i===this.selectedIndex;

      const bg=this.add.rectangle(54,y,390,45,selected?0x20283a:0x182032)
        .setOrigin(0,0)
        .setStrokeStyle(selected?2:0,selected?0x22d9ff:0x000000);

      const sw=this.add.rectangle(72,y+22,14,14,r.color)
        .setStrokeStyle(1,0xffffff);

      const label=this.add.text(94,y+12,`RIDER ${r.id} — ${r.name}`,{
        fontFamily:'monospace',fontSize:'13px',color:'#f4eed7'
      });

      const score=this.add.text(420,y+12,'—',{
        fontFamily:'monospace',fontSize:'13px',color:'#22d9ff',fontStyle:'bold'
      }).setOrigin(1,0);

      this.rows.push({bg,sw,label,score});
    });

    this.add.text(700,118,'THE DEATH ROLLS THE BONES',{
      fontFamily:'monospace',fontSize:'18px',color:'#ff2b6d',fontStyle:'bold'
    }).setOrigin(.5);

    this.add.text(700,150,'Highest 2D6 total gets the best position.',{
      fontFamily:'monospace',fontSize:'12px',color:'#9ba4b7'
    }).setOrigin(.5);

    this.die1=this.makeDie(630,280);
    this.die2=this.makeDie(770,280);

    this.currentText=this.add.text(700,382,'READY TO ROLL',{
      fontFamily:'monospace',fontSize:'15px',color:'#f4eed7'
    }).setOrigin(.5);

    this.resultText=this.add.text(700,424,'—',{
      fontFamily:'monospace',fontSize:'34px',color:'#ffd331',fontStyle:'bold'
    }).setOrigin(.5);

    this.actionText=this.add.text(700,520,'PRESS SPACE TO ROLL ALL RIDERS',{
      fontFamily:'monospace',fontSize:'15px',color:'#22d9ff'
    }).setOrigin(.5);

    this.add.text(700,558,'2D6 • TOTAL • HIGH DIE TIEBREAK',{
      fontFamily:'monospace',fontSize:'11px',color:'#9ba4b7'
    }).setOrigin(.5);

    this.add.text(480,672,'ESC BACK',{
      fontFamily:'monospace',fontSize:'12px',color:'#9ba4b7'
    }).setOrigin(.5);
  }

  makeDie(x,y){
    const c=this.add.container(x,y);
    const bg=this.add.rectangle(0,0,104,104,0xf4eed7).setStrokeStyle(4,0x111111);
    c.add(bg);

    const pipPos=[
      [-28,-28],[0,-28],[28,-28],
      [-28,0],[0,0],[28,0],
      [-28,28],[0,28],[28,28]
    ];

    const pips=pipPos.map(([px,py])=>{
      const p=this.add.circle(px,py,7,0x111111);
      p.setVisible(false); c.add(p); return p;
    });

    c.pips=pips;
    return c;
  }

  setDie(container,value){
    const map={
      1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],
      5:[0,2,4,6,8],6:[0,2,3,5,6,8]
    };

    container.pips.forEach((p,i)=>p.setVisible(map[value].includes(i)));
  }

  randomDie(){ return Phaser.Math.Between(1,6); }

  handleAction(){
    if(this.rolling) return;

    if(this.phase==='FATE'){
      this.rollAllAnimated();
    }else if(this.phase==='LINEUP'){
      this.scene.start('LineupScene');
    }
  }

  async rollAllAnimated(){
    this.rolling=true;
    this.results=[];

    for(let i=0;i<this.riders.length;i++){
      const r=this.riders[i];

      this.rows.forEach((row,j)=>{
        row.bg.setStrokeStyle(j===i?2:(j===this.selectedIndex?2:0),
          j===i?0xff2b6d:(j===this.selectedIndex?0x22d9ff:0x000000));
      });

      this.currentText.setText(`RIDER ${r.id} — ${r.name}`);
      this.resultText.setText('ROLLING...');

      await this.rollVisual(520);

      const d1=this.randomDie();
      const d2=this.randomDie();
      const total=d1+d2;
      const high=Math.max(d1,d2);

      this.setDie(this.die1,d1);
      this.setDie(this.die2,d2);

      this.resultText.setText(`${d1} + ${d2} = ${total}`);
      this.rows[i].score.setText(`${d1}+${d2}=${total}`);

      this.results.push({...r,index:i,d1,d2,total,high});

      await this.delay(260);
    }

    this.finalizeResults();
    this.rolling=false;
  }

  rollVisual(duration){
    return new Promise(resolve=>{
      let elapsed=0;

      const event=this.time.addEvent({
        delay:70,
        loop:true,
        callback:()=>{
          elapsed+=70;
          this.setDie(this.die1,this.randomDie());
          this.setDie(this.die2,this.randomDie());

          this.die1.rotation=Phaser.Math.FloatBetween(-.06,.06);
          this.die2.rotation=Phaser.Math.FloatBetween(-.06,.06);

          if(elapsed>=duration){
            event.remove();
            this.die1.rotation=0;
            this.die2.rotation=0;
            resolve();
          }
        }
      });
    });
  }

  delay(ms){
    return new Promise(resolve=>this.time.delayedCall(ms,resolve));
  }

  finalizeResults(){
    // Same approved rule: total desc, then high die desc, then random tie breaker.
    this.results.sort((a,b)=>
      b.total-a.total ||
      b.high-a.high ||
      Math.random()-.5
    );

    const order=this.results.map(r=>r.index);
    this.registry.set('fateOrder',order);
    this.registry.set('fateResults',this.results);

    const playerPosition=order.indexOf(this.selectedIndex)+1;

    this.currentText.setText('FATE DECIDED');
    this.resultText.setText(`YOU START P${playerPosition}`);
    this.actionText.setText('PRESS ENTER / SPACE TO VIEW LINE-UP');
    this.phase='LINEUP';
  }
}
