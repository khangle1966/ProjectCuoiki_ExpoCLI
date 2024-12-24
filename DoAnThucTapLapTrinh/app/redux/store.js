import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';  // Đây là cách đúng để import 'thunk' từ 'redux-thunk'
import musicReducer from './reducers/musicReducer';
import authReducer from './reducers/authReducer';   // Reducer cho authentication

// Kết hợp các reducers lại
const rootReducer = combineReducers({
    music: musicReducer,
    auth: authReducer,
});

const store = createStore(
    rootReducer,            // Truyền rootReducer vào store
    applyMiddleware(thunk)  // Sử dụng middleware thunk
);

export { store };