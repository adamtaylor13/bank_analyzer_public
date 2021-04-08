import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {selectTransactions} from "../../reducers";

const mapStateToProps = state => {
    return { transactionsFromState: selectTransactions(state) }
};

const withTransactions = (WrappedComponent) => (props) => {
    return <WrappedComponent transactions={ props.transactionsFromState } { ...props } />;
};

export default compose(
    connect(mapStateToProps, null),
    withTransactions
);
