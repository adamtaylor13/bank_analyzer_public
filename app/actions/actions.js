import {
    ACTIVATE_FILTER, ADD_CATEGORY,
    APPEND_FUND,
    DEACTIVATE_ALL_FILTERS,
    DEACTIVATE_FILTER,
    DEQUEUE_ALERT, ON_FUND_UPDATE_SUCCESS, ON_MULTI_FUND_UPDATE_SUCCESS,
    QUEUE_ALERT, REMOVE_CATEGORY,
    REMOVE_FUND,
    SET_ACCOUNTS, SET_APP_PROCESSING, SET_AUTH,
    SET_CATEGORIES,
    SET_FUNDS, SET_METADATA, SET_MOBILE_VIEW,
    SET_TRANSACTIONS, UPDATE_CATEGORY_SUCCESS,
    UPDATE_TRANSACTION_SUCCESS, UPDATE_TRANSACTION_SUCCESS_MULTI
} from "./types";

export function setAuth(auth) {
    return { type: SET_AUTH, auth };
}

export function setCategories(categories) {
    return { type: SET_CATEGORIES, categories }
}

export function setTransactions(transactions) {
    return { type: SET_TRANSACTIONS, transactions }
}

export function activateFilter(filterName) {
    return { type: ACTIVATE_FILTER, filterName }
}

export function deactivateFilter(filterName) {
    return { type: DEACTIVATE_FILTER, filterName }
}

export function deactivateAllFilters() {
    return { type: DEACTIVATE_ALL_FILTERS }
}

export function setAccounts(accounts) {
    return { type: SET_ACCOUNTS, accounts };
}

export function setFunds(funds) {
    return { type: SET_FUNDS, funds };
}

export function appendFund(fund) {
    return { type: APPEND_FUND, fund };
}

export function removeFund(fundId) {
    return { type: REMOVE_FUND, fundId };
}

export function queueAlert(alert) {
    console.log('alert', alert);
    return { type: QUEUE_ALERT, alert };
}

export function dequeueAlert() {
    return { type: DEQUEUE_ALERT };
}

export function updateTransactionSuccess(transaction) {
    return { type: UPDATE_TRANSACTION_SUCCESS, transaction };
}

export function updateTransactionSuccessMulti(transactions) {
    return { type: UPDATE_TRANSACTION_SUCCESS_MULTI, transactions };
}

export function onFundUpdateSuccess(fund) {
    return { type: ON_FUND_UPDATE_SUCCESS, fund };
}

export function onMultiFundUpdateSuccess(funds) {
    return { type: ON_MULTI_FUND_UPDATE_SUCCESS, funds };
}

export function removeCategory(_id) {
    return { type: REMOVE_CATEGORY, _id };
}

export function updateCategorySuccess(category) {
    return { type: UPDATE_CATEGORY_SUCCESS, category };
}

export function setMetadata(metadata) {
    return { type: SET_METADATA, metadata };
}

export function setMobileView(mobileView) {
    return { type: SET_MOBILE_VIEW, mobileView };
}

export function addNewCategory(category) {
    return { type: ADD_CATEGORY, category };
}

export function setAppProcessing(isAppProcessing) {
    return { type: SET_APP_PROCESSING, isAppProcessing };
}
