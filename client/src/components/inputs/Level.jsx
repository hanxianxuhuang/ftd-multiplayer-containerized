import React from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

/**
 * 
 * A level select box 
 * 
 * Options are easy, middle and hard
 * 
 */
class Level extends React.Component {
 	render () {
		return <TextField
			name="level"
			select
			label="Level"
			defaultValue={this.props.defaultValue}
			value={this.props.defaultValue}
			onChange={this.props.onChange}
			error={this.props.error}
			helperText={this.props.error ? "Level must be one of Easy, Medium or Hard." : ""}
			required
			>
			{[{value: 'easy',label: 'Easy',},{value: 'medium',label: 'Medium',},{value: 'hard',label: 'Hard',}].map((option) => (
				<MenuItem key={option.value} value={option.value}>
					{option.label}
				</MenuItem>
			))}
		</TextField>
	}
}

Level.defaultProps = {
	onChange: {},
	defaultValue: 'easy',
	error: false
};

export {Level};