class HowToPlayScene extends Phaser.Scene{
  constructor(){super('HowToPlayScene')}
  create(){
    this.cameras.main.setBackgroundColor('#080a10');
    this.add.text(480,70,'HOW TO PLAY',{fontFamily:'monospace',fontSize:'34px',color:'#ff2b6d',fontStyle:'bold'}).setOrigin(.5);
    const body=['← →  ALTERNATE TO PEDAL','↑ ↓  CHANGE LINE DURING OPEN RACE','','FLOW ON = DRAFT + ENERGY RECOVERY','FLOW OFF = STAMINA DRAIN','ATTACK = LEAVE THE WHEEL AND PASS','','1 LAP WITH DEATH PACER','2 OPEN RACE LAPS','','PRESS ESC TO RETURN'].join('\n');
    this.add.text(480,190,body,{fontFamily:'monospace',fontSize:'20px',color:'#f4eed7',align:'center',lineSpacing:10}).setOrigin(.5,0);
    this.input.keyboard.on('keydown-ESC',()=>this.scene.start('TitleScene'));
    this.input.keyboard.on('keydown-ENTER',()=>this.scene.start('TitleScene'));
  }
}
