/* global describe, test, it, beforeAll, afterAll, beforeEach, afterEach, expect */
import "core-js/stable";
import "regenerator-runtime/runtime";
import TestDbHelper from "../app/testUtils/testDbHelper";
import Account from "../server/models/Account";

const dbHelper = new TestDbHelper();

beforeAll(async () => {
    await dbHelper.start();
});

afterAll(async () => {
    await dbHelper.stop();
});

let AccountService;
beforeEach(async () => {
    AccountService = new Account(dbHelper.db);
});

afterEach(async () => {
    await dbHelper.cleanup();
});

describe("findById", () => {
    test("should return the correct document by ID", async () => {
        // 1. Insert the desired documents and collections into the database
        const { account2 } = await createSampleAccounts();

        // 2. Call the method under test with the parameters needed for the desired outcome
        const result = await AccountService.findById(account2._id);

        // 3. Make assertions on the result
        expect(result).toMatchObject(account2);
    });

    test("should return null if a document with the provided ID could not be found", async () => {
        const result = await AccountService.findById("123456789123");
        expect(result).toBeNull();
    });
});

describe("findByIds", () => {
    test("should return the correct documents by ID", async () => {
        const { account1, account3 } = await createSampleAccounts();
        const result = await AccountService.findByIds([account1._id, account3._id]);
        expect(result).toMatchObject([account1, account3]);
    });

    test("should return empty array if documents with the provided IDs could not be found", async () => {
        const result = await AccountService.findByIds(["123456789123"]);
        expect(result).toEqual([]);
    });
});

describe("saveAccount", () => {
    test("should correctly persist updates", async () => {
        let { account1 } = await createSampleAccounts();
        account1.subtype = "sinking fund";
        const response = await AccountService.saveAccount(account1);
        expect(response.variant).toEqual('success');

        let dbRes = await AccountService.findById(account1._id);
        expect(dbRes.subtype).toEqual("sinking fund");
    });

    test("should throw error variant on errors", async () => {
        let { account1 } = await createSampleAccounts();
        account1._id = undefined;
        const response = await AccountService.saveAccount(account1);
        expect(response.variant).toEqual('error');
    });

    test('should not update certain properties', async () => {
        const props = {
            mask: 1234,
            official_name: 'Ya momma',
            type: 'something else',
            account_id: 'GASP. You can\'t change this'
        };

        let { account1 } = await createSampleAccounts();
        const response = await AccountService.saveAccount({ ...account1, ...props });
        expect(response.data.account_id).not.toEqual('GASP. You can\'t change this');

        const dbAccount1 = await AccountService.findById(account1._id);
        expect(dbAccount1.mask).toEqual('6501');
        expect(dbAccount1.official_name).toEqual('SAVINGS');
        expect(dbAccount1.type).toEqual('depository');
        expect(dbAccount1.account_id).toEqual('95J5nVeEvdCkMxxeQK8asvPNXbdrkaIdEB5EN');
    });
});

describe("getSinkingFundAccounts", () => {
    test("should only get a single account with subtype 'sinking fund'", async () => {
        await createSampleAccounts();
        let result = await AccountService.getSinkingFundAccount();
        expect(result.length).toEqual(1);
        expect(result[0].subtype).toEqual('sinking fund');
    });
});

/**
 * Insert set of sample products into the database
 */
async function createSampleAccounts() {
    const account1 = await dbHelper.createDoc(AccountService.collectionName, {
        account_id : "95J5nVeEvdCkMxxeQK8asvPNXbdrkaIdEB5EN",
        balances : {
            available : 5909.35,
            current : 5909.35,
            iso_currency_code : "USD",
            limit : null,
            unofficial_currency_code : null
        },
        mask : "6501",
        name : "General Savings",
        official_name : "SAVINGS",
        subtype : "savings",
        type : "depository"
    });
    const account2 = await dbHelper.createDoc(AccountService.collectionName, {
        account_id : "78R8Z74EkDTyYaaxZD3rSm6dwO8KApiQXL7Xg",
        balances : {
            available : 2888.9,
            current : 2888.9,
            iso_currency_code : "USD",
            limit : null,
            unofficial_currency_code : null
        },
        mask : "5816",
        name : "Checking",
        official_name : "CLASSIC CHECKING",
        subtype : "checking",
        type : "depository"
    });
    const account3 = await dbHelper.createDoc(AccountService.collectionName, {
        account_id : "yMRMAYqV8mTM8bb5vDEjHyoy3PzE5XfO83yKO",
        balances : {
            available : 7133,
            current : 366.32,
            iso_currency_code : "USD",
            limit : 7500,
            unofficial_currency_code : null
        },
        mask : "4467",
        name : "Visa Credit Card",
        official_name : "Signature Visa",
        subtype : "credit card",
        type : "credit"
    });
    const account4 = await dbHelper.createDoc(AccountService.collectionName, {
        account_id : "gEkEdv7K3pcvbDDEoy58Cd94rPv5eDHqPVdPe",
        balances : {
            available : 10015.87,
            current : 10015.87,
            iso_currency_code : "USD",
            limit : null,
            unofficial_currency_code : null
        },
        mask : "4119",
        name : "Emergency Fund",
        official_name : "SAVINGS",
        subtype : "savings",
        type : "depository"
    });
    const sinkingFund = await dbHelper.createDoc(AccountService.collectionName, {
        account_id : "95J5nVeEvdCkMxxeQK8asvPNXbdrkasinking_fund",
        balances : {
            available : 5909.35,
            current : 5909.35,
            iso_currency_code : "USD",
            limit : null,
            unofficial_currency_code : null
        },
        mask : "6501",
        name : "General Savings (Sinking Fund)",
        official_name : "SAVINGS",
        subtype : "sinking fund",
        type : "depository"
    });


    return { account1, account2, account3, account4, sinkingFund };
}
