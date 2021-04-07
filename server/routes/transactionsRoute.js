import express from 'express';
import Transaction from "../models/Transaction.js";
import bodyParser from 'body-parser';
import Category from "../models/Category.js";
import {errorWrap} from "../utility.js";
const transactionsRouter = express.Router();
const jsonParser = bodyParser.json();
import Metadata from "../models/Metadata.js";

transactionsRouter.get('/', errorWrap(async ({ _db, query}, res) => {
    console.log('GET: transactions/');

    let TService = new Transaction(_db);
    let passedQuery;
    if (query.justThisMonth) {
        let timeperiod = (await new Metadata(_db).get()).selectedTimeperiod;
        passedQuery = { date: { $regex: `${timeperiod}.*` } };
    } else {
        passedQuery = {};
    }
    console.log('passedQuery', passedQuery);
    let transactions = await TService.findByQuery(passedQuery);

    // await fs.readFile(path.resolve(__dirname, '../../public/images/IMG_7633.JPG'), (err, data) => {
    //     console.log('err', err);
    // transactions.map(t => {
    //     t.receipt = 'images/IMG_7633.JPG';
    // });
    //     console.log('response[0]', transactions[0]);
        res.send(transactions);
    // });
}));

transactionsRouter.get('/sync', errorWrap(async ({ _db }, res) => {
    console.log('GET: transactions/sync');
    let TService = new Transaction(_db);
    let response = await TService.syncTransactionsInDB();
    console.log('response', response);
    res.send(response);
}));

transactionsRouter.put('/', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('PUT: transactions/');
    const transaction = body;
    console.log('transaction to update:', transaction);
    let TService = new Transaction(_db);
    let response = await TService.updateTransactions([transaction]);
    if (response.variant === 'success') {
        let CService = new Category(_db);
        await CService.syncAllPeriodCategories(transaction.date.match(/\d\d\d\d-(\d\d)/)[1]);
    }
    res.send(response);
}));

transactionsRouter.put('/multi', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('PUT: transactions/multi/');
    const transactions = body;
    console.log('transactions to update:', transactions);

    let TService = new Transaction(_db);
    let response = await TService.updateTransactions(transactions);
    if (response.variant === 'success') {
        let CService = new Category(_db);
        await CService.syncAllPeriodCategories(transactions[0].date.match(/\d\d\d\d-\d\d/)[0]);
    }
    res.send(response);
}));

transactionsRouter.delete('/:transactionId', jsonParser, errorWrap(async (req, res) => {
    const { _db, params } = req;
    const { transactionId } = params;
    console.log('DELETE: transactions/' + transactionId);

    let TService = new Transaction(_db);
    let response = await TService.deleteTransaction(transactionId);
    console.log('response', response);
    res.send(response);
}));

// transactionsRouter.post('/receipt', errorWrap(async ({ _db, body, files, _id }, res) => {
//     console.log('POST: transactions/receipt');
//     const fileName = `receipt_${body._id}.jpg`;
//     let streamWriter = fs.createWriteStream(path.resolve(__dirname, `../../public/images/receipts/${fileName}`));
//     streamWriter.write(files.receipt.data);
//     streamWriter.end();
//
//     let TService = new Transaction(_db);
//     let response = await TService.assignReceipt(body._id, fileName);
//
//     // let FundService = new SinkingFundService(_db);
//     // let results = await FundService.saveNewFund(newFund);
//     res.send(response);
// }));

export default transactionsRouter;
