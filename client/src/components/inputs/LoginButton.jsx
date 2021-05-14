import React from 'react';
import Button from '@material-ui/core/Button';

/**
 * 
 * A button that would log the user in
 * 
 */
const LoginButton = () => {
	return <Button type="submit" variant="contained" color="primary">
		Login
	</Button>
}

export {LoginButton};