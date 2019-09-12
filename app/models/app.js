const conn = require('../db.js');
let SeriaModel = require('./seria');

async function getAppCat(config) {
	const db = await conn();
	const sql = `
		SELECT c.id, c.name, c.root_cat_id
		FROM cat c
		INNER JOIN ann a ON a.root_cat_id=c.id
		WHERE a.app='1' AND c.is_disable='0'  AND a.is_disable='0'
			AND c.root_cat_id!='20' AND c.root_cat_id!='4'
		GROUP BY c.id
		ORDER BY c.SORT ASC
	`;
	let [result] = await db.query(sql);
	db.destroy();

	for (let item of result) {
		item['ann_array'] = [];
		const seria_array = await SeriaModel.getSeriaArrayByAnnCat({
			root_cat_id: item['root_cat_id'],
			get_ann: true
		});
		for (let seria_item of seria_array) {
			for (let ann_item of seria_item['ann_array']) {
				item['ann_array'].push(ann_item);
			}
		}
	}
	return result;
}

module.exports = { getAppCat };
