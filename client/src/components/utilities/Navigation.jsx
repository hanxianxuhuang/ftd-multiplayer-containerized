import React from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import HelpIcon from '@material-ui/icons/Help';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

/**
 * 
 * Navigation bar on the top of the page
 * 
 * User can go to a different page by click the navigation bar
 * 
 */
class Navigation extends React.Component {
	render () {
		return <BottomNavigation
			value={this.props.currentPage}
			showLabels={true}
			onChange={(event, newPage) => {
				this.props.switchPage(this.props.currentPage, newPage);
			}}
			>
			<BottomNavigationAction label="Play" value="PlayPage" icon={<SportsEsportsIcon />} />
			<BottomNavigationAction label="Instructions" value="InstructionsPage" icon={<HelpIcon />} />
			<BottomNavigationAction label="Stats" value="StatsPage" icon={<EqualizerIcon />} />
			<BottomNavigationAction label="Profile" value="ProfilePage" icon={<AssignmentIndIcon />} />
			<BottomNavigationAction label="Logout" value="Logout" icon={<ExitToAppIcon />} />
		</BottomNavigation>
	}
}

Navigation.defaultProps = {
	switchPage: {},
	currentPage: "PlayPage"
};

export {Navigation};