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
        this.PLAID_ACCESS_TOKEN = null;

        this.CLIENT = new plaid.Client({
            clientID: this.PLAID_CLIENT_ID,
            secret: this.PLAID_SECRET,
            env: plaid.environments.sandbox,
            options: {
                version: '2018-05-22'
            },
        });
    }

    async getAccessToken() {
        const self = this;

        return self.PLAID_ACCESS_TOKEN ? self.PLAID_ACCESS_TOKEN : // Use fetched token if we have it
            new Promise(async (resolve, reject) => {
                try {
                    const publicTokenResponse = await this.CLIENT.sandboxPublicTokenCreate('ins_109508', ['transactions']);
                    const publicToken = publicTokenResponse.public_token;

                    // The generated public_token can now be exchanged for an access_token
                    const exchangeTokenResponse = await this.CLIENT.exchangePublicToken(publicToken);
                    const accessToken = exchangeTokenResponse.access_token;
                    self.PLAID_ACCESS_TOKEN = accessToken;
                    resolve(accessToken);
                } catch (err) {
                    console.error('Error while fetching access_token:', err);
                    reject(err);
                }
            });
    }

    async getAccountsFromAPI() {
        return new Promise(async (resolve, reject) => {
            let accessToken = await this.getAccessToken();
            this.CLIENT.getAccounts(accessToken, async function(error, result) {
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

    async fetchTransactions(count = 250) {
        const startYear = moment().startOf('year').subtract(5, 'years').format('YYYY-MM-DD');
        const endDate = moment().format('YYYY-MM-DD'); // Today

        return new Promise(async (resolve, reject) => {
            let accessToken = await this.getAccessToken();
            this.CLIENT.getTransactions(accessToken, startYear, endDate, {
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

