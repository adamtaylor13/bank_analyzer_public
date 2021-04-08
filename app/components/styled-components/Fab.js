import React from 'react';
import {connect} from 'react-redux';
import {makeStyles} from '@material-ui/core/styles';
import MuiFab from '@material-ui/core/Fab';
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
