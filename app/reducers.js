import moment from 'moment';
import {combineReducers} from 'redux';
import {
    ACTIVATE_FILTER,
    APPEND_FUND,
    DEACTIVATE_ALL_FILTERS,
    DEACTIVATE_FILTER,
    DEQUEUE_ALERT,
    ON_FUND_UPDATE_SUCCESS,
    ON_MULTI_FUND_UPDATE_SUCCESS,
    QUEUE_ALERT,
    REMOVE_CATEGORY,
    REMOVE_FUND,
    SET_ACCOUNTS, SET_APP_PROCESSING,
    SET_AUTH,
    SET_CATEGORIES,
    SET_FUNDS,
    SET_LOADING,
    SET_METADATA,
    SET_MOBILE_VIEW,
    SET_TRANSACTIONS,
    SET_TRANSACTIONS_IN_PROGRESS,
    UPDATE_CATEGORY_SUCCESS,
    UPDATE_TRANSACTION_SUCCESS,
    UPDATE_TRANSACTION_SUCCESS_MULTI
} from './actions/types';
import {Filters} from "./components/global/FilterService";
import {totalAdjustments} from "./utility";
import {navbarState} from "./components/Navbar";

/**
 * Reducers update the state according to the actions they are provided
 */

const initialState = {
    isLoading: true,
    isAppProcessing: false, // Is the app processing data (i.e. saving, deleting, etc)
    transactions: [],
    categories: [],
    accounts: [],
    funds: [],
    metadata: {
        income: 0,
        last_updated: 0
    },
    isMobile: false,
    isAuthenticated: false,
    transactionsInProgress: [] // List of _ids that denote transactions being updated
};

function app(state = initialState, action) {
    switch (action.type) {
        case SET_LOADING:
            return { ...state, isLoading: action.isLoading };

        case SET_APP_PROCESSING:
            return { ...state, isAppProcessing: action.isAppProcessing };

        case SET_AUTH:
            return { ...state, isAuthenticated: action.auth };

        case SET_TRANSACTIONS:
            return { ...state, transactions: action.transactions };

        case UPDATE_TRANSACTION_SUCCESS: // Filter out the updated transaction, and insert the update
            return { ...state, transactions: [...state.transactions.filter(t => t._id.toString() !== action.transaction._id), action.transaction] };

        case UPDATE_TRANSACTION_SUCCESS_MULTI: // Filter out the updated transactions, and insert the updated ones
            return { ...state, transactions: [...state.transactions.filter(t => !action.transactions.map(tr => tr._id.toString()).includes(t._id.toString())), ...action.transactions] };

        case SET_CATEGORIES:
            return { ...state, categories: action.categories };

        case REMOVE_CATEGORY:
            return { ...state, categories: state.categories.filter(b => b._id.toString() !== action._id.toString() )};

        case UPDATE_CATEGORY_SUCCESS:
            return { ...state, categories: [ ...state.categories.filter(c => c._id.toString() !== action.category._id), action.category] };

        case SET_ACCOUNTS:
            return { ...state, accounts: action.accounts };

        case SET_FUNDS:
            return { ...state, funds: action.funds };

        case SET_METADATA:
            return { ...state, metadata: action.metadata };

        case APPEND_FUND:
            return { ...state, funds: [...state.funds, action.fund ] };

        case REMOVE_FUND:
            return { ...state, funds: [...state.funds.filter(f => f._id.toString() !== action.fundId.toString()) ] };

        case ON_FUND_UPDATE_SUCCESS:
            return { ...state, funds: [...state.funds.filter(f => f._id.toString() !== action.fund._id.toString()), action.fund] };

        case ON_MULTI_FUND_UPDATE_SUCCESS:
            const updatedIDs = action.funds.map(f => f._id.toString());
            return { ...state, funds: [...state.funds.filter(f => !updatedIDs.includes(f._id.toString())), ...action.funds] };

        case SET_MOBILE_VIEW:
            return { ...state, isMobile: action.mobileView };

            // TODO: Set this up
        case SET_TRANSACTIONS_IN_PROGRESS:
            return { ...state, transactionsInProgress: action.transactions };

        default:
            return state
    }
}

