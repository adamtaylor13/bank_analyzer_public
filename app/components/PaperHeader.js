import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {spacing} from '@material-ui/system';
import Icon from "./Icon";
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(() => ({
    row: {
        display: 'flex',
        alignItems: 'center'
    },
}));

const PaperHeader = (props) => {
    const classes = useStyles();
    const { onClick, display, ...rest } = props;
    return (
        <Box {...rest}>
            <Grid container direction="row" justify="space-between" alignItems="center">
                <Box className={ classes.row }>
                    { onClick ? (
                        <Button onClick={ onClick }>
                            <Icon icon={ 'arrow-circle-left' } size='2x' color='primary' />
                        </Button>
                    ) : null }
                    <Typography variant={ props.variant || "h4"}>{ display }</Typography>
                </Box>
                { props.children ? (
                    <Box className="childrenBox">
                        { props.children }
                    </Box>
                ) : null }
            </Grid>
        </Box>
    );
};

export default PaperHeader;
