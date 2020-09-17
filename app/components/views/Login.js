import React from 'react';
import {connect} from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
// import Button from "../styled-components/Button";
import {login} from "../../actions/api";
import {isAuthenticated} from "../../reducers";
import { Redirect } from "react-router-dom";
import {authenticateUser} from "../../actions/authCookie";
import {
    Box,
    Card,
    Image,
    Heading,
    Text,
    Flex,
    Button,
} from 'rebass';
import { Input, Label, Select, Textarea } from '@rebass/forms';

const mapStateToProps = state => {
    return {
        isAuthenticated: isAuthenticated(state),
    };
};

const Login = (props) => {
    const { dispatch } = props;
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    function loginBtnClick() {
        dispatch(login({ username, password }));
    }

    if (props.isAuthenticated) {
        dispatch(authenticateUser());
        return <Redirect to="/" />
    }

    return (
        <Box>
            <Flex justifyContent='center' alignItems='center' flexDirection='column'  sx={{
                // height: '100vh',
                overflow: 'hidden',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}>

                <Heading color='tangelo' fontSize='2rem' mb={3}>Login Here</Heading>
                <Label>Username</Label>
                <Input defaultValue={ username } onChange={e => setUsername(e.target.value)} mb={2}/>
                <Label>Password</Label>
                <Input type="password" defaultValue={ password } onChange={e => setPassword(e.target.value)} mb={3}/>
                <Button variant='action' sx={{ width: '100%' }} onClick={loginBtnClick}>Login</Button>
            </Flex>
        </Box>
    );
};

export default connect(mapStateToProps)(Login);
