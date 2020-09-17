import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import {spacing} from '@material-ui/system';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(theme => ({
    displayField: {
        border: 0,
        '&.MuiInput-underline.Mui-disabled:before': {
            border: 0,
        },
        '&:hover': {
            cursor: 'unset',
        }
    },
}));

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

const OutlinedTextField = (props) => {
    const classes = useStyles();
    return (
        <TextField
            disabled
            className={ classes.displayField }
            margin="normal"
            fullWidth={ true }
            variant="outlined"
            inputProps={ {style: { color: 'black' } }}
            { ...props }
        />
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(OutlinedTextField);
