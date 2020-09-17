import express from 'express';
import bodyParser from 'body-parser';
import SinkingFundService from "../models/SinkingFundService";
import {errorWrap} from "../utility";
const fundsRouter = express.Router();
const jsonParser = bodyParser.json();

fundsRouter.get('/', errorWrap(async ({ _db }, res) => {
    console.log('GET: funds/');
    let FundService = new SinkingFundService(_db);
    let funds = await FundService.findByQuery();
    res.send(funds);
}));

fundsRouter.put('/', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('PUT: funds/');
    const fund = body;
    console.log('fund', fund);
    let FundService = new SinkingFundService(_db);
    let response = await FundService.updateFunds([fund]);
    console.log('response', response);
    res.send(response);
}));

fundsRouter.put('/multi', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('PUT: funds/multi');
    const funds = body;
    console.log('funds', funds);
    let FundService = new SinkingFundService(_db);
    let response = await FundService.updateFunds(funds);
    console.log('response', response);
    res.send(response);
}));

fundsRouter.post('/', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('POST: funds/');
    const newFund = body;
    let FundService = new SinkingFundService(_db);
    let results = await FundService.saveNewFund(newFund);
    res.send(results);
}));

fundsRouter.delete('/:fundId', jsonParser, errorWrap(async (req, res) => {
    const { _db, params } = req;
    const { fundId } = params;
    console.log('DELETE: funds/' + fundId);

    let FundService = new SinkingFundService(_db);
    let response = await FundService.deleteFund(fundId);
    console.log('response', response);
    res.send(response);
}));

fundsRouter.put('/activate', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('PUT: funds/activate');
    const { fundId, amount } = body;
    let FundService = new SinkingFundService(_db);
    let response = await FundService.activateFund(fundId, amount);
    res.send(response);
}));

export default fundsRouter;
