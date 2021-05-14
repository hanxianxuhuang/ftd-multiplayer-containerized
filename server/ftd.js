var port = 8000; 
var gameWebSocketPort = port+1;
var replayWebSocketPort = port+2;
var express = require('express');
var cors = require("cors");
var app = express();
var path = require('path');
var {Stage} = require('./model.js');
var {Pair} = require('./model.js');
var {Player} = require('./model.js');

// Setup the PostgreSQL credentials
const { Pool } = require('pg')
const pool = new Pool({
	user: 'webdbuser',
	host: 'postgres',
	database: 'webdb',
	password: 'password',
	port: 5432
});

// Setup the MongoDB credentials
var MongoClient = require('mongodb').MongoClient;
var MongoURL = "mongodb://mongo:27017/";
MongoClient.connect("mongodb://mongo:27017/replays", { useUnifiedTopology: true },function(err, db) {
	db.close();
});

const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies
function isNaturalNumber(value) { return /^\d+$/.test(value); }
app.use(bodyParser.json());
app.use(cors());


// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got here"}); 
});


/** 
 * 
 * Retrieve top 10 scores of each level from PostgreSQL
 * 
*/
app.get('/api/scores', function (req, res) {
	var easy_scores = {}; // scores for level easy
	var medium_scores = {}; // scores for level medium
	var hard_scores = {}; // scores for level hard
	let sql_easy_scores = "SELECT * FROM ftdstats WHERE level = 'easy' ORDER BY score DESC LIMIT 10;";
	let sql_medium_scores = "SELECT * FROM ftdstats WHERE level = 'medium' ORDER BY score DESC LIMIT 10;";
	let sql_hard_scores = "SELECT * FROM ftdstats WHERE level = 'hard' ORDER BY score DESC LIMIT 10;";

	// the sql callbacks are nested since they are asynchronous and the function may return before all scores are retrieved
	pool.query(sql_easy_scores, [], (err, pgRes) => {
		if(err){ 
			res.status(404).json({'message': 'Unknown error occured'});
			return;
		} else{
			easy_scores = build_scores_json(pgRes);
			pool.query(sql_medium_scores, [], (err, pgRes) => {
				if(err){ 
					res.status(404).json({'message': 'Unknown error occured'});
					return;
				} else{
					medium_scores = build_scores_json(pgRes);
					pool.query(sql_hard_scores, [], (err, pgRes) => {
						if(err){ 
							res.status(404).json({'message': 'Unknown error occured'});
							return;
						} else{
							hard_scores = build_scores_json(pgRes);
							// All scores are retrieved now so return to the users
							res.status(200); 
							res.json({"message":"scores retrieved", "easy_scores":easy_scores, "medium_scores":medium_scores, 
										"hard_scores":hard_scores}); 
						}
					});
				}
			});
		}
	});
});


/** 
 * 
 * Retrieve top 10 number of enemies of each level from PostgreSQL 
 * 
*/
app.get('/api/enemies', function (req, res) {
	var easy_numbers_of_enemies = {};
	var medium_numbers_of_enemies = {};
	var hard_numbers_of_enemies = {};
	let sql_easy_numbers_of_enemies = "SELECT * FROM ftdstats WHERE level = 'easy' ORDER BY enemies DESC LIMIT 10;";
	let sql_medium_numbers_of_enemies = "SELECT * FROM ftdstats WHERE level = 'medium' ORDER BY enemies DESC LIMIT 10;";
	let sql_hard_numbers_of_enemies = "SELECT * FROM ftdstats WHERE level = 'hard' ORDER BY enemies DESC LIMIT 10;";

	// the sql callbacks are nested since they are asynchronous and the function may return before all numbers of enemies are retrieved
	pool.query(sql_easy_numbers_of_enemies, [], (err, pgRes) => {
		if(err){ 
			res.status(404).json({'message': 'Unknown error occured'});
			return;
		} else{
			easy_numbers_of_enemies = build_numbers_of_enemies_json(pgRes);
			pool.query(sql_medium_numbers_of_enemies, [], (err, pgRes) => {
				if(err){ 
					res.status(404).json({'message': 'Unknown error occured'});
					return;
				} else{
					medium_numbers_of_enemies = build_numbers_of_enemies_json(pgRes);
					pool.query(sql_hard_numbers_of_enemies, [], (err, pgRes) => {
						if(err){ 
							res.status(404).json({'message': 'Unknown error occured'});
							return;
						} else{
							hard_numbers_of_enemies = build_numbers_of_enemies_json(pgRes);
							// All numbers of enemies are retrieved now so return to the users
							res.status(200); 
							res.json({"message":"enemies retrieved", "easy_numbers_of_enemies":easy_numbers_of_enemies, "medium_numbers_of_enemies":medium_numbers_of_enemies, 
										"hard_numbers_of_enemies":hard_numbers_of_enemies}); 
						}
					});
				}
			});
		}
	});
});


