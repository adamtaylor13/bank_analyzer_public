require('dotenv').config(); // Load all ENV vars

import express from 'express';
import {getDB, initDB} from "./db.js";
import categoryRouter from './routes/categoryRoute.js';
import transactionsRouter from "./routes/transactionsRoute.js";
import Category from "./models/Category.js";
import moment from 'moment';
import accountsRouter from "./routes/accountsRouter.js";
import fundsRouter from "./routes/fundsRouter.js";
import MetadataService from "./models/Metadata.js";
import Transaction from "./models/Transaction.js";
import Account from "./models/Account.js";
import metadataRouter from "./routes/metadataRouter.js";
import path from 'path';
import authRouter, {authenticate} from "./routes/authRouter.js";
import cookieParser from 'cookie-parser';
import CategoryTypes from "./CategoryTypes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname + '/../public')));
app.use(cookieParser());

// Pass DB connection in middleware
app.use(function (req, res, next) {
    req._db = getDB();
    next();
});

app.use('/api/auth', authRouter);
app.use('/api/categories', authenticate, categoryRouter);
app.use('/api/transactions', authenticate, transactionsRouter);
app.use('/api/accounts', authenticate, accountsRouter);
app.use('/api/funds', authenticate, fundsRouter);
app.use('/api/metadata', authenticate, metadataRouter);

app.use((err, req, res, next) => {
    console.log('err', err);
    res.status(500).send(err.message);
});

app.use('/bundle.js', function (req, res) {
    let pathThing = path.resolve(__dirname + '/../public/bundle.js');
    res.sendFile(pathThing);
});

app.get('*', function(req, res) {
    let pathThing = path.resolve(__dirname + '/../public/index.html');
    res.sendFile(pathThing);
});

initDB().then(async () => {
    const CService = new Category(getDB());
    const Metadata = new MetadataService(getDB());
    let results = await CService.syncAllPeriodCategories(moment().format('YYYY-MM'));

    // If no categories, create the new month's categories
    if (results.length === 0) {
        const lastMonth = moment().subtract(1,'months').format('YYYY-MM');
        let res = await CService.getCategoriesForTimeperiod(lastMonth);
        res = res.filter(c => {
            // Don't pass FUND categories to next month
            return c.type === CategoryTypes.DYNAMIC;
        }).map(r => ({
            name: r.name,
            budgeted: r.budgeted,
            timeperiod: moment().format('YYYY-MM'),
            type: CategoryTypes.DYNAMIC
        }));
        res.map(async r => await CService.createCategory(r));
        await Metadata.populateBudgetPeriodList();
    }

    const shouldRunUpdates = await Metadata.shouldCheckForUpdates();

    // Check for transaction & account updates
    if (shouldRunUpdates) {
        console.log('Running updates for transactions and accounts...');
        // Update transactions
        const TransactionService = new Transaction(getDB());
        await TransactionService.syncTransactionsInDB();

        // Update accounts
        let AccountService = new Account(getDB());
        await AccountService.syncAccounts();

        // Set the last updated check to now
        await Metadata.setLastUpdateCheck(moment());
    }

    // Set for demoing purposes — not real logic
    await Metadata.setTimeperiodFilter('2019-06');

    const host = process.env.PORT ? '0.0.0.0' : 'localhost';
    console.log('port', port);
    console.log('host', host);
    app.listen(port, host, () => console.log(`Listening on port ${port}!`));
});

