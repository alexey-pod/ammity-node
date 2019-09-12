const conn = require('../db.js');
const AnnModel = require('./ann');
const CongigModel = require('../models/config');

async function getPageItemByMnemonic(config) {
	const { mnemonic } = config;
	const db = await conn();
	const sql = `
		SELECT p.*
		FROM page p
		WHERE p.mnemonic='${mnemonic}'
		`;
	let [result] = await db.query(sql);
	db.destroy();

	if (!result.length) {
		return false;
	}
	result = result[0];

	if (!result['title']) {
		result['title'] = result['name'];
	}

	if (result['keywords'] == '' || result['description'] == '') {
		const site_config = await CongigModel.getAll();

		if (result['keywords'] == '') {
			result['keywords'] = site_config['keywords'];
		}
		if (result['description'] == '') {
			result['description'] = site_config['description'];
		}
	}

	return result;
}

module.exports = { getPageItemByMnemonic };
