/* global describe, test, it, beforeAll, afterAll, beforeEach, afterEach, expect */
import "core-js/stable";
import "regenerator-runtime/runtime";
import TestDbHelper from "../app/testUtils/testDbHelper";
import Category from "../server/models/Category";
import createSampleTransactions from "../app/testUtils/createSampleTransactions";
import Transaction from "../server/models/Transaction";

const dbHelper = new TestDbHelper();

beforeAll(async () => {
    await dbHelper.start();
});

afterAll(async () => {
    await dbHelper.stop();
});

let CategoryService;
beforeEach(async () => {
    CategoryService = new Category(dbHelper.db);
});

afterEach(async () => {
    await dbHelper.cleanup();
});

describe("findById", () => {
    test("should return the correct document by ID", async () => {
        // 1. Insert the desired documents and collections into the database
        const { category2 } = await createSampleCategories();

        // 2. Call the method under test with the parameters needed for the desired outcome
        const result = await CategoryService.findById(category2._id);

        // 3. Make assertions on the result
        expect(result).toMatchObject(category2);
    });

    test("should return null if a document with the provided ID could not be found", async () => {
        const result = await CategoryService.findById("123456789123");
        expect(result).toBeNull();
    });
});

describe("findByIds", () => {
    test("should return the correct documents by ID", async () => {
        const { category1, category3 } = await createSampleCategories();
        const result = await CategoryService.findByIds([category1._id, category3._id]);
        expect(result).toMatchObject([category1, category3]);
    });

    test("should return empty array if documents with the provided IDs could not be found", async () => {
        const result = await CategoryService.findByIds(["123456789123"]);
        expect(result).toEqual([]);
    });
});

describe("findByPeriod", () => {
    test("should find the correct number of categories for a period", async () => {
        await createSampleCategories();
        let response = await CategoryService.findByPeriod('2019-06');
        expect(response.length).toBe(1);

        response = await CategoryService.findByPeriod(/\d\d\d\d-06/);
        expect(response.length).toBe(1);

        response = await CategoryService.findByPeriod(/\d\d\d\d-05/);
        expect(response.length).toBe(3);

        response = await CategoryService.findByPeriod('2019');
        expect(response.length).toBe(4);
    });
});

describe('createCategory()', () => {
    test('should created timePeriod for new categories', async () => {
        const budgetItems = { name: 'Rent', budgeted: 1901.76, };
        let result = await CategoryService.createCategory(budgetItems);
        expect(result).toHaveProperty('timeperiod');
    });
});

describe('importCategories()', () => {
    test('should import all categories for all months it can find', async () => {
        await createSampleTransactions(dbHelper);
        let { category1 } = await createSampleCategories();
        let response = await CategoryService.syncCategory(category1._id, new Transaction(dbHelper.db));
        expect(response.variant).toBe('success');

        let result = await CategoryService.findById(category1._id);
        expect(result.spent).toBe(20);
        expect(result.difference).toBe(100);

        await dbHelper.createDoc('transactions', {
            amount : 20,
            date : "2019-05-03",
            budget_category: 'Gas',
            name : "Gas Place Stop",
            was_budgeted: true
        });
        await CategoryService.syncCategory(category1._id, new Transaction(dbHelper.db));
        result = await CategoryService.findById(category1._id);
        expect(result.spent).toBe(40);
        expect(result.difference).toBe(80);
    });
});


/**
 * Insert set of sample products into the database
 */
async function createSampleCategories() {
    const category1 = await dbHelper.createDoc(CategoryService.collectionName, {
        name: 'Gas',
        timeperiod: '2019-05',
        budgeted: 120,
        spent: 0,
        difference: 120
    });
    const category2 = await dbHelper.createDoc(CategoryService.collectionName, {
        name: 'Groceries',
        timeperiod: '2019-05',
        budgeted: 300,
        spent: 900,
        difference: -600
    });
    const category3 = await dbHelper.createDoc(CategoryService.collectionName, {
        name: 'Rent',
        timeperiod: '2019-06',
        budgeted: 1900,
        spent: 1900,
        difference: 0
    });
    const category4 = await dbHelper.createDoc(CategoryService.collectionName, {
        name: 'Adam',
        timeperiod: '2019-05',
        budgeted : 100,
        spent : 75,
        difference: 25
    });

    return { category1, category2, category3, category4 };
}
