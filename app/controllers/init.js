let CatModel = require('../models/cat');
let AnnModel = require('../models/ann');
let BasketModel = require('../models/basket');
let PrModel = require('../models/presentation');
let CongigModel = require('../models/config');

let Ctrl = {
	index: async function(req, res) {
		const result = {};

		const left_menu = await CatModel.getLeftMenu({ get_ann: true }, req);
		result.left_menu = left_menu;

		const pr_left = await PrModel.getPresentationArray({
			pp: 3,
			page: 1,
			show_in_mane: 1,
			bild_url: true
		});
		result.pr_left = pr_left;

		const config = await CongigModel.getAll();
		result.config = config;

		result['compare'] = await AnnModel.getCompareAll();
		result['basket'] = await BasketModel.loadBasket({}, req.session);

		res.json(result);
	}
};
module.exports = Ctrl;
