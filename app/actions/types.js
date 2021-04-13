/**
 * Actions represent "facts" about what happened to our state
 */

// APP-READY
export const SET_LOADING = 'SET_LOADING';
export const SET_APP_PROCESSING = 'SET_APP_PROCESSING';

// Authentication
export const SET_AUTH = 'SET_AUTH';

// Categories
export const SET_CATEGORIES = 'SET_CATEGORIES';
export const REMOVE_CATEGORY = 'REMOVE_CATEGORY';
export const UPDATE_CATEGORY_SUCCESS = 'UPDATE_CATEGORY_SUCCESS';
export const ADD_CATEGORY = 'ADD_CATEGORY';

// Transactions
export const SET_TRANSACTIONS = 'SET_TRANSACTIONS';
export const UPDATE_TRANSACTION_SUCCESS = 'UPDATE_TRANSACTION_SUCCESS';
export const UPDATE_TRANSACTION_SUCCESS_MULTI = 'UPDATE_TRANSACTION_SUCCESS_MULTI';
export const SET_TRANSACTIONS_IN_PROGRESS = 'SET_TRANSACTIONS_IN_PROGRESS';

// Accounts
export const SET_ACCOUNTS = 'SET_ACCOUNTS';

// Filters
export const ACTIVATE_FILTER = 'ACTIVATE_FILTER';
export const DEACTIVATE_FILTER = 'DEACTIVATE_FILTER';
export const TOGGLE_FILTER = 'TOGGLE_FILTER';
export const DEACTIVATE_ALL_FILTERS = 'DEACTIVATE_ALL_FILTERS';

// Funds
export const SET_FUNDS = 'SET_FUNDS';
export const APPEND_FUND = 'APPEND_FUND';
export const REMOVE_FUND = 'REMOVE_FUND';
export const ON_FUND_UPDATE_SUCCESS = 'ON_FUND_UPDATE_SUCCESS';
export const ON_MULTI_FUND_UPDATE_SUCCESS = 'ON_MULTI_FUND_UPDATE_SUCCESS';

// Alerts
export const QUEUE_ALERT = 'QUEUE_ALERT';
export const DEQUEUE_ALERT = 'DEQUEUE_ALERT';

// Metadata
export const SET_METADATA = 'SET_METADATA';

// Mobile View
export const SET_MOBILE_VIEW = 'SET_MOBILE_VIEW';
