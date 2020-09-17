'use strict';

import envvar from 'envvar';
import moment from 'moment';
import plaid from 'plaid';

export default class Plaid {
    constructor(debug = true) {
        this.PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
        this.PLAID_SECRET = process.env.PLAID_SECRET;
        this.PLAID_PUBLIC_KEY = process.env.PLAID_PUBLIC_KEY;
        this.PLAID_ENV = envvar.string('PLAID_ENV', 'development');
        this.PLAID_PRODUCTS = envvar.string('PLAID_PRODUCTS', 'transactions');
        this.PLAID_ACCESS_TOKEN = process.env.PLAID_ACCESS_TOKEN;

        this.CLIENT = new plaid.Client(
            this.PLAID_CLIENT_ID,
            this.PLAID_SECRET,
            this.PLAID_PUBLIC_KEY,
            plaid.environments[this.PLAID_ENV],
            {version: '2018-05-22'}
        );

        this.debugMode = debug;
    }

    getAccountsFromAPI() {
        return new Promise((resolve, reject) => {
            this.CLIENT.getAccounts(this.PLAID_ACCESS_TOKEN, async function(error, result) {
                if (error != null) {
                    reject(error);
                } else {
                    let accounts = result.accounts;
                    resolve(accounts);
                }
            }).catch(reason => {
                reject(reason);
            });
        });
    }

    fetchTransactions(count = 250) {
        const startYear = moment().startOf('year').subtract(5, 'years').format('YYYY-MM-DD');
        const endDate = moment().format('YYYY-MM-DD'); // Today

        return new Promise((resolve, reject) => {
            this.CLIENT.getTransactions(this.PLAID_ACCESS_TOKEN, startYear, endDate, {
                count: count,
                offset: 0,
            }, async function(error, transactionsResponse) {
                if (error != null) {
                    reject(error);
                } else {
                    let transactions = transactionsResponse.transactions;
                    resolve(transactions);
                }
            }).catch(reason => {
                reject(reason);
            });
        });
    }
}

