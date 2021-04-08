import React from 'react';
import {connect} from 'react-redux';
import {Box, Heading, Text,} from 'rebass';
import {selectAccounts, selectActivatedForMonth, selectIncome} from "../../reducers";
import Navbar from "../Navbar";
import PaperBox from "../styled-components/PaperBox";
import TwoColRow from "../styled-components/TwoColRow";
import ToDollars from "../styled-components/ToDollars";
import {toDollars} from "../../utility";

const mapStateToProps = state => {
    return {
        accounts: selectAccounts(state),
        income: selectIncome(state),
        selectActivatedForMonth: selectActivatedForMonth(state),
    }
};

/*
TODO: I need a way to make all the logic around projections
    dynamic so that others can define other accounts that should
    be projected.
 */

const AccountsList = (props) => {
    console.log('props', props);

    const buffer = 1000;

    return (
        <Navbar label={'Accounts'}>
            { props.accounts.map(a => (
                <PaperBox key={a._id} mb={3}>
                    <Box>
                        <TwoColRow col1={<Heading fontSize={3}>{a.name}</Heading>}
                                   col2={<Text fontSize={1}>{a.subtype}</Text>}/>

                        <Box mt={3}>
                            <TwoColRow col1={<Text>Balance:</Text>}
                                       col2={<ToDollars>{a.balances.current}</ToDollars>}/>

                            { a.subtype === 'sinking fund' ? (
                                <TwoColRow col1={<Text>Allocated This Month:</Text>}
                                           col2={<ToDollars>{props.selectActivatedForMonth}</ToDollars>}/>
                            ) : null }

                            { a.balances.available !== a.balances.current ? (
                                <TwoColRow col1={<Text>Available:</Text>}
                                           col2={<ToDollars>{a.balances.available}</ToDollars>}/>
                            ) : null }

                            { a.type.includes('credit') ? (
                                <TwoColRow col1={<Text>Limit:</Text>}
                                           col2={<ToDollars>{a.balances.limit}</ToDollars>}/>
                            ) : null }

                            { a.account_id === '78R8Z74EkDTyYaaxZD3rSm6dwO8KApiQXL7Xg' ? (
                                <Box mt={3}>
                                    <Text>Buffer: { toDollars(buffer)}</Text>
                                    <Text>Income: { toDollars(props.income) }</Text>
                                    <Text>Projection: { toDollars(a.balances.current - props.accounts.filter(a => a.type.includes('credit')).reduce((prev, curr) => prev + curr.balances.current, 0) - buffer) } (bal - cred - buff)</Text>
                                </Box>
                            ) : null }

                        </Box>
                    </Box>
                </PaperBox>
            )) }
        </Navbar>
    );
};

export default connect(mapStateToProps, null)(AccountsList);
