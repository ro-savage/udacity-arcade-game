/***** Global Vars ****/
var playerPos = {x: 0, y: 0};
var startTime = Math.floor(Date.now() / 10) / 60;
var gameTime = 0;
var difficulty = 'easy';

var currentPos = {
    "x" : 0,
    "y" : 0
}

var gameBoard = {
    "settings" : {
        "widthInBlocks" : 5,
        "heightInBlocks" : 6
    },
    "stats" : {
        "blockSizeX" : 101,
        "blockSizeY" : 83
    }
}

var difficulties = {
    "easy" : {
        "moveSpeed" : 1,
        "enemies" : 8
    },
    "medium" : {
        "moveSpeed" : 0.25,
        "enemies" : 16
    },
    "hard" : {
        "moveSpeed" : 1,
        "enemies" : 24
    }
}

// Records position of all non-moving objects
var objectPos = {};

// Records position of all enemies
var enemiesPos = {};

// Records position of all players
var playersPos = {};

// Keeps try go game time
var gameTimeCounter = function() {
    // Game time is tracked in ss.msms
    gameTime = (Math.floor(Date.now() / 10) / 60 - startTime).toFixed(2);
    
    // Show game timer
    ctx.clearRect(0, 0, 600, 50); // clears after each refresh
    ctx.font = "30px Verdana";
    ctx.fillText(gameTime +'s', 10, 50);
}

// Turns Y grid co-ords into pixels
var calcYPosition = function(ypos, yOffset) {
    return ypos * gameBoard.stats.blockSizeY  - yOffset;
}

// Turns X grid co-ords into pixels
var calcXPosition = function(xpos, xOffset) {
    return xpos * gameBoard.stats.blockSizeX  - xOffset;
}

// Turns X pixels into grid co-ords
var calcXPosPixelsToGrid = function(xposPixels, xOffset) {
    return Math.round((xposPixels + xOffset) / gameBoard.stats.blockSizeX);
}

// Updates enemiesPos object
var updateEnemyPos = function(name, xpos, ypos) {
    enemiesPos[name].x = xpos;
    enemiesPos[name].y = ypos
    enemiesPos[name].xy = xpos + '' + ypos;
}

// Update player position
var updatePlayerPos = function(name, xpos, ypos) {
    playersPos[name].x = xpos;
    playersPos[name].y = ypos
    playersPos[name].xy = xpos + '' + ypos;
}

var reset =  function(playerNum) {
    console.log("You are dead. The game has reset.");
    
    // Update location in object model so reset event doesn't fire over and over
    // while delay is occuring.
    updatePlayerPos(playerNum, 3, 6);

    // Delay visual / actual movement
    window.setTimeout(function() {
        // Reset position
        player.boardXPos = 3;
        player.boardYPos = 6;
    }, 200);
    
    
}

var checkCollisions = function() {
    // Check for enemy collision
    for (var player in playersPos) { // check for all players
        if (playersPos['player1'].y < 5) { //  If isn't on road. Dont check
            for (var enemy in enemiesPos) { // check for enemies
                if (enemiesPos[enemy].x == playersPos[player].x && enemiesPos[enemy].y == playersPos[player].y) { // do they have the same xy position
                    reset(player);
                }
            }
        }
    }

}


// Enemies our player must avoid
var Enemy = function(enemyNum) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    
    //Config
    this.sprite = 'images/enemy-bug.png'; // Image of enemy
    this.spriteYOffset = 110; // Offset because of image size.
    this.spriteXOffset = 101; // Just in case.
    
    // Creates object name
    this.enemyName = "enemy" + enemyNum;
    
    // Hide offscreen
    this.x = -100;
    this.y = -100;

    // Create random start time between 0 and 20 seconds
    this.startTime = (Math.random() * 100) / 4 - 5; // calcs 0 to 25 then minus 5. This makes bias toward starting early.
    //this.startTime = 1;
    // Make random movespeed
    this.moveSpeed = (Math.random() * 10) / 2 + 1; // +1 to avoid super slow enemies.


    //************** GRID BASED MOTION ******************/
    this.boardYPos = 0;
    this.boardXPos = 0;

    // Create enemy position objects
    enemiesPos[this.enemyName] = {
            "x" : this.boardXPos,
            "y" : this.boardYPos,
            "xy" : this.boardXPos + '' + this.boardYPos
        }

    // Return a random appropriate grid co-ord for starting.
    var randomYStartPos = function() {

        var randomY = calcYPosition(2, this.spriteYOffset); // default

        // Random start position
        if (Math.random() < 0.33) {
            randomY = 2;
        } else if ( Math.random() > 0.66) {
            randomY = 4;
        } else {
            randomY = 3;
        }

        return randomY
}
    // Ensures there is at least one enemy per line
    switch (enemyNum) {
        case 1:
            this.boardYPos = 2;
            break;
        case 2:
            this.boardYPos = 3;
            break;
        case 3:
            this.boardYPos = 4;
            break;
        default:
            this.boardYPos = randomYStartPos();
    }
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    
    /*************** SMOOTH MOTION ***********************/
    // X movement for enemies is based on pixels. It is converted
    // to grids for interactions with charcter and objects.
    
    // Start time
    if (gameTime >  this.startTime) {
        this.x = this.x + this.moveSpeed;
        
        if (this.x > -50 && this.x < 500) { // Check if onscreen
            // Check for collision
            this.boardXPos = calcXPosPixelsToGrid(this.x, this.spriteXOffset);
            updateEnemyPos(this.enemyName, this.boardXPos, this.boardYPos); 
        } else if (this.x > 500) {
            this.boardXPos = 0; // Reset board position
            updateEnemyPos(this.enemyName, this.boardXPos, this.boardYPos); 
            this.x = -1 * Math.random() * 1000; // Move offscreen random amount
        }
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, calcYPosition(this.boardYPos, this.spriteYOffset));
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {

    this.sprite = 'images/char-boy.png';
    this.spriteYOffset = 110;
    this.spriteXOffset = 101;
    
    // Start position of player
    this.boardYPos = 6;
    this.boardXPos = 3;

    this.playerName = 'player1';

    // Create player location object
    playersPos[this.playerName] = {
            "x" : this.boardXPos,
            "y" : this.boardYPos,
            "xy" : this.boardXPos + '' + this.boardYPos
        }
}

Player.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // Update player position
    updatePlayerPos(this.playerName, this.boardXPos, this.boardYPos);

    if (this.boardYPos == 1) { // reached water. Reset
        console.log("you escaped");
        reset(this.playerName);
    }
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), calcXPosition(this.boardXPos, this.spriteXOffset), calcYPosition(this.boardYPos, this.spriteYOffset));
}

Player.prototype.handleInput = function(keyPress) {
    // 2nd if statements makes sure you can not run off the board.
    if (keyPress == 'up') {
        if (this.boardYPos > 1){
            this.boardYPos = this.boardYPos - 1;
        }
    } else if (keyPress == 'down') {
        if (this.boardYPos < gameBoard.settings.heightInBlocks) {
           this.boardYPos = this.boardYPos + 1; 
        }
    } else if (keyPress == 'left') {
        if (this.boardXPos > 1) {
           this.boardXPos = this.boardXPos - 1; 
        }
    } else if (keyPress == 'right') {
        if (this.boardXPos < gameBoard.settings.widthInBlocks) {
           this.boardXPos = this.boardXPos + 1; 
        }
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];

// Add enemies. Amount added based on difficulty
for (var i = 1; i <= difficulties[difficulty].enemies; i++ ) {
    var newEnemy = new Enemy(i);
    allEnemies.push(newEnemy);
    
}

var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
