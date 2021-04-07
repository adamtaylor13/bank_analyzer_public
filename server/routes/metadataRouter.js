import express from 'express';
import bodyParser from 'body-parser';
import {errorWrap} from "../utility.js";
import MetadataService from "../models/Metadata.js";
const metadataRouter = express.Router();
const jsonParser = bodyParser.json();

metadataRouter.get('/', errorWrap(async ({ _db }, res) => {
    console.log('GET: metadata/');
    let Metadata = new MetadataService(_db);
    let metadata = await Metadata.get();
    res.send(metadata);
}));

metadataRouter.put('/timeperiod', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('PUT: metadata/timeperiod', body);
    let Metadata = new MetadataService(_db);
    let response = await Metadata.setTimeperiodFilter(body.timeperiod);
    res.send(response);
}));

metadataRouter.put('/income', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('PUT: metadata/income', body);

    let Metadata = new MetadataService(_db);
    let response = await Metadata.setIncome(parseFloat(body.income));
    res.send(response);
}));

export default metadataRouter;
