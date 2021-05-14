import React from 'react';
import $ from 'jquery'; 
import gunAudio from '../assets/gun.mp3';
import {Stage} from './GameDisplay';

/**
 * 
 * Everything about the game, including the canvas (to display), the socket (to get updates from the server) and the game status
 * 
 * Replay is also handled here 
 * 
 */
class Game extends React.Component {
	constructor(props) {
		super(props);
		this.socket = null;
		this.stage = null;
		this.gameEnded = true;
		this.replay = false;
		this.canvasRef = React.createRef();
	}

	/**
	 * 
	 * This function will be called after the canvas is ready
	 * 
	 */
	componentDidMount = () => {
		// Create a new game when everything is ready
		this.newGame();

		// Add event listeners to get user's actions
		document.addEventListener("keydown", this.keyPressed);
		this.window.addEventListener("mousemove", this.moveMouse);
		this.window.addEventListener("click", this.clickMouse);
	}

	/**
	 * 
	 * This function will be called after the canvas will be unmounted 
	 * 
	 * For example, user goes to another page
	 * 
	 */
	componentWillUnmount = () =>{
		// Remove event listeners since user's actions are no longer needed
		document.removeEventListener("keydown", this.keyPressed);
		this.window.removeEventListener("mousemove", this.moveMouse);
		this.window.removeEventListener("click", this.clickMouse);

		// Close the socket since the user will go to other pages
		if (this.socket !== null){
			this.socket.close();
		}
	}

	/**
	 * 
	 * Start a new game
	 * 
	 */
	newGame = () =>{
		// Close the previous socket before starting a new game
		if (this.socket !== null){
			this.socket.close();
		}

		// Create a new stage and new socket
		this.stage=new Stage(this.canvasRef.current, this.props.level);
		this.socket = new WebSocket(`ws://${window.location.hostname}:8001`);

		this.replay = false;
		var game = this;
		this.socket.onopen = function (event) {
			game.gameEnded = false; // game has started when socket is open
		};
		this.socket.onclose = function (event) {
			game.gameEnded = true; // game has ended when socket is closed
		};
		this.socket.onmessage = function (event) {
			game.update(JSON.parse(event.data)); // update the game when new data is received
		};
	}

	/**
	 * 
	 * Start a new replay
	 * 
	 */
	newReplay = () =>{
		// Close the previous socket before replaying
		if (this.socket !== null){
			this.socket.close();
		}

		// Record which replay to play
		var replayId = this.stage.id;
		var replaySquareId = this.stage.square_id;

		// Create a new stage and new socket
		this.stage=new Stage(this.canvasRef.current, this.props.level);
		this.stage.replay = true; // this game is a replay
		this.socket = new WebSocket(`ws://${window.location.hostname}:8002`);

		this.replay = true;
		var game = this;
		this.socket.onopen = function (event) {
			// send a request to server indicating which replay to play
			game.socket.send(JSON.stringify({"id" : replayId, "square_id": replaySquareId}));
			game.gameEnded = false; // game has started upon open of the socket
		};
		this.socket.onclose = function (event) {
			game.gameEnded = true; // game has ended upon close of the socket
		};
		this.socket.onmessage = function (event) {
			game.update(JSON.parse(event.data)); // update the game when new data is received
		};
	}

	/**
	 * 
	 * Update the game data
	 * 
	 */
	update = (message) =>{
		if (message["type"] == "data"){ // this message contains information of the game stage
			for (let new_square in message["new_squares"]){ // add new square to the game
				this.stage.squares[new_square] = message["new_squares"][new_square];
			}
			for (let updated_square in message["updated_squares"]){ // update an existing square
				if (updated_square in this.stage.squares){
					this.stage.squares[updated_square].x = message["updated_squares"][updated_square].x;
					this.stage.squares[updated_square].y = message["updated_squares"][updated_square].y;
					this.stage.squares[updated_square].health = message["updated_squares"][updated_square].health;
				}
			}
			for (let deleted_square of message["deleted_squares"]){ // delete an existing square
				if (deleted_square in this.stage.squares){
					delete this.stage.squares[deleted_square];
				}
			}
			if ("enemies_number" in message){ // number of enemies has changed
				this.stage.enemies_number = message["enemies_number"];
			}
			if ("bullets" in message){ // number of bullets has changed
				this.stage.bullets = message["bullets"];
			}
			if ("health" in message){ // health has changed
				this.stage.health = message["health"];
			}
			if ("score" in message){ // score has changed
				this.stage.score = message["score"];
			}
			this.stage.draw();
		} else if (message["type"] === "assignment"){ // this message contains the new player id and square id
			this.stage.id = message["id"];
			this.stage.square_id = message["square_id"];
		} else if (message["type"] === "failure"){ // this message indicates the player has died
			this.gameEnded = true;
			this.stage.lose = true;
			// Record the score in the database if it's not a replay
			if (!this.replay){ 
				this.recordScore();
			}
			this.stage.draw();
		} else if (message["type"] === "error"){ // this message indicates something went wrong
			this.gameEnded = true;
			this.stage.lose = false;
			this.stage.error = true;
			this.stage.draw();
		}
	}

