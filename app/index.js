import "@babel/polyfill";
import React from 'react';
import App from './app';
import * as serviceWorker from './serviceWorker';

// State / Redux stuff
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers'
import {checkWidth} from "./actions/mobile";
import {authenticateUser} from "./actions/authCookie";

const loggerMiddleware = createLogger();
const store = createStore(rootReducer, applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
));

// Store dispatch dispatches an async action creator
store.dispatch(checkWidth());
store.dispatch(authenticateUser());

ReactDOM.render(
    <Provider store={ store }>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
