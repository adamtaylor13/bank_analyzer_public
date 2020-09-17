import cookie from 'react-cookies';
import {setAuth} from "./actions";
import {initApp} from "./api";

export const authenticateUser = () => {
    return function (dispatch) {
        const hasAuth = cookie.load('token');
        dispatch(setAuth(hasAuth));
        if (hasAuth) {
            dispatch(initApp());
        }
    };
};
