import moment from 'moment';
import Category from "./Category.js";
import {getObjectID} from "../utility.js";
import CategoryTypes from "../CategoryTypes.js";
import Metadata from "./Metadata.js";

export default class SinkingFundService {
    constructor(db) {
        this.db = db;
        this.collectionName = "sinking_funds";
        this.collection = db.collection(this.collectionName);
    }

    async saveNewFund(document) {
        if (document._id) {
            delete document._id;
        }
        const { ops } = await this.db
            .collection(this.collectionName)
            .insertOne(document);
        return ops[0];
    }

    async saveNewFunds(documents) {
        documents.map(d => {
            delete d._id;
            delete d.payment_meta;
            delete d.location;
        });
        const { ops } = await this.db
            .collection(this.collectionName)
            .insertMany(documents);
        return ops;
    }

    /**
     * Find a specific product document by ID
     * @param {ObjectID} objectId
     */
    async findById(objectId) {
        return await this.collection.findOne({ _id: getObjectID(objectId) });
    }

    /**
     * Find a list of product documents by IDs
     * @param {ObjectID[]} ids
     */
    async findByIds(ids) {
        return await this.collection.find({ _id: { $in: ids } }).toArray();
    }

    async findByQuery(query = {}) {
        return await this.collection.find(query).toArray();
    }

    /**
     * @param funds
     * @returns {Promise<*>}
     */
    async updateFunds (funds, extraFilterFields) {

        // Cast to array if singleton
        if (!Array.isArray(funds)) {
            funds = [funds];
            if (funds.length === 0) {
                return { variant: 'info', message: 'No funds were passed.' };
            }
        }

        const updatePromises = funds.map(async transaction => {
            let { _id, ...rest } = transaction;
            let fields = { ...rest };

            _id = getObjectID(transaction);

            if (fields.reserved) {
                fields.reserved = parseFloat(fields.reserved);
            }

            if (fields.goal) {
                fields.goal = parseFloat(fields.goal);
            }

            let filter = { $set: { ...fields } };

            if (extraFilterFields) {
                filter = { ...filter, ...extraFilterFields };
            }
            console.log('filter', filter);

            return new Promise((resolve, reject) => {
                this.collection.findOneAndUpdate({ _id }, filter, { returnOriginal: false }, (err, result) => {
                        if (err) { reject(err); }
                        resolve(result);
                    });
            });
        });

        let finalStatus = await Promise.all(updatePromises).catch(err => ({ variant: 'error', message: err }));
        if (finalStatus.variant !== 'error') {
            const numProvided = finalStatus.length;
            const numModified = finalStatus.reduce((prev, curr) => prev + (curr.lastErrorObject.updatedExisting ? 1 : 0), 0);
            const numOk = finalStatus.reduce((prev, curr) => prev + curr.ok, 0);
            if (numProvided !== numModified) {
                if (numOk === numProvided) {
                    return {
                        variant: 'info',
                        message: `No updates to perform`
                    };
                }
                return {
                    variant: 'warning',
                    message: `Provided ${numProvided} funds, but modified ${numModified} of them`
                };
            } else {
                // All success
                return {
                    variant: 'success',
                    message: `Successfully updated ${numModified} funds`,
                    data: finalStatus.map(v => v.value).filter(Boolean)
                };
            }
        } else {
            // err
            return finalStatus;
        }
    }

    // TODO: Possibly just remove this. Need to think about the logic of just not handling transfers at all.
    async attributeTransferToFund(transfer, fund) {
        if (transfer.account_id !== fund.account_id) {
            return { variant: 'error', message: 'You cannot attribute a transfer that wasn\'t from or to this sinking fund' }
        }

        const wasDebit = transfer.amount > 0;
        const wasCredit = transfer.amount < 0;

        if (wasDebit) {
            fund.reserved = fund.reserved - Math.abs(transfer.amount);
            fund.available = fund.available + Math.abs(transfer.amount);
            const CService = new Category(this.db);
            await CService.createCategory({ name: fund.name, budgeted: fund.available, timeperiod: moment().format('YYYY-MM')});
        }

        if (wasCredit) {
            fund.reserved = fund.reserved + Math.abs(transfer.amount);
        }

        let res = await this.updateFunds(fund);
        return { variant: 'success', message: 'Attributed transaction to fund', data: res.data };
    }

