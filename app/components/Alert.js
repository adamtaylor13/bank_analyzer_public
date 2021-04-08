import React from 'react';
import {connect} from 'react-redux';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import {makeStyles} from '@material-ui/core/styles';
import Icon from "./Icon";
import {selectActiveAlert, selectAlertOpenStatus} from "../reducers";
import {dequeueAlert} from "../actions/actions";


// TODO: Implement notistack here. I already npm installed it, just implement it

const useStyles1 = makeStyles(theme => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
}));

function MySnackbarContentWrapper(props) {
    const classes = useStyles1();
    const { className, message, onClose, variant, ...other } = props;
    let { icon } = props;

    const defaultIcons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle',
        error: 'exclamation-circle',
    };

    if (!icon) {
        icon = defaultIcons[variant] || defaultIcons.info;
    }

    return (
        <SnackbarContent
            className={ classes[variant] }
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
                    <Icon icon={ icon } position="left" />
                        {message}
                </span>
            } {...other} />
    );
}

const mapStateToProps = state => {
    return {
        isOpen: selectAlertOpenStatus(state),
        alert: selectActiveAlert(state)
    }
};

const mapDispatchToProps = dispatch => {
    return {
        handleClose: () => {
            // Dequeue the most recent alert
            dispatch(dequeueAlert());
        }
    }
};

// TODO: Maybe clean up the "hide" logic so it isn't so choppy
function Alert(props) {
    if (!props.isOpen) return null;

    function handleClose(event, reason) {
        if (reason === 'clickaway') return;
        // Other reason is 'timeout'
        props.handleClose();
    }

    return (
        <div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={ props.isOpen }
                autoHideDuration={ props.alert.autoHideDuration || 2500 }
                onClose={ handleClose }
            >
                <MySnackbarContentWrapper
                    onClose={ handleClose }
                    variant={ props.alert.variant }
                    message={ props.alert.message }
                    icon={ props.alert.icon }
                />
            </Snackbar>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Alert);
