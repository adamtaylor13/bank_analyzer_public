import moment from 'moment';
import {getObjectID} from "../utility.js";
import Category from "./Category.js";

export default class Metadata {
    static COLLECTION_NAME = "metadata";
    constructor(db) {
        this.db = db;
        this.collectionName = Metadata.COLLECTION_NAME;
        this.collection = db.collection(this.collectionName);
    }

    /**
     * There will only ever be one metadata object, so a simple: get() method will do
     * @returns {Promise<*>}
     */
    async get() {
        // TODO: Fix this so that when metadata is null, you get a default object
        return await this.collection.findOne();
    }

    async setLastUpdateCheck(momentObj) {
        let metadata = await this.get();
        let _id = getObjectID(metadata);
        let response = await this.collection.findOneAndUpdate(
            { _id: _id },
            { $set: { last_updated: momentObj.valueOf() } },
            { returnOriginal: false }
        );
        return response;
    }

    /**
     * Logic to determine if we should check for account/transaction updates
     * @returns {Promise<Boolean>}
     */
    async shouldCheckForUpdates() {
        let metadata = await this.get();

        // If no metadata, we should check for updates (on app install!)
        if (!metadata) {
            return true;
        }

        const lastUpdate = moment(metadata.last_updated);
        const thirtyMinutes = 900000;

        return Math.abs(lastUpdate.diff(moment())) >= thirtyMinutes;
    }

    async setIncome(income) {
        if (typeof income === 'string' || Number.isNaN(income)) {
            throw new Error('Income must be a number');
        }

        let metadata = await this.get();
        let _id = getObjectID(metadata);
        let response = await this.collection.findOneAndUpdate(
            { _id: _id },
            { $set: { income } },
            { returnOriginal: false }
        );
        return response;
    }

    async setTimeperiodFilter(selectedTimeperiod) {
        let metadata = await this.get();
        let _id = getObjectID(metadata);
        let response = await this.collection.findOneAndUpdate(
            { _id: _id },
            { $set: { selectedTimeperiod } },
            { returnOriginal: false }
        );
        return response;
    }

    /**
     * This idea here is that we have a list of category timeperiods (2019-05, 2019-06, etc)
     * which allow us to quickly populate the time period picker and switch between months.
     * This was built towards the end of 2019 as I realized simply having "months" was not enough.
     * @returns {Promise<void>}
     */
    async populateBudgetPeriodList() {
        let metadata = await this.get();
        let timeperiods = await this.db.collection(Category.COLLECTION_NAME).distinct("timeperiod");
        console.log('Updating list of timeperiods', timeperiods);
        let _id = getObjectID(metadata);
        let response = await this.collection.findOneAndUpdate(
            { _id: _id },
            { $set: { timeperiods } },
            { returnOriginal: false }
        );
        return response;
    }

}
