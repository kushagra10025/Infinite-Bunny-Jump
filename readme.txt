The basic structure for a Phaser Game will be

--Main Project Folder--
--assets
--src
    -game
    -lib
        -phaser.js
    -scenes
    -types
        -phaser.d.ts
    -main.js
--index.html
--jsconfig.json


NOTE - 
To remove the Debug Lines from the physics elements set the debug option
in physics properties to false in main.js file.

phaser.js m phaser.d.ts and jsconfig.json are used to enable Phaser Autocomplete features in
VS Code and hence make development of the game easier.

Steps to Recreate :
1. Create the same folder structure and base contents from main.js,phaser.js,jsconfig.json and copy d.ts
2. Create the first scene in scenes folder namd Game.js - this is where the majority of the game logic will go.

Thanks for Reading.

ART ASSETS FROM - kenney.nl

--2020/08/31 -- Compiled Together By Kushagra --