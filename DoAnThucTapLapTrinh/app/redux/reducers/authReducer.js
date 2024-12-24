import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from '../actions/authActions';

const initialState = {
    user: null,
    token: null,
    error: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user, // Lưu thông tin người dùng
                token: action.payload.access_token, // Lưu token
                error: null,
            };
        case LOGIN_FAIL:
            return {
                ...state,
                user: null,
                token: null,
                error: action.payload, // Lưu lỗi từ server
            };
        case LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                error: null,
            };
        default:
            return state;
    }
};

export default authReducer;