function filters(state = Filters, action) {
    switch (action.type) {
        case ACTIVATE_FILTER:
            return { ...state, [action.filterName]: { ...Filters[action.filterName], active: true } };
        case DEACTIVATE_FILTER:
            return { ...state, [action.filterName]: { ...Filters[action.filterName], active: false } };
        case DEACTIVATE_ALL_FILTERS:
            return Filters;
        default:
            return state;
    }
}

function alerts(state = [], action) {
    switch (action.type) {
        case QUEUE_ALERT:
            return [ ...state, action.alert ];
        case DEQUEUE_ALERT:
            return state.slice(1);
        default:
            return state;
    }
}

// TRANSACTIONS
export const selectTransactions = state => state.app.transactions;
// TODO: Add this flag so we can alert the user to uncategorized transactions that they should categorize
export const hasUncategorizedTransactions = state => state.app.transactions.filter();

// FILTERS
// filter all filters down to "active" and then return filter value
export const selectActiveFilters = state => Object.keys(state.filters).filter(f => state.filters[f].active).map(fName => state.filters[fName].value);
export const selectFilters = state => state.filters;

// ACCOUNTS
export const selectAccounts = state => state.app.accounts;
export const selectSinkingFundAccount = state => state.app.accounts.filter(a => a.subtype === 'sinking fund');
export const selectFunds = state => state.app.funds.filter(f => f.active);
export const selectFundById = (id, state) => state.app.funds.filter(f => f._id.toString() === id)[0];

// Date format = "YYYY-MM"
export const selectActivatedForMonth = (state, date) => {
    const momen = date ? moment(date).format('YYYY-MM') : moment(selectUserSelectedTimeperiod(state)).format('YYYY-MM');
    return state.app.funds.reduce((prev, curr) => {
        const fundActivatedThisMonth = curr.activated_timeperiod && curr.activated_timeperiod === momen;
        if (fundActivatedThisMonth) {
            return prev + curr.available;
        } else {
            return prev;
        }
    }, 0);
};

export const selectUnaccountedMoneyInSinkingFund = state => {
    // Calculate how much money in the sinking fund is not accounted for (i.e. should be put in a fund)
    let sinkingFundAccount = state.app.accounts.filter(a => a.subtype === 'sinking fund');

    if (!sinkingFundAccount || !sinkingFundAccount.length) {
        throw new Error('Must have a sinking fund account defined!');
    }

    if (sinkingFundAccount.length > 1) {
        throw new Error('Cannot have more than one sinking fund');
    } else {
        sinkingFundAccount = sinkingFundAccount[0];
        const fundBalance = sinkingFundAccount.balances.available;
        const reserved = state.app.funds.reduce((prev, curr) => prev + curr.reserved, 0);

        return fundBalance - reserved - selectActivatedForMonth(state);
    }
};

// ALERTS
export const selectActiveAlert = state => state.alerts[0];
export const selectAlertOpenStatus = state => state.alerts.length > 0;

// METADATA
export const selectIncome = state => state.app.metadata.income;
export const selectAdditionalIncome = state => {
    // Select any funds that have been activated this month
    return state.app.funds
        .filter(f => f.activated_timeperiod === state.app.metadata.selectedTimeperiod)
        .map(f => f.available)
        .filter(Boolean)
        .reduce((prev, curr) => prev + parseFloat(curr), 0);
};
export const selectTimeperiods = state => state.app.metadata.timeperiods;
export const selectUserSelectedTimeperiod = state => state.app.metadata.selectedTimeperiod;

export const selectTotalBudgetedDollars = state => {
    return state.app.categories.reduce((prev, curr) => prev + curr.budgeted, 0);
};

// Categories
export const selectCategories = state => state.app.categories.sort((a, b) => a.name.localeCompare(b.name));
export const listCategoryNames = state => {
    return state.app.categories.map((o) => o.name).sort();
};
export const amountBudgetedForMonth = state => state.app.categories.reduce((acc, curr) => {
    return curr.budgeted + acc;
}, 0);
export const amountSpentThisMonth = state => state.app.categories.reduce((acc, curr) => {
    return curr.spent + acc + totalAdjustments(curr);
}, 0);

export const isMobileView = state => state.app.isMobile;
export const isAuthenticated = state => state.app.isAuthenticated;
export const isAppLoading = state => state.app.isLoading;
export const isAppProcessing = state => state.app.isAppProcessing;

const rootReducer = combineReducers({ app, filters, alerts, navbarState });
export default rootReducer;