    /**
     * Transfer amounts in-between different funds
     *
     * transferFromFunds structure:
     * [
     *      {
     *         _id <ObjectID>,  - The _id of the fund to remove dollars from
     *         amount <Number>, - The amount of dollars to remove from the fund
     *      }, ...
     * ]
     *
     * @param fund
     * @param transferFromFunds
     * @returns {Promise<{variant: string, message: string}>}
     */
    async transferAmounts(fund, transferFromFunds) {
        if (!transferFromFunds) {
            return { variant: 'error', message: 'You must pass a at least one fund to transfer money from' };
        }

        if (!Array.isArray(transferFromFunds)) {
            transferFromFunds = [transferFromFunds];
        }

        // Get actual fund objects
        let fromFunds = await this.findByIds(transferFromFunds.map(f => f._id));
        fromFunds.map(fromFund => {
            let match = transferFromFunds.filter(f => f._id.toString() === fromFund._id.toString())[0];
            if (!match) { throw Error('No match found for funds passed-in'); }

            const { amount } = match;
            fromFund.reserved = fromFund.reserved - Math.abs(amount);
            if (fromFund.reserved < 0) {
                throw new Error('You cannot go negative on a sinking_fund.');
            }
            fund.reserved = fund.reserved + Math.abs(amount);
        });

        return await this.updateFunds([fund, ...fromFunds]);
    }

    async deleteFund(fundId) {
        fundId = getObjectID(fundId);
        let fund = await this.findById(fundId);

        if (!fund) {
            return { variant: 'error', message: `Could not find: ObjectID(${fundId})` };
        }

        let response = await this.collection.deleteOne({ _id: fundId });
        if (!response.result) {
            return { variant: 'error', message: `No result from deleting fund: ObjectID(${fundId})` };
        }
        if (response.result.n !== response.result.ok) {
            return { variant: 'error', message: `Number matched (${response.result.n}) was not the number deleted (${response.result.ok})` };
        }

        return { variant: 'success', message: `Successfully deleted fund.`, data: fundId };
    }

    /**
     * To make funds available:
     * - Remove amount from goal & reserved
     * - Add amount to available
     * - Create new category with fund name
     */
    async activateFund(fundId, amount) {
        const meta = await (new Metadata(this.db)).get();
        const timeperiod = meta.selectedTimeperiod;

        let fund = await this.findById(getObjectID(fundId));
        fund.goal -= amount;
        fund.reserved -= amount;
        fund.available += amount;

        if (typeof fund.available !== "number") {
            console.log('typeof fund.available', typeof fund.available);
            throw new Error('Cannot set fund.available to type: ' + typeof fund.available);
        }

        fund.activated_timeperiod = timeperiod;

        if (fund.reserved < 0) {
            throw new Error('Cannot activate more funds than you have available.');
        }

        // If we're activating the full fund, set it to inactive. It's been used up.
        if (fund.goal === 0) {
            fund.active = false;
        }

        const CategoryService = new Category(this.db);
        // NOTE: If you ever change budgeted: amount, check reverseFundActivation as we rely on that to pass in the amount
        const cat = { name: fund.name, budgeted: amount, timeperiod: moment().format('YYYY-MM'), type: CategoryTypes.FUND, sinking_fund_id: fundId };
        let newCategory = await CategoryService.createCategory(cat);

        let updatedFund = await this.updateFunds(fund);

        return { updatedFund: updatedFund.data[0], newCategory };
    }

    /**
     * This is needed in order to reverse an activated fund
     *
     * @param fundId
     * @param amount
     * @returns {Promise<{updatedFund: *, newCategory: *}>}
     */
    async reverseFundActivation(fundId, amount) {

        let fund = await this.findById(getObjectID(fundId));
        fund.goal += amount;
        fund.reserved += amount;
        fund.available -= amount;
        fund.active = true;
        delete fund.activated_timeperiod;

        return await this.updateFunds(fund, { $unset: { activated_timeperiod: 1 }});
    }
}
