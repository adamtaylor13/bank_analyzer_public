import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import withFilter from "../../higher-order/withFilter";
import {defaultTransactionSort, toDollars} from "../../../utility";
import Icon from "../../Icon";
import TableBase from "./TableBase";
import {isMobileView, listCategoryNames} from "../../../reducers";
import {
    Box,
    Heading,
    Text,
    Flex,
} from 'rebass';
import TableRowBase from "./TableRowBase";
import Cell from "./Cell";
import BottomBarButton from "../../styled-components/BottomBarButton";
import PaperBox from "../../styled-components/PaperBox";
import Dialog from '@material-ui/core/Dialog';
import { Label, Select } from '@rebass/forms';
import {fetchSyncTransactions, updateTransactionsMulti} from "../../../actions/api";
import useLongPress from "../../higher-order/useLongPress";
import Button from "../../styled-components/Button";
import {activateFilter, deactivateFilter, setCategories} from "../../../actions/actions";
import PullToRefresh from "../../styled-components/PullToRefresh";


const getId = obj => obj._id.toString();

const mapStateToProps = state => {
    return {
        isMobile: isMobileView(state),
        cats: listCategoryNames(state),
    }
};

const Icons = props => {
    const isPending = props.row.pending;
    const missingCategory = !props.row.budget_category;

    if (isPending) {
        return (
            <Cell sx={{ position: 'absolute', right: '25%' }}>
                <Icon icon="clock" size="lg" color='granite'/>
            </Cell>
        )
    } else if (missingCategory) {
        return (
            <Cell sx={{ position: 'absolute', right: '26%' }}>
                <Icon icon="exclamation-triangle" size="lg" color='tangelo'/>
            </Cell>
        );
    } else {
        return null;
    }
};

