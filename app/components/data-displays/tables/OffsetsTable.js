import React from 'react';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableBase from "./TableBase";
import Rows from "./Rows";

const OffsetsTable = (props) => {

    let { rows, onRowClick } = props;
    rows = [...rows, {
        name: 'Total',
        amount: rows.reduce((prev, curr) => prev + curr.amount, 0),
    }];

    // rows = sortByDate(rows);

    return (
        <TableBase size="small" >
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <Rows rows={ rows } cellmap={[
                    { name: 'name', style: { maxWidth: '50px' }},
                    { name: 'date', style: { maxWidth: '50px' }},
                    { name: 'amount', align: "right"},
                ]} onRowClick={ onRowClick } />
            </TableBody>
        </TableBase>
    );
};

export default OffsetsTable;
