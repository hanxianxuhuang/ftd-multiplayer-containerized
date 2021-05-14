import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import $ from 'jquery'; 
import {Username} from '../inputs/Username'
import {Password} from '../inputs/Password'
import {LoginButton} from '../inputs/LoginButton'
import {ToRegisterButton} from '../inputs/ToRegisterButton'

/**
 * 
 * The login page
 * 
 */
class LoginPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '', 
			password: '', 
			usernameError:false, 
			passwordError:false
		};
	}

	/**
	 * 
	 * This function will be called if the client changes any input field
	 *
	 */
	handleChange = (event) => {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		this.setState({
			[name]: value
		});
	}

	/**
	 * 
	 * This function will be called when the client clicks the login button and will log the client in
	 *
	 */
	login = (event) =>{
		// prevent redirection
		event.preventDefault();
		// validate all inputs to see if there is any error (frontend validation)
		if (this.validate() === 1){
			return;
		}

		// send the login request to the server
		var page = this;
		$.ajax({
			method: "POST",
			url: "http://"+ window.location.hostname +":8000/api/auth/login",
			data: JSON.stringify({}),
			headers: { "Authorization": "Basic " + btoa(page.state.username + ":" + page.state.password) },
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"
		}).done(function(data, text_status, jqXHR){
			// login succeed so switch page and display notification
			// the server returns all user information so store it in order to display them in the profile page

			// record the user information which received from the server and then go to the PlayPage
			page.props.setUserInformation(
				page.state.username, 
				page.state.password, 
				data["email"], 
				data["phone"],
				data["birthday"].substring(0, 10), 
				data["level"], 
				true,
				"login"
			);
		}).fail(function(err){
			// user's login credentials are not good so highlight them in the login page
			page.setState({usernameError:true, passwordError:true});
		});
	}

	/**
	 * 
	 * Validate client's input
	 * 
	 * Return 0 if all inputs are ok, 1 otherwise
	 *
	 */
	validate = () =>{
		var has_error = 0;
		this.clearError();

		// validate all inputs
		// username must not include colon and have length <= 20
		if (this.state.username === '' || this.state.username.indexOf(':') !== -1 || this.state.username.length > 20){
			this.setState({usernameError:true});
			has_error = 1;
		}
		// password must have length >= 3
		if (this.state.password.length < 3){
			this.setState({passwordError:true});
			has_error = 1;
		}

		if (has_error){
			return 1;
		}
		return 0;
	}

	/**
	 * 
	 * Clear the errors that the input fields would display
	 *
	 */
	clearError = () =>{
		this.setState({usernameError:false, passwordError:false});
	}

	/**
	 * 
	 * Go to the register page
	 *
	 */
	toRegister = () =>{
		this.props.switchPage("LoginPage", "RegisterPage");
	}

	render() {
		return (
			<div>
				<form onSubmit={e => this.login(e)}>
					<Grid container direction="column" justify="center" alignItems='center' spacing={3}>
						<Grid item>
							<Typography variant="h4">
								f0rt9it32d Login
							</Typography>
						</Grid>

						<Grid item>
							<Username onChange={this.handleChange} error={this.state.usernameError} defaultValue={this.state.username}/>
						</Grid>

						<Grid item>
							<Password onChange={this.handleChange} error={this.state.passwordError}/>
						</Grid>

						<Grid item>
							<LoginButton />
						</Grid>

						<Grid item>
							<ToRegisterButton onClick={this.toRegister}/>
						</Grid>
					</Grid>
				</form>
			</div>
		);
	}
}

LoginPage.defaultProps = {
	switchPage: {},
	setUserInformation: {}
};

export {LoginPage};