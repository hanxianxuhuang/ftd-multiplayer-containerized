import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';

/**
 * 
 * A privacy Checkbox 
 * 
 * The checkbox must be checked in order to proceed
 * 
 */
class Privacy extends React.Component {
	render () {
		return <Checkbox
			name="privacy"
			variant="outlined"
			color="primary"
			onChange={this.props.onChange}
			defaultChecked={true}
			required
		/> 
	}
}

Privacy.defaultProps = {
	onChange: {}
};

export {Privacy};