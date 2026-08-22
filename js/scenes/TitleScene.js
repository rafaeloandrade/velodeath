class TitleScene extends Phaser.Scene {
  constructor(){ super('TitleScene'); }
  create(){
    this.cameras.main.setBackgroundColor('#05070c');
    this.add.rectangle(480,360,960,720,0x05070c);
    const g=this.add.graphics();
    g.lineStyle(2,0xff2b6d,.8); g.strokeRect(10,10,940,700);
    for(let i=0;i<7;i++){g.lineStyle(1,0x17233a,.75);g.strokeEllipse(480,500,740-i*28,220-i*10);}
    this.add.text(28,24,'INSERT FATE',{fontFamily:'monospace',fontSize:'16px',color:'#ff2b6d'});
    this.add.text(930,24,'CREDIT 00',{fontFamily:'monospace',fontSize:'16px',color:'#ffd62e'}).setOrigin(1,0);
    this.add.text(480,48,'ベロデス・ケイリン',{fontFamily:'monospace',fontSize:'18px',color:'#f2ead5'}).setOrigin(.5);
    this.add.text(370,82,'☠',{fontFamily:'monospace',fontSize:'74px',color:'#f2ead5'}).setOrigin(.5);
    this.add.text(480,85,'死神',{fontFamily:'monospace',fontSize:'66px',color:'#e51f32',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(650,98,'VELODEATH',{fontFamily:'monospace',fontSize:'40px',color:'#22b7ff',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(480,182,'KEIRIN',{fontFamily:'monospace',fontSize:'78px',color:'#e51f32',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(480,242,'死神は競輪を愛す',{fontFamily:'monospace',fontSize:'24px',color:'#ffcf24'}).setOrigin(.5);

    this.options=['START','HOW TO PLAY','CREDITS']; this.selected=0; this.menuTexts=[];
    this.options.forEach((label,i)=>{
      const t=this.add.text(480,350+i*62,label,{fontFamily:'monospace',fontSize:i===0?'28px':'23px',color:'#f4eed7',fontStyle:'bold'}).setOrigin(.5);
      this.menuTexts.push(t);
    });
    this.cursor=this.add.text(370,350,'▶',{fontFamily:'monospace',fontSize:'26px',color:'#ff2b6d'}).setOrigin(.5);

    this.add.text(480,562,'INSERT FATE • PRESS ENTER',{fontFamily:'monospace',fontSize:'16px',color:'#22b7ff'}).setOrigin(.5);
    this.add.text(26,682,'© VELODEATH',{fontFamily:'monospace',fontSize:'14px',color:'#ff2b6d'});
    this.add.text(930,682,'VERSION 0.5',{fontFamily:'monospace',fontSize:'14px',color:'#22b7ff'}).setOrigin(1,0);

    const colors=[0xf5f2e8,0x222222,0xd92929,0x2467d9,0xffd331,0x1c9d41,0xef7c1b];
    colors.forEach((c,i)=>{
      const rider=this.add.container(620+i*42,525-i*2);
      rider.add(this.add.circle(0,-8,6,c)); rider.add(this.add.rectangle(0,2,12,12,c));
      rider.add(this.add.circle(-7,12,7,0x111111)); rider.add(this.add.circle(8,12,7,0x111111));
    });

    this.input.keyboard.on('keydown-UP',()=>this.move(-1));
    this.input.keyboard.on('keydown-DOWN',()=>this.move(1));
    this.input.keyboard.on('keydown-ENTER',()=>this.activate());
    this.input.keyboard.on('keydown-SPACE',()=>this.activate());
    this.updateMenu();
  }
  move(dir){this.selected=Phaser.Math.Wrap(this.selected+dir,0,this.options.length);this.updateMenu();}
  updateMenu(){this.cursor.y=350+this.selected*62;this.menuTexts.forEach((t,i)=>t.setColor(i===this.selected?'#ffd62e':'#f4eed7'));}
  activate(){
    const choice=this.options[this.selected];
    if(choice==='START')this.scene.start('RiderSelectScene');
    else if(choice==='HOW TO PLAY')this.scene.start('HowToPlayScene');
    else this.scene.start('CreditsScene');
  }
}
