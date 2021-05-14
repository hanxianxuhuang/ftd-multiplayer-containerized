import React from 'react';
import Button from '@material-ui/core/Button';

/**
 * 
 * A button that would take the user to the register page
 * 
 */
const ToRegisterButton = ({onClick}) => {
	return <Button variant="contained" color="secondary" onClick={onClick}>
		Register An Account
	</Button>
}

export {ToRegisterButton};