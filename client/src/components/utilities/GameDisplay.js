/**
 * 
 * Display the game stage that receives (from the server)
 * 
 * Display the mouse location (from the client)
 * 
 */
class Stage {
	constructor(canvas){
		this.squares={}; // all squares on this stage (monsters, player, boxes, ...)

		this.canvas = canvas;
	
		// the logical width and height of the stage
		this.width=canvas.width * 1.5; // the width of the stage
		this.height=canvas.height * 1.5; // the height of the stage

		// the mouse location in the stage
		this.mouseX = 0; // the x-coordinate of the mouse in the stage
		this.mouseY = 0; // the y-coordinate of the mouse in the stage

		this.id = -1; // player_id of this player
		this.square_id = -1; // square_id of this player

		// game parameters
		this.enemies_number = 0; // total number of enemies in the game
		this.bullets = 0; // the bullets of the current player
		this.score = 0; // the score of the current player
		this.health = 0; // the health of the current player

		// display parameters
		this.lose = false; // the player fails the game or not
		this.replay = false; // the game is a replay
		this.error = false; // unknown error (should not be true if the webpage is used normally)
		this.score_add_message = 0; // 0 indicates no score has added, 1 indicates score added successfully, 2 otherwise
	}

	/**
	 * 
	 * Draw the current game state
	 * 
	 */
	draw(){
		var context = this.canvas.getContext('2d');
		context.setTransform(1,0,0,1,0,0); // remove all scaling
		context.clearRect(0, 0, this.width, this.height); // erase everything in the window

		// display health in the upper left corner
		context.font = "22px Verdana";
		var final_health = this.lose ? 0 : Math.max(0, this.health);
		if (final_health > 0){
			context.fillStyle ='rgba(0,0,255,1)';
		} else{
			context.fillStyle ='rgba(255,0,0,1)';
		}
		context.fillText("Health: " + final_health, 0, 20);

		// display bullets in the upper left corner
		if (this.bullets > 0){
			context.fillStyle ='rgba(0,0,255,1)';
		} else{
			context.fillStyle ='rgba(255,0,0,1)';
		}
		context.fillText("Bullets: " + Math.max(this.bullets, 0), 0, 40);

		// display score and enemies number in the upper left corner
		context.fillStyle ='rgba(0,0,255,1)';
		context.fillText("Enemies: " + this.enemies_number, 0, 60);
		context.fillText("Score: " + this.score, 0, 80);

		if (this.score_add_message == 1){
			context.fillText("Score Records Successfully", 0, 100);
		} else if (this.score_add_message == 2){
			context.fillText("Score Records Unsuccessfully", 0, 100);
		}

		// display lost message if the player lost
		if (this.lose){
			context.font = "44px Verdana";
			context.fillStyle ='rgba(255,0,0,1)';
			context.fillText("You Lost! Press t To Restart!", 160, 40);
		} else if (this.replay){ // if the game hasn't finished and is a replay, display a message
			context.font = "44px Verdana";
			context.fillStyle ='rgba(255,0,0,1)';
			context.fillText("@Replay@", 160, 40);
		} 
		
		// display unknown error
		if (this.error){
			context.font = "44px Verdana";
			context.fillStyle ='rgba(255,0,0,1)';
			context.fillText("Unknown Error! Press t To Restart!", 150, 40);
		}

		// draw crosshair
		context.beginPath();
		context.moveTo(this.mouseX-16, this.mouseY);
		context.lineTo(this.mouseX+16, this.mouseY);
		context.stroke();
		context.beginPath();
		context.moveTo(this.mouseX, this.mouseY - 16);
		context.lineTo(this.mouseX, this.mouseY + 16);
		context.stroke();

		var this_player_x = this.width / 2;
		var this_player_y = this.height / 2;

		// make the player location the centre of the canvas
		if (this.square_id in this.squares){
			this_player_x = this.squares[this.square_id].x;
			this_player_y = this.squares[this.square_id].y;
		}

		// make the world move
		context.translate(-this_player_x + this.canvas.width / 2, -this_player_y + this.canvas.height / 2);

		// draw all the squares of the game (play, enemy, bullet, box, ...)
		for(let playerid in this.squares){
			this.drawSquare(context, this.squares[playerid]);
		}

		// draw the border
		context.strokeStyle = "blue";
		context.beginPath();
		context.rect(0, 0, this.width,this.height);
		context.stroke();
	}

