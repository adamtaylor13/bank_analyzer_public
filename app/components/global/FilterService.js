import {
    isOffset, isPending,
    noCreditCardPayments, noFundCredits,
    noInterestPaid,
    noPaychecks, noTransfers,
    uncategorizedTransactionsOnly
} from "../../../server/filters";

export const Filters = {
    uncategorized: {
        label: 'Uncategorized',
        active: false,
        value: uncategorizedTransactionsOnly,
    },
    // isOffset: {
    //     active: false,
    //     value: isOffset(true),
    // },
    // isNotOffset: {
    //     active: false,
    //     value: isOffset(false),
    // },
    isPending: {
        label: 'Pending',
        active: false,
        value: isPending,
    },
    noInterest: {
        label: 'No Interest Transactions',
        active: true,
        value: noInterestPaid,
    },
    noPaychecks: {
        label: 'No Paychecks',
        active: true,
        value: noPaychecks,
    },
    noCCPayments: {
        label: 'No Credit Card Payments',
        active: true,
        value: noCreditCardPayments,
    },
    noTransfers: {
        label: 'No Transfers',
        active: false,
        value: noTransfers
    },
    noSinkingFundCredits: {
        // Explanation: We do not need/want to show when money enters the sinking fund,
        // because we'll see that in the accounts overview. We don't need to necessarily
        // track the individual credit. But the DEBIT on the other hand we want to account
        // for because it's "money out" of the budget so to speak.
        label: 'No Fund Credits',
        active: true,
        value: noFundCredits
    }
};

export const activateFilter = filterName => {
    Filters[filterName].active = true;
};

export const deactivateFilter = filterName => {
    Filters[filterName].active = false;
};

export const resetFilters = () => {
    Filters.forEach(f => {
        f.active = false;
    });
};

function filtersAsArray() {
    return Object.keys(Filters).map(fName => Filters[fName]);
}

export const getActiveFilterNames = () => {
    return filtersAsArray().filter(f => f.active);
};

export const applyFilters = (transactions) => {
    filtersAsArray().filter(f => f.active).forEach(f => {
        transactions = transactions.filter(f.value);
    });
    return transactions;
};


export const getFilters = () => Filters;


// Things you can "do" to a filter:
// - Activate a filter
// - Deactivate a filter
// - Deactivate all filters