/** 
 * 
 * Handle registration requests from users and register the user in PostgreSQL if the inputs are fine
 * 
 */
app.post('/api/register', function (req, res) {
	// check if the information provided by the user contains any error (backend validation)
	var input_error = register_validate(req);
	if (JSON.stringify(input_error) != '{}'){
		return res.status(400).json(input_error); // the information that the user provides is invalid
	}

	var username = req.body['reg_username']; // get the username that the user requests

	// check if the username already exists in the db
	let sql_username = 'SELECT * FROM ftduser WHERE username=$1';
	pool.query(sql_username, [username], (err, pgRes) => {
		if (err){
			res.status(404).json({'message': 'Unknown error occured'});
		} else if(pgRes.rowCount != 0){ 
			// username already exists
			return res.status(409).json({"message":"Username exists"});
		} else{
			// username doesn't exist in PostgreSQL, so insert the user into PostgreSQL
			let sql_register = "INSERT INTO ftduser VALUES($1, sha512($2), $3, $4, $5, $6, true)";
			pool.query(sql_register, [req.body['reg_username'], req.body['reg_password'], req.body['reg_email'], req.body['reg_phone'], req.body['reg_birthday'], req.body['reg_level']], (err, pgRes) => {
				if (err){
					res.status(404).json({'message': 'Unknown error occured'}); // registration succeeded
				} else {
					res.status(201).json({'message': 'Registration succeeded'}); // registration failed
				}
			});
		}
	});
});


