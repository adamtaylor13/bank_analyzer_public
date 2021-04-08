import moment from 'moment';
import {Link} from "react-router-dom";
import React from 'react';
import {connect} from 'react-redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import {createNewFund, syncAccounts, updateAccount} from "../../../actions/api";
import {
    selectAccounts,
    selectActivatedForMonth,
    selectFunds,
    selectSinkingFundAccount,
    selectUnaccountedMoneyInSinkingFund
} from "../../../reducers";
import {toDollars} from "../../../utility";
import Icon from "../../Icon";
import Fab from "../../styled-components/Fab";
import Navbar from "../../Navbar";
import {Box, Flex, Heading, Text,} from 'rebass';
import Button from "../../styled-components/Button";
import BtnFull from "../../styled-components/BtnFull";


const mapStateToProps = state => {
    return {
        sinkingFundAccount: selectSinkingFundAccount(state),
        accounts: selectAccounts(state),
        funds: selectFunds(state),
        unaccountedMoneyInSinkingFund: selectUnaccountedMoneyInSinkingFund(state),
        monthlyActivated: selectActivatedForMonth(state),
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        createNewFund: (fund) => {
            dispatch(createNewFund(fund));
        },
        updateAccount: (account) => {
            dispatch(updateAccount(account));
        },
        updateFund: () => {
            console.log('not hooked up');
        },
        syncAccounts: () => {
            dispatch(syncAccounts());
        }
    }
};

const SetSinkingFundAccount = props => {

    const setSinkingFundAccount = (e) => {
        let [ account ] = props.accounts.filter(a => a.name.toLowerCase() === e.target.innerHTML.toLowerCase());
        account.subtype = "sinking fund";
        props.updateAccount(account);
    };

    if (!props.sinkingFundAccount) {
        return (
            <>
                Click an account to set it as your sinking fund account:
                <List>
                    { props.accounts.map((a, index) => (
                        <ListItem key={index} button onClick={ setSinkingFundAccount }>
                            <Grid container
                                  direction="row"
                                  justify="space-between"
                                  alignItems="center">
                                { a.name }
                            </Grid>
                        </ListItem>
                    ))}
                </List>
            </>
        );
    } else {
        return null;
    }
};

const TransferFundsButton = props => {
    if (!props.sinkingFundAccount) {
        return null;
    } else {
        return (
            <Button variant={"contained"}
                    color="primary"
                    className={props.btnClass}>
                <Icon icon={ 'exchange-alt' } position="left" />
                <Link to={"/funds/transfer"} style={{ textDecoration: 'none', color: 'unset' }}>Transfer Funds</Link>
            </Button>
        )
    }
};

