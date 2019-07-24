import React from 'react';
import {ActivityIndicator, FlatList, StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import {Headline} from 'react-native-paper';

export default class ListView extends React.Component {
    render() {
        return (
            <FlatList
                data={this.props.data}
                keyExtractor={(item) => String(item.id)}
                renderItem={({item}) => this.props.renderRow(item)}
                refreshing={this.props.isLoading}
                onRefresh={() => this.props.refresh()}
                onEndReached={() => !this.props.isEnd && this.props.fetchMore()}
                ListEmptyComponent={() => {
                    return (
                        !this.props.isLoading &&
                        <View style={styles.emptyContainer}>
                            <Headline style={styles.emptyText}>Empty</Headline>
                        </View>
                    );
                }}
                ListFooterComponent={() => {
                    return (
                        !this.props.isEnd && this.props.isLoadingMore &&
                        <View style={{ flex: 1 }}>
                            <ActivityIndicator size="small" />
                        </View>
                    );
                }} />
        );
    }
}

ListView.propTypes = {
    data: PropTypes.array.isRequired,
    renderRow: PropTypes.func.isRequired,
    refresh: PropTypes.func.isRequired,
    fetchMore: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isLoadingMore: PropTypes.bool.isRequired,
    isEnd: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
    },
    emptyText: {
        color: 'gray',
    },
});