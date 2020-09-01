import Phaser from './lib/phaser.js'
import Game from './scenes/Game.js'
import GameOver from './scenes/GameOver.js';


export default new Phaser.Game({
    type: Phaser.AUTO, // Phases decides to use OpenGL or Canvas
    width: 480,
    height:640,
    //scene:Game, // for one scene
    scene: [Game, GameOver], // for multiple scenes;
    physics:{
        default:'arcade',
        arcade:{
            gravity:{
                y:200
            },
            debug:true
        }
    }
})

/**
 * --2020/08/31 -- Compiled Together By Kushagra --
 */