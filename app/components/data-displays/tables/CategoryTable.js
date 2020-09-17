import React from 'react';
import {isMobileView, selectAdditionalIncome, selectIncome} from "../../../reducers";
import TableBase from "./TableBase";
import { connect } from 'react-redux';
import Cell from "./Cell";
import {
    Box,
    Heading,
    Text,
    Flex
} from 'rebass';
import {toDollars, totalAdjustments} from "../../../utility";
import TableRowBase from "./TableRowBase";
import CategoryTypes from "../../../../server/CategoryTypes";
import Icon from "../../Icon";
import TwoColRow from "../../styled-components/TwoColRow";
import ToDollars from "../../styled-components/ToDollars";

const mapStateToProps = state => {
    return {
        isMobile: isMobileView(state),
        income: selectIncome(state),
        additionalIncome: selectAdditionalIncome(state),
    }
};

const verbiageSwitcher = (props, category) => {

    const over = category.difference < 0;
    const exact = category.difference === 0;
    const isStatic = category.type === CategoryTypes.STATIC;
    const isFund = category.type === CategoryTypes.FUND;

    if (exact) {
        if (isStatic) {
            return <Text sx={{ color: 'roman' }}>PAID</Text>;
        } else {
            return <Text sx={{ color: 'roman' }}>SPENT</Text>;
        }
    } else if (over) {
        if (isStatic) {
            return <Text sx={{color: 'tangelo'}}>Overcharged</Text>;
        } else if (isFund) {
            return <Text sx={{color: 'tangelo'}}>{ toDollars(category.difference) }</Text>;
        } else {
            return <Text sx={{ color: 'tangelo' }}>{ toDollars(category.difference) }</Text>;
        }
    } else {
        return <Text sx={{ color: 'green' }}>{ toDollars(category.difference) }</Text>
    }

}

export const CategoryTable = connect(mapStateToProps)((props) => {

    let { rows, dispatch, onItemClicked, ...rest } = props;

    // Alphabetical sort on name
    rows = rows.sort((a,b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);

    // TODO: Clean up the 'editMode' stuff that we're not using anymore
    const budgeted = rows.reduce((prev, curr) => prev + curr.budgeted, 0);
    const spent = rows.reduce((prev, curr) => prev + curr.spent + totalAdjustments(curr), 0);

    return (
        <Box>
            <TableBase>
                { props.editMode ? null : (
                    <Flex
                        alignItems='center'
                        justifyContent='space-between'
                        px='16px'
                    >
                        <Text>Name</Text>
                        <Text>Balance</Text>
                    </Flex>
                ) }
                {rows.map((row, rowIndex) => (
                    <Flex sx={{ position: 'relative', width: '100%' }} alignItems='center' key={rowIndex}>
                        <Box sx={{
                            flex: props.editMode ? 3 : 0,
                            width: 36,
                            height: 36,
                            marginLeft: -32,
                            minWidth: 'auto',
                            transition: '0.3s flex ease-in',
                            textAlign: 'right',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        }}>
                            <Icon icon='trash' size='lg' color='tangelo' style={{ marginRight: 17 }} />
                        </Box>
                        <TableRowBase key={ rowIndex }
                                      hover={ true }
                                      index={ rowIndex }
                                      length={ rows.length }
                                      row={ row } { ...rest }
                                      className={ row && row.className ? row.className : '' }
                                      onClick={() => onItemClicked(row._id)}
                                      sx={{ flex: 10, width: '100%', }}
                        >

                            <Cell>{row.name}</Cell>
                            { row.type === CategoryTypes.FUND ? (
                                <Box fontSize={'0.8rem'} color={'roman'} mr={2}><Icon icon='funnel-dollar' color='roman'/></Box>
                            ) : null }
                            { props.editMode ? (
                                <Cell><Flex alignItems='center'><Text color='roman' mr={2}>Edit</Text><Icon icon='angle-right' size='lg' color='roman'/></Flex></Cell>
                            ) : (
                                <Cell>{ verbiageSwitcher(props, row) }</Cell>
                            ) }

                        </TableRowBase>
                    </Flex>
                ))}

            </TableBase>
        </Box>
    );
});

export default CategoryTable;
