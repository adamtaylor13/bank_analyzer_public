import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {selectAccounts, selectCategories} from "../reducers";
import {deleteTransaction, updateTransaction} from "../actions/api";
import moment from 'moment';
import {_try, toDollars} from "../utility";
import Icon from "./Icon";
import IconButton from '@material-ui/core/IconButton';
import Receipt from "./Receipt";
import { withRouter } from 'react-router-dom';
import withTransactions from "./higher-order/withTransactions";
import { Redirect } from "react-router-dom";
import Button from "./styled-components/Button";
import Fab from '@material-ui/core/Fab';
import BottomBarButton from "./styled-components/BottomBarButton";
import Navbar from "./Navbar";
import OffsetsTable from "./data-displays/tables/OffsetsTable";
import {
    Box,
    Heading,
    Text,
    Flex,
} from 'rebass';
import { Input, Label} from '@rebass/forms';
import EditableBar from "./EditableBar";
import StackSlider from "./StackSlider";
import theme from "../theme";
import Prompt from "./styled-components/Prompt";


const useStyles = makeStyles(theme => ({
    button: {
        display: 'block',
    },
    input: {
        display: 'none',
    },
    flex: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    flexCol: {
        display: 'flex',
        flexDirection: 'column',
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    padding: {
        padding: '10px'
    },
    noGutters: {
        paddingRight: 0,
        paddingLeft: 0,
    },
    datePicker: {
        width: '100%',
    },
    label: {
        color: 'rgba(0, 0, 0, 0.38)',
    },
    fab: {
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        position: 'fixed',
    }
}));

const mapStateToProps = state => {
    return {
        categories: selectCategories(state),
        accounts: selectAccounts(state),
    }
};

const getAccount = (accounts, transaction) => {
    if (!accounts.length) {
        return 'No accounts to compare';
    }

    const account = accounts.filter(a => a.account_id === transaction.account_id)[0];
    if (account.subtype === 'sinking fund') {
        // For clarity
        return "Sinking Fund";
    }
    return account.name;
};


const EditTransaction = withTransactions(withRouter((props)  => {
    const classes = useStyles();
    let inputFile = useRef(null);

    const { categories, accounts, dispatch, ...rest } = props;
    const [loading, setLoading] = React.useState(true);
    const [canSave, setCanSave] = React.useState(false);
    const [originalReference, setOriginalReference] = React.useState({});
    const [transaction, setTransaction] = React.useState({});
    const [redirect, setRedirect] = React.useState(false);
    const [promptDelete, setPromptDelete] = React.useState(false);

    const options = props.categories.map((o) => o.name).sort();

    useEffect(() => {
        if (!props.transactions || !props.transactions.length) {
            setLoading(true);
        } else {
            setLoading(false);

            // Try to find a matching transaction
            const transactionId = _try(() => props.match.params.id, null);
            const matchingTransaction = _try(() => props.transactions.filter(t => t._id === transactionId)[0], null);
            if (!transactionId || !matchingTransaction) {
                setRedirect(true);
            }

            // Set the transaction and the original reference
            setTransaction(matchingTransaction);
            setOriginalReference(matchingTransaction);
        }
    }, [props.transactions]);

    if (loading) {
        return <div>Loading...</div>
    }

    if (redirect) {
        return <Redirect to="/list" />
    }

    function returnToList() {
        props.history.goBack();
    }

    // Check each key and if they are different, you can save
    function checkCanSave(incoming) {
        return new Promise((resolve, reject) => {
            const incomingKeys = Object.keys(incoming);
            for (let key of incomingKeys) {
                if (incoming[key] !== originalReference[key]) {
                    setCanSave(true);
                    resolve();
                    return;
                }
            }
            setCanSave(false);
            reject(); // Maybe don't need to reject
        });
    }

    function handleSave() {
        dispatch(updateTransaction(transaction));
        returnToList();
    }

    function onMemoChange(e) {
        const memo = e.target.value;
        console.log('memo', memo);
        const incoming = { ...transaction, memo };
        checkCanSave(incoming)
            .then(() => {
                setTransaction(incoming);
            })
            .catch();
    }

    function handleCategorySelect(cat, done) {
        const budget_category = cat;
        const incoming = { ...transaction, budget_category, was_budgeted: true };
        checkCanSave(incoming)
            .then(() => {
                setTransaction(incoming);
                done();
            })
            .catch();
    }

    function onDateChange(date) {
        date = moment(date).format('YYYY-MM-DD').toString();
        const incoming = { ...transaction, date };

        // TODO: Change colors
        checkCanSave(incoming)
            .then(() => {
                setTransaction(incoming);
            })
            .catch();
    }

    const canOffset = transaction ? transaction.amount >= 0 : false;
    const OffsetButton = ({ canOffset }) => {
        if (!canOffset) return null;
        return (
            <IconButton onClick={() => setView('SelectOffset')} style={{ padding: 10 }}>
                <Icon icon="edit" size="xs"/>
            </IconButton>
        );
    };
    const canRemoveOffset = transaction.is_offset_transaction;
    const RemoveOffsetButton = () => {
        if (!canRemoveOffset) return null;
        return (
            <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={() => setView('RemoveOffset') }
            >
                Remove Offset Transaction
            </Button>
        );
    };
    const OffsetList = props => {
        if (!(transaction.offsets && transaction.offsets.length)) { return null; }
        return (
            <>
                <h3>Offsets</h3>
                <OffsetsTable rows={ transaction.offsets } />
            </>
        );
    };

    function handleAssignReceipt() {
        inputFile.current.click();
    }

    return (
        <StackSlider
            { ...rest }
            mainView={ props => (
                <Navbar
                    label={"Edit Transaction"}
                    navIcon={"times"}
                    onNavIconClick={() => props.history.goBack()}
                    actionIcon={'trash'}
                    onActionIconClick={() => {
                        // Only trigger if not already open
                        if (!promptDelete) {
                            setPromptDelete(true);
                        }
                    }}
                >
                    <Receipt transaction={ transaction } style={{ flex: 1 }} closeModal={ props.closeTransactionModal }/>

                    <Box>
                        <Box p={2}>
                            <Heading>{transaction.name}</Heading>

                            { transaction.category.includes('Transfer') ? (
                                <Text>Transfer</Text>
                            ) : null }
                        </Box>
                        <Flex
                            justifyContent='space-between'
                            flexDirection='column'
                        >
                            <EditableBar disabled>
                                <Label>Amount</Label>
                                <Text fontSize='1.2rem'>{ toDollars(transaction.amount) }</Text>
                            </EditableBar>

                            <EditableBar disabled>
                                <Label>Account</Label>
                                <Text fontSize='1.2rem'>{ getAccount(accounts, transaction) }</Text>
                            </EditableBar>

                            <EditableBar disabled>
                                <Label>Date</Label>
                                <Text fontSize='1.2rem'>{ moment(transaction.date).format('MMM DD, YYYY') }</Text>
                            </EditableBar>

                            <EditableBar onClick={() => props.openSlide()}>
                                <Label>Category</Label>
                                <Text fontSize='1.2rem'>{transaction.budget_category || ''}</Text>
                            </EditableBar>

                            <EditableBar disabled>
                                <Label htmlFor='memo'>Memo</Label>
                                <Input id='memo' variant='noBorder' onBlur={(e) => onMemoChange(e)} defaultValue={transaction.memo}/>
                            </EditableBar>
                        </Flex>

                        <Box mt={4}>
                            <Grid container justify="space-between" alignItems="center">

                                <Prompt msg={'Are you sure you wish to delete this transaction?'}
                                        open={ promptDelete }
                                        centered
                                        onConfirmClick={() => {
                                            setPromptDelete(false);
                                            dispatch(deleteTransaction(transaction._id));
                                            returnToList();
                                        }}
                                        onCancelClick={() => setPromptDelete(false)}
                                />

                            </Grid>
                        </Box>
                    </Box>
                    {/* Bottom save bar */}
                    { canSave ? (
                        <BottomBarButton
                            variant="contained"
                            color="success"
                            onClick={ handleSave }>
                            Save Changes
                        </BottomBarButton>
                    ) : null }
                    {/* Fab Button */}
                    { !transaction.receipt ? (
                        <Fab
                            className={ classes.fab }
                            color="primary"
                            aria-label="add"
                             onClick={ handleAssignReceipt }>
                            <Icon icon="receipt" size="lg"/>
                        </Fab>
                    ) : null }

                </Navbar>
            )
            }
            // Category Selection
            slideView={ props => (
                <Navbar label={'Select a Category'}
                        navIcon='chevron-left'
                        onNavIconClick={props.closeSlide}
                >
                    { options.map((o,idx) => (
                        <Box p={3} mb='1px' key={idx}
                             onClick={() => handleCategorySelect(o, props.closeSlide)}
                         sx={{
                             position: 'relative',
                             backgroundColor: transaction.budget_category === o ? 'midnightOff' : '',
                         }}>{ o }
                            {transaction.budget_category === o ? (
                                <Icon icon='check' color='white' style={{
                                    position: 'absolute',
                                    right: theme.space[2],
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}></Icon>
                            ) : null}
                        </Box>
                    )) }
                </Navbar>
            )
            }/>
    );
}));

export default connect(mapStateToProps)(EditTransaction);
