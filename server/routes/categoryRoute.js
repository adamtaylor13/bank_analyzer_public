import express from 'express';
import bodyParser from 'body-parser';
import Category from "../models/Category.js";
import {errorWrap} from "../utility.js";
import Metadata from "../models/Metadata.js";

const categoryRouter = express.Router();
const jsonParser = bodyParser.json();

categoryRouter.get('/', errorWrap(async ({ _db }, res) => {
    console.log('GET: categories/');

    let CategoryService = new Category(_db);
    let timeperiod = (await new Metadata(_db).get()).selectedTimeperiod;
    console.log('timeperiod', timeperiod);
    let categoryItems = await CategoryService.getCategoriesForTimeperiod(timeperiod);
    const categories = await CategoryService.syncCategories(categoryItems);
    // TODO: Does this work if nothing was updated? Do we still return the .data attribute?
    res.send(categories.map(b => b.data));
}));

categoryRouter.put('/', jsonParser, errorWrap(async ({ _db, body }, res) => {
    const category = body;
    console.log('PUT: categories/', category);

    let CategoryService = new Category(_db);
    let response = await CategoryService.saveCategory(category);
    res.send(response);
}));

categoryRouter.put('/remove-adjustment', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('PUT: categories/remove-adjustment', body);

    const { _id, category } = body;

    let CategoryService = new Category(_db);
    let response = await CategoryService.removeAdjustment(_id, category);
    res.send(response);
}));

categoryRouter.delete('/:categoryId', jsonParser, errorWrap(async (req, res) => {
    const { _db, params } = req;
    const { categoryId } = params;
    const { includeFund } = req.query;
    console.log('includeFund', includeFund);

    let CategoryService = new Category(_db);
    let response = await CategoryService.deleteCategory(categoryId, includeFund.toUpperCase() === 'TRUE');
    res.send(response);
}));

categoryRouter.post('/', jsonParser, errorWrap(async ({ _db, body }, res) => {
    console.log('POST: categories/', body);
    let CategoryService = new Category(_db);
    let response = await CategoryService.createCategory(body);
    res.send(response);
}));

export default categoryRouter;
