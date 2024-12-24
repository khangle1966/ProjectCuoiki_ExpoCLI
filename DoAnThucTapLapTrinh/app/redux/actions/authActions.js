import axios from 'axios';
import { API_URL } from '../config';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const LOGOUT = 'LOGOUT';

export const login = (username, password) => async (dispatch) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { username, password });
        dispatch({
            type: LOGIN_SUCCESS,
            payload: response.data, // Giả sử response trả về { user, access_token }
        });
    } catch (error) {
        dispatch({
            type: LOGIN_FAIL,
            payload: error.response?.data?.message || 'Đăng nhập thất bại!',
        });
    }
};
export const logout = () => (dispatch) => {
    dispatch({
        type: LOGOUT,
    });
};