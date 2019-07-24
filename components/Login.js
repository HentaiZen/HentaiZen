import React from 'react';
import {SafeAreaView} from 'react-native';
import PropTypes from 'prop-types';
import {Modal, Portal, Button, Card, TextInput} from 'react-native-paper';

export default class Login extends React.Component {
    state = {
        visible: false,
        username: '',
        password: '',
    };

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    _showModal = () => this.setState({ visible: true });
    _hideModal = () => this.setState({ visible: false });

    render() {
        const { visible } = this.state;
        return (
            <Portal>
                <Modal dismissable={false} visible={visible}>
                    <SafeAreaView>
                        <Card style={{margin: 8}}>
                            <Card.Content>
                                <TextInput
                                    label='Username'
                                    value={this.state.username}
                                    onChangeText={username => this.setState({ username })} />
                                <TextInput
                                    label='Password'
                                    secureTextEntry
                                    value={this.state.password}
                                    onChangeText={password => this.setState({ password })} />
                            </Card.Content>
                            <Card.Actions>
                                <Button onPress={() => this._hideModal()}>Cancel</Button>
                                <Button onPress={() => this.props.login(this.state.username, this.state.password)}>Login</Button>
                            </Card.Actions>
                        </Card>
                    </SafeAreaView>
                </Modal>
            </Portal>
        );
    }
}

Login.propTypes = {
    login: PropTypes.func.isRequired,
    onRef: PropTypes.func.isRequired,
};
