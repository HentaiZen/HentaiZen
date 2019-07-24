import React from 'react';
import {AsyncStorage, StatusBar} from 'react-native';
import {Button, Card, DefaultTheme, Modal, Paragraph, Portal, Provider as PaperProvider, Title} from 'react-native-paper';
import {createDrawerNavigator, createStackNavigator} from 'react-navigation';

import MyDarkTheme from './components/MyDarkTheme';
import DrawerItems from './components/DrawerItems';
import Login from './components/Login';

import GalleryPage from './components/Pages/GalleryPage';
import FavoritePage from './components/Pages/FavoritePage';
import FeaturedPage from './components/Pages/FeaturedPage';
import HomePage from './components/Pages/HomePage';
import SearchPage from './components/Pages/SearchPage';

import PreferencesContext from './components/PreferencesContext';

const Nav = createDrawerNavigator({
    Home: {
        screen: createStackNavigator({
            home: { screen: HomePage },
            featured: { screen: FeaturedPage },
            search: { screen: SearchPage },
            favorite: { screen: FavoritePage },
            gallery: {screen: GalleryPage},
        })
    }
}, {
    contentComponent: (props) => (
        <PreferencesContext.Consumer>
        {preferences => (
            <DrawerItems
                login={preferences.login}
                username={preferences.username}
                toggleTheme={preferences.theme}
                isDarkTheme={preferences.isDarkTheme}
                navigation={props.navigation} />
        )}
        </PreferencesContext.Consumer>
    )
});

export default class App extends React.Component {
    state = {
        username: '',
        theme: DefaultTheme,
        showTerms: true,
        termsVersion: '',
        termsContent: '',
    };

    async componentDidMount() {
        StatusBar.setBarStyle('light-content');

        try {
            const termsRead = await AsyncStorage.getItem('terms');
            fetch('https://api.hentaizen.cf/terms/')
                .then((response)=> {
                    if (response.ok) {
                        response.json().then((terms) => {
                            if (termsRead !== terms.version) {
                                this._showTerms(terms.version, terms.content);
                            } else {
                                this._hideTerms();
                            }
                        });
                    }
                })
                .catch(error => console.error(error));

            const tokenString = await AsyncStorage.getItem('token');
            const token = JSON.parse(tokenString);

            const cookieString = await AsyncStorage.getItem('cookie');
            const cookie = JSON.parse(cookieString);

            if (token && token.access_token && cookie && cookie.igneous) {
                this.setState({
                    username: token.username,
                });
            }

            const prefString = await AsyncStorage.getItem('preferences');
            const preferences = JSON.parse(prefString);
            if (preferences) {
                this.setState({
                    theme: preferences.theme === 'dark' ? MyDarkTheme : DefaultTheme
                });
            }
        } catch (e) {
            // ignore error
        }
    }

    _showTerms = (version, content) => this.setState({
        showTerms: true,
        termsVersion: version,
        termsContent: content,
    });
    _hideTerms = () => {
        AsyncStorage.setItem('terms', this.state.termsVersion);
        this.setState({ showTerms: false });
    };

    _savePreferences = async () => {
        try {
            AsyncStorage.setItem(
                'preferences',
                JSON.stringify({
                    theme: this.state.theme === MyDarkTheme ? 'dark' : 'light'
                })
            );
        } catch (e) {
            // ignore error
        }
    };

    _toggleTheme = () => this.setState(state => ({
        theme: state.theme === MyDarkTheme ? DefaultTheme : MyDarkTheme,
    }), this._savePreferences);

    _doLoginLogout = () => {
        let username = this.state.username;
        if (this.state.username !== '') {
            username = '';

            AsyncStorage.setItem('cookie', '{}');
            AsyncStorage.setItem('token', '{}');
        } else {
            this.login._showModal();
            // username = 'Test';
        }

        this.setState({
            username: username,
        });
    };

    _login = (username, password) => {
        const that = this;
        fetch('https://api.hentaizen.cf/Auth/Token', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${username}&password=${password}`,
        }).then((response)=> {
            if (response.ok) {
                response.json().then((token) => {
                    fetch('https://api.hentaizen.cf/Auth/Cookie', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `${token.token_type} ${token.access_token}`
                        },
                        body: `username=${username}&password=${password}`,
                    }).then((response)=> {
                        if (response.ok) {
                            response.json().then(function(cookie) {
                                AsyncStorage.setItem('token', JSON.stringify(token));
                                AsyncStorage.setItem('cookie', JSON.stringify(cookie));
                                that.setState({username: token.username});
                                that.login._hideModal();
                            });
                        } else {
                            alert('Login Failed');
                        }
                    }).catch(error => {
                        alert('Login Failed');
                        console.error(error);
                    });
                });
            } else {
                alert('Login Failed');
            }
        }).catch(error => {
            alert('Login Failed');
            console.error(error);
        });
    };

    render() {
        return (
            <PaperProvider theme={this.state.theme}>
                <PreferencesContext.Provider
                    value={{
                        login: this._doLoginLogout,
                        username: this.state.username,
                        theme: this._toggleTheme,
                        isDarkTheme: this.state.theme === MyDarkTheme,
                    }} >
                    <Nav/>
                    <Login login={this._login} onRef={ref => (this.login = ref)} />
                </PreferencesContext.Provider>

                <Portal>
                    <Modal dismissable={false} visible={this.state.showTerms}>
                        <Card style={{margin: 8}}>
                            <Card.Content>
                                <Title style={{textAlign: 'center'}}>Terms Updated</Title>
                                <Paragraph>{this.state.termsContent}</Paragraph>
                            </Card.Content>
                            <Card.Actions>
                                <Button onPress={() => this._hideTerms()}>I agree to terms</Button>
                            </Card.Actions>
                        </Card>
                    </Modal>
                </Portal>
            </PaperProvider>
        );
    }
}
