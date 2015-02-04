// Create IIFE. Public properties accessible through game.<var>
var game = (function (that) {

	// User configurable options
	var userConfig = {
	    'players' : 1,
	    'difficulty' : 'easy'
	}

	// Game defaults. Developer configurable.
	var gameDefaults = {
		lives: 2,
		difficulties: {
			"easy" : {
		        "moveSpeed" : 0.25,
		        "enemyMultipler": 1,
		        "points": 100
	    		},
	    "medium" : {
		        "moveSpeed" : 0.5,
		        "enemyMultipler": 1.5,
		        "points": 125
	    		},
	    "hard" : {
		        "moveSpeed" : 1,
		        "enemyMultipler": 2,
		        "points": 150
	    		}
			}
	}

	// Records the current state of the game
	var gameState = {
		startTime: Date.now(),
		gameTime: 0,
		level: 1,
		numOfEnemies: 0,
		nextGemCreateTime: 0,
		gameOverFlag: false,
		lives: gameDefaults.lives,
		allEnemies: [],
		allGems: [],
		reset: function() {
			// Reset to original state
			// TODO: Create function automatically gets all vars from gameState and saves them.
			this.startTime = Date.now(),
			this.gameTime = 0,
			this.level = 1,
			this.numOfEnemies = 0,
			this.nextGemCreateTime = 0,
			this.gameOverFlag = false,
			this.lives = gameDefaults.lives,
			this.allEnemies = [],
			this.allGems = []
		}
	}

	// Makes timer for creating enemies and gems. Whenever new enemies are created the level goes up 1.
	gameState.levelTimer = function() {
	    var enemyCreateInterval = window.setInterval(Enemy.createEnemies, 5000);
	    var gemCreateInterval = window.setInterval(Gem.createGems, 1000);
	}

	// Keeps track of the time passed in the game.
	var gameTimeCounter = function() {
	    // Game time is tracked in  seconds
	    gameState.gameTime = (Date.now() - gameState.startTime) / 1000;
	}


	/******
	 * Scores is done pretty poorly. It needs a default. And is using unnecessary external vars
	 * and the clear is very hacky.
	 * Ran out of time to refactor
	 * TODO: Rewrite scores
	 ******/

	var scores = {};
	var storage = window.localStorage;
	var localGameData = {};

	// Make Rowan have the first high score!
	localGameData.highScoresList = [
	                      { "name" : "Rowan", "score" : 1000 }
	                  ];

	if (!storage.collectAndDodge) { 
	        storage.collectAndDodge = JSON.stringify(localGameData);
	    } else {
	        localGameData = JSON.parse(storage.collectAndDodge);
	};

	scores.clear = function() {

		window.localStorage.clear(); // clear local storage
		localGameData.highScoresList = [{ "name" : "Rowan", "score" : 1000 }]; // update list to have Rowan has high score
		document.getElementById('highScores').innerHTML = ""; // Just remove all the previous HTML
	}

	scores.save = function() {
	    storage.collectAndDodge = JSON.stringify(localGameData);
	}

	scores.display = function() {

		localGameData = JSON.parse(storage.collectAndDodge);
	    
	    localGameData.highScoresList.sort(function(obj1, obj2) {
	        return obj2.score - obj1.score;
	    });   
	    
	    
	    if (localGameData.highScoresList.length > 5) {
	        for (var i = 5; i < localGameData.highScoresList.length; i = i ) {
	            localGameData.highScoresList.pop();
	            }
	    }
	    
	    var HSlistLI  = document.getElementById('highScores');
	    HSlistLI.innerHTML = "";
	    
	    for (var i = 0; i < localGameData.highScoresList.length; i++) {
	        HSlistLI.innerHTML += "<li>" + localGameData.highScoresList[i].name + ": " + localGameData.highScoresList[i].score + "</li>";
	    }
	    
	}

	scores.addScores = function(name, score) {
	    localGameData.highScoresList.push({"name" : name, "score" : score});
	    scores.save();
	}

	scores.getName = function(whichPlayer) {
		document.getElementById('enterName').style.display = "block";  
	    
	    var submit = document.getElementById('highScoreFormSubmit');
	    
	    if (whichPlayer == 'p1') {
	        document.getElementById('player2-name').style.display = "none";  
	    } else if (whichPlayer == 'p2') {
	        document.getElementById('player1-name').style.display = "none"; 
	    } else if (whichPlayer == 'both') {
	        // Do nothing. Nothing to hide.
	    }
	    
	    var saveScore = function() {
	        
	        // Show and gets scores based on which player earned a high score
	        if (whichPlayer == 'p1') {
	            player1.playerName = document.getElementById('p1-name').value;
	            scores.addScores(player1.playerName, player1.score);
	        } else if (whichPlayer == 'p2') {
	            player2.playerName = document.getElementById('p2-name').value;
	            scores.addScores(player2.playerName, player2.score);
	        } else if (whichPlayer == 'both') {
	            player1.playerName = document.getElementById('p1-name').value;
	            player2.playerName = document.getElementById('p2-name').value;
	            scores.addScores(player1.playerName, player1.score);
	            scores.addScores(player2.playerName, player2.score);
	        }
	        
	        document.getElementById('enterName').style.display = "none";
	        
	        // Show the updated high scores
	        scores.display();
	    }
	    
	    //submit.addEventListener('click', saveScore, false);
	    submit.onclick = function () {
	    	saveScore();
	    }
	    
	}

	scores.check = function() {
	    
	    var lowestScore = localGameData.highScoresList.length - 1;
	    var minHighScore = localGameData.highScoresList[lowestScore].score;
	    
	    // Figures out if player 1, player 2 or both players got high scores
	    if (localGameData.highScoresList.length < 5 && userConfig.players == 2) {
	        scores.getName('both');
	    } else if (localGameData.highScoresList.length < 5) {
	    	scores.getName('p1');
	    } else if (player1.score > minHighScore && player2.score > minHighScore) { 
	        scores.getName('both');
	    } else if (player1.score > minHighScore) {
	    	scores.getName('p1');
	    } else if (player2.score > minHighScore) {
	    	scores.getName('p2');
	    }
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
	    ctx.fillText('Level: ' + gameState.level, 0, 30);
	}

	gui.timeDisplay = function() {
	    // Show game timer
	    ctx.textAlign = 'right';
	    ctx.clearRect(300, 0, 250, 30); // clears after each refresh
	    ctx.font = "30px Verdana";
	    ctx.fillText('Time: ' + Math.floor(gameState.gameTime) +'s', 500, 30);
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
	    ctx.fillText("Time: " + Math.floor(player1.gameOverTime) + 's', 50, 285);
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
	            ctx.fillText("Time: " + Math.floor(player2.gameOverTime) + 's', 450, 285);
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
	    ctx.fillStyle = 'black';

	    // Restart button click capture
	    var canvas = document.getElementById('canvas');

	    // Location of the reset button
	    canvas.resetButton = {'x1': 150, 'x2': 350, 'y1': 400, 'y2': 440 };
	    // Listens to every click on canvas
	    canvas.addEventListener("mousedown", gui.listenResetButton, false);

	}

	gui.listenResetButton = function(event) {
		// Record where the click occurred
	    var x = event.x;
	    var y = event.y;
	    x = x - canvas.offsetLeft;
	    y = y - canvas.offsetTop;
	    var resetButton = event.target.resetButton;

	    // Check if click occured in the reset button
	    if (x > resetButton.x1 && x < resetButton.x2 && y > resetButton.y1 && y < resetButton.y2) {
	        reset();
	        canvas.removeEventListener("mousedown", gui.listenResetButton, false);
	    }
	}

	gui.displayGui = function() {
		gui.timeDisplay();
	    gui.levelDisplay();
	    gui.playerInfoDisplay();
	}

	// Game Board settings. Could be used for larger boards with other code modifications
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

	// Turns Y grid co-ords into pixels
	gameBoard.calcYPosition = function(ypos, yOffset) {
	    return ypos * gameBoard.stats.blockSizeY  - yOffset;
	}

	// Turns X grid co-ords into pixels
	gameBoard.calcXPosition = function(xpos, xOffset) {
	    return xpos * gameBoard.stats.blockSizeX  - xOffset;
	}

	// Turns X pixels into grid co-ords
	gameBoard.calcXPosPixelsToGrid = function(xposPixels, xOffset) {
	    return Math.round((xposPixels + xOffset) / gameBoard.stats.blockSizeX);
	}

	var gameOver = function(playerName) {
	    
	    if (gameState.gameOverFlag == false) {
	        if (userConfig.players == 2){ // if playing 2 players
	            if (playerName == 'player2'){
	                player2.remove();
	            } else {
	                player1.remove();
	            }

	            if (player1.gameOver == true && player2.gameOver == true) {
	                gameState.gameOverFlag = true;
	                scores.check();
	            }

	        } else { // if playing one player just end the game
	            player1.remove();
	            gameState.gameOverFlag = true;
	            scores.check();
	        }
	    } 
	}

	// Gem constructor. General settings applying to all gems
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

	// Render for each gem
	Gem.prototype.render = function() {
	    ctx.drawImage(Resources.get(this.sprite), gameBoard.calcXPosition(this.boardXPos, this.spriteXOffset), gameBoard.calcYPosition(this.boardYPos, this.spriteYOffset));
	}

	// Moves gem off board whenever it is collected
	Gem.prototype.collectGem = function(playerNum) {
	    this.boardXPos = -1;
	    this.boardYPos = -1;
	}

	Gem.prototype.update = function() {
		// Doesn't update as gems don't move. Just check for a collision.
		this.collisionDetection();
	}

	// collision detection passed to each gem
	Gem.prototype.collisionDetection = function() {

		// Checks if player 1 is on a gem
	    if (player1.boardXPos == this.boardXPos && player1.boardYPos == this.boardYPos) {
	        this.boardXPos = -1;
	        this.boardYPos = -1;
	        player1.score = player1.score + gameDefaults.difficulties[userConfig.difficulty].points; // adds points based on difficulty
	        player1.gemsCollected = player1.gemsCollected + 1;
	    }

	    // Checks if player 2 is on a gem
	    if (userConfig.players == 2) {
	        if (player2.boardXPos == this.boardXPos && player2.boardYPos == this.boardYPos) {
	            this.boardXPos = -1;
	            this.boardYPos = -1;
	            player2.score = player2.score + gameDefaults.difficulties[userConfig.difficulty].points; // adds points based on difficulty
	            player2.gemsCollected = player2.gemsCollected + 1;
	        }
	    }
	}

	// function not passed to individual gems. Used to create all new gems.
	Gem.createGems = function () {
		var numberOfGems = gameState.allGems.length;

		var totalGemsCollected = (player1.gemsCollected || 0) + (player2.gemsCollected || 0);

		// Don't make gems forever. Only allow 30 on the grid at one time.
		if (numberOfGems <= totalGemsCollected + 30) {
			if (Math.floor(gameState.gameTime) > gameState.nextGemCreateTime ) { // Check if it's time to create a new gem.
				
				var gemsToCreate = Math.round((Math.random() * 10) / 5) + 1; // Generate # between 1-3
				
				for (var i = 1; i <= gemsToCreate; i++) {
					var gem = new Gem(numberOfGems+1); // Create gem and give it a number
	        		gameState.allGems.push(gem);
				}

	        	gameState.nextGemCreateTime =  Math.floor(gameState.gameTime) + Math.round((Math.random() * 10) / 3); // create gem every 0-3 seconds
	   		}
		}
	}


	// Enemy Constructor with configs for each gem
	var Enemy = function(enemyNum) {
	    
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

	// Update the enemy's position
	Enemy.prototype.update = function() {   
	    // X movement for enemies is based on pixels. It is converted
	    // to grids for interactions with charcter and objects.
	    
	    // Start time
	    if (gameState.gameTime >  this.startTime) {
	        this.x = this.x + this.moveSpeed;
	        
	        if (this.x > -50 && this.x < 500) { // Check if onscreen
	            // Check for collision
	            this.boardXPos = gameBoard.calcXPosPixelsToGrid(this.x, this.spriteXOffset);
	            this.checkCollision();
	        } else if (this.x > 500) {
	            this.boardXPos = 0; // Reset board position
	            this.x = -1 * Math.random() * 1000; // Move offscreen random amount
	        }
	    }
	}

	// Each enemy checks of collision
	Enemy.prototype.checkCollision = function() {

		/******
		 * Both of this do the same thing. Just written different ways as I was wondering what is more efficient
		 ******/
	    if (this.boardYPos == player1.boardYPos) { // Check one at a time. 
	        if (this.boardXPos == player1.boardXPos) {
	            player1.death();
	        }
	    } 

	    if (userConfig.players == 2) {
	        if (this.boardXPos == player2.boardXPos && this.boardYPos == player2.boardYPos) {
	            player2.death(); // Checks at same time
	        }
	    }
	}

	// Draw the enemy on the screen, required method for game
	Enemy.prototype.render = function() {
	    ctx.drawImage(Resources.get(this.sprite), this.x, gameBoard.calcYPosition(this.boardYPos, this.spriteYOffset));
	}

	// Not passed to individual enemies. Used to create all enemies
	Enemy.createEnemies = function() {
	    gameState.level = gameState.level + 1;

	    // Only created eneimies upto level 20. That is upto 150 enimies in maximum case.
	    if (gameState.level < 20) {

	    	// Generates less and less enemies as the level goes up
		    // (1/level = 0.1->1) * (random*10/2 = 0->5) * (enemyMultiplier = 1 -> 1.5) + 1.
		    var numToGenerate = Math.round(1/gameState.level * (Math.random()*10/2) * gameDefaults.difficulties[userConfig.difficulty].enemyMultipler + 1); // always generate atleast 1

		    for (var i = 1; i <= numToGenerate; i++ ) {
		        gameState.numOfEnemies = gameState.numOfEnemies + 1;
		        var newEnemy = new Enemy(gameState.numOfEnemies);
		        gameState.allEnemies.push(newEnemy);  
		    }
	    }
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
	    this.lives = gameState.lives;
	    this.alive = true;
	    this.gameOver = false;

	    // Set up stats
	    this.gemsCollected = 0;
	    this.deaths = 0;
	    this.gameOverTime = 0;
	    this.gameOverLevel = 0;
	}

	Player.prototype.death = function() { 

	    if (this.alive == true){
	        this.lives = this.lives - 1;
	        this.deaths = this.deaths + 1;
	    }
	    
	    this.alive = false; // Kill player because function will fire a lot before movement occurs
	    
	    var player = this; // To pass through to timeout function
	    
	    // Only fire this once within 100ms. Without this it would fire over and over when a bug hit while the program calculated how to move the player.
	    window.setTimeout(function() {
	        // Reset position
	        player.boardXPos = player.startXPos;
	        player.boardYPos = player.startYPos;
	        player.alive = true;
	        
	        // If the player dies set all the game over features
	        if (player.lives < 1) {
	            player.gameOver = true;
	            player.alive = false;
	            player.gameOverTime = gameState.gameTime;
	            player.gameOverLevel = gameState.level;
	            gameOver(player.playerName);
	        }
	    }, 100);
	}

	// Hide the player off the board if another player is still playing
	Player.prototype.remove = function() { 
	    this.boardXPos = -100;
	    this.boardYPos = -100;
	}

	Player.prototype.reset = function() {
	    this.boardXPos = this.startXPos;
	    this.boardYPos = this.startYPos;
	    this.score = 0;
	    this.gameOver = false;
	    this.lives = gameDefaults.lives;
	    this.deaths = 0;
	    this.gemsCollected = 0;
	    this.alive = true;
	}

	Player.prototype.render = function() {
	    // Renders the player
	    ctx.drawImage(Resources.get(this.sprite), gameBoard.calcXPosition(this.boardXPos, this.spriteXOffset), gameBoard.calcYPosition(this.boardYPos, this.spriteYOffset));
	}

	Player.prototype.handleInput = function(keyPress) {

		if (this.gameOver == false) { // Check if he is dead.
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
	}

	// This listens for key presses and sends the keys to your
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

	var renderCanvas = function() {
		// Update time counter
		gameTimeCounter();

		// Render GUI
		gui.displayGui();

		// Render and check for collisions with Gems
	    gameState.allGems.forEach(function(gem) {
	        gem.render();
	        gem.update();
	    });

	    // Render, move and check for collisions with Enemies
	    gameState.allEnemies.forEach(function(enemy) {
	        enemy.render();
	        enemy.update();
	    });

	    // Render player1
	    player1.render();

	    // Render player2
	    if (userConfig.players == 2) {player2.render();}

	    // If game ends. Show stats overlay
	    if (gameState.gameOverFlag == true) {
	        gui.gameOverDisplay();
	    }
	}

	
	// Resets the game state and players.
	// called from engine.reset()
	var resetGame = function() {
		
		// Reset the game state
		gameState.reset();

		// Reset per player stats
		if (player1) { player1.reset(); };
	    if (player2) { player2.reset(); };
	};

	// Called from engine.ready() once images have loaded.
	// Sets up interface for user to interact with and choose settings
	var startGame = function () {

		// Reveal configDiv and hide LoadingDiv
		document.getElementById("configDiv").style.display = "block";
		document.getElementById("loadingDiv").style.display = "none";


		// Each does basically the same thing. On click sets a configuration option
		// then hides/add classes and then update text to show selection
		// TODO: abstract into function (maybe?)
		document.getElementById('1p').onclick = function() {
			userConfig.players = 1;
			document.getElementById('1p').className = "selected";
			document.getElementById('2p').className = "";

			document.getElementById('players').innerHTML = "1 player";
		}

		document.getElementById('2p').onclick = function() {
			userConfig.players = 2;
			document.getElementById('1p').className = "";
			document.getElementById('2p').className = "selected";

			document.getElementById('players').innerHTML = "2 players";
		}

		document.getElementById('easy').onclick = function() {
			userConfig.difficulty = "easy"
			document.getElementById('easy').className = "selected";
			document.getElementById('medium').className = "";
			document.getElementById('hard').className = "";

			document.getElementById('difficulty').innerHTML = "easy";
			document.getElementById('gempoints').innerHTML = gameDefaults.difficulties.easy.points;
		}

		document.getElementById('medium').onclick = function() {
			userConfig.difficulty = "medium"
			document.getElementById('easy').className = "";
			document.getElementById('medium').className = "selected";
			document.getElementById('hard').className = "";

			document.getElementById('difficulty').innerHTML = "medium";
			document.getElementById('gempoints').innerHTML = gameDefaults.difficulties.medium.points;
		}

		document.getElementById('hard').onclick = function() {
			userConfig.difficulty = "hard"
			document.getElementById('easy').className = "";
			document.getElementById('medium').className = "";
			document.getElementById('hard').className = "selected";

			document.getElementById('difficulty').innerHTML = "hard";
			document.getElementById('gempoints').innerHTML = gameDefaults.difficulties.hard.points;
		}

		document.getElementById('clearHighScores').onclick = function() {
			//window.localStorage.clear();
			scores.clear();
		}

		// Starts the actual game!
	    document.getElementById("play").onclick = function() {
	    	document.getElementById("configDiv").style.display = "none";
	    	document.getElementById("gameMode").style.display = "block";

	    	init(); // run the init as defined in engine.js
		};

	}


	// Functions to execute. Could probably redone to be self executing 
	scores.display(); // Display the scores
	gameState.levelTimer(); // Timer for creation of Enemies and Gems

	// Create the players
	var player1 = new Player(1);
	var player2 = new Player(2); // creates two player objects even if there is only 1 player.


	// Functions & vars made available globaly via game.[var]
	that.startGame = startGame;
	that.resetGame = resetGame;
	that.renderCavnas = renderCanvas;

	return that;

})(game || {});