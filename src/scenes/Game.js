import Phaser from '../lib/phaser.js';

import Carrot from '../game/Carrot.js';

export default class Game extends Phaser.Scene{

    //Declare global variables
    /** @type {Phaser.Physics.Arcade.Sprite} */
    player;
    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    platforms;
    /** @type {Phaser.Physics.Arcade.Group} */
    carrots;
    /** @type {Phaser.GameObjects.Text} */
    carrotsCollectedText;

    carrotsCollected = 0;

    //To add player Input
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors;

    constructor(){
        super('game'); //assigns unique key to each scene
    }

    init(){
        //Reset the score everytime the score is loaded
        //this is called before Preload by Phaser Engine
        this.carrotsCollected = 0;
    }

    preload(){
        //preload assets here
        this.load.image('background','assets/bg_layer1.png');

        this.load.image('platform','assets/ground_grass.png');

        this.load.image('bunny-stand','assets/bunny1_stand.png');

        this.load.image('carrot','assets/carrot.png');

        this.load.image('bunny-jump','assets/bunny1_jump.png');

        this.load.audio('jump','assets/sfx/phaseJump1.ogg');

        //create cursor keys here
        this.cursors = this.input.keyboard.createCursorKeys(); // can also be set in create function
    }

    create(){
        //work with preloaded assets here
        //this.add.image(240,320,'background');//places image center as the size here is at half of init
        //Will allow the background to scroll with the camera
        //which is something we dont want for our current game hence set scrolling vertical to 0;
        this.add.image(240,320,'background').setScrollFactor(1,0);//x scroll doesnt affect but y is 0

        //Platform Code Starts Here
        
        //This adds platform which is just a image - Non Physics
        //this.add.image(240,320,'platform').setScale(0.5);

        //This adds platform which is physics enables
        //this.physics.add.image(240,320,'platform').setScale(0.5);
        //The platform now is in dynamic state which is why it will fall of the screen
        //what we need is a static platform which detects collision and stays where it is
        //this.physics.add.staticImage(240,320,'platform').setScale(0.5);
        //This will add only one Platform image and what we need is a bunch of platform
        //image for the purpose of our Infinite Jumper Game
        //const platforms = this.physics.add.staticGroup(); //Local Variable
        this.platforms = this.physics.add.staticGroup();

        for(let i = 0;i<5;i++){
            //Calculate a random Location for the new platform
            const x = Phaser.Math.Between(80,400);
            const y = 150 * i;

            //Creates an Phaser.Physics.Arcade.Sprite
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = this.platforms.create(x,y,'platform');
            platform.scale = 0.5;

            //Update body type to Phaser.Physics.Arcade.StaticBody
            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body;
            body.updateFromGameObject();
        }

        //Platform Code Ends Here
        //Player Code Starts Here
        //const player = this.physics.add.sprite(240,320,'bunny-stand').setScale(0.5); // Create Local Variable Player
        this.player = this.physics.add.sprite(240,320,'bunny-stand').setScale(0.5);//Global Var
        //For things having animations we generally would create a sprite instead of an image.
        //This sprite will have no collision and hence will start falling down

        //We have to tell the physics engine what collides with what.
        //In our case the Player collides with the Platforms Group
        this.physics.add.collider(this.platforms,this.player);//refer to global var

        //We only need collision check in the downward direction to make sure that we
        //have landed on a platform or not
        //Used Phaser.Physics.Arcade.Body -> checkCollision property
        this.player.body.checkCollision.up = false;
        this.player.body.checkCollision.left = false;
        this.player.body.checkCollision.right = false;

        //If we dont follow the player then after sometime the player will move of screen
        this.cameras.main.startFollow(this.player);
        //We notice that once we reach the top we have run out of platforms as intially we have
        //only spawned 5 platforms - idea totally opposite to that of Infinite Jumper
        //We can achieve this in two ways.
        // 1. Delete the non visible platforms and add new ones - Inefficient
        // 2. Move the non visible platforms to top hence reusing - Efficient - Data Pooling
        //This also adds a game over condition if the player falls past the last visible platform.

        //to solve the problem of the camera moving horizontally when player moves horizontally
        //we set dead zone - zone where there is no camera movement - here 1.5 times the width
        //which being a large value will not get called;
        this.cameras.main.setDeadzone(this.scale.width * 1.5);

        //Create a carrot
        //const carrot = new Carrot(this,240,320,'carrot');
        //this.add.existing(carrot);
        //This just adds one carrot and will not allow us to interact with it
        //To solve this again we will use Physics and Groups
        this.carrots = this.physics.add.group({
            classType : Carrot
        });
        //this.carrots.get(240,320,'carrot');//test add carrot
        //add Collision logic to the carrots
        this.physics.add.collider(this.platforms,this.carrots);

        //The Player can move over the carrot and not collide as intented but still cannot collect
        //the carrot to do this we will add a Physics Overlap which will be triggered when the 
        //Player overlaps with the Carrot class.
        this.physics.add.overlap(
            this.player,this.carrots, //Which two GO's will interact
            this.handleCollectCarrot, //Call on success of overlap
            undefined,
            this
        );

        //Create a text Gameobject to display the score of the carrots collected to the user
        const style = {color:'#000', fontSize : 24};
        this.carrotsCollectedText = this.add.text(240,10,'Carrots : 0',style).setScrollFactor(0).setOrigin(0.5,0);
        //But this text wont get updated all this will do is just print Carrots : 0 everytime on the
        //screen and we need to make sure that the score is displayed by this text
    }

