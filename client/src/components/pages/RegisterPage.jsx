import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import $ from 'jquery'; 
import {Username} from '../inputs/Username'
import {Password} from '../inputs/Password'
import {PasswordAgain} from '../inputs/PasswordAgain'
import {Email} from '../inputs/Email'
import {Phone} from '../inputs/Phone'
import {Birthday} from '../inputs/Birthday'
import {Level} from '../inputs/Level'
import {Privacy} from '../inputs/Privacy'
import {RegisterButton} from '../inputs/RegisterButton'
import {ToLoginButton} from '../inputs/ToLoginButton'

/**
 * 
 * The register page
 * 
 */
class RegisterPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '', 
			password: '', 
			passwordAgain: '', 
			email: '', 
			phone: '', 
			birthday: new Date().toISOString().substr(0, 10), 
			level: 'easy', 
			privacy: true,			
			usernameError: false, 
			passwordError: false, 
			passwordAgainError: false, 
			emailError: false, 
			phoneError: false, 
			birthdayError: false, 
			levelError: false
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
	 * This function will be called when the client clicks the register button and will register the client
	 *
	 */
	register = (event) =>{
		event.preventDefault();
		
		// validate all inputs (frontend validation)
		if (this.validate() === 1){
			return;
		}

		// package the registration information into json in order to send to the server
		var register_credentials =  { 
			"reg_username": this.state.username, 
			"reg_password": this.state.password,
			"reg_password_again": this.state.passwordAgain, 
			"reg_email": this.state.email,
			"reg_phone": this.state.phone, 
			"reg_birthday": this.state.birthday, 
			"reg_level": this.state.level,
			"reg_privacy" : "true"
		};

		// send a post request to the server for registering
		var page = this;
		$.ajax({
			method: "POST",
			url: "http://"+ window.location.hostname +":8000/api/register",
			data: JSON.stringify(register_credentials),
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"
		}).done(function(data, text_status, jqXHR){
			// Set user information and automatically log the user in and go to the PlayPage
			page.props.setUserInformation(
				page.state.username, 
				page.state.password, 
				page.state.email, 
				page.state.phone,
				page.state.birthday, 
				page.state.level, 
				true,
				"register"
			);
		}).fail(function(err){
			// the registration fails so highlight all the invalid fields
			if (err.responseJSON !== undefined){ // the server responded normally
				page.showError(err.responseJSON);
			} else{ // the server doesn't send response so highlight everything
				page.showError({
					"reg_username": "is invalid", 
					"reg_password": "is invalid",
					"reg_email": "is invalid",
					"reg_phone": "is invalid",
					"reg_birthday": "is invalid",
					"reg_level": "is invalid",
				}
				);
			}
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
		this.clearError();
		var has_error = 0;

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
		// password must match
		if (this.state.password !== this.state.passwordAgain){
			this.setState({passwordError:true, passwordAgainError:true});
			has_error = 1;
		}
		// email must contain @ and have length <=256
		if (this.state.email.length < 3 || !this.state.email.indexOf('@') === -1 || this.state.email.length > 256 || 
			this.state.email[0] ==='@' || this.state.email[-1] ==='@'){
			this.setState({emailError:true});
			has_error = 1;
		}
		// phone must match the regex
		var regex_phone = new RegExp("[0-9]{3}-[0-9]{3}-[0-9]{4}");
		if (this.state.phone.length !== 12 || !regex_phone.test(this.state.phone)){
			this.setState({phoneError:true});
			has_error = 1;
		}
		// birthday must match the regex
		var regex_date = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}");
		var date_check = new Date(this.state.birthday);
		if (this.state.birthday.length !== 10 || !regex_date.test(this.state.birthday) || isNaN(date_check.getTime())){
			this.setState({birthdayError:true});
			has_error = 1;
		}
		// level must be one of easy, medium, hard
		if (this.state.level !== 'easy' && this.state.level !== 'medium' && this.state.level !== 'hard'){
			this.setState({levelError:true});
			has_error = 1;
		}
		// privacy must be checked
		if (this.state.privacy !== true){
			has_error = 1;
		}
		if (has_error){
			return 1;
		}
		return 0;
	}

	/** 
	 * 
	 * Highlight the input field if any error is presented
	 * 
	 */
	showError = (error_response) =>{
		// display all errors reported by the server
		if (("message" in error_response && error_response["message"] === "Username exists") || "reg_username" in error_response){
			this.setState({usernameError:true});
		}
		if ("reg_password" in error_response){
			this.setState({passwordError:true, passwordAgainError: true});
		}
		if ("reg_email" in error_response){
			this.setState({emailError:true});
		}
		if ("reg_phone" in error_response){
			this.setState({phoneError:true});
		}
		if ("reg_birthday" in error_response){
			this.setState({birthdayError:true});
		}
		if ("reg_level" in error_response){
			this.setState({levelError:true});
		}
	}

	/**
	 * 
	 * Clear the errors that the input fields would display
	 *
	 */
	clearError = () =>{
		this.setState({
			usernameError: false, 
			passwordError: false, 
			passwordAgainError: false, 
			emailError: false, 
			phoneError: false, 
			birthdayError: false, 
			levelError: false
		});
	}

	/**
	 * 
	 * Go to the login page
	 *
	 */
	toLogin = () =>{
		this.props.switchPage("RegisterPage", "LoginPage");
	}


	render(){
		return (
			<div>
				<form onSubmit={e => this.register(e)}>
					<Grid container direction="column" justify="center" alignItems='center' spacing={3}>
						<Grid item>
							<Typography variant="h4">
								f0rt9it32d Register
							</Typography>
						</Grid>

						<Grid item>
							<Username onChange={this.handleChange} error={this.state.usernameError} defaultValue={this.state.username}/>
						</Grid>

						<Grid item>
							<Password onChange={this.handleChange} error={this.state.passwordError}/>
						</Grid>

						<Grid item>
							<PasswordAgain onChange={this.handleChange} error={this.state.passwordAgainError}/>
						</Grid>

						<Grid item>
							<Email onChange={this.handleChange} error={this.state.emailError} defaultValue={this.state.email}/>
						</Grid>

						<Grid item>
							<Phone onChange={this.handleChange} error={this.state.phoneError} defaultValue={this.state.phone}/>
						</Grid>

						<Grid item>
							<Birthday onChange={this.handleChange} error={this.state.birthdayError} defaultValue={this.state.birthday}/>
						</Grid>

						<Grid item>
							<Level onChange={this.handleChange} error={this.state.levelError} defaultValue={this.state.level}/>
						</Grid>

						<Grid item>
							<FormControlLabel
								control={
									<Privacy onChange={this.handleChange}/>
								}
								label="You agree to our privacy policy"
							/>
						</Grid>

						<Grid item>
							<RegisterButton/>
						</Grid>

						<Grid item>
							<ToLoginButton onClick={this.toLogin}/>
						</Grid>
					</Grid>
				</form>
			</div>
		);
	}
}

RegisterPage.defaultProps = {
	switchPage: {},
	setUserInformation: {}
};

export {RegisterPage};