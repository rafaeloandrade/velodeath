class LineupScene extends Phaser.Scene {
  constructor(){ super('LineupScene'); }

  create(){
    this.cameras.main.setBackgroundColor('#080a10');

    const results=this.registry.get('fateResults')||[];
    const selected=this.registry.get('selectedRiderIndex') ?? 0;

    this.add.text(32,24,'☠ VELODEATH KEIRIN',{
      fontFamily:'monospace',fontSize:'26px',color:'#f4eed7',fontStyle:'bold'
    });

    this.add.text(480,28,'運命決定 / LINE-UP',{
      fontFamily:'monospace',fontSize:'18px',color:'#22d9ff'
    }).setOrigin(.5,0);

    this.add.text(930,28,'SINGLE FILE BEHIND DEATH',{
      fontFamily:'monospace',fontSize:'13px',color:'#ff2b6d'
    }).setOrigin(1,0);

    this.add.rectangle(480,360,850,530,0x0e1420,.98)
      .setStrokeStyle(2,0x343e55);

    this.add.text(480,108,'☠ DEATH PACER',{
      fontFamily:'monospace',fontSize:'22px',color:'#f4eed7',fontStyle:'bold'
    }).setOrigin(.5);

    if(!results.length){
      this.add.text(480,330,'NO FATE RESULT — PRESS ESC',{
        fontFamily:'monospace',fontSize:'18px',color:'#ff5a5a'
      }).setOrigin(.5);
    }else{
      results.forEach((r,pos)=>{
        const y=154+pos*58;
        const isPlayer=r.index===selected;

        const bg=this.add.rectangle(250,y,460,44,isPlayer?0x20304a:0x182032)
          .setOrigin(0,0)
          .setStrokeStyle(isPlayer?2:1,isPlayer?0x22d9ff:0x3d485f);

        this.add.text(270,y+10,`${pos+1}`,{
          fontFamily:'monospace',fontSize:'18px',color:'#22d9ff',fontStyle:'bold'
        });

        this.add.rectangle(310,y+22,14,14,r.color).setStrokeStyle(1,0xffffff);

        this.add.text(332,y+11,`RIDER ${r.id} — ${r.name}`,{
          fontFamily:'monospace',fontSize:'14px',color:'#f4eed7'
        });

        this.add.text(685,y+11,`${r.d1}+${r.d2}=${r.total}`,{
          fontFamily:'monospace',fontSize:'13px',color:'#ffd331'
        }).setOrigin(1,0);

        if(isPlayer){
          this.add.text(720,y+11,'YOU',{
            fontFamily:'monospace',fontSize:'13px',color:'#22d9ff',fontStyle:'bold'
          });
        }
      });
    }

    this.add.text(480,624,'PRESS SPACE / ENTER TO FOLLOW DEATH',{
      fontFamily:'monospace',fontSize:'16px',color:'#22d9ff'
    }).setOrigin(.5);

    this.add.text(480,662,'ESC BACK TO RIDER SELECT',{
      fontFamily:'monospace',fontSize:'11px',color:'#9ba4b7'
    }).setOrigin(.5);

    this.input.keyboard.on('keydown-SPACE',()=>this.startRace());
    this.input.keyboard.on('keydown-ENTER',()=>this.startRace());
    this.input.keyboard.on('keydown-ESC',()=>this.scene.start('RiderSelectScene'));
  }

  startRace(){
    if(this.starting)return;
    this.starting=true;

    // Small delay prevents the same key event from leaking into the next scene.
    this.time.delayedCall(120,()=>this.scene.start('PacerScene'));
  }
}
