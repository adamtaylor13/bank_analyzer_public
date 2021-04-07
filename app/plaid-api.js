'use strict';

import envvar from 'envvar';
import moment from 'moment';
import plaid from 'plaid';

export default class Plaid {
    constructor(debug = true) {
        this.PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
        this.PLAID_SECRET = process.env.PLAID_SECRET;
        this.PLAID_ENV = envvar.string('PLAID_ENV', 'development');
        this.PLAID_PRODUCTS = envvar.string('PLAID_PRODUCTS', 'transactions');

        this.CLIENT = new plaid.Client({
            clientID: this.PLAID_CLIENT_ID,
            secret: this.PLAID_SECRET,
            env: plaid.environments.sandbox,
            options: {
                version: '2018-05-22'
            },
        });

        const configs = {
            user: {
                // This should correspond to a unique id for the current user.
                client_user_id: 'user-id',
            },
            client_name: 'Bank Analyzer',
            products: ['transactions'],
            country_codes: ['US'],
            language: 'en',
        };

        let self = this;
        this.CLIENT.createLinkToken(configs, function (error, createTokenResponse) {
            if (error != null) {
                // TODO: Handle it
                console.log('error', error);
            }
            console.log('createTokenResponse', createTokenResponse);
            self.PLAID_ACCESS_TOKEN = createTokenResponse.link_token;
        });
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

