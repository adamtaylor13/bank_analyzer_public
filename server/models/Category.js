import Transaction from "./Transaction.js";
import moment from 'moment';
import {getObjectID} from "../utility.js";
import {dollarsFloat} from "../../app/utility.js";
import CategoryTypes from "../CategoryTypes.js";
import SinkingFundService from "./SinkingFundService.js";

/**
 * TODO: (?) Add a "transient" property to categories that specifies that the category should not be persisted
 *        in the following month.
 * ==========
 * Properties
 * ==========
 *
 *        _id: BSON - Unique Mongo identifier
 *        timeperiod: String - Must be in YYYY-MM-DD format Example: '2019-07-19'
 *        name: String
 *        budgeted: Number - Amount of dollars that should not be exceeded for this category; not strictly enforced
 *        spent: Number - Amount of dollars spent under this category for its timeperiod; may exceed budgeted
 *        type: CategoryType - The type of category represented
 *        adjustments: Array[<Number>] - List of numerical adjustments that should be made to this category when displayed
 *              Useful when one category has a large budget leftover and another has been exceeded
 *        sinking_fund_id: ?BSON - Must only exist on a FUND type category and must reference a sinking fund to link them
 *              This is important so that we can carry changes between these 2 tightly-coupled entities.
 */

export default class Category {

    static COLLECTION_NAME = "category";
    constructor(db) {
        this.db = db;
        this.collectionName = Category.COLLECTION_NAME;
        this.collection = db.collection(this.collectionName);
        this.TService = new Transaction(db);
    }

    /**
     * Find a specific product document by ID
     * @param {ObjectID} objectId
     */
    findById(objectId) {
        objectId = getObjectID(objectId);
        return this.collection.findOne({ _id: objectId });
    }

    /**
     * Find a list of product documents by IDs
     * @param {ObjectID[]} ids
     */
    findByIds(ids) {
        return this.collection.find({ _id: { $in: ids } }).toArray();
    }

    /**
     * Find a list of categories by time timeperiod
     * @param timeperiod String - ex: "june 2019", "january 2017"
     * @returns {T[]}
     */
    findByPeriod(timeperiod) {
        if (!timeperiod instanceof RegExp) {
            timeperiod = new RegExp(timeperiod)
        }
        return this.collection.find({ timeperiod: { $regex: timeperiod } }).toArray();
    }

    findByQuery(query = {}) {
        return this.collection.find(query).toArray();
    }

    async prePersistValidation(category) {

        if (!category.timeperiod || !/\d\d\d\d-\d\d/.test(category.timeperiod)) {
            console.log('Category with missing/malformed timeperiod:', category);
            throw new Error('Will not save category with missing or malformed timeperiod');
        }

        if (!category.type) {
            // TODO: Not a proper solution; only placing this here as a tmp fix
            //  to get this code up and running for demo purposes
            category.type = CategoryTypes.DYNAMIC;
            // throw new Error('Will not save category without type attribute');
        }

        if (category.type === CategoryTypes.FUND) {
            const sinkingFundId = category.sinking_fund_id;
            if (!sinkingFundId) {
                console.log('category', category);
                throw new Error('Will not save FUND category without linking ID');
            }
            const SFS = new SinkingFundService(this.db);
            const matchingFund = await SFS.findById(sinkingFundId);
            if (!matchingFund) {
                console.log('category', category);
                throw new Error('Will not save FUND category without a valid linking Sinking Fund');
            }
        }

    }

    /**
     * Returns a mutated category with properties properly formatted
     * @param category
     * @returns {Promise<Category>}
     */
    async prePersistFormatting(category) {

        // First make sure everything is valid
        await this.prePersistValidation(category);

        // Make sure we're dealing with Numbers and not strings here
        category.budgeted = dollarsFloat(category.budgeted || 0);
        category.spent = dollarsFloat(category.spent || 0);


        let adjustmentsTotal = category.adjustments ? Object.keys(category.adjustments).map(key => category.adjustments[key]).reduce((prev, curr) => prev + curr, 0) : 0;
        category.difference = dollarsFloat(category.budgeted - category.spent - adjustmentsTotal);

        // Ensure all adjustments are dollars
        if (category.adjustments) {
            Object.keys(category.adjustments).forEach(key => { category.adjustments[key] = dollarsFloat(category.adjustments[key]) });
        }

        return category;
    }

