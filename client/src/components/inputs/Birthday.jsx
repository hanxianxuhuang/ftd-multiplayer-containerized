import React from 'react';
import TextField from '@material-ui/core/TextField';

/**
 * 
 * A birthday Text Field (that takes date)
 * 
 */
class Birthday extends React.Component {
	render () {
		return <TextField
			name="birthday"
			label="Birthday"
			type="date"
			variant="outlined"
			color="primary"
			defaultValue={this.props.defaultValue}
			onChange={this.props.onChange}
			error={this.props.error}
			helperText={this.props.error ? "The format of birthday is invalid." : ""}
			required
		/>
	}
}

Birthday.defaultProps = {
	defaultValue: '',
	onChange: {},
	error: false
};

export {Birthday};