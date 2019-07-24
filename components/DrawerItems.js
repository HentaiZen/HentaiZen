import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import PropTypes from 'prop-types';
import {Drawer, withTheme, Switch, TouchableRipple, Text, Button, Colors} from 'react-native-paper';

const DrawerItemsData = [
    { name: 'home', label: 'Home', icon: 'home', key: 0 },
    { name: 'featured', label: 'Featured', icon: 'vibration', key: 1 },
    { name: 'search', label: 'Search', icon: 'search', key: 2 },
    { name: 'favorite', label: 'Favorite', icon: 'favorite', key: 3 },
];

class DrawerItems extends React.Component {
    _setDrawerItem = index => {
        this.props.navigation.navigate(DrawerItemsData[index].name)
    };

    render() {
        const { colors } = this.props.theme;

        return (
            <View style={[styles.drawerContent, { backgroundColor: colors.surface }]}>
                <Drawer.Section title="Menu">
                    {DrawerItemsData.map((props, index) => (
                        <Drawer.Item
                            {...props}
                            key={props.key}
                            theme={
                                props.key === 3
                                    ? { colors: { primary: Colors.tealA200 } }
                                    : undefined
                            }
                            onPress={() => this._setDrawerItem(index)} />
                    ))}
                </Drawer.Section>

                <Drawer.Section title="Preferences">
                    <TouchableRipple onPress={this.props.login}>
                        <View style={styles.preference}>
                            <Text>{this.props.username==''?'Login':this.props.username}</Text>
                            <View pointerEvents="none">
                                <Button icon={this.props.username==''?'vpn-key':'exit-to-app'} mode="contained">{this.props.username==''?'Login':'Logout'}</Button>
                            </View>
                        </View>
                    </TouchableRipple>
                    <TouchableRipple onPress={this.props.toggleTheme}>
                        <View style={styles.preference}>
                            <Text>Dark Theme</Text>
                            <View pointerEvents="none">
                                <Switch value={this.props.isDarkTheme} />
                            </View>
                        </View>
                    </TouchableRipple>
                </Drawer.Section>
            </View>
        );
    }
}

DrawerItems.propTypes = {
    login: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
    toggleTheme: PropTypes.func.isRequired,
    isDarkTheme: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 25 : 22,
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});

export default withTheme(DrawerItems);
