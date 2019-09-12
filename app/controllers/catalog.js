const CatModel = require('../models/cat');
const AnnModel = require('../models/ann');
const SeriaModel = require('../models/seria');

const Ctrl = {
	ann_array_cat: async function(req, res) {
		const { mode } = req.query;

		if (mode == 'catalog_mane') {
			req.query['cat_mnemonic'] = 'begovye-dorozhki';
		}

		const cat_item = await CatModel.getCatItemByMnemonic({
			mnemonic: req.query['cat_mnemonic']
		});

		const result = {};
		req.page_item['title'] = cat_item['name'];

		const ann_array = await AnnModel.getAnnArray(
			{
				get_main_param: true,
				root_cat_id: cat_item['root_cat_id'],
				count_compare: true,
				get_compare_url: true,
				bild_seria_url: true,
				no_text: true
			},
			req.session
		);

		result['ann_array'] = ann_array;
		result['cat_item'] = cat_item;
		result['page_item'] = req.page_item;

		res.json(result);
	},
	ann_array_seria: async function(req, res) {
		const result = {};

		const seria_item = await SeriaModel.getSeriaItemByMnemonic({
			mnemonic: req.query['seria_mnemonic']
		});

		result['seria_item'] = seria_item;
		req.page_item['title'] = 'Серия ' + seria_item['name'];

		const seria_cat_array = await SeriaModel.getSeriaCatArray({
			id: seria_item['id'],
			get_ann: true,
			count_compare: true,
			get_compare_url: true,
			bild_seria_url: true
		});

		result['seria_cat_array'] = seria_cat_array;
		result['page_item'] = req.page_item;
		res.json(result);
	},

	ann_item: async function(req, res) {
		const result = {};

		const cat_item = await CatModel.getCatItemByMnemonic({
			mnemonic: req.query['cat_mnemonic']
		});

		const ann_item = await AnnModel.getAnnItemByMnemonic(
			{
				mnemonic: req.query['ann_mnemonic'],
				bild_seria_url: true
			},
			req.session
		);

		req.page_item['title'] = ann_item['name'];
		result['ann_item'] = ann_item;
		result['cat_item'] = cat_item;

		result['page_item'] = req.page_item;
		res.json(result);
	},

	compare: async function(req, res) {
		const result = {};

		const compare_array = await AnnModel.getCompareItemArray({
			compare_list: req.query.compare_list,
			diff: req.query.diff
		});

		req.page_item['title'] = 'Сравнение товаров';
		req.page_item['mnemonic'] = 'compare';

		result['compare_array'] = compare_array;

		result['page_item'] = req.page_item;

		res.json(result);
	}
};
module.exports = Ctrl;
