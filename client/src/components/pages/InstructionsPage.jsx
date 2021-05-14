import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

/**
 * 
 * The instructions page
 * 
 */
class InstructionsPage extends React.Component {
	render(){
		return (
			<div>
				<Grid container direction="column" justify="center" alignItems='center' spacing={1}>
					<Grid item>
						<Typography variant="h3">
							Objects
						</Typography>
					</Grid>

					<Grid item />

					<Grid item>
						<Typography variant="h6">
							Purple Square: Obstacle
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Yellow Square: Box
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Green Square: This Player (You)
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Blue Square: Other Players
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Red Square: Enemy
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Green Text: Health (Top Left)
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Pink Text: Player ID (Top Right)
						</Typography>
					</Grid>

					<Grid item></Grid> <Grid item></Grid> <Grid item></Grid>
				</Grid>

				<Grid container direction="column" justify="center" alignItems='center' spacing={1}>
					<Grid item>
						<Typography variant="h3">
							Operations
						</Typography>
					</Grid>

					<Grid item />

					<Grid item>
						<Typography variant="h6">
							Restart with <i>t</i>
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Replay the game with <i>r</i> after the game ends
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Move with <i>wasd</i>
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Boxes restore bullets and health, Move next to them and press <i>e</i>
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Aim with your mouse
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							Mouse click fires
						</Typography>
					</Grid>

					<Grid item></Grid> <Grid item></Grid> <Grid item></Grid>
				</Grid>

				<Grid container direction="column" justify="center" alignItems='center' spacing={1}>
					<Grid item>
						<Typography variant="h3">
							Features
						</Typography>
					</Grid>

					<Grid item />

					<Grid item>
						<Typography variant="h6">
							No friendly fire
						</Typography>
					</Grid>

					<Grid item></Grid> <Grid item></Grid>

					<Grid item>
						<Typography variant="h6">
							The speed of bullets is affected by the location of the mouse 
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							(further--{'>'}faster && closer--{'>'}slower)
						</Typography>
					</Grid>

					<Grid item></Grid> <Grid item></Grid>

					<Grid item>
						<Typography variant="h6">
							The damage of bullets is affected by how many obstacles are around
						</Typography>
					</Grid>

					<Grid item>
						<Typography variant="h6">
							(1 obstacle--{'>'}&times;2 && 2 obstacles--{'>'}&times;3 && 3 obstacles--{'>'}&times;4)
						</Typography>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export {InstructionsPage};