    //modify update from update() to update(t,dt) when using input
    //update(){
    update(t,dt){
        //First Perform Check to see if the platforms have been recycled and reused
        //Iterate over each child in the platforms group
        //Here iteration means going through each platform and performing some action
        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child;

            const scrollY = this.cameras.main.scrollY;
            //If the camera has scrolled a fix 700px units then we update the Platforms position
            //On true we add if randomly 50px or 100px above the camera
            //on false let it be as it is
            if(platform.y >= scrollY + 700){
                platform.y = scrollY - Phaser.Math.Between(50,100);
                //after changing any settings in the platforms physics we need to update the
                //Game object hence we call the updateFromGameObject from the body.
                platform.body.updateFromGameObject();

                //create a carrot above the platform being reused
                this.addCarrotAbove(platform);
            }
        });

        //Check for Bottom Touching Platform
        //use the physics engine to find if the player is touching something below it
        const touchingDown = this.player.body.touching.down;

        if(touchingDown){
            //make the player jump straight up
            this.player.setVelocityY(-300);//more than gravity as in config and hence vertical jump

            //while jumping we just change the texture to give it a feel as if it is animating
            this.player.setTexture('bunny-jump');

            //Play jump sound on actually jumping
            this.sound.play('jump');
        }

        //to make the player stand again after the Jump animation has played
        const velY = this.player.body.velocity.y;
        if(velY > 0 && this.player.texture.key != 'bunny-stand'){
            //switch back the texture to standing
            this.player.setTexture('bunny-stand');
        }

        //Handle Movement left and right by the user
        if(this.cursors.left.isDown && !touchingDown){
            this.player.setVelocityX(-200);
        }else if(this.cursors.right.isDown && !touchingDown){
            this.player.setVelocityX(200);
        }else{
            this.player.setVelocityX(0);//stop complete 
        }
        //This produces an error of the camera scrolling horizontally as it is following the player
        
        //with the problem solved we want the camera to wrap the player,i.e,bring the player back in
        //from the other side of the screen
        this.horizontalWrap(this.player);
        //we create a custom wrap system instead of using wrap() in Physics but that wraps also
        //vertically which will break our game

        //We will constantly check if we have fallen from the bottom most platform if yes then it is
        //game over condition for us
        const bottomPlatform = this.findBottomMostPlatform();
        if(this.player.y > bottomPlatform.y + 200){
            //console.log('Game Over');
            //On Game Over we would like to add GameOver scene which can be accessed by the 
            //unique key created in the Scenes constructor with the name game-over
            this.scene.start('game-over');
        }
    }

    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    horizontalWrap(sprite){
        const halfWidth = sprite.displayWidth * 0.5;
        const gameWidth = this.scale.width;
        if(sprite.x < -halfWidth){
            sprite.x = gameWidth + halfWidth;
        }else if(sprite.x > gameWidth + halfWidth){
            sprite.x = -halfWidth;
        }
    }

    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    addCarrotAbove(sprite){
        const y = sprite.y - sprite.displayHeight;//used to position above a given sprite
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x,y,'carrot');

        //For reusing the carrots and setting it visible again
        carrot.setActive(true);
        carrot.setVisible(true);

        this.add.existing(carrot);

        carrot.body.setSize(carrot.width,carrot.height);
        //re-enable the carrot physics in the Game world
        this.physics.world.enable(carrot);

        return carrot;
    }

    /**
     * @param {Phaser.Physics.Arcade.Sprite} player
     * @param {Carrot} carrot
     */
    handleCollectCarrot(player,carrot){
        //Hide and Kill the Carrots
        this.carrots.killAndHide(carrot);
        //disable the physics components on the carrot
        this.physics.world.disableBody(carrot.body);

        //increment the score by 1
        this.carrotsCollected++;

        //Create a temp text value and set it to the CarrotCollected text
        const value = `Carrots : ${this.carrotsCollected}`; //note : single quotes are not used - Tilde
        this.carrotsCollectedText.text = value;
    }

    findBottomMostPlatform(){
        const platforms = this.platforms.getChildren();
        let bottomPlatform = platforms[0];

        for(let i =1;i<platforms.length;i++){
            const platform = platforms[i];
            if(platform.y < bottomPlatform.y){
                continue;
            }
            bottomPlatform = platform;
        }

        return bottomPlatform;
    }
}



/**
 * Every problem here has a much better solution like the object pooling
 * changing the game height or adding more number of platforms when initially created
 * can possibly break the game. To be solved later
 * 
 */

 
/**
 * --2020/08/31 -- Compiled Together By Kushagra --
 */