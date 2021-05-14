import React from 'react';
import TextField from '@material-ui/core/TextField';

/**
 * 
 * A phone Text Field (that takes phone)
 * 
 * The pattern of the phone must be ***-***-****
 * 
 */
class Phone extends React.Component {
	render () {
		return <TextField
			name="phone"
			label="Phone"
			variant="outlined"
			color="primary"
			onChange={this.props.onChange}
			defaultValue={this.props.defaultValue}
			error={this.props.error}
			helperText={this.props.error ? "The format of phone is invalid." : ""}
			required
			inputProps={{
				pattern: "[0-9]{3}-[0-9]{3}-[0-9]{4}",
				placeholder: "***-***-****",
				title: "***-***-****"
			}}
		/> 
	}
}

Phone.defaultProps = {
	defaultValue: '',
	onChange: {},
	error: false
};

export {Phone};