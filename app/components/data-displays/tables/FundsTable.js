import React from 'react';
import { connect } from 'react-redux';
import TableBase from "./TableBase";
import Rows from "./Rows";
import Icon from "../../Icon";
import {toDollars} from "../../../utility";
import moment from 'moment';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {isMobileView} from "../../../reducers";
import {
    Box,
    Card,
    Image,
    Heading,
    Text,
    Flex
} from 'rebass';
import TableRowBase from "./TableRowBase";
import Cell from "./Cell";

const mapStateToProps = state => {
    return {
        isMobile: isMobileView(state),
    }
};

export const FundsTable = connect(mapStateToProps)((props) => {

    let { rows, onRowClick, dispatch, ...rest } = props;
    if (!rows) return null;

    // Alphabetical name sort
    rows = rows.sort((a,b) => a.name > b.name ? 1 : -1);

    rows = [...rows, {
        name: 'Total',
        goal: rows.reduce((prev, curr) => prev + curr.goal, 0),
        reserved: rows.reduce((prev, curr) => prev + curr.reserved, 0),
    }];


    let tableCells = [
        {name: 'Fund Name', mobile: true },
        {name: '', mobile: true }, // Icons
        {name: 'Due Date', align: 'center', mobile: false },
        {name: 'Goal', align: 'right', mobile: true },
        {name: 'Amount Saved', align: 'right', mobile: true },
        {name: '% Complete', mobile: false },
        {name: '$ / Month', mobile: false }
    ];
    let cellmap = [
        {
            name: 'name', mobile: true,
        },
        {// Icon rendering
            name: '', mobile: true, renderOnTotal: false,
        },
        {
            name: 'due_date', mobile: false,
        },
        {
            name: 'goal', isDollarCell: true, mobile: true,
        },
        {
            name: 'reserved', isDollarCell: true, mobile: true,
        },
        {
            name: ({ goal, reserved }) => {
                const percent = Math.floor((reserved / goal) * 100);
                return `${Number.isNaN(percent) ? 9 : percent }%`;
            },
            mobile: false,
        },
        {
            name: ({ goal, due_date, reserved }) => {
                if (due_date) {
                    if (goal === reserved) {
                        return <Icon icon='check-square' size='lg' color='green' />;
                    }
                    const monthsTill = Math.abs(moment().diff(moment(due_date), 'months')) || 1;
                    const difference = goal - reserved;
                    return `${toDollars(difference / monthsTill)} / month`;
                } else {
                    return '';
                }
            },
            mobile: false,
        }
    ];



    return (
        <TableBase>
            <Flex alignItems='center'
                  justifyContent='space-between'
                  p={2}>
                <Text>Name</Text>
                <Text>Goal</Text>
                <Text>Saved</Text>
            </Flex>

            {rows.map((row, rowIndex) => (
                <TableRowBase key={ rowIndex }
                              hover={ true }
                              index={ rowIndex }
                              length={ rows.length }
                              row={ row } { ...rest }
                              className={ row && row.className ? row.className : '' }
                              onClick={() => props.history.push(`/funds/${row._id}`)}>

                    <Cell>{row.name}</Cell>
                    <Cell>{ toDollars(row.goal) }</Cell>
                    <Cell>{ toDollars(row.reserved) }</Cell>

                </TableRowBase>
            ))}
            {/*<Rows resource="funds" rows={ rows } cellmap={ cellmap } {...rest} />*/}
        </TableBase>
    );
});

export default FundsTable;
