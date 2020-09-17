import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {_try, toDollars} from "../../utility";
import {Redirect} from "react-router-dom";
import {selectCategories, selectFundById, selectTransactions,} from "../../reducers";
import {activateFilter, deactivateFilter} from "../../actions/actions";
import TransactionsTable from "../data-displays/tables/TransactionsTable";
import Navbar from "../Navbar";
import {deleteCategory} from "../../actions/api";
import {Box, Flex, Text, Heading} from 'rebass';
import Cell from "../data-displays/tables/Cell";
import EditableBar from "../EditableBar";
import Button, {ButtonLink} from "../styled-components/Button";
import Icon from "../Icon";
import CategoryTypes from "../../../server/CategoryTypes";
import Prompt from "../styled-components/Prompt";
import BtnFull from "../styled-components/BtnFull";

const mapStateToProps = state => {
    return {
        categories: selectCategories(state),
        getTransactions: category => {
            return selectTransactions(state).filter(t => t.budget_category === category.name);
        },
        getFundMatch: category => {
            return selectFundById(category.sinking_fund_id, state);
        }
    }
};

const mapDispatchToProps = dispatch => {
    return {
        init: () => {
            dispatch(deactivateFilter('noTransfers'));
        },
        // Called when component unmounts, this will re-activate the filter we turned off
        cleanupFilters: () => {
            dispatch(activateFilter('noTransfers'));
        },
        deleteCategory: (id, includeFund) => {
            dispatch(deleteCategory(id, includeFund));
        }
    };
};

const CategoryDetail = (props) => {
    const { categories } = props;

    const [loading, setLoading] = React.useState(true);
    const [category, setCategory] = React.useState({});
    const [redirect, setRedirect] = React.useState(false);
    const [transactions, setTransactions] = React.useState([]);
    const [promptDelete, setPromptDelete] = React.useState(false);
    const [promptDeleteFund, setPromptDeleteFund] = React.useState(false);

    useEffect(() => {
        props.init();
        if (!props.categories || !props.categories.length) {
            setLoading(true);
        } else {
            setLoading(false);

            const categoryId = _try(() => props.match.params.catId, null);
            const cat = _try(() => categories.filter(b => b._id === categoryId)[0], null);
            if (!categoryId || !cat) {
                setRedirect(true);
            }

            setCategory(cat);
            setTransactions(props.getTransactions(cat));
        }

        return () => props.cleanupFilters();
    }, [props.categories]);


    if (loading) {
        return <div>Loading...</div>
    }

    if (redirect) {
        return <Redirect to="/" />
    }

    function handleDeleteClick(includeFund = false) {
        props.deleteCategory(category._id, includeFund);
        props.history.goBack();
    }

    function editCategory() {
        props.history.push(`/category/${category._id}/edit`);
    }

    // Transform a category _id to its name
    function keyToName(key) {
        return props.categories.filter(c => c._id.toString() === key)[0].name;
    }

    const budgeted =  category.budgeted;
    const spent =  transactions.reduce((prev, curr) => prev + curr.amount, 0);
    const isNegativeBalance = category.difference < 0;
    const color =  isNegativeBalance ? 'danger' : 'successGreen';
    const linkedFund = props.getFundMatch(category);

    return (
        <Navbar
            navIcon="times"
            onNavIconClick={() => props.history.push(`/categories`)}
            actionIcon="trash"
            onActionIconClick={() => {
                // Only trigger if not already open
                if (!promptDelete) {
                    setPromptDelete(true);
                }
            }}>

            <Flex
                justifyContent={'center'}
                alignItems={'center'}
                mb={4}
                mt={4}
            >
                <Heading>{ category.name }</Heading>
            </Flex>


            { category.type === CategoryTypes.FUND ? (
                <Box p={2}>
                    <Text>Linked to { (props.getFundMatch(category)).name }</Text>
                </Box>
            ) : null }

            {/* Table */}
            <TransactionsTable transactions={transactions} hideTotalRow={true} />
            <Flex px={2} justifyContent='space-between'>
                <Cell>Budgeted</Cell>
                <Cell>{ toDollars(budgeted) }</Cell>
            </Flex>
            <Flex px={2} justifyContent='space-between'>
                <Cell>Spent</Cell>
                <Cell>{ toDollars(spent) }</Cell>
            </Flex>

            { category.adjustments ? (
                Object.keys(category.adjustments).map((key, i) => {
                    return (
                        <Flex px={2} justifyContent='space-between' key={i} alignItems={'center'}>
                            <Cell>{ keyToName(key) }</Cell>
                            <Icon icon={'balance-scale'}/>
                            <Cell>{ toDollars(category.adjustments[key]) }</Cell>
                        </Flex>
                    );
                })
            ) : null }

            <hr/>
            <Flex px={2} justifyContent='space-between' sx={{ color }}>
                <Cell>Balance</Cell>
                <Cell>{ toDollars(category.difference) }</Cell>
            </Flex>
            { isNegativeBalance ? (
                <Flex px={2} justifyContent='space-between' sx={{ color }}>
                    <ButtonLink bg={'midnightOff'} fullWidth to={`/category/${category._id.toString()}/balance`}>Balance Category</ButtonLink>
                </Flex>
            ) : null }

            <Box sx={{paddingBottom: '4rem'}}/>

            <Box p={2}>
                <Button onClick={() => editCategory()} p={2} variant={'full.secondary'}>
                    <Icon icon={'edit'} color="white" position={'left'}/>
                    Edit Category
                </Button>
            </Box>

                <Prompt msg={'Are you sure you wish to delete this category?'}
                        open={ promptDelete }
                        centered
                        onConfirmClick={() => {
                            setPromptDeleteFund(true);
                            setPromptDelete(false);
                        }}
                        onCancelClick={() => setPromptDelete(false)}
                />
                <Prompt msg={'This category is a Fund category, would you like to delete the fund as well?'}
                        detailTexts={
                            [
                                'The money previously set aside for this fund will be unallocated, and any transactions that are currently marked as ' + category.name + ' will be uncategorized. ',
                                'Deleting this fund would restore ' + toDollars(category.budgeted) + ' to your available funds.'
                            ]
                        }
                        open={ promptDeleteFund }
                        centered
                        btns={
                            [
                                {
                                    text: 'Yes, delete both',
                                    onClick: function() {
                                        console.log('doing both');
                                        handleDeleteClick(true);
                                    },
                                    bg: 'danger'
                                },
                                {
                                    text: 'No, just delete category',
                                    onClick: function() {
                                        console.log('just delete category');
                                        handleDeleteClick();
                                    },
                                    bg: 'danger'
                                },
                                {
                                    text: 'No, don\'t do either',
                                    onClick: function () {
                                        console.log('do not delete anything');
                                        setPromptDelete(false);
                                        setPromptDeleteFund(false);
                                    }
                                }
                            ]
                        }
                        onCancelClick={() => {
                            setPromptDelete(false);
                            setPromptDeleteFund(false);
                        }}
                />
                <Prompt />

            {/*<EditableBar danger onClick={() => handleDeleteClick()}>*/}
            {/*    Delete Category*/}
            {/*</EditableBar>*/}

        </Navbar>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryDetail);
