const CatModel = require('../models/cat');
const PrModel = require('../models/presentation');
const AppModel = require('../models/app');

const Ctrl = {
	contact: async function(req, res) {
		const result = {};

		const cat_array = await CatModel.getCatArray(
			{ no_text: true, link_disable: 0 },
			req
		);
		result['cat_array'] = cat_array;

		result['page_item'] = req.page_item;
		res.json(result);
	},
	presentation: async function(req, res) {
		const result = {};

		const pr_array = await PrModel.getPresentationArray({
			page: -1,
			get_image: true,
			show_in_pr_page: 1
		});
		result['pr_array'] = pr_array;

		result['page_item'] = req.page_item;
		res.json(result);
	},
	index: async function(req, res) {
		const result = {};
		result['page_item'] = req.page_item;
		res.json(result);
	},
	product_registration: async function(req, res) {
		const result = {};

		const cat_array = await CatModel.getCatArray(
			{ no_text: true, link_disable: 0 },
			req
		);
		result['cat_array'] = cat_array;

		result['page_item'] = req.page_item;
		res.json(result);
	},
	search_dealer: async function(req, res) {
		const result = {};

		const {
			diler_array,
			diler_map_array
		} = await require('../diler/diler.json');

		result['diler_array'] = diler_array;
		result['diler_map_array'] = diler_map_array;

		result['page_item'] = req.page_item;
		res.json(result);
	},
	app: async function(req, res) {
		const result = {};

		const app_cat_array = await AppModel.getAppCat();
		result['app_cat_array'] = app_cat_array;

		result['page_item'] = req.page_item;
		res.json(result);
	}
};
module.exports = Ctrl;
