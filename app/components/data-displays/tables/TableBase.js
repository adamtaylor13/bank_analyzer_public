import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Box} from 'rebass';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        borderCollapse: 'separate',
    },
}));

const TableBase = (props) => {
    const classes = useStyles();

    return (
        <Box className={classes.table} {...props}>
            { props.children }
        </Box>
    );
};

export default TableBase;