/** 
 * This is middleware to restrict access to subroutes of /api/auth/ 
 * To get past this middleware, all requests should be sent with appropriate
 * credentials. Now this is not secure, but this is a first step.
 *
 * Authorization: Basic YXJub2xkOnNwaWRlcm1hbg==
 * Authorization: Basic " + btoa("arnold:spiderman"); in javascript
**/
app.use('/api/auth', function (req, res,next) {
	if (!req.headers.authorization) {
		return res.status(401).json({ error: 'No credentials sent!' });
  	}
	try {
		// var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
		var user_pass = Buffer.from(m[1], 'base64').toString()
		m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this
		var username = m[1];
		var password = m[2];

		// check if the username matches the password in db
		let sql_login = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
			pool.query(sql_login, [username, password], (err, pgRes) => {
  			if (err){
				res.status(401).json({ error: 'Not authorized'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
					res.status(401).json({ error: 'Not authorized'});
				}
		});
	} catch(err) {
			   	res.status(401).json({ error: 'Not authorized'});
	}
});

// All routes below /api/auth require credentials 


/**
 * 
 * Handle login requests from uesrs using PostgreSQL
 * 
 */
app.post('/api/auth/login', function (req, res) {
	// retrieve the username from the authorization header
	var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
	var user_pass = Buffer.from(m[1], 'base64').toString()
	m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this
	var username = m[1];

	// search the user in db and return all the information of the user except the password
	let sql_login = 'SELECT username, email, phone, birthday, level FROM ftduser WHERE username=$1';
	pool.query(sql_login, [username], (err, pgRes) => {
		if (err){
			res.status(403).json({ error: 'Unknown error'});
		} else if(pgRes.rowCount == 1){ // the user is in the database
			// return all the information of the user
			var info = {};
			info["username"] = pgRes["rows"][0]["username"];
			info["email"] = pgRes["rows"][0]["email"];
			info["phone"] = pgRes["rows"][0]["phone"];
			info["birthday"] = pgRes["rows"][0]["birthday"];
			info["level"] = pgRes["rows"][0]["level"];
			info["message"] = "authentication success";
			res.status(200); 
			res.json(info); 
		} else { // should never happens since username is a primary key
			res.status(404).json({ error: 'Unknown error'});
		}
	});
});


/**
 * 
 * Handle profile modification requests from users and modify the user information in PostgreSQL if the inputs are good
 * 
 */
app.put('/api/auth/modify', function (req, res) {
	// check if the information provided by the user contains any error (backend validation)
	var input_error = save_validate(req);
	if (JSON.stringify(input_error) != '{}'){
		return res.status(400).json(input_error); // the information that the user provides is invalid
	}

	// Check if password needs to be updated
	if (req.body['profile_password'] != ""){ // need to update password
		let sql_update = "UPDATE ftduser SET password = sha512($1), email = $2, phone = $3, birthday = $4, level = $5 WHERE username = $6;";
		pool.query(sql_update, [req.body['profile_password'], req.body['profile_email'], req.body['profile_phone'], req.body['profile_birthday'], req.body['profile_level'], req.body['profile_username']], (err, pgRes) => {
			if (err){
				res.status(403).json({'message': 'Unknown error occured'}); // modification failed
			} else {
				res.status(200).json({'message': 'Save succeeded'}); // modification succeeded
			}
		});
	} else{ // don't need to update password
		let sql_update = "UPDATE ftduser SET email = $1, phone = $2, birthday = $3, level = $4 WHERE username = $5;";
		pool.query(sql_update, [req.body['profile_email'], req.body['profile_phone'], req.body['profile_birthday'], req.body['profile_level'], req.body['profile_username']], (err, pgRes) => {
			if (err){
				res.status(403).json({'message': 'Unknown error occured'}); // modification failed
			} else {
				res.status(200).json({'message': 'Save succeeded'}); // modification succeeded
			}
		});
	}
});


/**
 * 
 * Handle profile deletion requests from users and delete the user in PostgreSQL if the user exists
 * 
 */
app.delete('/api/auth/delete', function (req, res) {	
	// retrieve the username from the authorization header
	var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
	var user_pass = Buffer.from(m[1], 'base64').toString()
	m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this
	var username = m[1];

	// delete the user in db and return
	let sql_update = "DELETE FROM ftduser WHERE username = $1;";
	pool.query(sql_update, [username], (err, pgRes) => {
		if (err){
			res.status(403).json({'message': 'Fail to delete profile'}); // deletion failed
		} else {
			res.status(200).json({'message': 'Profile deleted'}); // deletion succeeded
		}
	});
});


/**
 * 
 * Handle recording stats requests from users and record the stats in PostgreSQL if the inputs are good
 * 
 */
app.post('/api/auth/record', function (req, res) {
	// check if the information provided by the user contains any error (backend validation)
	if (!("score" in req.body) || !isNaturalNumber(req.body["score"]) || req.body["score"] < 0 || req.body["score"] > 2147483647){
		return res.status(400).json({'message': 'Invalid score'}); // the score or enemies that the client provides is not valid
	} 
	if (!("enemies" in req.body) || !isNaturalNumber(req.body["enemies"]) || req.body["enemies"] < 0 || req.body["enemies"] > 2147483647){
		return res.status(400).json({'message': 'Invalid enemies'}); // the score or enemies that the client provides is not valid
	} 
	if (!('level' in req.body) || (req.body['level'] != 'easy' && req.body['level'] != 'medium' && req.body['level'] != 'hard')){
		return res.status(400).json({'message': 'Invalid level'}); // the score or enemies that the client provides is not valid
	}

	// retrieve the username from the authorization header
	var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
	var user_pass = Buffer.from(m[1], 'base64').toString()
	m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this
	var username = m[1];

	// insert the username, stats and level of difficulty to db
	let sql_record = "INSERT INTO ftdstats VALUES(CURRENT_TIMESTAMP, $1, $2, $3, $4)";
	pool.query(sql_record, [username, req.body['level'], req.body['score'], req.body['enemies']], (err, pgRes) => {
		if (err){
			res.status(404).json({'message': 'Unknown error occured'});// fail to record stats
		} else {
			res.status(201).json({'message': 'Score and enemies recorded'}); // stats recorded successfully
		}
	});
});


app.post('/api/auth/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got to /api/auth/test"}); 
});

// serve all static files
app.use('/',express.static(path.join(__dirname + '/static_content/')));

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});


