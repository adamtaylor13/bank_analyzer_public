/**
 * NOTE: We may be getting hit double with the bills + credit card payments because
 * we use auto payment and we could those transactions (from the credit card accounts)
 * i.e. NOT CHECKING_ACCOUNT_ID
 *
 * So perhaps logic should not include credit card payments in order to avoid counting
 * the transactions themselves PLUS the paying off of those transactions.
 */

export const noTransfers = trans => {
    let b = !trans.category.includes('Transfer');
    if (!b) {
        // Don't block rent payments!
        return trans.category.includes('Withdrawal') || trans.name.toLowerCase().includes('vanderbilt');
    }
    return b;
};

// No credits to the sinking fund account
export const noFundCredits = trans => {
    return !trans.category.includes('Transfer')
        || !trans.category.includes('Credit')
        || trans.account_id !== process.env.SINKING_FUND_ACCOUNT_ID;
};

// Dont' show credit card payments
export const noCreditCardPayments = trans => {
    let isReceivedPayment = trans.account_id === process.env.CREDIT_CARD_ACCOUNT_ID
                            && trans.amount < 0
                            && trans.name.includes('CREDIT CARD PAYMENT');
    let isPayment = trans.account_id === process.env.CHECKING_ACCOUNT_ID
                    && trans.name.includes('CREDIT CARD PAYMENT');
    // Negative logic because we're filtering those OUT
    return !(isReceivedPayment || isPayment);
};

/**
 * This should not be confused with filtering
 * transactions that CONTAIN an offset. This only
 * filters out transactions which ARE an offset.
 */
export const noOffsetTransactions = (trans) => {
    return !trans.is_offset_transaction;
};

export const noInterestPaid = (trans) => {
    return trans.name.toUpperCase() !== 'INTEREST PAID';
};

/**
 * Pretty goofy. Filter transactions with amounts between -2000 & -2800
 * So we include tax refunds, but don't include paychecks.
 */
export const noPaychecks = (trans) => {
    return !(trans.amount < -2000 && trans.amount > -2800);
};

/**
 * This 0-based month index just like new Date()
 * @param month Number
 */
export const byMonth = month => transaction => {
    const transactionMonth = new Date(transaction.date).getUTCMonth();
    return month === transactionMonth;
};

export const thisMonth = byMonth(new Date().getMonth());

export const uncategorizedTransactionsOnly = trans => {
    return trans.budget_category === undefined;
};

export const isOffset = bool => trans => {
    return bool ? trans.is_offset_transaction : !trans.is_offset_transaction;
};

export const isPending = trans => {
    return trans.pending === true;
};

export const withoutId = _id => doc => {
    return doc._id.toString() !== _id.toString();
};

export const filterObjectIDs = idToFilter => passedInID => {
    return idToFilter.toString() !== passedInID.toString();
};

