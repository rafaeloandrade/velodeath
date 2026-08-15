class BootScene extends Phaser.Scene {
  constructor(){ super('BootScene'); }
  create(){
    this.cameras.main.setBackgroundColor('#070910');
    const cx=this.scale.width/2, cy=this.scale.height/2;
    this.add.text(cx,cy-34,'☠ VELODEATH KEIRIN',{fontFamily:'monospace',fontSize:'30px',color:'#f4eed7',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(cx,cy+12,'v0.4.3 // DEATH PACER TEST',{fontFamily:'monospace',fontSize:'13px',color:'#22d9ff'}).setOrigin(.5);
    this.time.delayedCall(550,()=>this.scene.start('PacerScene'));
  }
}