// Game Web Sockets (used for the main game)
var gameWebSocketServer = require('ws').Server  
   ,wss = new gameWebSocketServer({port: gameWebSocketPort});  

// Game Web Sockets (use for replaying games)
var replayWebSocketServer = require('ws').Server  
   ,replayWss = new replayWebSocketServer({port: replayWebSocketPort});
  

// Initialize all the data
var actions = []; // all the client requests that are waiting to be processed (every 100ms)
var bad_clients = []; // clients that sent at least one invalid requests that are waiting to be removed (every 100ms)
var count = 0; // Number of clients so far including the disconnected clients
var squares = {}; // all the squares in the game
var old_data = {}; // old score, bullets and health of each client (previous update)
var old_enemies_number = 0; // old enemies_number

// Start the game
var stage=new Stage(900, 600, "easy"); // Setup a game model
// Send game updated to clients, execute clients' requests, remove misbehaved client, send replay updates to clients and step the game every 100ms
setInterval(function(){ execute_buffered_action(); wss.removeBadClients(); stage.step(); wss.broadcast(); replayWss.broadcast();},100);
  
wss.on('close', function() {  
	console.log('Game web socket server disconnected');  
});  
  
/**
 * 
 * Send game updates to clients every 100ms
 * 
 * This function would calculate games changes (new squares, updated sqaures, removed squares)
 * 
 * This function would also calculate client's data changes
 * 
 */
wss.broadcast = function(){ 
	let new_squares = {}; // new squares since last update
	let updated_squares = {}; // updated squares since last update
	let keys = []; // all existing square_id of squares
   	for(let key in squares) keys.push(key); // add all existing square_id in squares to keys

	// send only the new, updated and removed squares to the clients
	for (let square of stage.squares){ 
		if (!(square.square_id in squares)){ // The square is new since last update
			if (square.type == "player"){ // the square is a player so also send the player id
				squares[square.square_id] = {"x" : square.x, "y" : square.y, "length" : square.length, "health" : square.health, "type" : "player", "id" : square.id};
				new_squares[square.square_id] = {"x" : square.x, "y" : square.y, "length" : square.length, "health" : square.health, "type" : "player", "id" : square.id};
			} else if (square.type == "bullet"){ // the square is a player so also send whose the bullet is from
				squares[square.square_id] = {"x" : square.x, "y" : square.y, "length" : square.length, "health" : square.health, "type" : "bullet", "source_id" : square.source_id};
				new_squares[square.square_id] = {"x" : square.x, "y" : square.y, "length" : square.length, "health" : square.health, "type" : "bullet", "source_id" : square.source_id};
			} else{ // the square doesn't require anything special to be sent
				squares[square.square_id] = {"x" : square.x, "y" : square.y, "length" : square.length, "health" : square.health, "type" : square.type};
				new_squares[square.square_id] = {"x" : square.x, "y" : square.y, "length" : square.length, "health" : square.health, "type" : square.type};
			}
		} else{ // The square is old from the last update
			// remove the square_id from keys list since it's still in squares (in order to keep track of which square is deleted)
			let index=keys.indexOf(String(square.square_id));
			if(index!=-1){
				keys.splice(index,1);
			}

			// The square is updated since last update
			// Only the location and health need to be updates (length, id type would never change)
			if (squares[square.square_id].x != square.x || squares[square.square_id].y != square.y || squares[square.square_id].health != square.health){
				squares[square.square_id].x = square.x; // update x-coordinate
				squares[square.square_id].y = square.y; // update y-coordinate
				squares[square.square_id].health = square.health; // update health
				updated_squares[square.square_id] = {"x" : square.x, "y" : square.y, "health" : square.health};
			}
		}
	} 

	// Remove deleted square in the game stage from squares JSON if any
	for (let removed_key of keys){
		delete squares[removed_key];
	}

	// Form a general data that every client would receive (not including client-specific data like score and bullets)
	var general_data = {"type" : "data", "new_squares" : new_squares, "updated_squares" : updated_squares, "deleted_squares" : keys};
	if (stage.enemies_number != old_enemies_number){
		general_data["enemies_number"] = stage.enemies_number;
		old_enemies_number = stage.enemies_number;
	}
	general_data_string = JSON.stringify(general_data); // Since not every client would receive the same data, a new JSON needs to be created for every client

	// Send data to every client including client-specific data
	for(let ws of this.clients){
		var data = JSON.parse(general_data_string); // include the general data that every client would receive

		// Check if the client is new
		if (!(ws.id in old_data)){
			old_data[ws.id] = {}; // The client is new so doesn't have any old data (received last time) 
		}  

		// Check if this client has been removed and send update if this client's score, health and bullets changed
		if (ws.id in stage.removed_players){ // this client has been removed from the game
			if (old_data[ws.id]["score"] != stage.removed_players[ws.id]["score"]){
				// The score changes since last update so send it to the client and update the old data
				data["score"] = stage.removed_players[ws.id]["score"];
				old_data[ws.id]["score"] = stage.removed_players[ws.id]["score"];
			}
			if (old_data[ws.id]["health"] != stage.removed_players[ws.id]["health"]){
				// The health changes since last update so send it to the client and update the old data
				data["health"] = stage.removed_players[ws.id]["health"];
				old_data[ws.id]["health"] = stage.removed_players[ws.id]["health"];
			}
			if (old_data[ws.id]["bullets"] != stage.removed_players[ws.id]["bullets"]){
				// The bullets changes since last update so send it to the client and update the old data
				data["bullets"] = stage.removed_players[ws.id]["bullets"];
				old_data[ws.id]["bullets"] = stage.removed_players[ws.id]["bullets"];
			}

			ws.send(JSON.stringify(data)); // send the game updates to the client
			ws.send(JSON.stringify({"type" : "failure"})); // tell the client that he/she has died
			ws.close();
			delete old_data[ws.id]; // delete the old data of this client to save space
		} else{ // the client is still alive
			var client = stage.players[ws.id];
			if (old_data[ws.id]["score"] != client.score){
				// The score changes since last update so send it to the client and update the old data
				data["score"] = client.score;
				old_data[ws.id]["score"] = client.score;
			}
			if (old_data[ws.id]["health"] != client.health){
				// The health changes since last update so send it to the client and update the old data
				data["health"] = client.health;
				old_data[ws.id]["health"] = client.health;
			}
			if (old_data[ws.id]["bullets"] != client.bullets){
				// The bullets changes since last update so send it to the client and update the old data
				data["bullets"] = client.bullets;
				old_data[ws.id]["bullets"] = client.bullets;
			}
			ws.send(JSON.stringify(data)); // send the game updates to the client
		}

		// Record the data in MongoDB so client can replay later
		var current_time = ws.time; // avoid asynchronous issue
		ws.time += 1; // add 1 to the time since the data will be stored
		MongoClient.connect(MongoURL, { useUnifiedTopology: true }, function(err, db) {
			if (!err){ // connect to MongoDB successfully
				var replays = db.db("replays"); // store the data in the replays database
				replays.collection("replay_" + ws.id).insertOne({[current_time]: data}, function(err, res) {
					db.close();
				});
			}
		});
	}  
}

