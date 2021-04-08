/* global describe, test, it, beforeAll, afterAll, beforeEach, afterEach, expect */
import "core-js/stable";
import "regenerator-runtime/runtime";
import moment from 'moment';
import TestDbHelper from "../../app/testUtils/testDbHelper";
import SinkingFundService from "./SinkingFundService";
import Category from "./Category";

jest.mock('./Metadata.js', function() {
    const { default: mockMetadata } = jest.requireActual('./Metadata.js');
    mockMetadata.prototype.get = function () {
        return {
            "last_updated" : 1617759471000,
            "income" : 4000.00,
            "timeperiods" : [
                "2019-06",
                "2019-05",
                "2019-04",
                "2019-03",
                "2019-02",
                "2019-01",
                "2019-07",
                "2019-08"
            ],
            "selectedTimeperiod" : "2019-06"
        }
    };
    return mockMetadata;
});

const dbHelper = new TestDbHelper();

beforeAll(async () => {
    await dbHelper.start();
});

afterAll(async () => {
    await dbHelper.stop();
});

let FundService;
beforeEach(async () => {
    FundService = new SinkingFundService(dbHelper.db);
});

afterEach(async () => {
    await dbHelper.cleanup();
});

describe("findById", () => {
    test("should return the correct document by ID", async () => {
        const { tripFund } = await createSampleFunds();
        const result = await FundService.findById(tripFund._id);
        expect(result).toMatchObject(tripFund);
    });

    test("should return null if a document with the provided ID could not be found", async () => {
        const result = await FundService.findById("123456789012");
        expect(result).toBeNull();
    });
});

describe("findByIds", () => {
    test("should return the correct documents by ID", async () => {
        const { tripFund, homeGymFund } = await createSampleFunds();
        const result = await FundService.findByIds([tripFund._id, homeGymFund._id]);
        expect(result).toMatchObject([tripFund, homeGymFund]);
    });

    test("should return empty array if documents with the provided IDs could not be found", async () => {
        const result = await FundService.findByIds(["1234567", "9876543"]);
        expect(result).toEqual([]);
    });
});

describe('attributeTransferToFund()', () => {
    test('should increase reserved by the transfer amount', async () => {
        let { creditTransfer } = await createSampleTransfers();
        let { tripFund } = await createSampleFunds();
        expect(tripFund.reserved).toBe(500);

        let result = await FundService.attributeTransferToFund(creditTransfer, tripFund);
        expect(result.data[0]).toHaveProperty('reserved', 900);
    });

    test('should reduce reserved and increase available by the transfer amount', async () => {
        let { debitTransfer } = await createSampleTransfers();
        let { tripFund } = await createSampleFunds();
        expect(tripFund.reserved).toBe(500);

        let result = await FundService.attributeTransferToFund(debitTransfer, tripFund);
        expect(result.data[0]).toHaveProperty('reserved', 100);
        expect(result.data[0]).toHaveProperty('available', 400);
    });

    test('should not allow transfers that aren\'t from/to fund', async () => {
        let { debitTransfer } = await createSampleTransfers();
        let { tripFund } = await createSampleFunds();

        debitTransfer.account_id = 'not_sinking_fund_id';
        let result = await FundService.attributeTransferToFund(debitTransfer, tripFund);
        expect(result.variant).toBe('error');
    });

    test('should create fund category on fund debit transfer', async () => {
        let { debitTransfer } = await createSampleTransfers();
        let { tripFund } = await createSampleFunds();

        await FundService.attributeTransferToFund(debitTransfer, tripFund);

        const CService = new Category(dbHelper.db);
        let [ res ] = await CService.findByQuery({ name: tripFund.name });
        expect(res.name).toBe(tripFund.name);
        expect(res.budgeted).toBe(debitTransfer.amount);
        expect(res.timeperiod).toBe(moment().format('YYYY-MM'));
    });
});

describe('transferAmounts()', () => {
    test('should adjust the amounts of funds being withdrawn', async () => {
        const { tripFund, homeGymFund } = await createSampleFunds();
        const originalTripFundAmount = tripFund.reserved;
        const originalGymFund = homeGymFund.reserved;

        let transferFunds = [{ _id: homeGymFund._id, amount: 100 }];
        let res = await FundService.transferAmounts(tripFund, transferFunds);
        const [ tripFundResult, gymFundResult ] = res.data;

        expect(tripFundResult.reserved).toBe(originalTripFundAmount + transferFunds[0].amount);
        expect(gymFundResult.reserved).toBe(originalGymFund - transferFunds[0].amount);
    });
});

describe('activateFunds()', () => {
    test('should create a new category when activating a fund', async () => {
        const { tripFund } = await createSampleFunds();
        let { updatedFund, newCategory } = await FundService.activateFund(tripFund._id, 500);
        expect(newCategory.budgeted).toBe(500);
        expect(newCategory.timeperiod).toBe(moment().format('YYYY-MM'));

        expect(updatedFund.reserved).toBe(0);
        expect(updatedFund.goal).toBe(500);
        expect(updatedFund.available).toBe(500);
    });

    test('should not allow activating more funds than are reserved', async () => {
        const { tripFund } = await createSampleFunds();
        try {
            await FundService.activateFund(tripFund._id, 600);
        } catch (e) {
            expect(e.message).toBe('Cannot activate more funds than you have available.');
        }
    });
});

async function createSampleFunds() {
    const collectionName = 'sinking_funds';
    const tripFund = await dbHelper.createDoc(collectionName, {
        name: "Trip",
        account_id: "95J5nVeEvdCkMxxeQK8asvPNXbdrkaIdEB5EN",
        due_date: moment("2019-08-01").format('YYYY-MM-DD'),
        goal: 1000,
        active: true,
        reserved: 500,
        available: 0,
    });
    const homeGymFund = await dbHelper.createDoc(collectionName, {
        name: "Home Gym",
        account_id: "95J5nVeEvdCkMxxeQK8asvPNXbdrkaIdEB5EN",
        // No due date
        goal: 1200,
        active: true,
        reserved: 300,
        available: 0,
    });
    return { tripFund, homeGymFund };
}


async function createSampleTransfers() {
    const collectionName = 'transactions';
    const creditTransfer = await dbHelper.createDoc(collectionName, {
        account_id : "95J5nVeEvdCkMxxeQK8asvPNXbdrkaIdEB5EN",
        amount : -400,
        category : [ "Transfer", "Credit" ],
        date : "2019-06-06",
        name : "FUNDS TRANSFER CR",
        transaction_id : "nnXnZJ7qjauMZ77oLVJ0hvLjDAQqVvFAbdq89",
    });
    const debitTransfer = await dbHelper.createDoc(collectionName, {
        account_id : "95J5nVeEvdCkMxxeQK8asvPNXbdrkaIdEB5EN",
        amount : 400,
        category : [ "Transfer", "Credit" ],
        date : "2019-06-06",
        name : "FUNDS TRANSFER CR",
        transaction_id : "nnXnZJ7qjauMZ77oLVJ0hvLjDAQqVvFAbdq89",
    });
    return { creditTransfer, debitTransfer };
}
