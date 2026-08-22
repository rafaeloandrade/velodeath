class FateScene extends Phaser.Scene{
  constructor(){super('FateScene')}
  create(){
    this.cameras.main.setBackgroundColor('#06080d');
    this.add.text(480,44,'FATE DRAW',{fontFamily:'monospace',fontSize:'34px',color:'#ff2b6d',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(480,92,'運命',{fontFamily:'monospace',fontSize:'28px',color:'#ffcf24'}).setOrigin(.5);
    this.add.text(480,132,'ROLL TO DEFINE THE LINE-UP',{fontFamily:'monospace',fontSize:'16px',color:'#f4eed7'}).setOrigin(.5);
    this.dice=[]; this.finished=false; this.rolling=false;
    const selected=this.registry.get('selectedRiderIndex') ?? 0;
    for(let i=0;i<7;i++){
      const x=150+(i%4)*220, y=i<4?260:450;
      this.add.rectangle(x,y,88,88,0x101622).setStrokeStyle(3,i===selected?0x22b7ff:0xff2b6d);
      const num=this.add.text(x,y,'?',{fontFamily:'monospace',fontSize:'42px',color:'#f4eed7',fontStyle:'bold'}).setOrigin(.5);
      const label=this.add.text(x,y+68,`RIDER ${i+1}`,{fontFamily:'monospace',fontSize:'14px',color:'#9ba4b7'}).setOrigin(.5);
      this.dice.push({num,label});
    }
    this.message=this.add.text(480,610,'PRESS SPACE TO ROLL FATE',{fontFamily:'monospace',fontSize:'18px',color:'#22b7ff'}).setOrigin(.5);
    this.input.keyboard.on('keydown-SPACE',()=>this.roll());
    this.input.keyboard.on('keydown-ENTER',()=>this.roll());
  }
  roll(){
    if(this.finished){this.scene.start('PacerScene');return;}
    if(this.rolling)return;
    this.rolling=true; let ticks=0;
    this.rollEvent=this.time.addEvent({delay:75,loop:true,callback:()=>{
      ticks++; this.dice.forEach(d=>d.num.setText(String(Phaser.Math.Between(1,6))));
      if(ticks>=18){this.rollEvent.remove();this.resolveFate();}
    }});
  }
  resolveFate(){
    const rolls=[];
    for(let i=0;i<7;i++)rolls.push({index:i,score:Phaser.Math.Between(1,6)+Math.random()});
    rolls.sort((a,b)=>b.score-a.score);
    const order=rolls.map(r=>r.index); this.registry.set('fateOrder',order);
    order.forEach((riderIndex,pos)=>{this.dice[riderIndex].num.setText(String(pos+1));this.dice[riderIndex].label.setText(`RIDER ${riderIndex+1} • P${pos+1}`);});
    const selected=this.registry.get('selectedRiderIndex') ?? 0;
    this.message.setText(`YOUR FATE: POSITION ${order.indexOf(selected)+1}/7   •   PRESS ENTER`);
    this.finished=true; this.rolling=false;
  }
}
