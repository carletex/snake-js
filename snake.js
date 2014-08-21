;(function() {

	// GAME
	var Game = function() {
		var screen = document.getElementById("screen").getContext('2d');
		this.size = { x: screen.canvas.width, y: screen.canvas.height };
		this.center = { x: this.size.x / 2, y: this.size.y / 2 };

		this.bodies = [new Player(this), new Food(this)];

		var self = this;
		var tick = function() {
			self.update();
			self.draw(screen);
			requestAnimationFrame(tick);
		};

		tick();
	};

	Game.prototype = {
	    update: function() {
	    	reportCollisions(this.bodies);
	    	for (var i = 0; i < this.bodies.length; i++) {
        		this.bodies[i].update();
      		}
	    },

	    draw: function(screen) {
	    	screen.clearRect(5, 5, this.size.x - 5, this.size.y - 5);
		    for (var i = 0; i < this.bodies.length; i++) {
		    	drawRect(screen, this.bodies[i]);
		    }
	    },

	    addBody: function(body) {
	      this.bodies.push(body);
	    },

	    removeBody: function(body) {
	      var bodyIndex = this.bodies.indexOf(body);
	      if (bodyIndex !== -1) {
	        this.bodies.splice(bodyIndex, 1);
	      }
	    }
  	};



  	// PLAYER
	var Player = function(game) {
    	this.game = game;
   	 	this.size = { x: 10, y: 10 };

    	this.center = { x: game.size.x / 2, y: game.size.y / 2};
    	this.keyboarder = new Keyboarder();

   	 	this.speed = 1.5;
   	 	this.direction = 'right';
  	};

	Player.prototype = {
		update: function() {
			if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
				this.direction = 'left';
			} else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
				this.direction = 'right';
			} else if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
				this.direction = 'up';
			} else if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
				this.direction = 'down';
			}

			switch(this.direction){
				case 'left':
					this.center.x -= this.speed;
					break;
				case 'right':
					this.center.x += this.speed;
					break;
				case 'up':
					this.center.y -= this.speed;
					break;
				case 'down':
					this.center.y += this.speed;
					break;
			}

		},

		draw: function() {
		 	console.log('draw');
		},

		collision: function(otherBody) {
			if (this.direction === 'left' || this.direction === 'right') {
				this.size.x += 10;
			} else {
				this.size.y += 10;
			}

		}
	};

	// PLAYER
	var Food = function(game) {
    	this.game = game;
   	 	this.size = { x: 5, y: 5 };

    	this.center = {
    		x: Math.floor(Math.random() * game.size.x) + 1,
    		y: Math.floor(Math.random() * game.size.y) + 1
    	};

    	this.keyboarder = new Keyboarder();

  	};

  	Food.prototype = {
  		update: function() {

  		},
  		collision: function() {
  			this.game.removeBody(this);
  			this.game.addBody(new Food(this.game));
  		}
  	}


	// KEYBOARD
	var Keyboarder = function() {
	    var keyState = {};

	    window.addEventListener('keydown', function(e) {
	      keyState[e.keyCode] = true;
	    });

	    window.addEventListener('keyup', function(e) {
	      keyState[e.keyCode] = false;
	    });

	    this.isDown = function(keyCode) {
	      return keyState[keyCode] === true;
	    };

	    this.KEYS = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40};
  	};

	// AUX FUNCTIONS
	var drawRect = function(screen, body) {
    	screen.fillRect(body.center.x - body.size.x / 2,
    				    body.center.y - body.size.y / 2,
						body.size.x, body.size.y);
  	};

  	var isColliding = function(b1, b2) {
    	return !(
     	b1 === b2 ||
	        b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
	        b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
	        b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
	        b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2
    	);
  	};

  	var reportCollisions = function(bodies) {
	    var bodyPairs = [];
	    for (var i = 0; i < bodies.length; i++) {
	      for (var j = i + 1; j < bodies.length; j++) {
	        if (isColliding(bodies[i], bodies[j])) {
	          bodyPairs.push([bodies[i], bodies[j]]);
	        }
	      }
	    }

	    for (var i = 0; i < bodyPairs.length; i++) {
	      if (bodyPairs[i][0].collision !== undefined) {
	        bodyPairs[i][0].collision(bodyPairs[i][1]);
	      }

	      if (bodyPairs[i][1].collision !== undefined) {
	        bodyPairs[i][1].collision(bodyPairs[i][0]);
	      }
	    }
  	};

  	// INIT
  	window.addEventListener('load', function() {
    	new Game();
  	});

})();