/**
 * 
 * Remove all clients that sent at least one invalid message every 100 ms
 * 
 */
wss.removeBadClients = function(){ 
	// Remove all clients
	while (bad_clients.length != 0){
		// Get the first bad client in the list
		var bad_client = bad_clients.shift();
		if (bad_client === undefined){
			// should never happens unless some unknown mistakes happen
			return;
		}
		// Close the socket if the bad client is one of the clients
		for(let ws of this.clients){
			if (ws.id === bad_client){
				ws.send(JSON.stringify({"type" : "failure"})); // send a message to the clients indicating he/she has been removed
				ws.close();
			}
		}
	}
}
  
wss.on('connection', function(ws) {  
	// Assign the new player an id
	ws.id = count;
	ws.time = 0;

	// notify the new client his/her player_id and square_id
	var assignment = {"type" : "assignment", "id" : count, "square_id" : stage.squares_number};
	ws.send(JSON.stringify(assignment)); 

	// send the complete data to the client since he/she is new
	var complete_data = {"type" : "data", "new_squares" : squares, "updated_squares" : {}, "deleted_squares" : [], "enemies_number" : stage.enemies_number};
	ws.send(JSON.stringify(complete_data));

	// Start to record player's state so the player can replay later
	ws.time += 1; // add 1 to the time since the data will be stored
	MongoClient.connect(MongoURL, { useUnifiedTopology: true }, function(err, db) {
		if (!err){ // connect to MongoDB successfully
			var replays = db.db("replays"); // record the data in the replays database
			// Drop the replay of the previous client that has the same id (since the server may restart)
			replays.collection("replay_" + ws.id).drop(function(err, delOK) {
				// Create a new collection for storing the new replay call replay_id
				replays.createCollection("replay_" + ws.id, function(err, res) {
					if (!err){
						// Insert the first message (complete state) to the collection
						replays.collection("replay_" + ws.id).insertOne({0: complete_data}, function(err, res) {
							db.close();
						});
					} else{
						db.close();
					}
			  	});
			});
		}
	});

	count += 1; // Update the total number of clients

	// Add the player to the center of the stage
	var initial_position = new Pair(Math.floor(Math.random() * stage.width), Math.floor(Math.random() * stage.height));
	var player = new Player(stage, initial_position, new Pair(0,0), stage.player_colour, 40, stage.player_health, stage.player_bullets, 
							stage.player_health_restore_amount, stage.player_bullets_restore_amount, ws.id);
	stage.addPlayer(player);  

	ws.on('message', function(message) {  // Client sends a message
		actions.push({id: ws.id, message: message}); // Store the message in a buffer so it would be executed even though server lags
	}); 
	
	ws.on("close", function() { // The socket is closed
		stage.removePlayer(ws.id); // Remove the client if disconnected
	});

	ws.on("error", function() { // The socket has an error
		stage.removePlayer(ws.id); // Remove the client if error occurs
	});
});  