const FundMainView = (props) => {

    const [forceRender, setForceRender] = React.useState(false);

    // How much monthly savings are required to hit our goals
    const goalRequirement = props.funds.reduce((prev, curr) => {
        if (!curr.due_date) { return prev + 0; }
        const monthsTill = Math.abs(moment().diff(moment(curr.due_date), 'months')) || 1;
        const difference = curr.goal - curr.reserved;
        return prev + (difference / monthsTill);
    }, 0);

    const viewDetail = fund => {
        props.history.push(`/funds/${fund._id}`);
    };

    function createNewFund() {
        props.history.push('/funds/new');
    }

    return (
        <Navbar label="Sinking Funds">
            <Box pb={'64px'}>
                {/* TODO: This should happen within an individual fund edit screen */}
                {/*<TransferFundsButton*/}
                {/*    sinkingFundAccount={ props.sinkingFundAccount }*/}
                {/*    btnClass={classes.button}*/}
                {/*/>*/}

                <SetSinkingFundAccount
                    sinkingFundAccount={ props.sinkingFundAccount }
                    accounts={props.accounts}
                    updateAccount={props.updateAccount}/>

                { props.sinkingFundAccount &&
                <Box p={2}>
                    <Flex alignItems='center' justifyContent='space-between'>
                        <Heading fontSize={2} >Unallocated Funds:</Heading>
                        <Heading fontSize={2}>{ toDollars(props.unaccountedMoneyInSinkingFund) }</Heading>
                    </Flex>
                    <Flex alignItems='center' justifyContent='space-between'>
                        <Heading fontSize={2}>Goals ($ / Month):</Heading>
                        <Heading fontSize={2}>{ toDollars(goalRequirement) }</Heading>
                    </Flex>

                    <Flex alignItems='center' justifyContent='space-between' mt={3}>
                        <Heading fontSize={2}>Account Balance:</Heading>
                        <Heading fontSize={2}>{ toDollars(props.sinkingFundAccount[0].balances.current) }</Heading>
                    </Flex>
                    <Flex alignItems='center' justifyContent='space-between'>
                        <Heading fontSize={2}>Reserved:</Heading>
                        <Heading fontSize={2}>{ toDollars(props.funds.reduce((acc, curr) => curr.reserved + acc, 0)) }</Heading>
                    </Flex>
                    <Flex alignItems='center' justifyContent='space-between'>
                        <Heading fontSize={2}>Activated This Month:</Heading>
                        <Heading fontSize={2}>{ toDollars(props.monthlyActivated) }</Heading>
                    </Flex>

                    <BtnFull my={3} onClick={() => {
                        props.syncAccounts();
                        setForceRender(!forceRender); // Dummy state props to force a rerender of the component
                    }} variant={'primary'}>
                        <Icon icon={'sync'} position={'left'}/>
                        Refresh
                    </BtnFull>

                </Box>
                }

                { props.funds.sort((a,b) => a.name > b.name ? 1 : -1).map((fund, idx) => (
                    <Box m={2} key={idx} sx={{ bg:'midnightOff', borderRadius: '5px' }}
                         onClick={() => props.history.push(`/funds/${fund._id}`)}>
                        <Flex justifyContent='space-around' alignItems='center' p={2}>
                            <Flex alignItems='center' justifyContent='flex-start' flex={1}>
                                <Text fontSize={1}>{ fund.name }</Text>
                            </Flex>
                            {/* TODO: Just streamline these.. They're pretty similar */}
                            { fund.goal === fund.reserved ? (
                                <Flex flexDirection='column' flex={2} justifyContent={'space-between'}>
                                    <Flex alignItems='flex-end'>
                                        <Text color='tangelo' sx={{ flex: '1', textAlign: 'right', }}>Reserved:</Text>
                                        <Text fontSize={2} sx={{ flex: '1', textAlign: 'right', }}>
                                            { toDollars(fund.reserved) }
                                            <Box ml={1} as='span'>
                                                <Icon icon='check-circle' size='sm' color='tangelo'/>
                                            </Box>
                                        </Text>
                                    </Flex>
                                </Flex>
                            ) : (
                                <Flex flexDirection='column' flex={2} justifyContent={'space-between'}>
                                    <Flex alignItems='flex-start'>
                                        <Text color='roman' sx={{ flex: '1', textAlign: 'right', }}>Goal:</Text>
                                        <Text fontSize={2} sx={{ flex: '1', textAlign: 'right', }}>{ toDollars(fund.goal) }</Text>
                                    </Flex>
                                    <Flex alignItems='flex-end'>
                                        <Text color='roman' sx={{ flex: '1', textAlign: 'right', }}>Reserved:</Text>
                                        <Text fontSize={2} sx={{ flex: '1', textAlign: 'right', }}>{ toDollars(fund.reserved) }</Text>
                                    </Flex>
                                </Flex>
                            ) }
                        </Flex>
                    </Box>
                ))
                }

                {/*<FundsTable rows={ props.funds } />*/}

                <Fab onClick={ createNewFund } icon="plus" />

            </Box>
        </Navbar>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(FundMainView);
