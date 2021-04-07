import Plaid from "../../app/plaid-api.js";
import moment from 'moment';
import {getObjectID} from "../utility.js";
import {filterObjectIDs} from "../filters.js";
import Account from "./Account.js";

const PLAID_CLIENT = new Plaid(true); // Only need a single instance here

export default class Transaction {
    constructor(db) {
        this.db = db;
        this.collectionName = "transactions";
        this.collection = db.collection(this.collectionName);
        this.PlaidClient = PLAID_CLIENT;
    }

    async saveNewTransaction(document) {
        if (document._id) {
            delete document._id;
        }
        const { ops } = await this.db
            .collection(this.collectionName)
            .insertOne(document);
        return ops[0];
    }

    async saveNewTransactions(documents) {
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
     * @param { Object | Number | String } objectId
     */
    async findById(objectId) {
        objectId = getObjectID(objectId);
        let transaction = await this.collection.findOne({ _id: objectId });
        if (!transaction) { return null; }

        if (transaction.offsets) {
            let offsets = await this.findByIds([...transaction.offsets]);
            transaction.offsets = offsets;
        }

        return transaction;
    }

    /**
     * Find a list of product documents by IDs
     * @param { Object[] | Number[] | String[] } ids
     */
    async findByIds(ids) {
        ids = ids.map(getObjectID);
        return this.mapOffsets(await this.collection.find({ _id: { $in: ids } }).toArray());
    }

    /**
     * Find a list of transaction by their date
     * @param date Date|String
     * @returns {Transaction[]}
     */
    async findByDate(date) {
        if (date instanceof Date) {
            date = moment(date).format('YYYY-MM-DD');
        }
        return this.mapOffsets(await this.collection.find({ date: { $regex: new RegExp(date) } }).toArray());
    }

    async findByQuery(query = {}, skipOffsetMap = false) {
        if (!skipOffsetMap) {
            return this.mapOffsets(await this.collection.find(query).toArray());
        } else {
            return await this.collection.find(query).toArray();
        }
    }

    async mapOffsets(transactions) {
        let promises = transactions.map(async t => {
            if (t.offsets) {
                let offsets = await this.findByQuery({ _id: { $in: [...t.offsets] } }, true);
                t.offsets = offsets;
            }
            return t;
        });
        return await Promise.all(promises);
    }

    /**
     * Standard update method.
     *
     * Make sure that when passing allowOffsetUpdate: true, you are NOT
     * passing the full offset object in.
     *
     * @param transactions
     * @param allowOffsetUpdate
     * @returns {Promise<*>}
     */
    async updateTransactions (transactions, allowOffsetUpdate = false) {

        // Cast to array if singleton
        if (!Array.isArray(transactions)) {
            transactions = [transactions];
            if (transactions.length === 0) {
                return { variant: 'info', message: 'No transactions were passed.' };
            }
        }

        const updatePromises = transactions.map(async transaction => {
            let { _id, offsets, ...rest } = transaction;
            _id = getObjectID(_id);
            let fields = { ...rest };

            if (allowOffsetUpdate) {
                fields = { ...fields, offsets };
            }

            if (fields.budget_category) {
                fields.was_budgeted = true;
                // TODO: Start tracking by ID, not name
            }

            const filter = { $set: { ...fields } };

            if (!fields.budget_category) {
                delete filter.$set.budget_category;
                filter.$unset = { 'budget_category': 1 };
                console.log('filter because budget_category is empty', filter);
            }

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
                    message: `Provided ${numProvided} transactions, but modified ${numModified} of them`
                };
            } else {
                // All success
                return {
                    variant: 'success',
                    message: `Successfully updated ${numModified} transactions`,
                    data: finalStatus.map(v => v.value).filter(Boolean)
                };
            }
        } else {
            // err
            return finalStatus;
        }
    }

