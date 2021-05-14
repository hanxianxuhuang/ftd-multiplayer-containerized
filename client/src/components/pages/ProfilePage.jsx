import React from 'react';
import Grid from '@material-ui/core/Grid';
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
import {SaveButton} from '../inputs/SaveButton'
import {DeleteButton} from '../inputs/DeleteButton'

/**
 * 
 * The profile page
 * 
 */
class ProfilePage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: this.props.username, 
			password: '', 
			passwordAgain: '', 
			email: this.props.email, 
			phone: this.props.phone, 
			birthday: this.props.birthday, 
			level: this.props.level, 
			privacy: this.props.privacy,
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
		const value = target.type === 'checkbox' ? target.checked : target.value; // for checkbox, display true/false
		const name = target.name;
		this.setState({
			[name]: value
		});
	}

	/**
	 * 
	 * This function will be called when the client clicks the save button and will modify the client's profile
	 *
	 */
	save = (event) =>{
		// prevent redirection
		event.preventDefault();

		// validate all inputs (frontend validation)
		if (this.validate() === 1){
			return;
		}

		// package the updated information into json in order to send to the server
		var save_credentials =  { 
			"profile_username": this.state.username, 
			"profile_password": this.state.password,
			"profile_password_again": this.state.passwordAgain, 
			"profile_email": this.state.email,
			"profile_phone": this.state.phone, 
			"profile_birthday": this.state.birthday, 
			"profile_level": this.state.level,
			"profile_privacy" : "true"
		};

		// send a put request to the server for modifying the user information
		var page = this;
		$.ajax({
			method: "PUT",
			url: "http://"+ window.location.hostname +":8000/api/auth/modify",
			data: JSON.stringify(save_credentials),
			headers: { "Authorization": "Basic " + btoa(this.props.username + ":" + this.props.password) },
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"
		}).done(function(data, text_status, jqXHR){
			// the profile modification request succeeded
			// update the user information
			page.props.setUserInformation(
				page.state.username, 
				page.state.password, 
				page.state.email, 
				page.state.phone,
				page.state.birthday, 
				page.state.level, 
				true,
				"profile"
			);
		}).fail(function(err){
			// the modification fails so highlight all the invalid fields
			if (err.responseJSON !== undefined){
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
		// password must match and have length >= 3 if not empty
		if ((this.state.password.length !== 0 || this.state.passwordAgain.length !== 0) 
			&& (this.state.password.length < 3 || this.state.passwordAgain.length < 3 || this.state.password !== this.state.passwordAgain)){
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
		if ("profile_username" in error_response){
			this.setState({usernameError:true});
		}
		if ("profile_password" in error_response){
			this.setState({passwordError:true, passwordAgainError: true});
		}
		if ("profile_email" in error_response){
			this.setState({emailError:true});
		}
		if ("profile_phone" in error_response){
			this.setState({phoneError:true});
		}
		if ("profile_birthday" in error_response){
			this.setState({birthdayError:true});
		}
		if ("profile_level" in error_response){
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
	 * This function will be called when client clicks the delete button
	 * A request would be sent to the server and the user would be logout no matter the request succeeds or not
	 *
	 */
	delete = () =>{
		// send a delete request to the server for deleting the profile
		var page = this;
		$.ajax({
			method: "DELETE",
			url: "http://"+ window.location.hostname +":8000/api/auth/delete",
			data: JSON.stringify({}),
			headers: { "Authorization": "Basic " + btoa(this.props.username + ":" + this.props.password) },
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"
		}).done(function(data, text_status, jqXHR){
			// profile deletion request succeed so log the user out
			page.props.switchPage("DeleteSuccessfully", "LoginPage");
		}).fail(function(err){
			// the profile deletion fails but still log the user out
			page.props.switchPage("DeleteUnsuccessfully", "LoginPage");
		});
	}

	render(){
		return (
			<div>
				<form onSubmit={e => this.save(e)}>
					<Grid container direction="column" justify="center" alignItems='center' spacing={3}>
						<Grid item />

						<Grid item>
							<Username onChange={this.handleChange} error={this.state.usernameError} readOnly={true} required={false} defaultValue={this.state.username}/>
						</Grid>

						<Grid item>
							<Password onChange={this.handleChange} error={this.state.passwordError} required={false}/>
						</Grid>

						<Grid item>
							<PasswordAgain onChange={this.handleChange} error={this.state.passwordAgainError} required={false}/>
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
									<Privacy onChange={this.handleChange} />
								}
								label="You agree to our privacy policy"
							/>
						</Grid>

						<Grid item>
							<SaveButton />
						</Grid>

						<Grid item>
							<DeleteButton onClick={this.delete} />
						</Grid>
					</Grid>
				</form>
			</div>
		);
	}
}

ProfilePage.defaultProps = {
	switchPage: {},
	setUserInformation: {},
	username: "", 
	password: "",
	email: "",
	phone: "",
	birthday: new Date().toISOString().substr(0, 10),
	level: "easy",
	privacy: true
};

export {ProfilePage};