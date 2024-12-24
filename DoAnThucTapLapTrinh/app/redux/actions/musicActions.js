import axios from 'axios';
import { API_URL } from '../config'; // Import API_URL từ file config.js

// Các action types
export const ADD_SONG = 'ADD_SONG';
export const REMOVE_SONG = 'REMOVE_SONG';
export const SET_QUEUE = 'SET_QUEUE';
export const SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS';

// URL của API backend

// Hàm gọi API để thêm bài hát

// Hàm gọi API để xóa bài hát
const removeSongAPI = async (videoId) => {
    try {
        await axios.delete(`${API_URL}/music/delete/${videoId}`); // Gửi yêu cầu xóa tới API
    } catch (error) {
        console.error('[API Error][removeSongAPI]:', error);
        throw error;
    }
};

// Hàm gọi API để lấy danh sách nhạc
const getQueueAPI = async () => {
    try {
        const response = await axios.get(`${API_URL}/music/queue`); // Lấy danh sách nhạc
        return response.data;
    } catch (error) {
        console.error('[API Error][getQueueAPI]:', error);
        throw error;
    }
};

// Hàm gọi API để tìm kiếm nhạc
const searchMusicAPI = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/music/search`, {
            params: { q: query }, // Gửi từ khóa tìm kiếm đến API
        });
        return response.data;
    } catch (error) {
        console.error('[API Error][searchMusicAPI]:', error);
        throw error;
    }
};
const addSongAPI = async (song) => {
    try {
        const response = await axios.post(`${API_URL}/music/add`, song);
        return response.data;
    } catch (error) {
        // Bắt lỗi HTTP từ server
        if (error.response?.status === 409) {
            throw new Error('Bài hát đã tồn tại trong danh sách chờ!');
        }
        if (error.response?.status === 400) {
            throw new Error('Bạn đã thêm quá 2 bài hát trong 5 giây, vui lòng thử lại sau!');
        }
        throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm bài hát.');
    }
};

// Action để thêm bài hát vào danh sách chờ
export const addSong = (song) => async (dispatch, getState) => {
    const state = getState();

    // Kiểm tra bài hát trùng trên client-side
    const existingSong = state.music.queue.find((item) => item.videoId === song.videoId);
    if (existingSong) {
        alert(`Bài hát "${song.title}" đã có trong danh sách chờ!`);
        return;
    }

    try {
        console.log('Đang gọi API để thêm bài hát...', song);

        // Gọi API để thêm bài hát
        const newSong = await addSongAPI(song);

        console.log('Bài hát đã thêm thành công:', newSong);

        // Dispatch action để cập nhật Redux store
        dispatch({
            type: ADD_SONG,
            payload: newSong,
        });

        // Thông báo thành công
        alert(`Bài hát "${newSong.title}" đã được thêm vào danh sách chờ thành công!`);
    } catch (error) {
        console.error('Lỗi khi thêm bài hát:', error.message);

        // Hiển thị thông báo lỗi từ server
        alert(error.message);
    }
};



// Action để xóa bài hát khỏi danh sách chờ
export const removeSong = (videoId) => async (dispatch) => {
    try {
        await removeSongAPI(videoId); // Gọi API để xóa bài hát
        dispatch({
            type: REMOVE_SONG,
            payload: videoId, // Truyền videoId để reducer cập nhật state
        });
    } catch (error) {
        // Có thể dispatch một action để xử lý lỗi nếu cần
        alert('Có lỗi xảy ra khi xóa bài hát.');
    }
};

// Action để lấy danh sách nhạc
export const getQueue = () => async (dispatch) => {
    try {
        const queue = await getQueueAPI(); // Gọi API để lấy danh sách nhạc
        dispatch({
            type: SET_QUEUE,
            payload: queue, // Giả sử API trả lại danh sách nhạc
        });
    } catch (error) {
        // Có thể dispatch một action để xử lý lỗi nếu cần
        alert('Có lỗi xảy ra khi lấy danh sách nhạc.');
    }
};

// Action để tìm kiếm nhạc
export const searchMusic = (query) => async (dispatch) => {
    try {
        const response = await axios.get(`${API_URL}/music/search`, {
            params: { q: query },
        });
        dispatch({
            type: SET_SEARCH_RESULTS,
            payload: response.data,
        });
    } catch (error) {
        console.error('[API Error][searchMusic]:', error);
    }
};