    /**
     * Pass in a set of new transactions and this will find any currently pending
     * transactions and see if they've been updated. If so it will update these fields:
     * - pending
     * - pending_transaction_id
     * - transaction_id
     * - date
     *
     * @param newTransactions
     * @returns {Promise<*|*|*>}
     */
    async updatePendingTransactions(incomingApiTransactions) {
        const pendingTransactions = await this.findByQuery({ pending: true });
        const updatedTransactions = await pendingTransactions.map(async trans => {
            const [ updatedTransaction ] = incomingApiTransactions.filter(t => {
                // Various tests to see if a pending transaction potentially matches an incoming transaction
                const transactionIdsMatch = t.pending_transaction_id === trans.transaction_id;
                const amountsMatch = t.amount === trans.amount;

                const name1Compare = trans.name.toLowerCase().replace(/\.|\s/g, '');
                const name2Compare = t.name.toLowerCase().replace(/\.|\s/g, '');
                const namesAreClose = name1Compare.includes(name2Compare) || name2Compare.includes(name1Compare);
                const dateWithin3Days = () => {
                    const pendingDate = moment(t.date);
                    const incomingDate = moment(trans.date);
                    const threeDaysOut = moment(pendingDate).add(3, 'days');
                    const datesAreEqual = pendingDate.isSame(incomingDate);
                    const in3DayRange = incomingDate.isBetween(moment(pendingDate).subtract(1, 'second'), threeDaysOut)
                    return datesAreEqual || in3DayRange;
                };
                // Transactions are said to match if: the transaction_id matches the pending_transaction_id OR
                // the amounts match and the transactions are within 3 days of each other OR
                // the names are contained within one or the other and the transaction are within 3 days of each other
                return !!(transactionIdsMatch || ( (amountsMatch && dateWithin3Days()) || (namesAreClose && dateWithin3Days()) ));
            });
            if (updatedTransaction) {
                trans.pending = updatedTransaction.pending;
                trans.pending_transaction_id = trans.transaction_id;
                trans.transaction_id = updatedTransaction.transaction_id;
                trans.date = updatedTransaction.date;
                trans.amount = updatedTransaction.amount;
                if (trans.offsets && trans.offsets.length) {
                    trans.amount = trans.offsets.reduce((prev, curr) => prev + curr.amount, updatedTransaction.amount);
                    trans.original_amount = updatedTransaction.amount;
                }
                return trans;
            }
        });

        if (updatedTransactions.length === 0) {
            return { variant: 'info', message: 'No pending transactions needed to be updated.' }
        }

        let transactions = await Promise.all(updatedTransactions);
        return await this.updateTransactions(transactions.filter(Boolean));
    }

    async offsetTransaction (transactionId, offsetTransactionId) {

        let transaction = await this.findById(transactionId);
        let offsetTransaction = await this.findById(offsetTransactionId);

        if (!transaction || !offsetTransaction) {
            return { variant: 'error', message: 'Did not find a matching transaction and offsetTransaction' };
        }


        if (offsetTransaction.amount > 0) {
            return { variant: 'error', message: 'Cannot offset with a debit.' };
        }

        // If this is the first offset, create an array to push into
        if (transaction.offsets === undefined) {
            transaction.offsets = [];
        }

        // If this is the first offset, set an original amount
        if (transaction.original_amount === undefined) {
            transaction.original_amount = transaction.amount;
        }

        // Add new offset
        transaction.offsets.push(offsetTransaction._id);
        // Update Amount
        let offsets = await this.findByIds(transaction.offsets);
        transaction.amount = offsets.reduce((prev, curr) => prev + curr.amount, transaction.original_amount);
        // Set is_offset_transaction true on the new offset
        offsetTransaction.is_offset_transaction = true;

        let response = await this.updateTransactions([transaction, offsetTransaction], true);
        if (response.variant === 'error') {
            return response;
        }

        return {
            message: `Successfully offset transaction. New amount is: $${transaction.amount}`,
            data: transaction ,
            variant: 'success',
        };
    }

    /**
     * This is pulled out so it can be mocked in jest
     */
    fetchTransactionsFromAPI() {
        return this.PlaidClient.fetchTransactions();
    }

