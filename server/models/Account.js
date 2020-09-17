import {getObjectID} from "../utility";
import Plaid from "../../app/plaid-api";

export default class Account {
    constructor(db) {
        this.db = db;
        this.collectionName = "accounts";
        this.collection = db.collection(this.collectionName);
        this.PlaidClient = new Plaid(true);
    }

    /**
     * Find a specific product document by ID
     * @param {ObjectID} objectId
     */
    findById(objectId) {
        return this.collection.findOne({ _id: objectId });
    }

    /**
     * Find a list of product documents by IDs
     * @param {ObjectID[]} ids
     */
    findByIds(ids) {
        return this.collection.find({ _id: { $in: ids } }).toArray();
    }

    findByQuery(query = {}) {
        return this.collection.find(query).toArray();
    }

    /**
     * Update an account with a newly passed-in account
     * @param account
     * @param isSyncing
     * @returns {Promise<*>}
     */
    async saveAccount(account, isSyncing = false) {
        let { subtype, name, balances } = account;

        let searchQuery = { _id: getObjectID(account) };
        let setObject = { $set: { subtype, name, balances } };

        // Only update the balances when we're syncing
        if (isSyncing) {
            searchQuery = { account_id: account.account_id };
            setObject = { $set: { balances } };
        }

        let result = await this.collection.findOneAndUpdate(searchQuery, setObject);
        if (result.value) {
            return { variant: 'success', message: 'Successfully updated account', data: result.value };
        } else {
            return { variant: 'error', message: `Something went wrong when saving account` };
        }
    }

    /**
     * Not to be confused with getting actual sinking funds.
     * The Sinking Fund Category is the designation for where all sinking_fund dollars will live.
     * @returns {Promise<T[]>}
     */
    async getSinkingFundAccount() {
        return this.collection.find({ subtype: 'sinking fund' }).toArray();
    }

    async fetchAccountsFromPlaidApi() {
        return this.PlaidClient.getAccountsFromAPI();
    }

    async syncAccounts() {
        let accounts = await this.fetchAccountsFromPlaidApi();
        let updatePromises = accounts.map(a => {
            return this.saveAccount(a, true);
        });
        return await Promise.all(updatePromises).then(results => {
            return results.map(r => r.data).filter(Boolean);
        });
    }

}