	drawSquare(context, square){
		if (square["type"] == "obstacle"){
			// display health
			context.fillStyle ='rgba(63,209,46,1)';
			context.font = "16px Verdana";
			context.fillText(square.health, square.x, square.y - 5);
			// display obstacles
			context.fillStyle = 'rgba(91, 36, 135, 0.6)';
			context.fillRect(square.x, square.y, square.length,square.length);
		} else if (square["type"] == "box"){
			// display health
			context.fillStyle ='rgba(63,209,46,1)';
			context.font = "16px Verdana";
			context.fillText(square.health, square.x, square.y - 5);
			// display boxes
			context.fillStyle = 'rgba(223, 252, 3, 0.6)';
			context.fillRect(square.x, square.y, square.length,square.length);
		} else if (square["type"] == "bullet"){
			// display bullet
			if (square.source_id == -1){ // the bullet is from an enemy
				context.fillStyle = 'rgba(255,0,0,0.5)';
			} else if (square.source_id == this.id){ // the bullet is from this player
				context.fillStyle = 'rgba(0,255,0,0.5)';
			} else{ // the bullet is from other player
				context.fillStyle = 'rgba(0,0,255,0.5)';
			}
			context.fillRect(square.x, square.y, square.length, square.length);
		} else if (square["type"] == "player" || square["type"] == "enemy"){
			// draw eyes
			context.fillStyle ='rgba(0,0,0,1)';
			context.beginPath(); 
			context.arc(square.x + 12, square.y + 14, 3, 0, 2 * Math.PI, false); 
			context.fill();
			context.beginPath(); 
			context.arc(square.x + 28, square.y + 14, 3, 0, 2 * Math.PI, false); 
			context.fill();
			// draw nose
			context.beginPath(); 
			context.arc(square.x + 20, square.y + 28, 7, 0, 2 * Math.PI, false);
			context.fill();
			// display health on top of the dog (except the current player)
			context.fillStyle ='rgba(63,209,46,1)';
			context.font = "12px Verdana";
			if (square["type"] == "player"){
				// draw Dog (actual square) 
				if (square.id == this.id){
					context.fillStyle = 'rgba(0,255,0,0.5)';
				} else{
					context.fillText(square.health, square.x, square.y - 3);
					context.fillStyle = 'rgba(0,0,255,0.5)';
				}
				context.fillRect(square.x, square.y, square.length,square.length); // draw the dog
				context.fillStyle ='rgba(168, 50, 105, 1)';
				context.font = "12px Verdana";

				// adjust the id location based on the playerid (if it gets too long) and display it
				if (square.id < 10){
					context.fillText(square.id, square.x + 33, square.y - 3);
				} else if (square.id >= 10 && square.id < 100){
					context.fillText(square.id, square.x + 26, square.y - 3);
				} else{
					context.fillText(square.id, square.x + 22, square.y - 3);
				}
			} else{
				context.fillText(square.health, square.x, square.y - 3);
				// draw Enemy (actual square) 
				context.fillStyle = 'rgba(255,0,0,0.5)';
				context.fillRect(square.x, square.y, square.length,square.length);
			}
		}
	}

	/**
	 * 
	 * Set the currently location of the mouse in order to display crosshair and fire
	 * 
	 */
	updateMouseLocation(clientX, clientY){
		var stageLocation = this.canvas.getBoundingClientRect(); // the location of the stage
		this.mouseX = clientX - stageLocation.left; // get the vertical mouse location in the stage
		this.mouseY = clientY - stageLocation.top; // get the horizontal mouse location in the stage

		// make sure the crosshair stay in window if the user moves the mouse outside of the canvas
		if (this.mouseX < 0){
			this.mouseX = 0;
		}
		if (this.mouseX > this.canvas.width){
			this.mouseX = this.canvas.width;
		}
		if (this.mouseY < 0){
			this.mouseY = 0;
		}
		if (this.mouseY > this.canvas.height){
			this.mouseY = this.canvas.height;
		}
	}
} // End Class Stage

module.exports = {
	Stage: Stage,
}