    // Curried function to use in a map
    // Used to assign memos to transactions we know about
    assignMemoToKnownTransactions(sinkingFundAccount) {
        return function (transaction) {
            // If is a transfer to a sinking fund
            if (transaction.name.includes(`TO ******${sinkingFundAccount.mask}`) && transaction.category.includes('Transfer') && transaction.category.includes('Debit')) {
                transaction.memo = "Sinking Fund Transfer";
            }
            return transaction;
        }
    }

    /**
     * This grabs 250 of the most recent transactions, filters them down to only the ones we don't already have
     * in the database (basically it gets the delta) and then submits them to the database.
     * @returns {Promise<Object>}
     */
    async syncTransactionsInDB() {
        try {
            const existingTransactions = await this.findByQuery({pending: false});
            const existingTransactionIds = existingTransactions.map(t => t.transaction_id);
            const newTransactions = await this.fetchTransactionsFromAPI();

            // Delete all pending transactions
            const pendingTransactions = await this.findByQuery({pending: true});
            const pendingTransactionIds = pendingTransactions.map(t => t._id);
            const self = this; // TODO: Cleanup
            const all = pendingTransactionIds.map(id => self.deleteTransaction(id));
            await Promise.all(all);

            const sinkingFundAccount = (await (new Account(this.db)).getSinkingFundAccount())[0];

            // Difference is new transactions not in the DB (probably pending since we just deleted them)
            const difference = newTransactions
                .filter(trans => !existingTransactionIds.includes(trans.transaction_id))
                .map(this.assignMemoToKnownTransactions(sinkingFundAccount));

            let newTransactionsResponse = null;
            if (difference.length > 0) {
                let saveResults = await this.saveNewTransactions(difference).catch(err => ({variant: 'error', err}));
                newTransactionsResponse = {variant: 'success', message: `Saved ${saveResults.length} new transactions.`,};
            } else {
                newTransactionsResponse = {variant: 'info', message: 'No transactions to save.'};
            }

            return newTransactionsResponse;
        } catch (e) {
            console.error('Error syncing transactions in DB:', e);
        }
    }

    async deleteTransaction(transactionId) {
        transactionId = getObjectID(transactionId);
        let trans = await this.findById(transactionId);

        if (!trans) {
            return { variant: 'error', message: `No result from deleting transaction: ObjectID(${transactionId})` };
        }

        // Need to delete references of this
        if (trans.is_offset_transaction) {

            let transactionsToUpdate = await this.findByQuery({ "offsets": transactionId }, true);
            transactionsToUpdate = transactionsToUpdate.map(t => {

                t.offsets = t.offsets.filter(filterObjectIDs(transactionId));
                return t;
            });
            let response = await this.updateTransactions(transactionsToUpdate);
            if (response.variant !== 'success') {
                return response;
            }
        }

        // If has offset transactions, un-set those
        if (trans.offsets && trans.offsets.length) {
            let offsets = await this.findByQuery({ _id: { $in: [...trans.offsets] } });
            offsets.map(t => {
                t.is_offset_transaction = false;
            });
            let response = await this.updateTransactions(offsets);
            if (response.variant !== 'success') {
                return response;
            }
        }

        let response = await this.collection.deleteOne({ _id: transactionId });
        if (!response.result) {
            return { variant: 'error', message: `No result from deleting transaction: ObjectID(${transactionId})` };
        }
        if (response.result.n !== response.result.ok) {
            return { variant: 'error', message: `Number matched (${response.result.n}) was not the number deleted (${response.result.ok})` };
        }

        return { variant: 'success', message: `Successfully deleted transaction.`};
    }

    async assignReceipt(transactionId, fileName) {
        transactionId = getObjectID(transactionId);
        console.log('transactionId', transactionId);
        let trans = await this.findById(transactionId);
        console.log('trans', trans);
        trans.receipt = fileName;
        let response = await this.updateTransactions(trans);
        return response;
    }

}
