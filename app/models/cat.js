const conn = require('../db.js');

let rootCatArray = [];

async function getRootCat(config) {
	const db = await conn();
	const { id } = config;
	const sql = `SELECT id, name, mnemonic, cat_id FROM cat WHERE id='${id}'`;
	let [result] = await db.query(sql);
	db.destroy();
	if (result.length) {
		rootCatArray.unshift(result[0]);
		const cat_id = result[0]['cat_id'];
		await getRootCat({ id: cat_id });
	}
	return rootCatArray;
}

async function bildUrl(config) {
	const { id } = config;
	rootCatArray = [];
	const cat_array = await getRootCat({ id });
	let url = '';
	if (cat_array[0] && cat_array[0]['mnemonic']) {
		url = `/catalog/${cat_array[0]['mnemonic']}/`;
	}
	return url;
}

async function getCatArray(config) {
	const db = await conn();
	const { id, link_disable, show_in_mane } = config;

	// filter
	const and_link_disable =
		link_disable != undefined ? `AND link_disable='${link_disable}'` : '';
	const and_show_in_mane = show_in_mane ? 'AND show_in_mane=\'1\'' : '';

	const sql = `
		SELECT *
		FROM cat
		WHERE cat_id='${id}' AND is_disable='0'
			${and_link_disable} ${and_show_in_mane}
		ORDER BY sort
	`;

	let [result] = await db.query(sql);
	db.destroy();

	for (let item of result) {
		if (config['bild_url']) {
			item['url'] = await bildUrl({ id: item.id });
		}
		if (config['no_text']) {
			delete item['text'];
		}
	}

	return result;
}

async function getLeftMenu(config) {
	const db = await conn();

	let result = await getCatArray({ id: 0, no_text: true });

	let SeriaModel = await require('./seria');
	for (let item of result) {
		const seria_array = await SeriaModel.getSeriaArrayByAnnCat({
			root_cat_id: item['root_cat_id'],
			get_ann: true
		});
		item['seria_array'] = seria_array;
		item['url'] = await bildUrl({ id: item.id });
	}

	return result;
}

async function getCatItemByMnemonic(config) {
	const db = await conn();
	const { mnemonic } = config;

	const sql = `
		SELECT c.*
		FROM cat c
		WHERE c.mnemonic='${mnemonic}'
	`;

	let [result] = await db.query(sql);
	db.destroy();

	if (result && result.length) {
		return result[0];
	} else {
		return false;
	}
}

module.exports = { getLeftMenu, getCatArray, getCatItemByMnemonic, bildUrl };