/**
 * 
 * Execute the buffered action (fire, move, retreat) that the client requests every 100 ms
 * 
 * If client sends an invalid response, put the client into an array (so the client would be removed later)
 * 
 */
 function execute_buffered_action(){
	 while (actions.length != 0){
		// Get the first action from the list
		var raw_data = actions.shift();
		if (raw_data === undefined){
			// should never happen unless some unknown error occurs
			return;
		} 

		// Get detail of the action
		var id = raw_data.id; // the client that requests the action
		var raw_action = raw_data.message;// action detail (fire, move, retreat)
		var action = JSON.parse(raw_action);

		// Execute the action
		if (!("type" in action)){ 
			bad_clients.push(id); // remove the client if the action doesn't include a type
		} else if (action["type"] == "move"){ // the client requests to change the move direction
			if ("direction" in action && id in stage.players){
				// the client is in the game
				if (action.direction == "up"){
					stage.players[id].velocity = new Pair(0,-stage.player_speed); // up
				} else if (action.direction == "down"){
					stage.players[id].velocity = new Pair(0,stage.player_speed); // down
				} else if (action.direction == "left"){
					stage.players[id].velocity = new Pair(-stage.player_speed,0); // left
				} else if (action.direction == "right"){
					stage.players[id].velocity = new Pair(stage.player_speed,0); // right
				} else{
					bad_clients.push(id); // remove the client if the direction is not one of up, down, left, right
				}
			} else{
				bad_clients.push(id); // remove the client if the client is not in the game 
			}
		} else if (action["type"] == "fire"){ // the client requests to fire
			if ("x" in action && "y" in action && id in stage.players
				&& isNaturalNumber(action.x) && isNaturalNumber(action.y) 
				&& action.x >= 0 && action.x <= 900 && action.y >= 0 && action.y <= 600){
					// the client is in the game and the fire location is valid
					stage.players[id].fire(action.x, action.y);
			} else{
				bad_clients.push(id); // remove the client if the fire location is not valid
			}
		} else if (action["type"] == "retreat"){ // the client requests to retreat
			if (id in stage.players){
				stage.players[id].retreat(); // the client is in the game
			} else{
				bad_clients.push(id); // remove the client if the client is not in the game
			}
		} else{
			bad_clients.push(id); // remove the client sends an action that has invalid type
		}
	}
}

replayWss.on('close', function() {  
	console.log('Replay web socket server disconnected');  
});  

/**
 * 
 * Send replay updates to all clients that request replay every 100 ms
 * 
 */