	/**
	 * 
	 * Record the score in the database
	 * 
	 */
	recordScore = () =>{
		// check if any data is invalid
		if (this.stage === null || this.stage.score < 0 || this.stage.score > 2147483647 || 
			this.stage.enemies_number < 0 || this.stage.enemies_number > 2147483647){
				this.stage.score_add_message = 2;
				this.stage.draw();
				return ;
		}

		// send request to record the score in db
		var page = this;
		$.ajax({
			method: "POST",
			url: "http://"+ window.location.hostname +":8000/api/auth/record",
			data: JSON.stringify({"level": page.props.level, "score": page.stage.score, "enemies": page.stage.enemies_number}),
			headers: { "Authorization": "Basic " + btoa(page.props.username + ":" + page.props.password) },
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"
		}).done(function(data, text_status, jqXHR){
			page.stage.score_add_message = 1;
			page.stage.draw();
		}).fail(function(err){
			page.stage.score_add_message = 2;
			page.stage.draw();
		});
	}

	/**
	 * 
	 * If a user presses a key, this function will be called and sync it with the server
	 * 
	 */
	keyPressed = (event) =>{
		var key = event.key;

		// restart the game
		if (key === 't'){
			this.socket.close(); // close the previous socket 
			this.newGame();
			return;
		}

		// the player can watch a replay after the game is ended
		if (this.gameEnded && key === 'r'){
			this.socket.close(); // close the previous socket 
			this.newReplay();
			return;
		}

		// check if there is any player since all keys below require a stage and a player to function properly
		if (!this.gameEnded && !this.replay && this.socket !== null && this.stage !== null){
			// move the player up, down, left, right
			var moveMap = { 
				'a': "left",
				's': "down",
				'd': "right",
				'w': "up"
			};
			if(key in moveMap){
				// let the game model know the user wants to move in a different direction
				this.socket.send(JSON.stringify({"type" : "move", "direction" : moveMap[key]}));
			}
	
			// reload bullets and restore health
			if (key === 'e'){
				// let the game model know the user wants to retreat
				this.socket.send(JSON.stringify({"type" : "retreat"}));
			}
		}
	}
	
	/**
	 * 
	 * If a user moves the mouse on the game page, this function will be called and the game stage would be changed
	 * 
	 */
	moveMouse = (event) =>{
		if (!this.gameEnded && !this.replay && this.socket !== null && this.stage !== null){
			this.stage.updateMouseLocation(event.clientX, event.clientY); // let the game model know the user has moved the mouse
		}
	}
	
	/**
	 * 
	 * If a user clicks the mouse on the game page, this function would be called and sync it with the server
	 * 
	 */
	clickMouse = (event) =>{
		if (!this.gameEnded && !this.replay && this.socket !== null && this.stage !== null){
			// If the user has bullets to fire, play the sound
			if (this.stage.bullets > 0){
			    let playAudio = new Audio(gunAudio);
			    playAudio.play();
			}
			// let the server know the user has clicks the mouse (so the player can fire)
			this.socket.send(JSON.stringify({"type" : "fire", "x" : Math.floor(this.stage.mouseX), "y" : Math.floor(this.stage.mouseY)}));
		}
	}

	render() {
		return (
			<div ref={(window) => {this.window= window}}>
				<center>
					<canvas width="900" height="600" ref={this.canvasRef} style={{backgroundColor: "azure"}}/>
				</center>
			</div>
		);
	}
}

Game.defaultProps = {
	level: "easy",
	username: "", 
	password: ""
};

export {Game};
