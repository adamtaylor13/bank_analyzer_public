/* global describe, test, it, beforeAll, afterAll, beforeEach, afterEach, expect */
import "core-js/stable";
import "regenerator-runtime/runtime";
import {ObjectID} from 'mongodb';
import TestDbHelper from "../app/testUtils/testDbHelper";
import Transaction from "../server/models/Transaction";
import createSampleTransactions from "../app/testUtils/createSampleTransactions";

jest.mock('./Metadata', function() {
    const { default: mockTransactionService } = jest.requireActual('./Metadata');
    mockTransactionService.prototype.fetchTransactionsFromAPI = function () {
        return [
            {
                amount : 50,
                budget_category : "Eating Out",
                date : "2019-06-03",
                name : "Adam is cool",
                pending : false,
                pending_transaction_id: 'trans_id_for_pending_trans_adam_is_cool',
                transaction_id : "non-pending_id_for_adam_is_cool",
            }
        ]
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

describe("findById", () => {
    test("should return the correct document by ID", async () => {
        // 2. Call the method under test with the parameters needed for the desired outcome
        const result = await TransactionService.findById(regularTransaction._id);

        // 3. Make assertions on the result
        expect(result).toMatchObject(regularTransaction);
    });

    test("should return null if a document with the provided ID could not be found", async () => {
        const result = await TransactionService.findById("123456789123");
        expect(result).toBeNull();
    });
});

describe("findByIds", () => {
    test("should return the correct documents by ID", async () => {
        const result = await TransactionService.findByIds([regularTransaction._id, pendingTransaction._id]);
        expect(result).toMatchObject([regularTransaction, pendingTransaction]);
    });

    test("should return empty array if documents with the provided IDs could not be found", async () => {
        const result = await TransactionService.findByIds(["123456789123"]);
        expect(result).toEqual([]);
    });
});

describe("findByDate", () => {
    test('gets transactions by Date object', async () => {
        let response = await TransactionService.findByDate(new Date('05-20-2019'));
        expect(response.length).toBe(1);
    });

    test('gets transactions by string regex', async () => {
        let response = await TransactionService.findByDate('2019-05');
        expect(response.length).toBe(5);
    });
});

describe("insert behavior", () => {
    test('inserting with _id does not create different _id', async () => {
        expect(offsetCreditTransaction._id).toEqual(ObjectID("5cf10e35aa434d72f1e47d5e"));
        expect(offsetCreditTransaction.name).toBe("2044007375 - Zelle: Ruth Taylor");
    });
});

describe('get behavior', () => {
    test('getting a transaction with offsets appends the offsets', async () => {
        let response = await TransactionService.findById(transactionWithOffsets._id);

        expect(response.offsets[0].name).toBe("2044007375 - Zelle: Ruth Taylor");
        expect(response.offsets[0].amount + response.original_amount).toBe(response.amount);
    });
});

describe('updateTransactions()', () => {
    test('should update multiple transactions', async () => {
        regularTransaction.budget_category = 'yo momma';
        pendingTransaction.pending = false;
        let response = await TransactionService.updateTransactions([regularTransaction, pendingTransaction]);
        expect(response.variant).toBe('success');

        let [ t1, t2 ] = await TransactionService.findByIds([regularTransaction._id, pendingTransaction._id]);
        expect(t1.budget_category).toBe('yo momma');
        expect(t2.pending).toBe(false);
    });

    test('should update single transaction', async () => {
        regularTransaction.account_owner = 'yo momma';
        let response = await TransactionService.updateTransactions(regularTransaction);
        expect(response.variant).toBe('success');

        let t1 = await TransactionService.findById(regularTransaction._id);
        expect(t1.account_owner).toBe('yo momma');
    });

    test('should handle string and ObjectIDs correctly', async () => {
        regularTransaction.name = 'hello';
        expect(regularTransaction._id).toHaveProperty('_bsontype');
        expect(regularTransaction._id._bsontype).toBe('ObjectID');
        let res = await TransactionService.updateTransactions(regularTransaction);
        expect(res.variant).toBe('success');

        regularTransaction.name = 'goodbye';
        regularTransaction._id = regularTransaction._id.toString();
        expect(typeof regularTransaction._id).toBe('string');
        res = await TransactionService.updateTransactions(regularTransaction);
        expect(res.variant).toBe('success');
    });
});

describe('updatePendingTransactions', () => {
    test('should update pending transaction with incoming API transaction', async () => {
        let response = await TransactionService.updatePendingTransactions([apiTransaction]);
        expect(response.variant).toBe('success');
        expect(response.message.includes(1)).toBe(true);

        let t = await TransactionService.findById(pendingTransaction._id);
        expect(t.pending).toBe(false);
        expect(t.pending_transaction_id).toBe("4aNazoeg30tqX55QjOnDI77pYe9DpmFkawRBx");
        expect(t.amount).toBe(apiTransaction.amount);
        expect(t.transaction_id).toBe(apiTransaction.transaction_id);
    });

    test('should correctly handle updating offset amounts for pending transactions', async () => {
        let preOffset = { ...transactionWithOffsets, _id: ObjectID('djfhkjq876tg'), pending: true, original_amount: 1000, amount: 0, transaction_id: '1' };
        let { _id } = await dbHelper.createDoc(TransactionService.collectionName, preOffset);

        let res = await TransactionService.findById(_id);
        expect(res.pending).toBe(true);

        let incoming = { ...transactionWithOffsets, _id: ObjectID('somethinguni'), offsets: undefined, amount: 1000.88, pending_transaction_id: '1' };
        await TransactionService.updatePendingTransactions([ incoming ]);
        let [ response ]  = await TransactionService.findByQuery({ pending_transaction_id: '1' });
        expect(response.amount).toEqual(transactionWithOffsets.amount);
    });

    test('should match pending transactions without being able to match transaction IDs', async () => {
        const existingPendingTransaction = await dbHelper.createDoc(TransactionService.collectionName, {
            amount : 32.89,
            date : "2019-06-03",
            name : "Home Depot",
            pending : true,
            transaction_id : "6JbJ9g4QKEs3ommrbQ4YHKbdaLL1yxUa4QOA3",
        });

        const incomingTransaction = await dbHelper.createDoc(TransactionService.collectionName, {
            amount : 32.89,
            date : "2019-06-03",
            name : "Home Depot",
            pending : false,
            pending_transaction_id : null,
            transaction_id : "epypBk7oqXTkEvv0ZKOMIz5kLrYVdxfd8r330",
        });

        let response = await TransactionService.updatePendingTransactions([incomingTransaction]);
        expect(response.variant).toBe('success');
        expect(response.message).toBe('Successfully updated 1 transactions');

        let res = await TransactionService.findById(existingPendingTransaction._id);
        // Migrated the transaction id to pending
        expect(res).toHaveProperty('pending_transaction_id', existingPendingTransaction.transaction_id);
    });
});

describe('offsetTransaction', () => {
    test('should offset transaction correctly', async () => {
        let offsetTransaction = { ...regularTransaction, amount: -150, _id: '456789oiujhg' };
        await dbHelper.createDoc(TransactionService.collectionName, offsetTransaction);
        let response = await TransactionService.offsetTransaction(regularTransaction._id, offsetTransaction._id);
        expect(response.message.includes('Successfully offset transaction')).toBe(true);
        expect(parseFloat(response.data.amount.toFixed(2))).toBe(3.84);
    });

    test('should not offset with a debit', async () => {
        let response = await TransactionService.offsetTransaction(regularTransaction._id, pendingTransaction._id);
        expect(response.variant).toBe('error');
        expect(response.message.includes('Cannot offset with a debit')).toBe(true);
    });

    test('should not offset with nonexistent transactions', async () => {
        let response = await TransactionService.offsetTransaction(regularTransaction._id, 'literal gobledygook');
        expect(response.variant).toBe('error');
        expect(response.message.includes('Did not find a matching transaction and offsetTransaction')).toBe(true);

        response = await TransactionService.offsetTransaction('actual gobledygook', pendingTransaction._id);
        expect(response.variant).toBe('error');
        expect(response.message.includes('Did not find a matching transaction and offsetTransaction')).toBe(true);
    });
});

describe('mapOffsets()', () => {
    test('should map offset by default', async () => {
        let tWithOffsets = await TransactionService.findById(transactionWithOffsets._id);
        expect(tWithOffsets.offsets[0]).toHaveProperty('amount');
        expect(tWithOffsets.offsets[0]).toHaveProperty('_id');
    });
});

describe('syncTransactionsinDB()', () => {
    test('should not save transactions used to update pending transactions', async () => {
        await TransactionService.syncTransactionsInDB();
        let results = await TransactionService.findByQuery({ name: { $regex: /adam/i } });
        console.log('results', results);
        expect(results.length).toBe(1);
    });
});
