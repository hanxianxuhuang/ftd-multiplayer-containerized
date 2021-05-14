import React from 'react';
import $ from 'jquery'; 
import {Navigation} from './components/utilities/Navigation';
import {Notification} from './components/utilities/Notification';
import {InstructionsPage} from './components/pages/InstructionsPage';
import {LoginPage} from './components/pages/LoginPage';
import {PlayPage} from './components/pages/PlayPage';
import {ProfilePage} from './components/pages/ProfilePage';
import {RegisterPage} from './components/pages/RegisterPage';
import {StatsPage} from './components/pages/StatsPage';

/**
 * 
 * Everything would happen here , including displaying, storing user information, getting stats, ...
 * 
 */
class Client extends React.Component {
	constructor(props) {
		super(props);
		this.easyScores = [];
		this.mediumScores = [];
		this.hardScores = [];
		this.scoresRetrieveSuccess = true;
		this.state = {
			page: "LoginPage", 
			notification: 0,
			username: '', 
			password: '', 
			email: '', 
			phone: '', 
			birthday: new Date().toISOString().substr(0, 10), 
			level: 'easy', 
			privacy: true
		};
		this.retrieveStats("LoginPage", -1); // Get the stats since the user is in the login page initially
	}

	/**
	 * 
	 * This function would take the client to a different page and display notification if appropricate
	 * 
	 * Also, some actions would be done here such as logout and retrieve scores
	 * 
	 */
	switchPage = (oldPage, newPage) => {
		if (newPage === "LoginPage"){
			if (oldPage ==="DeleteSuccessfully"){ // user successfully deleted the profile
				this.logout(5);
			} else if (oldPage ==="DeleteUnsuccessfully"){ // user failed to delete the profile
				this.logout(6);
			} else{
				this.retrieveStats("LoginPage", -1); // retrieve the latest scores since the user will go to the login page
			}
		} else if (newPage === "RegisterPage"){
			this.setState({page: "RegisterPage", notification: 0});
		} else if (newPage === "PlayPage"){
			this.setState({page: "PlayPage", notification: 0});
		} else if (newPage === "InstructionsPage"){
			this.setState({page: "InstructionsPage", notification: 0});
		} else if (newPage === "ProfilePage"){
			this.setState({page: "ProfilePage", notification: 0});
		} else if (newPage === "StatsPage"){
			this.retrieveStats("StatsPage", -1);// retrieve the latest scores
		} else if (newPage === "Logout"){
			this.logout(2); // log out the user
		}
	}

	/**
	 * 
	 * Set all the user information in this function and display appropriate norification
	 * 
	 */
	setUserInformation = (username, password, email, phone, birthday, level, privacy, sourcePage) => {
		var notification = 0;
		var page = "PlayPage";

		// Set the new page that the user would go to and display the appropriate notification
		if (sourcePage === "login"){
			page = "PlayPage";
			notification = 1;
		} else if(sourcePage === "register"){
			page = "PlayPage";
			notification = 3;
		} else if (sourcePage === "profile"){
			page = "ProfilePage";
			notification = 4;
		}

		if (password === ""){ // user successfully changed the information but doesn't change the password
			this.setState({
				username: username, 
				email: email,
				phone: phone,
				birthday: birthday,
				level: level,
				privacy: privacy,
				page: page,
				notification: notification
			});
		} else{ // user successfully changed the information
			this.setState({
				username: username, 
				password: password,
				email: email,
				phone: phone,
				birthday: birthday,
				level: level,
				privacy: privacy,
				page: page,
				notification: notification
			});
		}
	}

