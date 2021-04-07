import express from 'express';
import bodyParser from 'body-parser';
import Account from "../models/Account.js";
import {errorWrap} from "../utility.js";
const accountsRouter = express.Router();
const jsonParser = bodyParser.json();

// GET ALL
accountsRouter.get('/', errorWrap(async ({ _db }, res) => {
    console.log('GET: accounts/');
    let AService = new Account(_db);
    let accounts = await AService.findByQuery({});
    res.send(accounts);
}));

accountsRouter.put('/', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('PUT: accounts/');
    const account = body;
    let AService = new Account(_db);
    let result = await AService.saveAccount(account);
    res.send(await AService.findByQuery({}));
}));

accountsRouter.get('/sync', errorWrap(async ({ _db }, res) => {
    console.log('GET: accounts/sync');

    let Service = new Account(_db);
    let response = await Service.syncAccounts();
    res.send(response);
}));

export default accountsRouter;
