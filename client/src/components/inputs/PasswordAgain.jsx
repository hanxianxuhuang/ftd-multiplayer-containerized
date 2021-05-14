import React from 'react';
import TextField from '@material-ui/core/TextField';

/**
 * 
 * A password Text Field (that takes password)
 * 
 * The length must be at least 3
 * 
 */
class PasswordAgain extends React.Component {
	render () {
		return <TextField
			name="passwordAgain"
			label="Password Again"
			type="password"
			variant="outlined"
			color="primary"
			onChange={this.props.onChange}
			required={this.props.required}
			error={this.props.error}
			helperText={this.props.error ? "The password is invalid." : ""}
			inputProps={{
				minLength: 3
			}}
		/> 
	}
}

PasswordAgain.defaultProps = {
	onChange: {},
	error: false,
	required: true
};

export {PasswordAgain};