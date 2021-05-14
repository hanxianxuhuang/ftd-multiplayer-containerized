import React from 'react';
import TextField from '@material-ui/core/TextField';

/**
 * 
 * An email Text Field (that takes email)
 * 
 */
class Email extends React.Component {
	render () {
		return <TextField
			name="email"
			label="Email"
			type="email"
			variant="outlined"
			color="primary"
			onChange={this.props.onChange}
			defaultValue={this.props.defaultValue}
			error={this.props.error}
			helperText={this.props.error ? "The format of email is invalid." : ""}
			required
			inputProps={{
				maxLength: 256
			}}
		/>  
	}
}

Email.defaultProps = {
	defaultValue: '',
	onChange: {},
	error: false
};

export {Email};