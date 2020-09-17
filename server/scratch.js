'use strict';

import {getDB, initDB} from "./db";
import Transaction from "./models/Transaction";
import MetadataService from "./models/Metadata";

async function run() {
    await initDB();

    const Metadata = new MetadataService(getDB());
    const metadata = await Metadata.get();
    const shouldUpdate = await Metadata.shouldCheckForUpdates();
    console.log('shouldUpdate', shouldUpdate);

    await Metadata.setIncome(2270.79 * 2);
}

run();
