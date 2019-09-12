let PageModel = require('../models/page');

module.exports = async function(req, res, next) {
	const mnemonic = req.query.mnemonic;

	let page_item = {};
	if (mnemonic) {
		page_item = await PageModel.getPageItemByMnemonic({ mnemonic });
	}

	req.page_item = page_item;
	next();
};
