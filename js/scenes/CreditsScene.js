class CreditsScene extends Phaser.Scene{
  constructor(){super('CreditsScene')}
  create(){
    this.cameras.main.setBackgroundColor('#080a10');
    this.add.text(480,100,'VELODEATH KEIRIN',{fontFamily:'monospace',fontSize:'34px',color:'#ff2b6d',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(480,210,'GAME CONCEPT / ART DIRECTION\nRAFAEL ANDRADE\n\nPROTOTYPE BUILD\nPHASER 3',{fontFamily:'monospace',fontSize:'20px',color:'#f4eed7',align:'center',lineSpacing:10}).setOrigin(.5,0);
    this.add.text(480,600,'PRESS ESC TO RETURN',{fontFamily:'monospace',fontSize:'16px',color:'#22b7ff'}).setOrigin(.5);
    this.input.keyboard.on('keydown-ESC',()=>this.scene.start('TitleScene'));
    this.input.keyboard.on('keydown-ENTER',()=>this.scene.start('TitleScene'));
  }
}
