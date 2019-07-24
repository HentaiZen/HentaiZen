import {Dimensions, Platform, StyleSheet} from "react-native";

const d = Dimensions.get('window');

function isIphoneX() {
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        ((d.height === 812 || d.width === 812) || (d.height === 896 || d.width === 896))
    );
}

const ScreenHeight = d.height - (isIphoneX() ? 100 : 64);

const styles = StyleSheet.create({
    container: {
        padding: 8,
        height: ScreenHeight,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
    },
    emptyText: {
        color: 'gray',
    },
    fab: {
        position: 'absolute',
        margin: 26,
        right: 0,
        bottom: 0,
    },
    search: {
        marginBottom: 8,
        marginTop: 8,
    },
});

export default styles;
