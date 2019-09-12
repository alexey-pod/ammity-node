const CatModel = require('../models/cat');
const PrModel = require('../models/presentation');

const Ctrl = {
	index: async function(req, res) {
		const result = {};

		const cat_array = await CatModel.getCatArray(
			{ id: 0, bild_url: true, show_in_mane: true },
			req
		);
		result.cat_array = cat_array;

		const pr_mane = await PrModel.getPresentationArray({
			pp: 3,
			page: 1,
			show_in_mane: 1,
			bild_url: true
		});
		result.pr_mane = pr_mane;

		result['page_item'] = req.page_item;
		res.json(result);
	}
};
module.exports = Ctrl;
