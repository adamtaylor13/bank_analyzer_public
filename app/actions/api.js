import {
    addNewCategory,
    appendFund,
    onFundUpdateSuccess,
    onMultiFundUpdateSuccess,
    queueAlert,
    removeCategory,
    removeFund,
    setAccounts,
    setAppProcessing,
    setAuth,
    setCategories,
    setFunds,
    setMetadata,
    setTransactions,
    updateCategorySuccess,
    updateTransactionSuccess,
    updateTransactionSuccessMulti
} from "./actions";
import {authenticateUser} from "./authCookie";

let apiUrl;
if (process.env.API_URL) {
    apiUrl = `${process.env.API_URL}`;
} else {
    apiUrl = 'http://localhost:8081/api';
}

let PORT = process.env.PORT;
console.log('PORT', PORT);
console.log('apiUrl', apiUrl);

const handleApiError = dispatch => async (res) => {
    if (res.status === 403) {
        // Forward to login screen
        dispatch(setAuth(false));
    }

    if (!res.ok) {
        let text = await res.text();
        throw Error(`(${res.status}) ${text}`);
    } else {
        return res;
    }
};

const handlePromiseError = dispatch => err => {
    console.log(err);
    dispatch(queueAlert({
        variant: 'error',
        message: err.toString(),
        timeout: 8000
    }));
    dispatch(setAppProcessing(false));
};

const handleApiSuccess = (res) => {
    return res.json();
};

const soFetch = (url, onSuccess, config = {}) => dispatch => {
    return fetch(apiUrl + url, config)
        .then(handleApiError(dispatch))
        .then(handleApiSuccess)
        .then(onSuccess(dispatch))
        .then(() => {
            dispatch(setAppProcessing(false))
        })
        .catch(handlePromiseError(dispatch));
};

export const login = (authObj) => {
    return soFetch('/auth/login', dispatch => json => {
        dispatch(authenticateUser());
    }, {
        method: 'post',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authObj),
        credentials: 'include',
    })
};

// --------------------------- GET ----------------------------
export const fetchCategories = () => {
    return soFetch(`/categories`,
        (dispatch) => (json) => {
        dispatch(setCategories(json));
    });
};

export const fetchTransactions = (justThisMonth)  =>  {
    return soFetch(`/transactions${justThisMonth ? `?justThisMonth=true` : ''}`,
        dispatch => json => dispatch(setTransactions(json)));
};

export const fetchSyncTransactions = () => {
    return soFetch('/transactions/sync', dispatch => json => {
        dispatch(queueAlert(json));
        return dispatch(fetchTransactions(true));
    });
};

export const fetchAccounts = () => {
    return soFetch(`/accounts`,
        dispatch => json => {
            dispatch(setAccounts(json));
        });
};

export const fetchFunds = () => {
    return soFetch(`/funds`,
        dispatch => json => {
            dispatch(setFunds(json));
        });
};

export const fetchMetadata = () => {
    return soFetch(`/metadata`,
        dispatch => json => {
            dispatch(setMetadata(json));
        });
};

export const syncAccounts = () => {
    return soFetch(`/accounts/sync`,
        dispatch => json => {
            dispatch(setAccounts(json));
        });
};

// ------------------------------------------------------------

// --------------------------- POST ----------------------------
export const createCategory = (category) => {
    return soFetch(`/categories`,
        dispatch => json => {
            dispatch(addNewCategory(json));
            dispatch(queueAlert({
                variant: 'success',
                message: 'Created new category'}));
            dispatch(fetchCategories());
        }, {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(category)
        });
};

export const createNewFund = (fund) => {
    return soFetch(`/funds`,
        dispatch => json => {
            dispatch(appendFund(json));
            dispatch(queueAlert({ variant: 'success', message: 'Created new fund' }));
        }, {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fund)
        });
};

