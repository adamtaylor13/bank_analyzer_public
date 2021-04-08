import React from 'react';
import {connect} from 'react-redux';
import {makeStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

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
