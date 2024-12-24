import React, { useState } from 'react';
import { Layout, Input, Button, Text } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../redux/actions/authActions';
import { StyleSheet, View } from 'react-native';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { user, error } = useSelector((state) => state.auth);

    const handleLogin = () => {
        dispatch(login(username, password));
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <Layout style={styles.container}>
            {!user ? (
                // Giao diện đăng nhập
                <>
                    <Text category="h1" style={styles.title}>
                        Đăng Nhập
                    </Text>
                    <Input
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        style={styles.input}
                    />
                    <Input
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                    />
                    {error && <Text style={styles.error}>{error}</Text>}
                    <Button onPress={handleLogin} style={styles.button}>
                        Đăng Nhập
                    </Button>
                </>
            ) : (
                // Giao diện khi đăng nhập thành công
                <View style={styles.userInfo}>
                    <Text category="h2" style={styles.success}>
                        Xin chào, {user.username}!
                    </Text>
                    <Button onPress={handleLogout} style={styles.logoutButton}>
                        Logout
                    </Button>
                </View>
            )}
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    userInfo: {
        alignItems: 'center',
    },
    success: {
        marginBottom: 20,
        color: 'green',
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: 20,
    },
});

export default LoginScreen;
