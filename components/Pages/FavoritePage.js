import React from 'react';
import {AsyncStorage, View} from 'react-native';
import PropTypes from 'prop-types';
import {Appbar, Searchbar, withTheme} from 'react-native-paper';

import Gallery from '../Gallery';
import ListView from '../ListView';
import Styles from '../Styles';

class FavoritePage extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        header: (
            <Appbar.Header>
                <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
                <Appbar.Content title="Favorite" />
                <Appbar.Action disabled={navigation.getParam('isSendFavorite')} icon="cached" onPress={() => FavoritePage.syncFavorites(navigation)} />
            </Appbar.Header>
        ),
    });

    static mounted = false;

    constructor(props) {
        super(props);

        this.fetchMore = this._fetchMore.bind(this);
        this.fetchData = this._fetchData.bind(this);
        this.refresh = this._refresh.bind(this);

        this.state = {
            token: '',
            cookie: '',
            query: '',
            isLoading: true,
            isLoadingMore: false,
            isEnd: false,
            data: [],
            _before: ''
        };
    }

    static async syncFavorites(navigation) {
        if (!FavoritePage.mounted || navigation.getParam('isSendFavorite')) return;

        navigation.setParams({'isSendFavorite': true});

        let tokenStr = '';
        let cookieStr = '';
        try {
            const tokenString = await AsyncStorage.getItem('token');
            const token = JSON.parse(tokenString);
            if (token && token.access_token) {
                tokenStr = `${token.token_type} ${token.access_token}`;
            }

            const cookieString = await AsyncStorage.getItem('cookie');
            const cookie = JSON.parse(cookieString);
            cookieStr = `ipb_member_id=${cookie.ipb_member_id};ipb_pass_hash=${cookie.ipb_pass_hash};igneous=${cookie.igneous}`;
        } catch (e) {
            // ignore error
        }

        fetch('https://api.hentaizen.cf/api/v0.9/Favorites/Sync', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Cookie: cookieStr,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': tokenStr
            },
            body: body.join('&'),
        }).then((response) => {
            if (!FavoritePage.mounted) return;

            if (!response.ok) {
                alert('Sync Failed');
            } else {
                alert('Sync in process');
            }

            navigation.setParams({'isSendFavorite': false});
        }).catch(error => {
            alert('Sync Failed');
            console.error(error);
        });
    }

    _fetchData(callback) {
        if (!FavoritePage.mounted) return;

        const params = this.state._before !== ''
            ? `?q=${this.state.query}&before=${this.state._before}`
            : `?q=${this.state.query}`;
        fetch(`https://api.hentaizen.cf/api/v0.9/Favorites${params}`, {
            headers: {
                'Authorization': `${this.state.token}`
            }
        }).then((response) => {
            if (!FavoritePage.mounted) return;

            if (response.ok) {
                response.json().then((data) => {
                    if (!FavoritePage.mounted) return;
                    callback(data);
                })
            } else if (response.status === 401 || response.status === 403) {
                this.props.navigation.navigate('home')
            }
        }).catch(error => console.error(error));
    }

    _fetchMore() {
        if (!FavoritePage.mounted) return;

        if (!this.state.isLoading && !this.state.isLoadingMore) {
            this.setState({isLoadingMore: true}, () => {
                this.fetchData(responseJson => {
                    if (!FavoritePage.mounted) return;

                    this.setState(state => ({
                        isLoadingMore: false,
                        isEnd: responseJson.galleries.length === 0,
                        data: state.data.concat(responseJson.galleries),
                        _before: (responseJson.galleries.length > 0)?responseJson.last:state._before
                    }));
                });
            });
        }
    }

    _refresh = () => {
        if (!FavoritePage.mounted) return;

        this.setState({
            isLoading: true,
            isLoadingMore: false,
            data: [],
            _before: ''
        });

        this.componentDidMount();
    };

    async componentDidMount() {
        FavoritePage.mounted = true;

        try {
            const tokenString = await AsyncStorage.getItem('token');
            const token = JSON.parse(tokenString);
            if (token && token.access_token) {
                this.setState({
                    token: `${token.token_type} ${token.access_token}`,
                });
            }

            const cookieString = await AsyncStorage.getItem('cookie');
            const cookie = JSON.parse(cookieString);
            if (cookie && cookie.igneous) {
                this.setState({
                    cookie: `ipb_member_id=${cookie.ipb_member_id};ipb_pass_hash=${cookie.ipb_pass_hash};igneous=${cookie.igneous}`,
                });
            }
        } catch (e) {
            // ignore error
        }

        this.fetchData(responseJson => {
            this.setState({
                isLoading: false,
                data: responseJson.galleries,
                _before: responseJson.last,
            });
        });
    }

    componentWillUnmount() {
        FavoritePage.mounted = false;
    }

    render() {
        const { colors } = this.props.theme;

        return (
            <View style={{...Styles.container, backgroundColor: colors.background}}>
                <Searchbar
                    style={Styles.search}
                    placeholder="Search in favorites"
                    onChangeText={query => { this.setState({ query: query }); }}
                    returnKeyType='search'
                    onSubmitEditing={this.refresh} />
                <ListView
                    data={this.state.data}
                    renderRow={(item) => (
                        <Gallery cover={item.cover_image_url}
                                 title={item.title}
                                 url={item.url}
                                 cookie={this.state.cookie}
                                 navigation={this.props.navigation}/>
                    )}
                    refresh={() => this.refresh()}
                    fetchMore={() => this.fetchMore()}
                    isLoading={this.state.isLoading}
                    isLoadingMore={this.state.isLoadingMore}
                    isEnd={this.state.isEnd} />
            </View>
        )
    }
}

FavoritePage.propTypes = {
    navigation: PropTypes.object.isRequired,
};

export default withTheme(FavoritePage);
