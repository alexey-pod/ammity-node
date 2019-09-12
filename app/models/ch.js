const conn = require('../db.js');

async function getAnnTableChParamArray(config) {
	const db = await conn();
	const { id } = config;

	let ORDER = 'ORDER BY sort ASC';
	if (config['table_ch_param_sort_field']) {
		const table_ch_param_sort_field = config['table_ch_param_sort_field'];
		ORDER = `ORDER BY ${table_ch_param_sort_field} ASC`;
	}

	const sql = `
		SELECT id AS rec_id, name, value, is_collapsed, sort, sort_client
		FROM table_ch_param
		WHERE table_ch_id='${id}'
		${ORDER}
	`;

	let [result] = await db.query(sql);
	db.destroy();

	if (config['id_as_key'] == true) {
		let result_new = [];
		for (let item of result) {
			result_new[item['rec_id']] = item;
		}
		result = result_new;
	}

	return result;
}

async function getAnnTableChArray(config) {
	const db = await conn();
	const { id, orientation, main_param } = config;

	// ORDER
	let ORDER = 'ORDER BY t_ch.sort ASC';
	if (config['table_ch_sort_field']) {
		const table_ch_sort_field = config['table_ch_sort_field'];
		ORDER = `ORDER BY t_ch.${table_ch_sort_field} ASC`;
	}

	let and_orientation = '';
	let and_main_param = '';
	{
		// filter
		if (orientation != undefined) {
			and_orientation = ` AND t_ch.orientation='${orientation}'  `;
		}
		if (main_param != undefined) {
			and_main_param = ` AND t_ch.main_param ='${main_param}'  `;
		}
	}

	const sql = `
		SELECT t_ch.id AS rec_id, t_ch.name, t_ch.orientation, t_ch.sort, t_ch.sort_client,
			t_ch.main_param
		FROM table_ch t_ch
		WHERE t_ch.ann_id='${id}' ${and_orientation} ${and_main_param}
		${ORDER}
	`;

	let [result] = await db.query(sql);
	db.destroy();

	if (config['load_use_param'] == true) {
		for (let item of result) {
			item['param'] = await getAnnTableChParamArray({
				id: item['rec_id'],
				table_ch_param_sort_field: config['table_ch_param_sort_field']
			});
		}
	}

	if (config['id_as_key'] == true) {
		let result_new = [];
		for (let item of result) {
			result_new[item['rec_id']] = item;
		}
		result = result_new;
	}

	return result;
}

module.exports = { getAnnTableChArray };
