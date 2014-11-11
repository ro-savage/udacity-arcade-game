/***** Global Vars ****/
var playerPos = {x: 0, y: 0};
var startTime = Math.floor(Date.now() / 10) / 60;
var gameTime = 0;
var level = 1;
var difficulty = 'hard';
var numOfEnemies = 0;
var nextGemCreateTime = 0;
var score = 0;

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
        "enemies" : 8,
        "enemyMultipler": 1,
        "levelSpeed": 20
    },
    "medium" : {
        "moveSpeed" : 0.25,
        "enemies" : 16,
        "enemyMultipler": 1,
        "levelSpeed": 15
    },
    "hard" : {
        "moveSpeed" : 1,
        "enemies" : 24,
        "enemyMultipler": 1,
        "levelSpeed": 10
    }
}

// Records position of all non-moving objects
var gemsPos = {};

// Records position of all enemies
var enemiesPos = {};

// Records position of all players
var playersPos = {};

var scoreCounter = function() {
    ctx.clearRect(0, 586, 200, 30); // clears after each refresh
    ctx.font = "30px Verdana";
    ctx.fillText('Score:' + score, 0, 610);
}

var levelCounter = function() {
    ctx.clearRect(0, 0, 200, 30); // clears after each refresh
    ctx.font = "30px Verdana";
    ctx.fillText('Level: ' + level, 0, 30);
}

var gameTimeCounter = function() {
    // Game time is tracked in ss.msms
    gameTime = Math.floor(Date.now() / 10 / 60 - startTime);
    
    // Show game timer
    ctx.clearRect(350, 0, 200, 30); // clears after each refresh
    ctx.font = "30px Verdana";
    ctx.fillText('Time: ' + gameTime +'s', 350, 30);
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

    score = score - 1000;

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
        if (playersPos['player1'].y != 1 || playersPos['player1'].y != 6) { //  If isn't on road. Dont check
            for (var enemy in enemiesPos) { // check for enemies
                if (enemiesPos[enemy].x == playersPos[player].x && enemiesPos[enemy].y == playersPos[player].y) { // do they have the same xy position
                    reset(player);
                }
            }
        }
    }
/*
    for (var player in playersPos) { // check for all players
        if (playersPos['player1'].y != 1 || playersPos['player1'].y != 6) { //  If isn't on road. Dont check
            for (var gem in gemsPos) { // check for enemies
                if (gemsPos[gem].x == playersPos[player].x && gemsPos[gem].y == playersPos[player].y) { // do they have the same xy position
                    Gem.prototype.collectGem();
                }
            }
        }
    }
*/
}


var Gem = function(gemNum){
    //Config
    this.spriteYOffset = 110; // Offset because of image size.
    this.spriteXOffset = 101; // Just in case.

    this.gemName = "gem" + gemNum;
    
    this.sprite = 'images/gem-blue.png'; // Default. randomGem == 0

    var randomGem = Math.floor(Math.random() * 10 / 4);

    if (randomGem == 1) {
        this.sprite = 'images/gem-green.png'; 
    }  else if (randomGem == 2) {
        this.sprite = 'images/gem-orange.png';
    }

    // Position
    this.boardYPos = Math.floor((Math.random() * 10) / 3 ) + 2 // Generate number between 2 and 5
    this.boardXPos = Math.floor((Math.random() * 10) / 2 ) + 1 // Generate number between 1 and 5

    gemsPos[this.gemName] = {
        "x" : this.boardXPos,
        "y" : this.boardYPos,
        "xy" : this.boardXPos + '' + this.boardYPos
    }
}

Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), calcXPosition(this.boardXPos, this.spriteXOffset), calcYPosition(this.boardYPos, this.spriteYOffset));
}

Gem.prototype.collectGem = function(playerNum) {
    console.log('ran over gem');
    this.boardXpos = -1;
    this.boardYPos = -1;
}

Gem.prototype.collisionDetection = function() {
    if (playersPos['player1'].x == this.boardXPos && playersPos['player1'].y == this.boardYPos) {
        console.log("Gem Collected");
        this.boardXPos = -1;
        this.boardYPos = -1;
        score = score + 100 * level;
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
    this.startTime = (Math.random() * 10) - 2; // Make enemies appear within 8 seconds of being created. -2 to make bias toward fast.
    //this.startTime = 1;
    // Make random movespeed
    this.moveSpeed = (Math.random() * 10) / 3 + 1; // +1 to avoid super slow enemies.


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

        // Generates a random number between 2 and 5.
        var randomY = Math.round(Math.random() * 10 / 3) + 2;

        return randomY
    }
    // Set random start position.
    this.boardYPos = randomYStartPos();
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
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), calcXPosition(this.boardXPos, this.spriteXOffset), calcYPosition(this.boardYPos, this.spriteYOffset));
}

Player.prototype.handleInput = function(keyPress) {
    // 2nd if statements makes sure you can not run off the board.
    if (keyPress == 'up') {
        if (this.boardYPos > 1){
            this.boardYPos = this.boardYPos - 1;
            updatePlayerPos(this.playerName, this.boardXPos, this.boardYPos);
        }
    } else if (keyPress == 'down') {
        if (this.boardYPos < gameBoard.settings.heightInBlocks) {
           this.boardYPos = this.boardYPos + 1; 
           updatePlayerPos(this.playerName, this.boardXPos, this.boardYPos);
        }
    } else if (keyPress == 'left') {
        if (this.boardXPos > 1) {
           this.boardXPos = this.boardXPos - 1;
           updatePlayerPos(this.playerName, this.boardXPos, this.boardYPos); 
        }
    } else if (keyPress == 'right') {
        if (this.boardXPos < gameBoard.settings.widthInBlocks) {
           this.boardXPos = this.boardXPos + 1;
           updatePlayerPos(this.playerName, this.boardXPos, this.boardYPos); 
        }
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];

// Add enemies. Amount added based on difficulty
var createEnemies = function() {
    console.log("createEnemies fired");
    level = level + 1;
    // Generates less and less enemies as the level goes up
    // (1/level = 0.1->1) * (random*10/2 = 0->5) * (enemyMultiplier = 1 -> 1.5) + 1.
    var numToGenerate = Math.round(1/level * (Math.random()*10/2) * difficulties[difficulty].enemyMultipler + 1); // always generate atleast 1

    for (var i = 1; i <= numToGenerate; i++ ) {
        numOfEnemies = numOfEnemies + 1;
        var newEnemy = new Enemy(numOfEnemies);
        allEnemies.push(newEnemy);  
    }
}

function levelTimer() {
    var timer = difficulties[difficulty].levelSpeed * 1000 / 2;
    window.setInterval(createEnemies, timer);
}

//************ LEVEL TIMER TURNED OFF**********************///
//************ LEVEL TIMER TURNED OFF**********************///
levelTimer();
//************ LEVEL TIMER TURNED OFF**********************///
//************ LEVEL TIMER TURNED OFF**********************///

for (var i = 1; i <= 3; i++ ) {
    var newEnemy = new Enemy(i);
    numOfEnemies = numOfEnemies + 1;
    allEnemies.push(newEnemy);
}

var player = new Player();

var allGems = [];

var createGems = function() {
    if (Math.floor(gameTime) > nextGemCreateTime ) {
        var numberOfGems = allGems.length
        var gem = new Gem(numberOfGems+1);
        allGems.push(gem);
        nextGemCreateTime =  Math.floor(gameTime) + Math.round((Math.random() * 10) / 2); 
    }
}


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
