/* global describe, test, it, beforeAll, afterAll, beforeEach, afterEach, expect */
import "core-js/stable";
import "regenerator-runtime/runtime";
import TestDbHelper from "../app/testUtils/testDbHelper";
import Transaction from "../server/models/Transaction";
import createSampleTransactions from "../app/testUtils/createSampleTransactions";

jest.mock('../server/models/Metadata.js', function() {
    const { default: mockTransactionService } = jest.requireActual('./Metadata');
    mockTransactionService.prototype.fetchTransactionsFromAPI = function () {
        return [{
            account_id : "78R8Z74EkDTyYaaxZD3rSm6dwO8KApiQXL7Xg",
            account_owner: null,
            amount : 5000,
            category : [ "Chuck Norris" ],
            category_id : "13005023",
            date : "2019-07-19",
            iso_currency_code: 'USD',
            location: {
                address: null,
                city: null,
                lat: null,
                lon: null,
                state: null,
                store_number: null,
                zip: null
            },
            name : "Adams Super Cool Metadata",
            payment_meta: {
                by_order_of: null,
                payee: null,
                payer: null,
                payment_method: null,
                payment_processor: null,
                ppd_id: null,
                reason: null,
                reference_number: null
            },
            pending: false,
            pending_transaction_id: "4aNazoeg30tqX55QjOnDI77pYe9DpmFkawRBx",
            transaction_id : "thisissuperunique",
            transaction_type: 'place',
            unofficial_currency_code: null
        }]
    };
    return mockTransactionService;
});

const dbHelper = new TestDbHelper();

beforeAll(async () => {
    await dbHelper.start();
});

afterAll(async () => {
    await dbHelper.stop();
});

let TransactionService;
let { regularTransaction, pendingTransaction, transactionWithOffsets, offsetCreditTransaction, transferTransaction, apiTransaction } = {};
beforeEach(async () => {
    TransactionService = new Transaction(dbHelper.db);
    ({ regularTransaction, pendingTransaction, transactionWithOffsets, offsetCreditTransaction, transferTransaction, apiTransaction } = await createSampleTransactions(dbHelper));
});

afterEach(async () => {
    await dbHelper.cleanup();
});

describe('calls from API', () => {
    test('dummy', async () => {
        expect(true).toBe(true);
//         // ORDER IS IMPORTANT WHEN SPYING
//         let spy = jest.spyOn(TransactionService, 'fetchTransactionsFromAPI');
//         let [ pending, update ] = await TransactionService.syncTransactionsInDB();
//         // console.log('pending', pending);
//         // console.log('update', update);
//         // expect(spy).toHaveBeenCalledTimes(1);
//         // expect(update.message).toBe('Saved 1 new transactions');
    });
});

