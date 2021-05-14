import React from 'react';
import {Game} from '../utilities/Game';

/**
 * 
 * The play page
 * 
 */
class PlayPage extends React.Component {
	render(){
		return (
			<Game 
				level={this.props.level}
				username= {this.props.username}
				password= {this.props.password}
			/>
		);
	}
}

PlayPage.defaultProps = {
	level: "easy",
	username: "", 
	password: ""
};

export {PlayPage};