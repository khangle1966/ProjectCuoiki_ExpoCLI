import { ADD_SONG, REMOVE_SONG, SET_QUEUE, SET_SEARCH_RESULTS } from '../actions/musicActions';

const initialState = {
    queue: [], // Danh sách hàng chờ
    searchResults: [], // Lưu kết quả tìm kiếm
};

const musicReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_SONG:
            return {
                ...state,
                queue: [...state.queue, action.payload], // Thêm bài hát mới vào queue
            };

        case REMOVE_SONG:
            return {
                ...state,
                queue: state.queue.filter((song) => song.videoId !== action.payload), // Xóa bài hát khỏi queue
            };

        case SET_QUEUE:
            return {
                ...state,
                queue: action.payload, // Cập nhật danh sách chờ
            };

        case SET_SEARCH_RESULTS:
            return {
                ...state,
                searchResults: action.payload, // Cập nhật kết quả tìm kiếm
            };

        default:
            return state;
    }
};

export default musicReducer;