replayWss.broadcast = function(){ 
	// Send replay updates to all clients that request replay
	for(let ws of this.clients){
		// Check if the client is watching replay
		if (ws.id != -1){ // the client is watching replay
			// Check if the client has finished watching the replay
			if (ws.time < ws.data_length){ // The replay hasn't finished
				if (ws.time in ws.data[ws.time]){ // The order of data is not messed up in MongoDB
					ws.send(JSON.stringify(ws.data[ws.time][ws.time])); // Send the replay update to the client
				} else{ // The order of data is messed up in MongoDB so search for the correct one in all data
					for (let i = 0; i < ws.data_length; i++){
						if (ws.time in ws.data[i]){ 
							ws.send(JSON.stringify(ws.data[i][ws.time])); // Send the replay update to the client
						}
					}
				}
				ws.time += 1; // add 1 to the time since client has watched this stage
			} else if (ws.data_length == -1) {
				// the client has sent a request to watch replay, but data is still being retrieved from MongoDB
				// since getting data from MongoDB is asynchronous
			} else{ // The replay has finished
				ws.send(JSON.stringify({"type" : "failure"})); // Notify the client that the replay has finished
				ws.close();
				ws.id = -1; // Indicate the client is not watching replay
				ws.time = 0;
				ws.data = [];
				ws.data_length = -1;
			}
		}
	}
}

replayWss.on('connection', function(ws) {
	ws.id = -1; // the replay that the client is watching, -1 indicates the client is not watching replay
	ws.time = 0; // the current time of the replay (for example, replay has 10 frames in total and the client is watching 2nd frame) 
	ws.data = []; // the complete data of the replay
	ws.data_length = -1; // -1 indicates the client has sent a request to watch replay, but data is still being retrieved from db

	ws.on('message', function(raw_message) {  // Client sends a message

		// Retrieve which replay the client wants to watch
		var message = JSON.parse(raw_message);
		if (!("id" in message) || !("square_id" in message) || !isNaturalNumber(message.id) 
			|| !isNaturalNumber(message.square_id) || message.id < 0 || message.square_id < 0){ // check if the replay id is valid
			ws.close();
			return ;
		}

		MongoClient.connect(MongoURL, { useUnifiedTopology: true }, function(err, db) {
			if (!err){ // connect to MongoDB successfully
				var replays = db.db("replays");	// The replay is stored in the replays database
				ws.id = message.id; // indicate the client starts to watch a replay
				ws.time = 0; // the time of the replay is 0 initially

				// Retrieve the replay from MongoDB
				// If the replay doesn't exist, the client would still be removed since ws.id has been changed
				replays.collection("replay_" + message.id).find({}).toArray(function(err, result) {
					if (!err){
						// Send the player id and square id to the client so the client can display the game properly
						ws.send(JSON.stringify({"type" : "assignment", "id" : ws.id, "square_id" : message.square_id}));
						ws.data = result; // all data of the replay
						ws.data_length = result.length; // length of the replay
					}
				});
			}
		});
	}); 
});  


// ------------------------------------------------------------Helper Function---------------------------------------------

/**
 * 
 * Retrieve the usernamse and the scores from pgRes and package them into JSON
 * 
 */
function build_scores_json(pgRes){
	var scores = {};
	for (var i=0;i<pgRes.rowCount;i++){
		var score_user = pgRes["rows"][i]["username"];
		var score_num = pgRes["rows"][i]["score"];
		var score = {score_user, score_num};
		scores[i+1] = score;
	}
	return scores;
}


/**
 * 
 * Retrieve the usernamse and the numbers of enemies from pgRes and package them into json
 * 
 */
function build_numbers_of_enemies_json(pgRes){
	var numbers_of_enemies = {};
	for (var i=0;i<pgRes.rowCount;i++){
		var number_of_enemies_user = pgRes["rows"][i]["username"];
		var number_of_enemies_num = pgRes["rows"][i]["enemies"];
		var number_of_enemies = {number_of_enemies_user, number_of_enemies_num};
		numbers_of_enemies[i+1] = number_of_enemies;
	}
	return numbers_of_enemies;
}

/**
 * 
 * Check all the information in users' registration requests to see if there is any error
 * 
 */