export const TransactionsTable = withRouter(connect(mapStateToProps, null)(withFilter((props) => {
    let { hideTotalRow, dispatch, ...rest } = props;
    let rows = props.transactions;

    if (!rows || !rows.length) return null;
    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const [filterUncategorizedOnly, setFilterUncategorizedOnly] = React.useState(false);

    const { selectedRows, setSelectedRows, multiMode, setMultiMode } = props;

    const longPress = useLongPress(({ longPressData }) => {
        const rowId = longPressData;
        if (!rowId) { return false; }

        if (!multiMode) {
            setMultiMode(true);
            setSelectedRows({ ...selectedRows, [`${rowId}`]: true });
        }
    }, 500);

    rows = defaultTransactionSort(rows);
    rows = rows.map(r => {
        if (r.pending) {
            r.className = 'pending-transaction';
            return r;
        }
        return r;
    });

    function onClick(row) {
        const id = getId(row);
        if (multiMode) {
            const exists = selectedRows[id];
            if (exists) {
                setSelectedRows({ ...selectedRows, [id]: null });
            } else {
                setSelectedRows({ ...selectedRows, [id]: true });
            }
        } else {
            props.history.push(`/transactions/${id}`);
        }
    }

    function toggleFilter(filter, activate) {
        if (activate) {
            dispatch(activateFilter(filter));
        } else {
            dispatch(deactivateFilter(filter))
        }
    }

    const handleClose = (e, reason) => {
        setModalIsOpen(false);
        setMultiMode(false);
        setSelectedRows({});
    };

    const onCategoryConfirm = category => {
        const transactionIdsToUpdate = Object.keys(selectedRows).filter(id => selectedRows[id]);
        if (!transactionIdsToUpdate.length) {
            return;
        }

        const transactions = rows.filter(r => transactionIdsToUpdate.includes(getId(r))).map(r => {
            r.budget_category = category;
            return r;
        });

        dispatch(updateTransactionsMulti(transactions));
        setModalIsOpen(false);
        setMultiMode(false);
    };

    return (
        <PullToRefresh onRefresh={ () => {
            return new Promise((resolve) => {
                dispatch(fetchSyncTransactions()).then(() => {
                    resolve(); // Wait for transactions to finish syncing, then close loader icon
                });
            });
        } }>
            <Box pb={2}>
                { props.showCategoryFilter ? (
                    <Box p={3}>
                        <Button icon={'filter'} variant={'full.secondary'} onClick={() => {
                            toggleFilter('uncategorized', filterUncategorizedOnly);
                            setFilterUncategorizedOnly(!filterUncategorizedOnly);
                        }}>
                            Only Uncategorized
                        </Button>
                    </Box>
                ) : null }

                <TableBase>
                    <Flex
                        alignItems='center'
                        justifyContent='space-between'
                        p={2}
                    >
                        <Text>Name</Text>
                        <Text>Amount</Text>
                    </Flex>
                    {rows.map((row, rowIndex) => {
                        const id = getId(row);
                        const selected = (selectedRows && Object.keys(selectedRows).length) ? selectedRows[id] : null;
                        return (
                            <TableRowBase key={rowIndex}
                                          hover={true}
                                          index={rowIndex}
                                          length={rows.length}
                                          row={row} {...rest}
                                          className={(row && row.className ? row.className : '') + ' row'}
                                          onClick={() => onClick(row)}
                                          data-long-press-data={id}
                                          { ...longPress }>

                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: multiMode ? 10 : -40,
                                    }}
                                >
                                    <Icon
                                        prefix={selected ? 'fas' : 'far'}
                                        icon={selected ? 'check-circle' : 'circle'}
                                        color={selected ? 'tangelo' : 'roman'}
                                        size='lg'
                                    />
                                </Box>

                                <Cell sx={{
                                    color: row.pending ? 'roman' : '',
                                    marginLeft: multiMode ? '2rem' : 0,
                                }}>{row.memo ? row.memo : row.name}</Cell>

                                {/* TODO: row.receipt */}
                                <Icons row={row}/>
                                <Cell sx={{color: row.pending ? 'roman' : ''}}>{toDollars(row.amount)}</Cell>

                            </TableRowBase>
                        );
                    })}
                    { props.hideTotalRow ? null : (
                        <Flex p={2} justifyContent='space-between'>
                            <Cell>
                                <Heading color='tangelo'>Total</Heading>
                            </Cell>
                            <Cell>
                                <Heading color='tangelo'>{ toDollars(rows.reduce((prev, curr) => prev + curr.amount, 0)) }</Heading>
                            </Cell>
                        </Flex>
                    ) }

                    { multiMode ? (
                        <>
                            <MultiCategorySelectDialog open={modalIsOpen}
                                                       {...props}
                                                       onConfirm={ onCategoryConfirm }
                                                       handleClose={handleClose}
                                                       selectedItems={rows.filter(r => selectedRows[getId(r)])}
                            />
                            <BottomBarButton onClick={() => setModalIsOpen(true)} bg='tangelo' fontSize={'1.2rem'}>
                                Categorize Selection
                            </BottomBarButton>
                        </>
                    ) : null }
                </TableBase>
            </Box>
        </PullToRefresh>
    );
})));

// TODO: This can be made into a reusable "page" component to just add a quick new "page" view
const MultiCategorySelectDialog = (props) => {
    const [val, setVal] = React.useState(props.cats[0]);
    return (
        <Dialog open={ props.open } onClose={ props.handleClose } fullScreen>
            <PaperBox sx={{ minHeight: '100vh', overflow: 'scroll' }} dark>
                <Box width='100%' mb={4}>
                    <Icon icon='times' color='tangelo' size='lg' onClick={ props.handleClose }/>
                </Box>
                    <Heading color='roman' variant='bar'>Categorize the following:</Heading>

                    { props.selectedItems.map(r => (
                        <Box p={2} key={r._id}>
                            <Text color='white' fontSize='1rem'>{r.name} {toDollars(r.amount)}</Text>
                        </Box>
                    )) }

                    <Label mt={3} mb={1}>Click to select Category</Label>
                    {/*<EditableBar disabled>*/}
                    <Select
                        id='cat-select'
                        name='cat-select'
                        value={ val }
                        onChange={ e => setVal(e.target.value) }
                        sx={{
                            height: '55px',
                            fontSize: '1.5rem',
                            borderColor: 'tangelo',
                            paddingRight: '25px',
                            color: 'roman',
                        }}
                    >
                        { props.cats.map((m, i) => {
                            return (
                                <option key={i} value={ m }>{ m }</option>
                            );
                        })}
                    </Select>
                    {/*</EditableBar>*/}

                    <Button mt={4} onClick={() => props.onConfirm(val)} variant='action' sx={{ width: '100%' }} fontSize={'1.5rem'}>Confirm</Button>
            </PaperBox>
        </Dialog>
    );
};

export default TransactionsTable;
