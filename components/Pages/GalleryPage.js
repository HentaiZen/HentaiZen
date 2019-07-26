import cheerio from 'cheerio';
import React from 'react';
import {AsyncStorage, Share, View} from 'react-native';
import PropTypes from 'prop-types';
import {Appbar, FAB, Text, withTheme} from 'react-native-paper';
import FitImage from 'react-native-fit-image';

import ListView from '../ListView';
import Styles from '../Styles';

class GalleryPage extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        header: (
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={navigation.getParam('title')} />
                <Appbar.Action icon="share" onPress={() => Share.share({
                    title: navigation.getParam('title'),
                    message: `${navigation.getParam('title')} ${navigation.getParam('url')}`,
                })} />
            </Appbar.Header>
        ),
    });

    static mounted = false;

    constructor(props) {
        super(props);

        this.fetchPages = this._fetchPages.bind(this);
        this.fetchData = this._fetchData.bind(this);
        this.fetchMore = this._fetchMore.bind(this);
        this.refresh = this._refresh.bind(this);
        this.addFavorite = this._addFavorite.bind(this);
        this.removeFavorite = this._removeFavorite.bind(this);
        this.favorite = this._favorite.bind(this);

        const url = props.navigation.getParam('url');

        this.state = {
            token: '',
            cookie: '',
            id: url.split('/')[4],
            key: url.split('/')[5],
            url: url,
            isLoading: true,
            isLoadingMore: false,
            isEnd: false,
            images: [],
            isSendFavorite: false,
            favorite: false,
            _p: 0,
        };
    }

    _fetchPages(pages, callback) {
        if (!GalleryPage.mounted) return;

        if (pages.length === 0) return callback();

        const url = pages.shift();

        fetch(`${url}`, {
            headers: {
                Cookie: this.state.cookie,
            }
        }).then((response) => {
            if (!GalleryPage.mounted) return;
            if (response.ok) {
                response.text().then((html) => {
                    if (!GalleryPage.mounted) return;

                    const $ = cheerio.load(html);

                    const source = $('#i3 img#img').attr('src');
                    if (source) {
                        const images = this.state.images;
                        const id = String(url.split('-').pop()-1);
                        if (!images.some((i) => i.id === id)) {
                            images.push({url: source, id: id});
                            this.setState({images: images});
                        } else {
                            this.setState({isEnd: true});
                        }
                    }

                    setTimeout(() => this.fetchPages(pages, callback), 500);
                })
            } else {
                this.props.navigation.goBack();
            }
        }).catch(error => console.error(error));
    }

    _fetchData(callback) {
        if (!GalleryPage.mounted) return;

        fetch(`${this.state.url}?p=${this.state._p}`, {
            headers: {
                Cookie: this.state.cookie,
            }
        }).then((response) => {
            if (!GalleryPage.mounted) return;
            if (response.ok) {
                response.text().then((html) => {
                    if (!GalleryPage.mounted) return;

                    const $ = cheerio.load(html);

                    if (this.state._p === 0) {
                        if (!this.props.navigation.getParam('title') ||
                            this.props.navigation.getParam('title').indexOf('hentai.org/g/')) {
                            const title = $('h1#gn').text();
                            this.props.navigation.setParams({'title': title});
                        }

                        if($('a#favoritelink').text().indexOf('Add to Favorites') === -1) {
                            this.setState({favorite: true});
                        }
                    }

                    let pages = [];
                    $('#gdt > div a').each(function(i, v){
                        const link = $(v).attr('href');
                        if (link) pages.push(link);
                    });

                    this.fetchPages(pages, callback);
                })
            } else {
                this.props.navigation.goBack();
            }
        }).catch(error => console.error(error));
    }

    _fetchMore() {
        if (!GalleryPage.mounted) return;

        if (!this.state.isLoading && !this.state.isLoadingMore) {
            this.setState(state => ({
                isLoadingMore: true,
                _p: state._p + 1,
            }), () => {
                this.fetchData(() => {
                    if (!GalleryPage.mounted) return;

                    this.setState({
                        isLoadingMore: false,
                    });
                });
            });
        }
    }

    _refresh = () => {
        if (!GalleryPage.mounted) return;

        this.setState({
            isLoading: true,
            isLoadingMore: false,
            isEnd: false,
            images: [],
            _p: 0,
        });

        this.componentDidMount();
    };

    _addFavorite = () => {
        if (!GalleryPage.mounted) return;

        if (!GalleryPage.mounted) return;
            fetch('https://api.hentaizen.cf/api/v0.9/Favorites/Add', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Cookie: this.state.cookie,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': this.state.token
                },
                body: `galleryId=${this.state.id}`,
            }).then(() => this.setState({isSendFavorite: false, favorite: true}));
    };

    _removeFavorite = () => {
        if (!GalleryPage.mounted) return;

        fetch('https://api.hentaizen.cf/api/v0.9/Favorites/Remove', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Cookie: this.state.cookie,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': this.state.token
            },
            body: `galleryId=${this.state.id}`,
        }).then(() => this.setState({isSendFavorite: false, favorite: false}));
    };

    _favorite = () => {
        if (!GalleryPage.mounted || this.state.isSendFavorite) return;
        if (!this.state.token || !this.state.cookie) return alert('Not signed in yet');

        this.setState({isSendFavorite: true}, () => {
            if (this.state.favorite) {
                this.removeFavorite();
            } else {
                this.addFavorite();
            }
        });
    };

    async componentDidMount() {
        GalleryPage.mounted = true;

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

        this.fetchData(() => {
            this.setState({
                isLoading: false,
            });
        });
    }

    componentWillUnmount() {
        GalleryPage.mounted = false;
    }

    render() {
        const { colors } = this.props.theme;

        return (
            <View style={{...Styles.container, backgroundColor: colors.background}}>
                <ListView
                    data={this.state.images}
                    renderRow={(item) => (
                        <View>
                            <Text>{item.id - 0 + 1}</Text>
                            <FitImage source={{uri: item.url}} />
                        </View>
                    )}
                    refresh={() => this.refresh()}
                    fetchMore={() => this.fetchMore()}
                    isLoading={this.state.isLoading}
                    isLoadingMore={this.state.isLoadingMore}
                    isEnd={this.state.isEnd} />
                <FAB
                    disabled={this.state.isSendFavorite}
                    style={Styles.fab}
                    icon={this.state.favorite?'favorite':'favorite-border'}
                    onPress={this.favorite} />
            </View>
        );
    }
}

GalleryPage.propTypes = {
    navigation: PropTypes.object.isRequired,
};

export default withTheme(GalleryPage);
