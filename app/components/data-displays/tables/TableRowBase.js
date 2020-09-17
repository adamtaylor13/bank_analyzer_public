import React from 'react';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';
import {
    Box,
    Card,
    Image,
    Heading,
    Text,
    Flex
} from 'rebass';


const useStyles = makeStyles(theme => ({
    row: {
        cursor: 'pointer',
    },
    lastRow: {
        color: 'blue',
    },
}));

const TableRowBase = withRouter((props) => {
    const classes = useStyles();

    const { row, noLastRow, staticContext, resource, sx, isTotalRow, ...rest } = props;
    function onClick(e, row) {
        if (row.name !== 'Total') {
            props.history.push(`/${resource}/${row._id}`);
            console.log('props.history', props.history);
        }
    }

    const applyLastRowClass = () => {
        if (noLastRow) { return ''; }
        return props.index === props.length - 1  ? 'last-row' : '';
    };

    return (
        <Flex
            alignItems='center'
            justifyContent='space-between'
            sx={{
                position: 'relative',
                height: [55, 70],
                bg: isTotalRow ? '' : 'midnightOff',
                color: 'lightgray',
                m: 2,
                borderRadius: 5,
                boxShadow: isTotalRow ? '' : `0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)`,
                ...sx,
            }}
            className={`${classes.row} ${ applyLastRowClass() }`}
                  onClick={(e) => onClick(e, row) } {...rest} >
            { props.children }
        </Flex>
    );
});

export default TableRowBase;

