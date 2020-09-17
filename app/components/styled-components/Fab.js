import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/core/styles';
import MuiFab from '@material-ui/core/Fab';
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
import Icon from "../Icon";
import globalTheme from "../../theme";

const useStyles = makeStyles(theme => {
    return ({
        fab: {
            margin: theme.spacing(1),
            position: 'fixed',
            bottom: theme.spacing(1),
            right: 0,
            backgroundColor: globalTheme.colors.tangelo,
        },
        fabBottomSpacer: {
            marginBottom: theme.spacing(5) * 2
        }
    });
});

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export const FabWrapper = (props) => {
    const classes = useStyles();
    return (
        <div className={ classes.fabBottomSpacer }>
            { props.children }
        </div>
    );
};

const Fab = (props) => {
    const classes = useStyles();
    const { onClick, ...rest } = props;
    return (
        <MuiFab color='default' aria-label="actionLabel" className={classes.fab} onClick={ onClick }>
            <Icon size="lg" { ...rest } />
        </MuiFab>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(Fab);