    /**
     * Update a category with a newly passed-in category
     * @param category
     * @returns {Promise<*>}
     */
    async saveCategory(category) {
        category = await this.prePersistFormatting(category); // Returns category with updated formatting
        const id = getObjectID(category);

        // Can't re-save this field, so delete it
        if (category._id) {
            delete category._id;
        }

        let result = await this.collection.findOneAndUpdate({ _id: id }, { $set: { ...category } }, { returnOriginal: false });
        if (result.value) {
            return { variant: 'success', message: `Successfully updated ${category.name} category`, data: result.value };
        } else {
            if (!result.lastErrorObject.updateExisting) {
                return { variant: 'error', message: `Something went wrong when saving category` };
            }
        }
    }

    /**
     * Create a new category based on a name and budgeted amount passed-in
     * @returns { Object }
     */
    async createCategory(category) {
        category = await this.prePersistFormatting(category);

        let { ops } = await this.collection.insertOne(category);
        return ops[0];
    }

    /**
     * Get all the categories for a given timeperiod
     * @returns {Promise<*>}
     */
    async getCategoriesForTimeperiod(timeperiod = moment().format('YYYY-MM')) {
        return this.findByQuery({ timeperiod: { $regex: new RegExp(`${timeperiod}`) } })
    }

    /**
     * Sync a category's amount and difference amounts based on matching transactions in the DB
     * for a given timeperiod.
     *
     * @param categoryId ObjectID
     * @param TransactionService TransactionService
     * @returns {Promise<void>}
     */
    async syncCategory(categoryId) {
        const category = await this.findById(categoryId);
        let transactions = await this.TService.findByQuery({ was_budgeted: true, budget_category: category.name, date: { $regex: new RegExp(category.timeperiod) } });
        const spent = transactions.reduce((prev, curr) => prev + curr.amount, 0);
        return await this.saveCategory({ ...category, spent });
    }

    async syncCategories(categories) {
        let results = categories.map(c => this.syncCategory(c._id));
        return await Promise.all(results);
    }

    /**
     * Update all the "amount" and "difference" properties for every category in the timeperiod we updated
     * @param timeperiod
     * @returns {Promise<[(number | bigint | void), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint), (number | bigint)]>}
     */
    async syncAllPeriodCategories(timeperiod) {
        const categories = await this.findByPeriod(timeperiod);
        let results = categories.map(c => this.syncCategory(c._id));
        return await Promise.all(results);
    }

    async deleteCategory(categoryId, includeFund = false) {
        const category = await this.findById(getObjectID(categoryId));

        if (!category) {
            return { variant: 'error', message: `Could not find: ObjectID(${categoryId})` };
        }

        // Return all transactions to an uncategorized state
        let TransactionService = new Transaction(this.db);
        let transactions = await TransactionService.findByQuery({ date: { $regex: `${category.timeperiod}.*` }, was_budgeted: true, budget_category: category.name });
        transactions = transactions.map(t => {
            t.budget_category = null;
            t.was_budgeted = false;
            return t;
        });

        if (transactions.length) {
            const res = await TransactionService.updateTransactions(transactions);
        }

        // If includeFund, also delete the fund associated with the category
        // TODO: Maybe do something with response?
        if (includeFund) {
            if (category.type !== CategoryTypes.FUND) {
                throw new Error('You cannot delete a linked fund if this isn\'t a FUND category type!');
            }
            const FundService = new SinkingFundService(this.db);
            const res = await FundService.deleteFund(category.sinking_fund_id);
        } else if (category.type === CategoryTypes.FUND) {
            const FundService = new SinkingFundService(this.db);
            const res = await FundService.reverseFundActivation(category.sinking_fund_id, category.budgeted);
        }

        let response = await this.collection.deleteOne({ _id: getObjectID(categoryId) });
        if (!response.result) {
            return { variant: 'error', message: `No result from deleting fund: ObjectID(${categoryId})` };
        }
        if (response.result.n !== response.result.ok) {
            return { variant: 'error', message: `Number matched (${response.result.n}) was not the number deleted (${response.result.ok})` };
        }

        return { variant: 'success', message: `Successfully deleted category.`, data: categoryId };
    }

    async removeAdjustment(_id, categoryTo) {
        let categoryFrom = await this.findById(_id);

        Object.keys(categoryTo.adjustments).forEach(id => {
            if (id === _id) {
                delete categoryTo.adjustments[_id];
                delete categoryFrom.adjustments[categoryTo._id.toString()];
            }
        });

        if (Object.keys(categoryTo.adjustments).length === 0) {
            delete categoryTo.adjustments;
        }

        if (Object.keys(categoryFrom.adjustments).length === 0) {
            delete categoryFrom.adjustments;
        }

        let res1 = await this.saveCategory(categoryTo);
        let res2 = await this.saveCategory(categoryFrom);
        return [ {variant: res1.variant, data: res1.data }, { variant: res2.variant, data: res2.data } ];
    }

}
