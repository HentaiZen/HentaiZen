import React from 'react';
import PropTypes from 'prop-types';
import {Card, Title, TouchableRipple} from 'react-native-paper';

export default class Gallery extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			url: props.url,
			cover: props.cover,
		};
	}

	componentDidMount() {
		//
	}

	render() {
		return (
			<TouchableRipple
				onPress={() => this.props.navigation.navigate('gallery', {
					title: this.props.title,
					url: this.state.url
				})}
				rippleColor="rgba(0, 0, 0, .32)">
				<Card style={{marginBottom: 8}}>
					<Card.Content>
						<Title>{this.props.title}</Title>
					</Card.Content>
					<Card.Cover source={{
						uri: this.state.cover,
						headers: {
							Cookie: this.props.cookie,
						}
					}} style={{height: 380}} />
				</Card>
			</TouchableRipple>
		)
	};
};

Gallery.propTypes = {
	cover: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	cookie: PropTypes.string.isRequired,
	navigation: PropTypes.object.isRequired,
};
