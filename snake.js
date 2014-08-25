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
			self.animationID = requestAnimationFrame(tick);
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

  	// Snake segment
  	var SnakeSegment = function(conf) {
  		this.x = conf.x;
  		this.y = conf.y;
  		this.direction = conf.direction;
   	 	this.size = { x: conf.size, y: conf.size };
  	}

  	// Snake
	var Snake = function(game) {
    	this.game = game;
   	 	this.size = { x: 10, y: 10 };

    	this.tail = [
    		new SnakeSegment({x: game.size.x / 2, y: game.size.y / 2, size: 10, direction: 'r'}),
    		new SnakeSegment({x: game.size.x / 2 - 10, y: game.size.y / 2, size: 10, direction: 'r'}),
    		new SnakeSegment({x: game.size.x / 2 - 20, y: game.size.y / 2, size: 10, direction: 'r'}),
    		new SnakeSegment({x: game.size.x / 2 - 30, y: game.size.y / 2, size: 10, direction: 'r'}),
    		new SnakeSegment({x: game.size.x / 2 - 40, y: game.size.y / 2, size: 10, direction: 'r'})
    	]
    	this.center = this.tail[0];

    	this.keyboarder = new Keyboarder();

   	 	this.speed = 0.5;
  	};

	Snake.prototype = {
		update: function() {

			// Change head direction
			if (this.tail[0].direction === this.tail[1].direction) {
				if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) &&
					this.tail[0].direction != 'r') {
					this.tail[0].direction = 'l';
				} else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) &&
					this.tail[0].direction != 'l') {
					this.tail[0].direction = 'r';
				} else if (this.keyboarder.isDown(this.keyboarder.KEYS.UP) &&
					this.tail[0].direction != 'd') {
					this.tail[0].direction = 'u';
				} else if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN) &&
					this.tail[0].direction != 'u') {
					this.tail[0].direction = 'd';
				}
			}

			for (var i = 0; i < this.tail.length; i++) {

				// Move the segments
				switch(this.tail[i].direction) {
				 	case 'l':
						this.tail[i].x -= this.speed;
						break;
					case 'r':
						this.tail[i].x += this.speed;
						break;
					case 'u':
						this.tail[i].y -= this.speed;
						break;
					case 'd':
						this.tail[i].y += this.speed;
						break;
				}
			}
			// Change segments directions
			for (var i = this.tail.length -1; i >= 1; i--) {

				var before = this.tail[i-1];
				if (this.tail[i].direction === before.direction) continue;
				switch(before.direction) {
				 	case 'l':
					case 'r':
						if (this.tail[i].y === before.y) {
							this.tail[i].direction = before.direction;
						}
						break;
					case 'u':
					case 'd':
						if (this.tail[i].x === before.x) {
							this.tail[i].direction = before.direction;
						}
						break;
				}

			};


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
 	    	for (var i = 0; i < this.tail.length; i++) {
 	    		screen.fillRect(this.tail[i].x - this.size.x / 2,
			    	this.tail[i].y - this.size.y / 2,
					this.size.x, this.size.y);
 	    	};

		},

		collision: function() {
			var last = this.tail[this.tail.length - 1];
			var newSegment = new SnakeSegment({
				direction: last.direction,
				size: 10
			});
			switch(last.direction) {
			 	case 'l':
					newSegment.x = last.x + last.size.x;
					newSegment.y = last.y;
					break;
				case 'r':
					newSegment.x = last.x - last.size.x;
					newSegment.y = last.y;
					break;
				case 'u':
					newSegment.x = last.x;
					newSegment.y = last.y + last.size.y;
					break;
				case 'd':
					newSegment.x = last.x;
					newSegment.y = last.y - last.size.y;
					break;
			}
			this.tail.push(newSegment);
			this.speed *= 2;

		}
	};

	// Food
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
  		},

  		collision: function() {
  			this.game.removeBody(this);
  			this.game.addBody(new Food(this.game));
  		}
  	}


	// Keyboard
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

	// Helper functions
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

  	// Init
  	window.addEventListener('load', function() {
    	new Game();
  	});

})();