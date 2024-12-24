import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, Text, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addSong, searchMusic } from '../redux/actions/musicActions';
import { AntDesign } from '@expo/vector-icons';

const HomeScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();
    const searchResults = useSelector((state) => state.music.searchResults);

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            alert('Vui lòng nhập từ khóa để tìm kiếm!');
            return;
        }
        dispatch(searchMusic(searchQuery));
    };

    const handleAddSong = (song) => {
        if (!song.duration || isNaN(song.duration)) {
            alert('Không thể xác định độ dài của bài hát!');
            return;
        }

        if (song.duration > 600) {
            alert(`Bài hát "${song.title}" quá dài! Chỉ cho phép dưới 10 phút.`);
            return;
        }

        const songToAdd = {
            title: song.title,
            videoId: song.videoId,
            thumbnail: song.thumbnail,
            addedBy: 'guest',
        };

        dispatch(addSong(songToAdd));
    };

    const renderSong = ({ item }) => (
        <View style={styles.songContainer}>
            <Image style={styles.thumbnail} source={{ uri: item.thumbnail }} />
            <View style={styles.textContainer}>
                <Text style={styles.songTitle}>{item.title || 'No Title'}</Text>
                <Text style={styles.songArtist}>{item.artist || 'Unknown Artist'}</Text>
            </View>
            <AntDesign
                name="pluscircleo"
                size={24}
                color="#ff6f61"
                onPress={() => handleAddSong(item)}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <AntDesign
                    name="search1"
                    size={20}
                    color="#888"
                    style={styles.iconSearch}
                />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search for songs..."
                    placeholderTextColor="#888"
                    style={styles.input}
                />
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
            </TouchableOpacity>

            <FlatList
                data={searchResults}
                renderItem={renderSong}
                keyExtractor={(item) => item.videoId.toString()}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 30,
        height: 50,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    iconSearch: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        backgroundColor: 'transparent',
        borderWidth: 0,
        color: '#333',
    },
    searchButton: {
        borderRadius: 25,
        backgroundColor: '#ff6f61',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 20,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    list: {
        flex: 1,
    },
    songContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    songTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    songArtist: {
        fontSize: 14,
        color: '#888',
    },
});

export default HomeScreen;
