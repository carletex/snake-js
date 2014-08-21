;(function() {

	// GAME
	var Game = function() {
		var screen = document.getElementById("screen").getContext('2d');

		this.size = { x: screen.canvas.width, y: screen.canvas.height };
		screen.lineWidth = 10;
		screen.strokeRect(0, 0, this.size.x, this.size.y);
		this.center = { x: this.size.x / 2, y: this.size.y / 2 };

		this.bodies = [new Snake(this), new Food(this)];

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
	    	screen.clearRect(5, 5, this.size.x - 10, this.size.y - 10);
		    for (var i = 0; i < this.bodies.length; i++) {
		    	this.bodies[i].draw(screen);
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

  	// SNAKE
	var Snake = function(game) {
    	this.game = game;
   	 	this.size = { x: 10, y: 10 };

    	this.center = {x: game.size.x / 2, y: game.size.y / 2};
    	this.tail = [
	    	{x:game.size.x / 2 - 10, y:game.size.y / 2},
	    	{x:game.size.x / 2 - 20, y:game.size.y / 2},
	    	{x:game.size.x / 2 - 30, y:game.size.y / 2},
	    	{x:game.size.x / 2 - 40, y:game.size.y / 2}
    	];

    	this.keyboarder = new Keyboarder();

   	 	this.speed = 0.5;
   	 	this.direction = 'right';
  	};

	Snake.prototype = {
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
					for (var i = this.tail.length - 1; i >= 0; i--) {
						if (i === 0) {
							this.tail[i].x = this.center.x + this.size.x;
							this.tail[i].y = this.center.y;
						} else{
							this.tail[i].x = this.tail[i-1].x + this.size.x;
							this.tail[i].y = this.tail[i-1].y;
						}
					};
					this.center.x -= this.speed;
					break;
				case 'right':
					for (var i = this.tail.length - 1; i >= 0; i--) {
						if (i === 0) {
							this.tail[i].x = this.center.x - this.size.x;
							this.tail[i].y = this.center.y;
						} else{
							this.tail[i].x = this.tail[i-1].x - this.size.x;
							this.tail[i].y = this.tail[i-1].y;
						}
					};
					this.center.x += this.speed;
					break;
				case 'up':
					for (var i = this.tail.length - 1; i >= 0; i--) {
						if (i === 0) {
							this.tail[i].x = this.center.x;
							this.tail[i].y = this.center.y - this.size.y;
						} else{
							this.tail[i].x = this.tail[i-1].x;
							this.tail[i].y = this.tail[i-1].y - this.size.y;
						}
					};
					this.center.y -= this.speed;
					break;
				case 'down':
					for (var i = this.tail.length - 1; i >= 0; i--) {
						if (i === 0) {
							this.tail[i].x = this.center.x;
							this.tail[i].y = this.center.y + this.size.y;
						} else{
							this.tail[i].x = this.tail[i-1].x;
							this.tail[i].y = this.tail[i-1].y + this.size.y;
						}
					};
					this.center.y += this.speed;
					break;
			}

			// Wall collision - reflection
			if (this.center.x + this.size.x / 2 > this.game.size.x) {
				this.center.x = 10;
			} else if (this.center.x + this.size.x / 2 < 0) {
				this.center.x = this.game.size.x - 10;
			} else if (this.center.y + this.size.y / 2 > this.game.size.y) {
				this.center.y = 10;
			} else if (this.center.y + this.size.y / 2 < 0) {
				this.center.y = this.game.size.y - 10;
			}

		},

		draw: function(screen) {
 	    	screen.fillRect(this.center.x - this.size.x / 2,
			    this.center.y - this.size.y / 2,
				this.size.x, this.size.y);
 	    	for (var i = 0; i < this.tail.length; i++) {
 	    		screen.fillRect(this.tail[i].x - this.size.x / 2,
			    	this.tail[i].y - this.size.y / 2,
					this.size.x, this.size.y);
 	    	};
		},

		collision: function(otherBody) {
			if (this.direction === 'left' || this.direction === 'right') {
				this.size.x += 10;
			} else {
				this.size.y += 10;
			}

		}
	};

	// FOOD
	var Food = function(game) {
    	this.game = game;
   	 	this.size = { x: 5, y: 5 };

    	this.center = {
    		x: Math.floor(Math.random() * (game.size.x - 10)) + 10,
    		y: Math.floor(Math.random() * (game.size.y - 10)) + 10
    	};

    	this.keyboarder = new Keyboarder();

  	};

  	Food.prototype = {
  		update: function() {

  		},

  		draw: function(screen) {
  			screen.fillRect(this.center.x - this.size.x / 2,
			    this.center.y - this.size.y / 2,
				this.size.x, this.size.y);
  			// screen.arc(this.center.x - this.size.x / 2,
  			// 	this.center.y - this.size.y / 2,
  			// 	10,	0, Math.PI*2, true);
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