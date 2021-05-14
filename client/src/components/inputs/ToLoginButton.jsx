import React from 'react';
import Button from '@material-ui/core/Button';

/**
 * 
 * A button that would take the user to the login page
 * 
 */
const ToLoginButton = ({onClick}) => {
	return <Button variant="contained" color="secondary" onClick={onClick}>
		Return To Login
	</Button>
}

export {ToLoginButton};