function register_validate(req){
	var input_error = {};

	// validate all inputs
	// username must not include colon
	if (!('reg_username' in req.body) || req.body['reg_username'] == '' || req.body['reg_username'].includes(':') || req.body['reg_username'].length > 20){
		input_error["reg_username"] = "is invalid"
	}
	// password must have length >= 3
	if (!('reg_password' in req.body) || req.body['reg_password'].length < 3){
		input_error["reg_password"] = "is invalid"
	}
	// password must match
	if (!('reg_password_again' in req.body) || req.body['reg_password'] != req.body['reg_password_again']){
		input_error["reg_password"] = "is invalid"
	}
	// email must contain @ and have length >=3
	if (!('reg_email' in req.body) || req.body['reg_email'].length < 3 || !req.body['reg_email'].includes('@') || req.body['reg_email'].length > 256
		|| req.body['reg_email'][0] == '@' || req.body['reg_email'][-1] == '@'){
		input_error["reg_email"] = "is invalid"
	}
	// phone must match the regex
	var regex_phone = new RegExp("[0-9]{3}-[0-9]{3}-[0-9]{4}");
	if (!('reg_phone' in req.body) || req.body['reg_phone'].length != 12 || !regex_phone.test(req.body['reg_phone'])){
		input_error["reg_phone"] = "is invalid"
	}
	// birthday must match the regex
	var regex_date = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}");
	if (!('reg_birthday' in req.body) || req.body['reg_birthday'].length != 10 || !regex_date.test(req.body['reg_birthday'])){
		input_error["reg_birthday"] = "is invalid"
	} else{
		var date_check = new Date(req.body['reg_birthday']);
		if (isNaN(date_check.getTime())){
			input_error["reg_birthday"] = "is invalid"
		}
	}
	// level must be one of easy, medium, hard
	if (!('reg_level' in req.body) || (req.body['reg_level'] != 'easy' && req.body['reg_level'] != 'medium' && req.body['reg_level'] != 'hard')){
		input_error["reg_level"] = "is invalid"
	}
	// privacy must be checked
	if (!('reg_privacy' in req.body) || req.body['reg_privacy'] != 'true'){
		input_error["reg_privacy"] = "is invalid"
	}
	return input_error;
}

/**
 * 
 * Check all the information in users' profile modificatioin requests to see if there is any error
 * 
 */
function save_validate(req){
	var input_error = {};

	// retrieve the username
	var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
	var user_pass = Buffer.from(m[1], 'base64').toString()
	m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this
	var username = m[1];

	// validate all inputs
	// username must not include colon
	if (!('profile_username' in req.body) || req.body['profile_username'] != username || req.body['profile_username'].length > 20){
		input_error["profile_username"] = "is invalid"
	}
	if ('profile_password' in req.body && 'profile_password_again' in req.body){
		// password must have length >= 3
		if (req.body['profile_password'] == "" && req.body['profile_password_again'] == ""){
			
		} else{
			// password must match
			if (req.body['profile_password'].length < 3 || req.body['profile_password'] != req.body['profile_password_again']){
				input_error["profile_password"] = "is invalid"
			}
		}
	} else{
		input_error["profile_password"] = "is invalid"
	}
	// email must contain @ and have length >=3
	if (!('profile_email' in req.body) || req.body['profile_email'].length < 3 || !req.body['profile_email'].includes('@') || req.body['profile_email'].length > 256
		|| req.body['profile_email'][0] == '@' || req.body['profile_email'][-1] == '@'){
		input_error["profile_email"] = "is invalid"
	}
	// phone must match the regex
	var regex_phone = new RegExp("[0-9]{3}-[0-9]{3}-[0-9]{4}");
	if (!('profile_phone' in req.body) || req.body['profile_phone'].length != 12 || !regex_phone.test(req.body['profile_phone'])){
		input_error["profile_phone"] = "is invalid"
	}
	// birthday must match the regex
	var regex_date = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}");
	if (!('profile_birthday' in req.body) || req.body['profile_birthday'].length != 10 || !regex_date.test(req.body['profile_birthday'])){
		input_error["profile_birthday"] = "is invalid"
	} else{
		var date_check = new Date(req.body['profile_birthday']);
		if (isNaN(date_check.getTime())){
			input_error["profile_birthday"] = "is invalid"
		}
	}
	// level must be one of easy, medium, hard
	if (!('profile_level' in req.body) || (req.body['profile_level'] != 'easy' && req.body['profile_level'] != 'medium' && req.body['profile_level'] != 'hard')){
		input_error["profile_level"] = "is invalid"
	}
	// privacy must be checked
	if (!('profile_privacy' in req.body) || req.body['profile_privacy'] != 'true'){
		input_error["profile_privacy"] = "is invalid"
	}
	return input_error;
}
