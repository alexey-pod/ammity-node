const conn = require('../db.js');
const CatModel = require('./cat');

async function bildUrl(config) {
	const { id } = config;
	const db = await conn();
	const sql = `
		SELECT pr.*
		FROM seria pr
		WHERE pr.id='${id}'
	`;
	let [result] = await db.query(sql);
	db.destroy();
	const url = `/seria/${result[0]['mnemonic']}/`;
	return url;
}

async function getSeriaArrayByAnnCat(config) {
	const db = await conn();

	// filter
	const root_cat_id = config.root_cat_id || null;
	const and_root_cat_id = root_cat_id
		? ` AND  a.root_cat_id='${root_cat_id}' `
		: '';
	const and_aa_cat_id = root_cat_id ? `AND aac.cat_id='${root_cat_id}' ` : '';

	const sql = `
	(
		SELECT s.*
		FROM seria s
		INNER JOIN ann a ON a.seria_id=s.id
		WHERE a.is_disable='0' ${and_root_cat_id}
		GROUP BY s.id
		ORDER BY s.sort ASC
	)
	UNION
	(
		SELECT s.*
		FROM seria s
		INNER JOIN ann a ON a.seria_id=s.id
		INNER JOIN ann_add_cat aac ON aac.ann_id=a.id ${and_aa_cat_id}
		WHERE a.is_disable='0'
		GROUP BY s.id
		ORDER BY s.sort ASC
	)
	ORDER BY sort ASC
	`;

	let [result] = await db.query(sql);
	db.destroy();

	const AnnModel = await require('./ann');
	for (let item of result) {
		item['url'] = await bildUrl({ id: item.id });

		if (config['get_ann']) {
			if (config['root_cat_id']) {
				const ann_array = await AnnModel.getAnnArray({
					seria_id: item['id'],
					root_cat_id: config['root_cat_id'],
					no_text: true
				});
				item.ann_array = ann_array;
			}
		}
	}

	return result;
}

async function getSeriaItemByMnemonic(config) {
	const { mnemonic } = config;
	const db = await conn();
	const sql = `
		SELECT
			s.*
		FROM seria s
		WHERE s.mnemonic='${mnemonic}'
	`;
	let [result] = await db.query(sql);

	db.destroy();
	result = result && result[0] ? result[0] : false;

	return result;
}

async function getSeriaCatArray(config) {
	const { id } = config;
	const db = await conn();
	const sql = `
		SELECT c.*
		FROM seria s
		INNER JOIN ann a ON a.seria_id=s.id AND a.is_disable='0'
		INNER JOIN cat c ON c.id=a.root_cat_id
		WHERE s.id='${id}'
		GROUP BY c.id
	`;
	let [result] = await db.query(sql);

	for (let item of result) {
		item['url'] = await CatModel.bildUrl({ id: item['id'] });
	}

	if (config['get_ann']) {
		let AnnModel = await require('./ann');
		for (let item of result) {
			item['ann_array'] = await AnnModel.getAnnArray({
				seria_id: id,
				root_cat_id: item['root_cat_id'],
				no_text: true,
				get_main_param: true,
				count_compare: config['count_compare'],
				get_compare_url: config['get_compare_url'],
				bild_seria_url: config['bild_seria_url']
			});
		}
	}

	return result;
}

module.exports = {
	getSeriaArrayByAnnCat,
	bildUrl,
	getSeriaItemByMnemonic,
	getSeriaCatArray
};
