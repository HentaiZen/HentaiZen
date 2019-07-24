import React from 'react';
import {AsyncStorage, View} from 'react-native';
import PropTypes from 'prop-types';
import {Appbar, Searchbar, withTheme} from 'react-native-paper';

import Gallery from '../Gallery';
import ListView from '../ListView';
import Styles from '../Styles';

class SearchPage extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        header: () => {
            if (navigation.getParam('isPush'))
                return (
                    <Appbar.Header>
                        <Appbar.BackAction onPress={() => navigation.goBack()} />
                        <Appbar.Content title="Search" />
                    </Appbar.Header>
                );

            return (
                <Appbar.Header>
                    <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
                    <Appbar.Content title="Search" />
                </Appbar.Header>
            );
        },
    });

    static mounted = false;

    constructor(props) {
        super(props);

        this.fetchMore = this._fetchMore.bind(this);
        this.fetchData = this._fetchData.bind(this);
        this.refresh = this._refresh.bind(this);
        this.search = this._search.bind(this);

        this.state = {
            cookie: '',
            query: '',
            isLoading: false,
            isLoadingMore: false,
            isEnd: false,
            data: [],
            _before: ''
        };
    }

    _fetchData(callback) {
        if (!SearchPage.mounted) return;

        const params = this.state._before !== ''
            ? `?q=${this.state.query}&before=${this.state._before}`
            : `?q=${this.state.query}`;
        fetch(`https://api.hentaizen.cf/api/v0.9/Galleries${params}`)
            .then((response) => {
                if (!SearchPage.mounted) return;

                if (response.ok) {
                    response.json().then(function(json) {
                        if (!SearchPage.mounted) return;

                        callback(json);
                    });
                }
            }).catch(error => console.error(error));
    }

    _fetchMore() {
        if (!SearchPage.mounted) return;

        if (!this.state.isLoading && !this.state.isLoadingMore) {
            this.setState({isLoadingMore: true}, () => {
                this.fetchData(responseJson => {
                    if (!SearchPage.mounted) return;

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
        if (!SearchPage.mounted) return;

        this.setState({
            isLoading: true,
            isLoadingMore: false,
            data: [],
            _before: ''
        });

        this.fetchData(responseJson => {
            if (!SearchPage.mounted) return;

            this.setState({
                isLoading: false,
                data: responseJson.galleries,
                _before: responseJson.last,
            });
        });
    };

    _search = () => {
        if (!SearchPage.mounted) return;

        if (this.state.query.indexOf('hentai.org/g/') === -1) {
            this.refresh();
        } else {
            this.props.navigation.navigate('gallery', {
                url: this.state.query
            })
        }
    };

    async componentDidMount() {
        SearchPage.mounted = true;

        try {
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
    }

    componentWillUnmount() {
        SearchPage.mounted = false;
    }

    render() {
        const { colors } = this.props.theme;

        return (
            <View style={{...Styles.container, backgroundColor: colors.background}}>
                <Searchbar
                    style={Styles.search}
                    placeholder="Search or paste an url"
                    onChangeText={query => { this.setState({ query: query }); }}
                    returnKeyType='search'
                    autoFocus={true}
                    onSubmitEditing={this.search} />
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
        );
    }
}

SearchPage.propTypes = {
    navigation: PropTypes.object.isRequired,
};

export default withTheme(SearchPage);
