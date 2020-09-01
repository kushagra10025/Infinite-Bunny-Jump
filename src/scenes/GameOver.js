import Phaser from '../lib/phaser.js'

export default class GameOver extends Phaser.Scene{
    constructor(){
        super('game-over');
    }

    create(){
        const width = this.scale.width;
        const height = this.scale.height;

        const style = {fontSize : 48};

        this.add.text(width * 0.5, height * 0.5,'Game Over',style).setOrigin(0.5);

        //When we reach GameOver scene. We would like to restart the game and play again
        this.input.keyboard.once('keydown_SPACE',()=>{
            this.scene.start('game');//the unique key for Game scene from constructor
        });
    }
}


/**
 * --2020/08/31 -- Compiled Together By Kushagra --
 */