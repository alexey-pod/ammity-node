const AnnModel = require('../models/ann');
const SeriaModel = require('../models/seria');
const BasketModel = require('../models/basket');
const FakeModel = require('../models/fake');

const Ctrl = {
	getSeriaArrayByAnnCat: async function(req, res) {
		const result = await SeriaModel.getSeriaArrayByAnnCat(req.body);
		res.json(result);
	},
	getAnnArrayForRegister: async function(req, res) {
		const result = await AnnModel.getAnnArrayForRegister(req.body);
		res.json(result);
	},
	searchAnn: async function(req, res) {
		const result = await AnnModel.searchAnn(req.body);
		res.json(result);
	},
	setCompare: async function(req, res) {
		const result = await AnnModel.setCompare(req.body, req.session);
		res.json(result);
	},
	// basket
	addToBasket: async function(req, res) {
		const amount = await BasketModel.addToBasket(req.body, req.session);
		const result = await BasketModel.loadBasket(req.body, req.session);
		res.json(result);
	},

	loadBasket: async function(req, res) {
		const result = await BasketModel.loadBasket(req.body, req.session);
		res.json(result);
	},

	updateBasketItem: async function(req, res) {
		const item = await BasketModel.updateBasketItem(req.body, req.session);
		const result = await BasketModel.loadBasket(req.body, req.session);
		res.json(result);
	},

	deleteFromBasket: async function(req, res) {
		const item = await BasketModel.deleteFromBasket(req.body, req.session);
		const result = await BasketModel.loadBasket(req.body, req.session);
		res.json(result);
	},

	addFakeRequest: async function(req, res) {
		const result = await FakeModel.addFakeRequest(req.body, req.session);
		res.json(result);
	}

};
module.exports = Ctrl;
