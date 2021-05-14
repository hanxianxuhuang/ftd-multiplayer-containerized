import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

/**
 * 
 * Notification when some events happen
 * 
 * It will disappear in 8 seconds if the user doesn't click
 * 
 */
class Notification extends React.Component {
	render () {
		var message = "";
		if (this.props.status === 1){
			message = "Login Successfully!";
		} else if (this.props.status === 2){
			message = "Logout Successfully!";
		} else if (this.props.status === 3){
			message = "Register Successfully And Login Automatically!";
		} else if (this.props.status === 4){
			message = "Save Successfully!";
		} else if (this.props.status === 5){
			message = "Delete Successfully!";
		} else if (this.props.status === 6){
			message = "Delete Unsuccessfully!";
		} else if (this.props.status === 7){
			message = "Stats Retrieve Successfully!";
		} else if (this.props.status === 8){
			message = "Stats Retrieve Unsuccessfully!";
		}

		if (this.props.status !== 0){
			return <Snackbar 
				open={true} 
				autoHideDuration={8000} 
				onClose={this.props.closeNotification} 
				message={message}
			/>;
		} else{
			return null;
		}
	}
}

Notification.defaultProps = {
	status: 0,
	closeNotification: {}
};

export {Notification};