// TODO: Remove this feature?
export const uploadReceipt = (receipt, _id) => {
    let form = new FormData();
    form.append('receipt', receipt);
    form.append('_id', _id);
    return soFetch(`/transactions/receipt`,
        dispatch => json => {
            dispatch(updateTransactionSuccess(json.data[0]));
        }, {
            method: 'post',
            body: form,
        });
};

// ------------------------------------------------------------

// --------------------------- DELETE -------------------------
export const deleteCategory = (categoryId, includeFund) => {
    console.log('includeFund', includeFund);
    return soFetch(`/categories/${categoryId}?includeFund=${includeFund}`,
        dispatch => json => {
            dispatch(removeCategory(json.data));
        }, {
            method: 'delete',
            headers: { "Content-Type": "application/json" },
        });
};

export const deleteTransaction = transactionId => {
    return soFetch(`/transactions/${transactionId}`,
        dispatch => json => {
            dispatch(queueAlert(json));
            dispatch(fetchCategories());
            dispatch(fetchTransactions());
        }, {
            method: 'delete',
            headers: { "Content-Type": "application/json" }
        });
};

export const deleteFund = (fundId) => {
    return soFetch(`/funds/${fundId}`,
        dispatch => json => {
            dispatch(removeFund(json.data));
        }, {
            method: 'delete',
            headers: { "Content-Type": "application/json" },
        });
};

// ------------------------------------------------------------

// --------------------------- PUT ----------------------------
export const updateCategory = (category) => {
    return soFetch(`/categories`,
        dispatch => json => {
            dispatch(updateCategorySuccess(json.data));
            dispatch(queueAlert(json));
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(category)
        });
};

export const updateTransaction = transaction => {
    return soFetch('/transactions',
        dispatch => json => {
            dispatch(fetchCategories()); // Update categories on transaction update
            dispatch(queueAlert(json));
            dispatch(updateTransactionSuccess(json.data[0]));
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transaction)
        });
};

export const updateTransactionsMulti = transactions => {
    return soFetch('/transactions/multi',
        dispatch => json => {
            dispatch(fetchCategories()); // Update categories on transaction update
            dispatch(queueAlert(json));
            dispatch(updateTransactionSuccessMulti(json.data));
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transactions)
        });
};

export const updateAccount = (account) => {
    return soFetch(`/accounts`,
        dispatch => json => {
            dispatch(setAccounts(json));
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(account)
        });
};

export const updateFund = (fund) => {
    return soFetch('/funds',
        dispatch => json => {
            dispatch(onFundUpdateSuccess(json.data[0]));
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fund)
        });
};

export const updateFunds = (funds) => {
    return soFetch('/funds/multi',
        dispatch => json => {
            dispatch(onMultiFundUpdateSuccess(json.data));
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(funds)
        });
};

export const removeAdjustment = (_id, category) => {
    return soFetch(`/categories/remove-adjustment`,
        dispatch => ([one, two]) => {
            dispatch(updateCategorySuccess(one.data));
            dispatch(updateCategorySuccess(two.data));
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: _id.toString(), category })
        });
};

export const activateFund = (fundId, amount) => {
    return soFetch(`/funds/activate`,
        dispatch => json => {
            dispatch(fetchCategories());
            dispatch(fetchFunds());
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fundId, amount })
        });
};

export const updateSelectedTimePeriod = (timeperiod) => {
    return soFetch(`/metadata/timeperiod`,
        dispatch => json => {
            dispatch(setMetadata(json.value))
            dispatch(fetchCategories());
            dispatch(fetchTransactions(true));
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(timeperiod)
        });
};

export const updateIncome = (income) => {
    return soFetch(`/metadata/income`,
        dispatch => json => {
            dispatch(setMetadata(json.value));
        }, {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(income)
        });
};
// ------------------------------------------------------------

export const initApp = () => dispatch => {
    let startupCalls = [dispatch(fetchCategories()), dispatch(fetchTransactions(true)), dispatch(fetchAccounts()), dispatch(fetchFunds()), dispatch(fetchMetadata())];
    Promise.all(startupCalls).then(res => {
        dispatch({ type: 'SET_LOADING', isLoading: false});
    });
};

