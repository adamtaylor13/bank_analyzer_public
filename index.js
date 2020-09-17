import Plaid from './app/plaid-api';
console.log('==>> Plaid', Plaid);

const api = new Plaid(true);

api.fetchTransactions();
api.getAccountsFromAPI();
