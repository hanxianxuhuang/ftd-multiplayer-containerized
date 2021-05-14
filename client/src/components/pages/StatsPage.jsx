import React from 'react';
import {StatsTable} from '../utilities/StatsTable';

/**
 * 
 * The stats page (will also display in the login page)
 * 
 */
class StatsPage extends React.Component {
	render(){
		if (this.props.success){
			// display all scores in three tables
			return (
				<div>
					<br />
					<br />
					<StatsTable rows={this.props.easyScores}/>
					<br />
					<br />
					<StatsTable rows={this.props.mediumScores}/>
					<br />
					<br />
					<StatsTable rows={this.props.hardScores}/>
				</div>
			);
		} else{
			return null;
		}
	}
}

StatsPage.defaultProps = {
	easyScores: [],
	mediumScores: [],
	hardScores: [],
	success: true
};

export {StatsPage};