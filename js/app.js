/***** Global Vars ****/
var startTime = Math.floor(Date.now() / 10) / 60;
var gameTime = 0;
var level = 1;
var numOfEnemies = 0;
var nextGemCreateTime = 0;
var gameOverFlag = false;

var resetGame = function() {
    window.location.reload();
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

var userConfig = {
    'players' : 1,
    'difficulty' : 'medium'
}

var gameConfig = {
    'lives' : 1
}

var gameTimeCounter = function() {
    // Game time is tracked in ss.msms
    gameTime = Math.floor(Date.now() / 10 / 60 - startTime);
}

// Used for displaying GUI objects.
var gui = {}; 

gui.playerInfoDisplay = function() {

    ctx.clearRect(0, 586, 200, 90); // clears after each refresh
    ctx.font = "30px Verdana";
    ctx.textAlign = 'left';
    ctx.fillStyle = 'red';
    ctx.fillText('Player 1', 0, 610);
    ctx.fillStyle = 'black';
    ctx.fillText('Lives:' + player1.lives, 0, 640);
    ctx.fillText('Score:' + player1.score, 0, 670);
    
    if (userConfig.players == 2) {
        ctx.textAlign = 'right';
        ctx.clearRect(300, 586, 200, 90); // clears after each refresh
        ctx.fillStyle = 'red';
        ctx.fillText('Player 2', 500, 610);
        ctx.fillStyle = 'black';
        ctx.fillText('Lives:' + player2.lives, 500, 640);
        ctx.fillText('Score:' + player2.score, 500, 670);
        ctx.textAlign = 'left';
    }
}

gui.levelDisplay = function() {
    ctx.clearRect(0, 0, 200, 30); // clears after each refresh
    ctx.font = "30px Verdana";
    ctx.fillText('Level: ' + level, 0, 30);
}

gui.timeDisplay = function() {
    // Show game timer
    ctx.textAlign = 'right';
    ctx.clearRect(300, 0, 250, 30); // clears after each refresh
    ctx.font = "30px Verdana";
    ctx.fillText('Time: ' + gameTime +'s', 500, 30);
    ctx.textAlign = 'left';
}



gui.gameOverDisplay = function() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(50, 150, 400, 300);
    ctx.strokeRect(49, 149, 402, 302);
    ctx.fillStyle = 'red';
    ctx.fillText("GAME OVER", 160, 180);
    ctx.fillStyle = 'black';

    // player1 stats
    ctx.font = "20px Verdana";
    ctx.fillStyle = 'red';
    ctx.fillText("Player 1 Stats", 50, 210);
    ctx.fillStyle = 'black';
    ctx.fillText("Score: " + player1.score, 50, 235);
    ctx.fillText("Level: " + player1.gameOverLevel, 50, 260);
    ctx.fillText("Time: " + player1.gameOverTime, 50, 285);
    ctx.fillText("Deaths: " + player1.deaths, 50, 310);
    ctx.fillText("Gems: " + player1.gemsCollected, 50, 335);
    ctx.fillText("Difficulty: " + userConfig.difficulty, 50, 360);

    if (userConfig.players == 2) {
            // player2 stats
            ctx.textAlign = 'right';
            ctx.fillStyle = 'red';
            ctx.fillText("Player 2 Stats", 450, 210);
            ctx.fillStyle = 'black';
            ctx.fillText("Score: " + player2.score, 450, 235);
            ctx.fillText("Level: " + player2.gameOverLevel, 450, 260);
            ctx.fillText("Time: " + player2.gameOverTime, 450, 285);
            ctx.fillText("Deaths: " + player2.deaths, 450, 310);
            ctx.fillText("Gems: " + player2.gemsCollected, 450, 335);
            ctx.fillText("Difficulty: " + userConfig.difficulty, 450, 360);
            ctx.textAlign = 'left';
    }

    // restart button
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(150, 400, 200, 40);
    ctx.strokeRect(150, 400, 200, 40);
    ctx.fillStyle = 'green';
    ctx.font = "30px Verdana";
    ctx.fillText("Restart!", 190, 430);

    // Restart button click capture
    var canvas = document.getElementById('canvas');

    canvas.resetButton = {'x1': 150, 'x2': 350, 'y1': 400, 'y2': 440 };
    canvas.addEventListener("mousedown", listenResetButton, false);

}

function listenResetButton(event) {
    var x = event.x;
    var y = event.y;
    x = x - canvas.offsetLeft;
    y = y - canvas.offsetTop;
    console.log('X: ' + x + ' Y: ' + y);
    console.log(event.target.resetButton);
    var resetButton = event.target.resetButton;

    if (x > resetButton.x1 && x < resetButton.x2 && y > resetButton.y1 && y < resetButton.y2) {
        resetGame();
    }
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

var gameOver = function(playerName) {
    
    if (userConfig.players == 2){ // if playing 2 players
        if (playerName == 'player2'){
            player2.remove();
        } else {
            player1.remove();
        }

        if (player1.gameOver == true && player2.gameOver == true) {
            gameOverFlag = true;
        }

    } else { // if playing one player just end the game
        player1.remove();
        gameOverFlag = true;
    }
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
}

Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), calcXPosition(this.boardXPos, this.spriteXOffset), calcYPosition(this.boardYPos, this.spriteYOffset));
}

Gem.prototype.collectGem = function(playerNum) {
    this.boardXPos = -1;
    this.boardYPos = -1;
}

