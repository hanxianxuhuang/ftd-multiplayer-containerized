import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

/**
 * 
 * Table used for displaying scores
 * 
 */
class StatsTable extends React.Component {
	render(){
		return (
			<div>
				<TableContainer>
					<Table aria-label="simple table">
						<colgroup>
							<col style={{width:'30%'}}/>
							<col style={{width:'10%'}}/>
							<col style={{width:'40%'}}/>
							<col style={{width:'20%'}}/>
						</colgroup>
						<TableHead>
							<TableRow>
								<TableCell align="center">Level</TableCell>
								<TableCell align="center">Rank</TableCell>
								<TableCell align="center">Username</TableCell>
								<TableCell align="center">Score</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{this.props.rows.map((row) => (
								<TableRow key={row.rank}>
									<TableCell align="center" component="th" scope="row">
										{row.level}
									</TableCell>
									<TableCell align="center">{row.rank}</TableCell>
									<TableCell align="center">{row.username}</TableCell>
									<TableCell align="center">{row.score}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		);
	}
}

StatsTable.defaultProps = {
	rows: []
};

export {StatsTable};