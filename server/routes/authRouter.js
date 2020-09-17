import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import {errorWrap} from "../utility";
import User from '../models/User';

const authRouter = express.Router();
const jsonParser = bodyParser.json();

const { TOKEN_SECRET, USER_HASH } = process.env;
const maxCookieAge = 1000 * 60 * 60 * 24;

authRouter.post('/login', jsonParser, errorWrap(async ({ body }, res) => {
    console.log('POST: auth/login');
    const { username, password } = body;

    if (username === User.username && password === User.password) {
        const token = {
            userHash: USER_HASH
        };
        const signedToken = jwt.sign(token, TOKEN_SECRET, { expiresIn: maxCookieAge });
        res.cookie('token', signedToken, { maxAge: maxCookieAge }).send({ authenticated: true });
    } else {
        throw Error(`Not a valid user: { username:${username}, password: ${password} }`);
    }
}));

export function authenticate(req, res, next) {
    console.log('authenticating user..');
    // Default to not authenticated
    req.auth = false;

    // Helper method to clear a token and invoke the next middleware
    function notAuthenticated() {
        res.status(403).send('Not authenticatd');
    }

    // Read the cookie named 'token' and bail out if it doesn't exist
    const { token } = req.cookies;
    if (!token) {
        return notAuthenticated();
    }

    // Test the validity of the token
    jwt.verify(token, TOKEN_SECRET, (err, decodedToken) => {
        if (err) {
            return notAuthenticated();
        }

        // Compare the token expiry (in seconds) to the current time (in milliseconds)
        // Bail out if the token has expired
        if (decodedToken.exp <= Date.now() / 1000) {
            return notAuthenticated();
        }

        if (decodedToken.userHash === USER_HASH) {
            next();
        } else {
            return notAuthenticated();
        }
    });
}

export default authRouter;
