import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import withTransactions from "./withTransactions";
import {selectActiveFilters} from "../../reducers";

const mapStateToProps = state => {
    return { globalFilters: selectActiveFilters(state) }
};

const getFilteredTransactions = (filters, transactions) => {
    return filters.reduce((results, filter) => results.filter(filter), transactions);
};

const withFilter = (WrappedComponent) => (props) => {
    let { transactions, passedFilters, globalFilters, ...rest } = props;
    passedFilters = passedFilters ? passedFilters : [];
    const filters = [...passedFilters, ...globalFilters];
    return (
        <WrappedComponent transactions={ getFilteredTransactions(filters, transactions) } { ...rest } />
    )
};

export default compose(
    withTransactions,
    compose(
        connect(mapStateToProps), withFilter
    )
);

