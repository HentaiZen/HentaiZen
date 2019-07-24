import {DarkTheme} from 'react-native-paper';

const MyDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: '#546e7a',
    },
};

export default MyDarkTheme;