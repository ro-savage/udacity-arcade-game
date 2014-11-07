// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    
    console.log("Enemy called");
    
    //Config
    this.sprite = 'images/enemy-bug.png'; // Image of enemy
    var startX = 000; // Player start X
    var startY = 50; // Player start Y 
    
    // Set position of created enemy
    this.x = startX;
    this.y = startY;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    console.log("Enemy render called");
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {

    this.sprite = 'images/char-boy.png';
    
    //Config
    var startX = 200; // Player start X
    var startY = 380; // Player start Y  
    this.boardSize = {top: 0, right: 400, bottom: 380, left: 0 }; // Size of tiles only.
    
    this.moveDistX = 101; // Player X move distance. Based on block size
    this.moveDistY = 83; // Player Y move distance. Based on block size
    
    // Set position of player when created.
    this.x = startX;
    this.y = startY;
    
}

Player.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function(keyPress) {
    console.log(keyPress);
    if (keyPress == 'up') {
        if (this.y <= this.boardSize.top) {
            // Off screen. Do nothing
        } else {
         this.y = this.y - this.moveDistY;   
        }
    } else if (keyPress == 'down') {
        if (this.y >= this.boardSize.bottom) {
            // Do nothing. Off screen
        } else {
            this.y = this.y + this.moveDistY;
        }
    } else if (keyPress == 'left') {
        if (this.x <= this.boardSize.left) {
            // Do nothing
        } else {
            this.x = this.x - this.moveDistX;
        }
        
    } else if (keyPress == 'right') {
        if (this.x >= this.boardSize.right) {
            // Do nothing
        } else {
            this.x = this.x + this.moveDistX;
        }
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];
var enemy = new Enemy();
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
