import React from 'react';
import TextField from '@material-ui/core/TextField';

/**
 * 
 * A username Text Field
 * 
 * The length must be less than or equal to 20
 * 
 */
class Username extends React.Component {
	render () {
		return <TextField 
			autoFocus={true} 
			name="username"
			label="Username"
			variant="outlined"
			onChange={this.props.onChange}
			defaultValue={this.props.defaultValue}
			error={this.props.error}
			helperText={this.props.error ? "The username is invalid." : ""}
			color="primary"
			required={this.props.required}
			inputProps={{
				maxLength: 20
			}}
			InputProps={{
				readOnly: this.props.readOnly
			}}
		/>; 
	}
}

Username.defaultProps = {
	defaultValue: '',
	onChange: {},
	error: false,
	readOnly: false,
	required: true
};

export {Username};