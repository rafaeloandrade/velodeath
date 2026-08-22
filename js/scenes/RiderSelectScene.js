class RiderSelectScene extends Phaser.Scene{
  constructor(){super('RiderSelectScene')}
  create(){
    this.cameras.main.setBackgroundColor('#05070c');
    this.riders=[
      {n:1,name:'WHITE',color:0xf5f2e8,text:'#101010',profile:'ALLROUND',stats:[4,4,4,4]},
      {n:2,name:'BLACK',color:0x222222,text:'#ffffff',profile:'STAYER',stats:[3,5,3,5]},
      {n:3,name:'RED',color:0xd92929,text:'#ffffff',profile:'ATTACKER',stats:[5,3,5,2]},
      {n:4,name:'BLUE',color:0x2467d9,text:'#ffffff',profile:'SPRINTER',stats:[5,3,4,3]},
      {n:5,name:'YELLOW',color:0xffd331,text:'#101010',profile:'ECONOMIST',stats:[3,5,3,5]},
      {n:6,name:'GREEN',color:0x1c9d41,text:'#ffffff',profile:'DEFENDER',stats:[3,4,3,5]},
      {n:7,name:'ORANGE',color:0xef7c1b,text:'#ffffff',profile:'WILDCARD',stats:[4,3,5,3]}
    ];
    this.selected=0; this.cards=[];
    this.add.text(480,22,'ベロデス・ケイリン',{fontFamily:'monospace',fontSize:'16px',color:'#f2ead5'}).setOrigin(.5);
    this.add.text(480,45,'死神 VELODEATH KEIRIN',{fontFamily:'monospace',fontSize:'30px',color:'#ff2b6d',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(480,92,'死神は競輪を愛す',{fontFamily:'monospace',fontSize:'18px',color:'#ffcf24'}).setOrigin(.5);
    this.add.text(32,126,'CICLISTAS (KEIRIN SKULL RIDERS)',{fontFamily:'monospace',fontSize:'16px',color:'#ff2b6d'});

    for(let i=0;i<7;i++){
      const x=32+i*108; const card=this.add.container(x,175);
      const panel=this.add.rectangle(0,0,96,328,0x0b0f18,.92).setOrigin(0,0).setStrokeStyle(2,0x283248);
      const rider=this.makeSkullRider(this.riders[i],48,75,1.05); card.add([panel,rider]);
      card.add(this.add.text(48,168,`${this.riders[i].n} ${this.riders[i].name}`,{fontFamily:'monospace',fontSize:'13px',color:'#f4eed7'}).setOrigin(.5));
      const labels=['SPR','STM','ACC','FLW'];
      labels.forEach((lab,j)=>{
        const y=205+j*26;
        card.add(this.add.text(8,y,lab,{fontFamily:'monospace',fontSize:'9px',color:'#9ba4b7'}));
        for(let b=0;b<5;b++)card.add(this.add.rectangle(48+b*8,y+5,6,6,b<this.riders[i].stats[j]?this.riders[i].color:0x303642));
      });
      this.cards.push(card);
    }

    this.infoPanel=this.add.rectangle(800,158,135,326,0x080a10,.96).setOrigin(0,0).setStrokeStyle(2,0xff2b6d);
    this.infoTitle=this.add.text(812,178,'',{fontFamily:'monospace',fontSize:'18px',color:'#f4eed7',fontStyle:'bold'});
    this.infoProfile=this.add.text(812,214,'',{fontFamily:'monospace',fontSize:'12px',color:'#22b7ff'});
    this.infoDesc=this.add.text(812,248,'',{fontFamily:'monospace',fontSize:'11px',color:'#c1c6d0',wordWrap:{width:110},lineSpacing:5});

    this.add.text(480,525,'← → ESCOLHER     ENTER CONFIRMAR     ESC VOLTAR',{fontFamily:'monospace',fontSize:'14px',color:'#f4eed7'}).setOrigin(.5);
    this.add.rectangle(480,625,900,88,0x080a10,.9).setStrokeStyle(1,0x283248);
    this.add.text(480,630,'CHOOSE YOUR FATE, START RACE.',{fontFamily:'monospace',fontSize:'16px',color:'#22b7ff'}).setOrigin(.5);

    this.input.keyboard.on('keydown-LEFT',()=>this.move(-1));
    this.input.keyboard.on('keydown-RIGHT',()=>this.move(1));
    this.input.keyboard.on('keydown-ENTER',()=>this.confirm());
    this.input.keyboard.on('keydown-SPACE',()=>this.confirm());
    this.input.keyboard.on('keydown-ESC',()=>this.scene.start('TitleScene'));
    this.refresh();
  }
  makeSkullRider(data,x,y,scale){
    const c=this.add.container(x,y); c.setScale(scale);
    c.add(this.add.circle(-20,22,16,0x0a0a0a).setStrokeStyle(2,data.color));
    c.add(this.add.circle(22,22,16,0x0a0a0a).setStrokeStyle(2,data.color));
    c.add(this.add.line(0,0,-20,22,2,3,data.color).setLineWidth(2));
    c.add(this.add.line(0,0,2,3,22,22,data.color).setLineWidth(2));
    c.add(this.add.rectangle(-4,-5,20,26,data.color));
    c.add(this.add.circle(-6,-24,10,0xf1dfbd));
    c.add(this.add.circle(-9,-26,3,0x000000)); c.add(this.add.circle(-2,-26,3,0x000000));
    c.add(this.add.rectangle(-6,-18,8,3,0x000000));
    c.add(this.add.text(-4,-7,String(data.n),{fontFamily:'monospace',fontSize:'9px',color:data.text,fontStyle:'bold'}).setOrigin(.5));
    return c;
  }
  move(dir){this.selected=Phaser.Math.Wrap(this.selected+dir,0,7);this.refresh();}
  refresh(){
    this.cards.forEach((card,i)=>{const panel=card.list[0];panel.setStrokeStyle(2,i===this.selected?0xff2b6d:0x283248);card.setScale(i===this.selected?1.035:1);});
    const r=this.riders[this.selected]; this.infoTitle.setText(`${r.n} ${r.name}`); this.infoProfile.setText(r.profile);
    const desc={ALLROUND:'Equilibrado e confiável.',STAYER:'Mantém ritmo forte por muito tempo.',ATTACKER:'Explosivo e agressivo.',SPRINTER:'Guarda energia para o final.',ECONOMIST:'Especialista em Flow e recuperação.',DEFENDER:'Ótimo posicionamento.',WILDCARD:'Imprevisível e veloz.'};
    this.infoDesc.setText(desc[r.profile]);
  }
  confirm(){
    const chosen=this.riders[this.selected];
    this.registry.set('selectedRider',chosen); this.registry.set('selectedRiderIndex',this.selected);
    this.scene.start('FateScene');
  }
}
