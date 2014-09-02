;(function() {

	// GAME
	var Game = function() {
		var screen = document.getElementById("screen").getContext('2d');
		this.screenScore = document.getElementById("score");

		this.size = { x: screen.canvas.width, y: screen.canvas.height };
		screen.lineWidth = 5;
		screen.strokeRect(2.5, 2.5, this.size.x - 5, this.size.y - 5);
		this.center = { x: this.size.x / 2, y: this.size.y / 2 };

		var confSnake = {x: this.size.x / 2, y: this.size.y / 2, direction: 'r'};
		this.bodies = [new SnakeHead(this, confSnake), new Food(this)];

   	 	this.score = 0;
   	 	this.speed = 1;

   	 	this.stop = 0;


		var self = this;
		var tick = function() {
			self.update();
			self.draw(screen);
			self.animationID = requestAnimationFrame(tick);
			if (self.stop) {
	    		cancelAnimationFrame(self.animationID);
			}
		};
		tick();

	}

;	Game.prototype = {
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
	    },

	    end: function() {
	    	this.stop = 1;
	    	this.screenScore.innerHTML = 'GAME OVER. You score: ' + this.score;
	    }
  	};

  	// Snake Segment
	var SnakeSegment = function(game, conf) {
    	this.game = game;
   	 	this.size = { x: 10, y: 10 };

	   	this.center = { x: conf.x, y: conf.y };
	   	this.direction = conf.direction;

    	this.keyboarder = new Keyboarder();

  	};

	SnakeSegment.prototype = {

		draw: function(screen) {
    		screen.fillRect(this.center.x - this.size.x / 2,
	    		this.center.y - this.size.y / 2,
				this.size.x, this.size.y);

		},
		update: function (argument) {
			switch(this.direction) {
			 	case 'l':
					this.center.x -= this.game.speed;
					break;
				case 'r':
					this.center.x += this.game.speed;
					break;
				case 'u':
					this.center.y -= this.game.speed;
					break;
				case 'd':
					this.center.y += this.game.speed;
					break;
			}
		}

	};

	// Snake Head
  	var SnakeHead = function(game, conf) {
  		SnakeSegment.call(this, game, conf);
  		this.tail = [];
  	};

  	SnakeHead.prototype = Object.create(SnakeSegment.prototype);
  	SnakeHead.prototype.constructor = SnakeHead;

  	SnakeHead.prototype._addSegment = function(conf) {
		var segment = new SnakeSegment(this.game, conf);
		this.tail.push(segment);
		this.game.bodies.push(segment);
  	}

  	SnakeHead.prototype.update = function() {

  		if (!((this.tail.length) && (this.direction !== this.tail[0].direction))) {
			// Change head direction
			if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) &&
					this.direction != 'r') {
				this.direction = 'l';
			} else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) &&
					this.direction != 'l') {
				this.direction = 'r';
			} else if (this.keyboarder.isDown(this.keyboarder.KEYS.UP) &&
					this.direction != 'd') {
				this.direction = 'u';
			} else if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN) &&
					this.direction != 'u') {
				this.direction = 'd';
			}
		}

		// Move the head
		switch(this.direction) {
		 	case 'l':
				this.center.x -= this.game.speed;
				break;
			case 'r':
				this.center.x += this.game.speed;
				break;
			case 'u':
				this.center.y -= this.game.speed;
				break;
			case 'd':
				this.center.y += this.game.speed;
				break;
		}

		// Change segments directions
		for (var i = this.tail.length - 1; i >= 0; i--) {

			var before = this.tail[i-1] || this;
			if (this.tail[i].direction === before.direction) continue;
			switch(before.direction) {
			 	case 'l':
				case 'r':
					if (this.tail[i].center.y === before.center.y) {
						this.tail[i].direction = before.direction;
					}
					break;
				case 'u':
				case 'd':
					if (this.tail[i].center.x === before.center.x) {
						this.tail[i].direction = before.direction;
					}
					break;
			}

		};

		// Wall collision
		if ((this.center.x + this.size.x / 2 > this.game.size.x - 5) ||
			(this.center.y + this.size.y / 2 > this.game.size.y - 5) ||
			(this.center.x - this.size.x / 2 < 5) ||
			(this.center.y - this.size.y / 2 < 5)) {
				this.game.end();
		}

	}


	SnakeHead.prototype.collision = function(otherBody) {
		if (otherBody instanceof Food) {
			var last = this.tail[this.tail.length - 1] || this;
			var newSegment = {direction: last.direction};
			switch(last.direction) {
			 	case 'l':
					newSegment.x = last.center.x + last.size.x;
					newSegment.y = last.center.y;
					break;
				case 'r':
					newSegment.x = last.center.x - last.size.x;
					newSegment.y = last.center.y;
					break;
				case 'u':
					newSegment.x = last.center.x;
					newSegment.y = last.center.y + last.size.y;
					break;
				case 'd':
					newSegment.x = last.center.x;
					newSegment.y = last.center.y - last.size.y;
					break;
			}
		this.game.score += 100;
		this.game.screenScore.innerHTML = this.game.score;
		this._addSegment(newSegment);
		}


	}


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