	/**
	 * 
	 * Retrieve the stats from the server and take the user to the desired new page
	 * 
	 */
	retrieveStats = (newPage, notification) =>{
		var page = this;
		this.easyScores = []; // scores for easy level
		this.mediumScores = []; // scores for meidum level
		this.hardScores = []; // scores for hard level

		$.ajax({
			method: "GET",
			url: "http://"+ window.location.hostname +":8000/api/scores",
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"
		}).done(function(data, text_status, jqXHR){
			// all stats have been retrieved from db so update all scores in the html page and display notification
			for (var i=1;i<=10;i++){
				if (i in data["easy_scores"]){
					page.easyScores.push({rank: i, level: "easy", username: data["easy_scores"][i]["score_user"], score: data["easy_scores"][i]["score_num"]});
				}
				if (i in data["medium_scores"]){
					page.mediumScores.push({rank: i, level: "medium", username: data["medium_scores"][i]["score_user"], score: data["medium_scores"][i]["score_num"]});
				}
				if (i in data["hard_scores"]){
					page.hardScores.push({rank: i, level: "hard", username: data["hard_scores"][i]["score_user"], score: data["hard_scores"][i]["score_num"]});
				}
			}
			page.scoresRetrieveSuccess = true;
			page.setState({page: newPage, notification: notification === -1 ? 7 : notification}) // take the user to the new page and display notification
		}).fail(function(err){
			page.scoresRetrieveSuccess = false;
			page.setState({page: newPage, notification: notification === -1 ? 8 : notification}) // take the user to the new page and display notification
		});
	}

	/**
	 *
	 * Log out the user and take the user to the login page 
	 *
	 */
	logout = (notification) =>{
		this.setState({
			username: '', 
			password: '',
			email: '',
			phone: '',
			birthday: new Date().toISOString().substr(0, 10),
			level: 'easy',
			privacy: true
		}, () => {this.retrieveStats("LoginPage", notification);});
	}

	/**
	 *
	 * Close the notification if the user clicks the mouse or 8 seconds have passed
	 *
	 */
	closeNotification = () =>{
		this.setState({notification: 0});
	}

	render (){
		if (this.state.page === "LoginPage"){
			return <div> 
				<LoginPage switchPage={this.switchPage} setUserInformation={this.setUserInformation}/>
				<StatsPage 
					easyScores= {this.easyScores}
					mediumScores= {this.mediumScores}
					hardScores= {this.hardScores}
					success= {this.scoresRetrieveSuccess}
				/> 
				<Notification status={this.state.notification} closeNotification={this.closeNotification}/>
			</div>;
		} else if (this.state.page === "RegisterPage"){
			return <div>
				<RegisterPage switchPage={this.switchPage} setUserInformation={this.setUserInformation}/>;
				<Notification status={this.state.notification} closeNotification={this.closeNotification}/>
			</div>
		} else if (this.state.page === "PlayPage"){
			return <div> 
				<Navigation switchPage={this.switchPage} currentPage={this.state.page}/>
				<PlayPage 
					level={this.state.level}
					username= {this.state.username}
					password= {this.state.password}
				/>  
				<Notification status={this.state.notification} closeNotification={this.closeNotification}/>
			</div>;
		} else if (this.state.page === "InstructionsPage"){
			return <div> 
				<Navigation switchPage={this.switchPage} currentPage={this.state.page}/> 
				<InstructionsPage /> 
				<Notification status={this.state.notification} closeNotification={this.closeNotification}/>
			</div>;
		} else if (this.state.page === "ProfilePage"){
			return <div> 
				<Navigation switchPage={this.switchPage} currentPage={this.state.page}/> 
				<ProfilePage 
					switchPage={this.switchPage}
					setUserInformation={this.setUserInformation}
					username= {this.state.username}
					password= {this.state.password}
					email= {this.state.email}
					phone= {this.state.phone}
					birthday= {this.state.birthday}
					level= {this.state.level}
					privacy= {this.state.privacy}
				/> 
				<Notification status={this.state.notification} closeNotification={this.closeNotification}/>
				</div>;
		} else if (this.state.page === "StatsPage"){
			return <div> 
				<Navigation switchPage={this.switchPage} currentPage={this.state.page} />
				<StatsPage 
					easyScores= {this.easyScores}
					mediumScores= {this.mediumScores}
					hardScores= {this.hardScores}
					success= {this.scoresRetrieveSuccess}
				/> 
				<Notification status={this.state.notification} closeNotification={this.closeNotification}/>
			</div>;
		}
	}
}

export {Client};