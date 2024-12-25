import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, ImageBackground, Animated, FlatList, PanResponder, Text, Button, Platform, SafeAreaView, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getQueue, removeSong } from '../redux/actions/musicActions';
import io from 'socket.io-client';
import YouTubeIframe from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

const QueueScreen = () => {
    const dispatch = useDispatch();
    const queue = useSelector((state) => state.music.queue);
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [animation, setAnimation] = useState(new Animated.Value(200));
    const socket = io('ws://192.168.1.4:3000');
    const user = useSelector((state) => state.auth?.user);

    useEffect(() => {
        socket.on('songAdded', (newSong) => {
            console.log('Received songAdded event:', newSong);
            dispatch(getQueue());
        });

        socket.on('songDeleted', (deletedSong) => {
            console.log('Received songDeleted event:', deletedSong);
            dispatch(getQueue());
        });

        dispatch(getQueue());

        return () => {
            socket.off('songAdded');
            socket.off('songDeleted');
            socket.disconnect();
        };
    }, [dispatch]);

    const playSong = (videoId) => {
        if (!user) return;
        setCurrentVideoId(videoId);
        setIsPlaying(true);
    };

    const stopSong = () => {
        if (!user) return;
        setIsPlaying(false);
    };

    const handleVideoEnd = () => {
        if (currentVideoId) {
            const currentIndex = queue.findIndex((song) => song.videoId === currentVideoId);
            const nextSong = currentIndex + 1 < queue.length ? queue[currentIndex + 1] : null;

            if (nextSong) {
                setCurrentVideoId(nextSong.videoId);
                setIsPlaying(true);
            } else {
                setIsPlaying(false);
                setCurrentVideoId(null);
            }

            dispatch(removeSong(currentVideoId));
        }
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (e, gestureState) => {
            if (gestureState.dy < 0) {
                Animated.spring(animation, {
                    toValue: Math.max(gestureState.dy, -200),
                    useNativeDriver: false,
                }).start();
            }
        },
        onPanResponderRelease: (e, gestureState) => {
            if (gestureState.dy < -100) {
                Animated.spring(animation, {
                    toValue: 0,
                    useNativeDriver: false,
                }).start();
            } else {
                Animated.spring(animation, {
                    toValue: 200,
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    const renderSong = ({ item }) => (
        <View style={styles.songContainer}>
            <View style={styles.thumbnailContainer}>
                <ImageBackground
                    source={{ uri: item.thumbnail }}
                    style={styles.thumbnail}
                    imageStyle={{ borderRadius: 8 }}
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.songTitle}>{item.title || 'No Title'}</Text>
                {user ? (
                    <View style={styles.controls}>
                        <Button
                            title={currentVideoId === item.videoId && isPlaying ? 'Đang phát' : 'Phát'}
                            onPress={() => playSong(item.videoId)}
                            color="blue"
                        />
                        <Button
                            title="Xóa"
                            onPress={() => dispatch(removeSong(item.videoId))}
                            color="red"
                        />
                    </View>
                ) : (
                    currentVideoId === item.videoId && (
                        <Text style={styles.viewOnlyText}>Đang phát</Text>
                    )
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerText}>Danh sách chờ</Text>

            {queue.length === 0 ? (
                <Text style={styles.noSongsText}>Không có bài hát nào trong danh sách chờ</Text>
            ) : (
                <FlatList
                    data={queue}
                    renderItem={renderSong}
                    keyExtractor={(item) => item.videoId.toString()}
                    style={{ marginBottom: 220 }}
                />
            )}

            {isPlaying && currentVideoId && (
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.playerContainer, { transform: [{ translateY: animation }] }]}
                >
                    <YouTubeIframe
                        videoId={currentVideoId}
                        height={200}
                        play={isPlaying}
                        onChangeState={(event) => {
                            if (event === 'ended') {
                                handleVideoEnd();
                            }
                        }}
                    />
                    <Button title="Dừng" onPress={stopSong} color="red" />
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 30, // Thêm khoảng cách cho Android và iOS
        backgroundColor: '#FFFFFF',
    },
    headerText: {
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
    },
    noSongsText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 16,
        fontStyle: 'italic',
    },
    songContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 12,
        padding: 10,
        elevation: 3,
        backgroundColor: '#FFF',
    },
    thumbnailContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
    },
    thumbnail: {
        width: 60,
        height: 60,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    songTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    playerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        padding: 10,
    },
    viewOnlyText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default QueueScreen;