Gem.prototype.collisionDetection = function() {
    if (player1.boardXPos == this.boardXPos && player1.boardYPos == this.boardYPos) {
        this.boardXPos = -1;
        this.boardYPos = -1;
        player1.score = player1.score + 100;
        player1.gemsCollected = player1.gemsCollected + 1;
    }

    if (userConfig.players == 2) {
        if (player2.boardXPos == this.boardXPos && player2.boardYPos == this.boardYPos) {
            this.boardXPos = -1;
            this.boardYPos = -1;
            player2.score = player2.score + 100;
            player2.gemsCollected = player2.gemsCollected + 1;
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
    this.startTime = (Math.random() * 10) - 2; // Make enemies appear within 8 seconds of being created. -2 to make bias toward fast.
    //this.startTime = 1;
    // Make random movespeed
    this.moveSpeed = (Math.random() * 10) / 3 + 1; // +1 to avoid super slow enemies.

    this.boardYPos = 0;
    this.boardXPos = 0;

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
            this.checkCollision();
        } else if (this.x > 500) {
            this.boardXPos = 0; // Reset board position
            this.x = -1 * Math.random() * 1000; // Move offscreen random amount
        }
    }
}
Enemy.prototype.checkCollision = function() {
    if (this.boardYPos == player1.boardYPos) { // Check one at a time. Efficiency? 
        if (this.boardXPos == player1.boardXPos) {
            player1.death();
        }
    } 

    if (userConfig.players == 2) {
        if (this.boardXPos == player2.boardXPos && this.boardYPos == player2.boardYPos) {
            player2.death(); // Doesn't check one at a time. How can I check efficiency?
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
var Player = function(playerNum) {

    this.spriteYOffset = 110;
    this.spriteXOffset = 101;

    if (playerNum == 1) {
        this.sprite = 'images/char-boy.png';

        this.startXPos = 3;
        this.startYPos = 6;

        this.playerName = 'player1';
    }
    if (playerNum == 2) {
        this.sprite = 'images/char-horn-girl.png';
        this.playerName = 'player2';

        this.startXPos = 3;
        this.startYPos = 1;
    }

    // Place in initial postion
    this.boardXPos = this.startXPos;
    this.boardYPos = this.startYPos;
    
    // Set up score, lives and if currently alive or dead
    this.score = 0;
    this.lives = gameConfig.lives;
    this.alive = true;
    this.gameOver = false;

    // Set up stats
    this.gemsCollected = 0;
    this.deaths = 0;
    this.gameOverTime = 0;
    this.gameOverLevel = 0;
}

Player.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // Update player position
}

Player.prototype.death = function() { 

    if (this.alive == true){
        //this.score = this.score - 500; // Remove comment to make player lose score on death
        this.lives = this.lives - 1;
        this.deaths = this.deaths + 1;
    }
    
    this.alive = false; // Kill player because function will fire a lot before movement occurs
    
    var player = this; // To pass through to timeout function
    
    window.setTimeout(function() {
        // Reset position
        player.boardXPos = player.startXPos;
        player.boardYPos = player.startYPos;
        player.alive = true;
        
        if (player.lives < 1) {
            player.gameOver = true;
            player.alive = false;
            player.gameOverTime = gameTime;
            player.gameOverLevel = level;
            gameOver(player.playerName);
        }
    }, 100);
}

Player.prototype.remove = function() { 
    this.boardXPos = -100;
    this.boardYPos = -100;
}

Player.prototype.render = function() {
    // Renders the player
    ctx.drawImage(Resources.get(this.sprite), calcXPosition(this.boardXPos, this.spriteXOffset), calcYPosition(this.boardYPos, this.spriteYOffset));
}

Player.prototype.handleInput = function(keyPress) {
    // 2nd if statements makes sure you can not run off the board.
    if (keyPress == 'up' || keyPress == 'w') {
        if (this.boardYPos > 1){
            this.boardYPos = this.boardYPos - 1;
        }
    } else if (keyPress == 'down' || keyPress == 's') {
        if (this.boardYPos < gameBoard.settings.heightInBlocks) {
           this.boardYPos = this.boardYPos + 1; 
        }
    } else if (keyPress == 'left' || keyPress == 'a') {
        if (this.boardXPos > 1) {
           this.boardXPos = this.boardXPos - 1;
        }
    } else if (keyPress == 'right' || keyPress == 'd') {
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
var createEnemies = function() {
    level = level + 1;
    // Generates less and less enemies as the level goes up
    // (1/level = 0.1->1) * (random*10/2 = 0->5) * (enemyMultiplier = 1 -> 1.5) + 1.
    var numToGenerate = Math.round(1/level * (Math.random()*10/2) * difficulties[userConfig.difficulty].enemyMultipler + 1); // always generate atleast 1

    for (var i = 1; i <= numToGenerate; i++ ) {
        numOfEnemies = numOfEnemies + 1;
        var newEnemy = new Enemy(numOfEnemies);
        allEnemies.push(newEnemy);  
    }
}

function levelTimer() {
    var timer = difficulties[userConfig.difficulty].levelSpeed * 1000 / 2;
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

var player1 = new Player(1);
if (userConfig.players == 2) {var player2 = new Player(2);}

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
    var player1Keys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player1.handleInput(player1Keys[e.keyCode]);

    if (userConfig.players == 2) {
        var player2Keys = {
            65: 'a',
            87: 'w',
            68: 'd',
            83: 's'
        };

        player2.handleInput(player2Keys[e.keyCode]);
    }  
});