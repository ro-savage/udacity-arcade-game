/***** Global Vars ****/
var playerPos = {x: 0, y: 0};
var startTime = Math.floor(Date.now() / 10) / 60;
var gameTime = 0;
var difficulty = 'easy';

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
        "enemies" : 3
    },
    "medium" : {
        "moveSpeed" : 0.25,
        "enemies" : 3
    },
    "hard" : {
        "moveSpeed" : 1,
        "enemies" : 5
    }
}

// Keeps try go game time
var gameTimeCounter = function() {
    // Game time is tracked in ss.msms
    gameTime = (Math.floor(Date.now() / 10) / 60 - startTime).toFixed(2);
    
    // Show game timer
    ctx.clearRect(0, 0, 600, 50); // clears after each refresh
    ctx.font = "30px Verdana";
    ctx.fillText(gameTime +'s', 10, 50);
}

var calcYPosition = function(y, yOffset) {
    return y * gameBoard.stats.blockSizeY  - yOffset;
}

var calcXPosition = function(x, xOffset) {
    return x * gameBoard.stats.blockSizeX  - xOffset;
}

var checkCollisions = function() {
    
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
    // Always start hidden.
    var startY = -100; 
    var startX = -100;

    // Return 50, 140 or 220 at random when called.
    var randomXStartPos = function() {

        var randomX = calcYPosition(2, this.spriteYOffset); // default

        // Random start position: Either Y 50 or 140 or 220
        if (Math.random() < 0.33) {
            randomX = calcYPosition(2, this.spriteYOffset);
        } else if ( Math.random() > 0.66) {
            randomX = calcYPosition(4, this.spriteYOffset);
        } else {
            randomX = calcYPosition(3, this.spriteYOffset);
        }

        return randomX
}
    // If only 3 enemies then make one on each line. Else randomly position.
    switch (enemyNum) {
        case 0:
            startY = calcYPosition(2, this.spriteYOffset);
            break;
        case 1:
            startY = calcYPosition(3, this.spriteYOffset);
            break;
        case 2:
            startY = calcYPosition(4, this.spriteYOffset);
            break;
        default:
            startY = randomXStartPos();
    }
    
 
    // Set position of created enemy
    this.x = startX;
    this.y = startY;
    
    this.enterTime = Math.random() * 10 / 2; // Enemies appear randomly within first 5 seconds.
    this.nextMove = this.enterTime + 1;

}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    
    if (gameTime > this.nextMove) {
        
        // 
        var timeToNextMove = this.nextMove + difficulties[difficulty].moveSpeed + Math.random();
        
        this.nextMove = timeToNextMove;
        this.x = this.x + 101;
        
        if ( this.x > 500) {
            this.x = 0  
        }
    }
    
    
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {

    this.sprite = 'images/char-boy.png';
    this.spriteYOffset = 110;
    this.spirteXOffset = 1;
    
    //Config
    var startX = 200 //calcXPosition(1, this.spriteXOffset); // Player start X
    console.log(calcXPosition(1, this.spriteXOffset));
    var startY = calcYPosition(6, this.spriteYOffset); // Player start Y  
    this.boardSize = {top: 0, right: 400, bottom: 380, left: 0 }; // Size of tiles only.
    
    this.moveDistX = 101; // Player X move distance. Based on block size
    this.moveDistY = 83; // Player Y move distance. Based on block size
    
    // Put player in starting position
    playerPos.x = startX;
    playerPos.y = startY;

}

Player.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), playerPos.x, playerPos.y);
}

Player.prototype.handleInput = function(keyPress) {
    if (keyPress == 'up') {
        if (playerPos.y <= this.boardSize.top) {
            // Off screen. Do nothing
        } else {
         playerPos.y = playerPos.y - this.moveDistY;   
        }
    } else if (keyPress == 'down') {
        if (playerPos.y >= this.boardSize.bottom) {
            // Do nothing. Off screen
        } else {
            playerPos.y = playerPos.y + this.moveDistY;
        }
    } else if (keyPress == 'left') {
        if (playerPos.x <= this.boardSize.left) {
            // Do nothing
        } else {
            playerPos.x = playerPos.x - this.moveDistX;
        }
        
    } else if (keyPress == 'right') {
        if (playerPos.x >= this.boardSize.right) {
            // Do nothing
        } else {
            playerPos.x = playerPos.x + this.moveDistX;
        }
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];

for (var i = 0; i < difficulties[difficulty].enemies; i++ ) {
    console.log("EnemyLoop");
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
