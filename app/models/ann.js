const conn = require('../db.js');
const SeriaModel = require('./seria');
const ChModel = require('./ch');
const BasketModel = require('./basket');
const { number_format } = require('../lib/index.js');

async function bildUrl(config) {
	const db = await conn();
	const { id } = config;

	const sql = `
		SELECT
		a.mnemonic,
		c.mnemonic AS cat_name
		FROM ann a
		INNER JOIN cat c ON c.id=a.root_cat_id
		WHERE a.id='${id}'
	`;

	let [result] = await db.query(sql);
	db.destroy();

	if (result) {
		result = result[0];
	} else {
		return '';
	}

	let url = '/catalog/' + result['cat_name'] + '/' + result['mnemonic'] + '/';

	return url;
}

function formatPrice(price) {
	return number_format(price, 0, ',', ' ');
}

async function getAnnItem(config) {
	const db = await conn();
	const { id } = config;

	const sql = `
		SELECT a.*,
			a_i.image
		FROM ann a
		LEFT JOIN ann_image a_i ON a_i.ann_id=a.id AND a_i.main='1'
		WHERE a.id='${id}'
	`;

	let [result] = await db.query(sql);
	db.destroy();

	if (result && result[0]) {
		result = result[0];
	} else {
		return false;
	}

	result['url'] = await bildUrl({ id: id });
	result['price_str'] = formatPrice(result['price']);
	if (config['unset_text']) {
		delete result['text'];
		delete result['features'];
	}

	return result;
}

async function bildFullName(config) {
	const db = await conn();
	const { id } = config;

	const sql = `
		SELECT
			a.id, a.name, a.full_name_manual,
			c.mnemonic AS cat_mnemonic,
			c.name_one AS cat_name_one,
			s.name AS seria_name
		FROM ann a
		INNER JOIN cat c ON c.id=a.root_cat_id
		INNER JOIN seria s ON s.id=a.seria_id
		WHERE a.id='${id}'
	`;

	let [result] = await db.query(sql);
	db.destroy();
	if (result && result[0]) {
		result = result[0];
	} else {
		return '';
	}

	let str =
		result['cat_name_one'] +
		' - ' +
		result['seria_name'] +
		' AMMITY ' +
		result['seria_name'] +
		' ' +
		result['name'];

	if (result['full_name_manual'] != '') {
		str = result['full_name_manual'];
	}

	return str;
}

async function getAnnItemShot(config) {
	const db = await conn();
	const { id } = config;

	const sql = `
		SELECT
			a.id, a.name, a.price, a.mnemonic, a.root_cat_id,
			c2.mnemonic AS cat_mnemonic,
			c.id AS cat_id,
			c.name_one AS cat_name_one,
			s.name AS seria_name, s.mnemonic AS seria_mnemonic,
			a_i.image
		FROM ann a
		INNER JOIN cat c ON c.id=a.cat_id
		INNER JOIN cat c2 ON c2.id=a.root_cat_id
		INNER JOIN seria s ON s.id=a.seria_id
		LEFT JOIN ann_image a_i ON a_i.ann_id=a.id AND a_i.main='1'
		WHERE a.id='${id}'
	`;

	let [result] = await db.query(sql);
	db.destroy();

	if (result && result[0]) {
		result = result[0];
	} else {
		return false;
	}

	result['url'] = await bildUrl(result);
	result['price_str'] = formatPrice(result['price']);
	if (config['bild_full_name']) {
		result['name_full'] = await bildFullName(config);
	}

	return result;
}

async function countCompare(config, SESSION = null) {
	const { id } = config;
	const item = await getAnnItem({ id: id });
	const root_cat_id = item['root_cat_id'];
	let total = 0;

	if (
		SESSION &&
		SESSION['compare_list'] &&
		SESSION['compare_list'][root_cat_id]
	) {
		total = Object.keys(SESSION['compare_list'][root_cat_id]).length;
	}

	return total;
}
async function getCompare(config, SESSION = null) {
	const { id } = config;

	const item = await getAnnItem({ id: id });
	const root_cat_id = item['root_cat_id'];

	let result = [];

	if (SESSION['compare_list'] && SESSION['compare_list'][root_cat_id]) {
		for (let key in SESSION['compare_list'][root_cat_id]) {
			result.push({ id: key });
		}
	}

	return result;
}
async function bildCompareUrl(config, SESSION = null) {
	const { id } = config;

	const item = await getAnnItem({ id: id });
	const root_cat_id = item['root_cat_id'];

	let str = '';
	str += '/compare/';
	if (
		SESSION &&
		SESSION['compare_list'] &&
		SESSION['compare_list'][root_cat_id]
	) {
		for (let key in SESSION['compare_list'][root_cat_id]) {
			str += key + '~';
		}
	}

	str = str.substr(0, str.length - 1);
	str += '/';

	return str;
}

async function setCompare(config, SESSION = null) {
	if (!SESSION) {
		return;
	}

	const { compare_mode, id } = config;
	const item = await getAnnItem({ id: id });
	const root_cat_id = item['root_cat_id'];

	if (compare_mode == 'add') {
		if (!SESSION['compare_list']) {
			SESSION['compare_list'] = {};
		}
		if (!SESSION['compare_list'][root_cat_id]) {
			SESSION['compare_list'][root_cat_id] = {};
		}
		SESSION['compare_list'][root_cat_id][id] = 1;
	} else {
		let list = SESSION['compare_list'][root_cat_id];
		delete list[id];
		SESSION['compare_list'][root_cat_id] = list;
	}
	const total = await countCompare({ id }, SESSION);
	const list = await getCompare({ id }, SESSION);
	const url = await bildCompareUrl({ id }, SESSION);
	const result = { total, list, url };

	return result;
}

async function getCompareAll(SESSION = null) {
	return {};
}

async function checkInCompare(config, SESSION = null) {
	if (
		SESSION &&
		SESSION['compare_list'] &&
		SESSION['compare_list'][config['root_cat_id']] &&
		SESSION['compare_list'][config['root_cat_id']][config['id']]
	) {
		return 1;
	} else {
		return 0;
	}
}

async function modeChNameAsKey(config, SESSION = null) {
	const arr = config['arr'];

	// internal transformation
	for (let key_1 in arr) {
		let param_tmp = [];

		for (let val_2 of arr[key_1]['param']) {
			delete val_2['sort'];
			delete val_2['is_collapsed'];
			delete val_2['rec_id'];
			param_tmp[val_2['name']] = val_2;
		}
		arr[key_1]['param'] = param_tmp;
	}

	// external transformation
	let new_arr = {};

	for (let val of arr) {
		delete val['sort'];
		delete val['rec_id'];
		delete val['orientation'];
		new_arr[val['name']] = val;
	}

	return new_arr;
}

async function bildDeleteCompareUrl(config) {
	const id = config['id'];
	const compare_list = config['compare_list'];
	let str = '';
	if (compare_list.lenght == 1) {
		str = await bildUrl(config);
		return str;
	}

	str += '/compare/';

	for (let item of compare_list) {
		if (item != id) {
			str += item + '~';
		}
	}

	str = str.substr(0, str.length - 1);
	str += '/';
	return str;
}

async function getCompareItemArray(config, SESSION = null) {
	let compare_list = config['compare_list'];
	compare_list = compare_list.split('~');

	let ann_seria_array = [];
	{
		for (let item of compare_list) {
			const ann_item = await getAnnItem({ id: item, unset_text: true });
			if (!ann_item) {
				return false;
			}
			if (ann_item['is_disable'] == 1) {
				return false;
			}
			ann_seria_array.push(ann_item);
		}
	}

	{
		// get characteristics for each product

		for (let key in ann_seria_array) {
			let ch_array = await ChModel.getAnnTableChArray({
				id: ann_seria_array[key]['id'],
				load_use_param: true,
				table_ch_sort_field: 'sort',
				table_ch_param_sort_field: 'sort',
				main_param: 0
			});

			ch_array = await modeChNameAsKey({ arr: ch_array });
			ann_seria_array[key]['param'] = ch_array;
		}
	}

	// prepare the matrix for the table
	let result = {};
	result['model_array'] = [];
	result['param_array'] = {};

	for (let item of ann_seria_array) {
		let selected = false;

		let tmp = await getAnnItemShot({ id: item['id'] });
		let el = {
			id: item['id'],
			name: item['name'],
			is_disable: item['is_disable'],
			image: item['image'],
			url: item['url'],
			url_delete: await bildDeleteCompareUrl({
				id: item['id'],
				compare_list: compare_list
			}),
			price_str: item['price_str'],
			mnemonic: item['mnemonic'],
			root_cat_id: item['root_cat_id'],
			cat_mnemonic: item['cat_mnemonic'],
			seria_mnemonic: item['seria_mnemonic']
		};
		result['model_array'].push(el);
	}

	{
		// try to fill in the matrix

		let item_nomber = 0;
		for (let val_1 of ann_seria_array) {
			for (let key_2 in val_1['param']) {
				let val_2 = val_1['param'][key_2];
				let section_param_name = val_2['name'];

				if (!result['param_array'][section_param_name]) {
					result['param_array'][section_param_name] = {};
				}

				for (let key_3 in val_2['param']) {
					let val_3 = val_2['param'][key_3];

					let param_name = val_3['name'];

					let param_value = val_3['value'];

					if (!result['param_array'][section_param_name][param_name]) {
						result['param_array'][section_param_name][param_name] = {};
					}

					result['param_array'][section_param_name][param_name][
						item_nomber
					] = param_value;
				}
			}
			item_nomber++;
		}
	}

	{
		//add missing cells

		let total_item_compare = Object.keys(result['model_array']).length;

		for (let key_1 in result['param_array']) {
			let val_1 = result['param_array'][key_1];

			for (let key_2 in val_1) {
				let val_2 = val_1[key_2];

				{
					//add missing elements
					for (let i = 0; i < total_item_compare; i++) {
						if (!val_2[i]) {
							// result['param_array'][key_1][key_2][i] = '';
						}
					}
				}

				{
					// sort the array
					let arr = result['param_array'][key_1][key_2];
					result['param_array'][key_1][key_2] = [];

					for (let i = 0; i < total_item_compare; i++) {
						result['param_array'][key_1][key_2].push(arr[i]);
					}
				}

				{
					// в пустые ячейки помещаем символ &mdash;
					let arr = result['param_array'][key_1][key_2];
					// foreach($arr as $key_3=>$val_3){
					for (let key_3 in arr) {
						let val_3 = arr[key_3];
						if (val_3 == '') {
							result['param_array'][key_1][key_2][key_3] = '&mdash;';
						}
					}
				}
			}
		}
	}

	{
		// delete categories in which there are no parameters
		for (let key_1 in result['param_array']) {
			let val_1 = result['param_array'][key_1];

			let param_total = 0;
			for (let key_2 in val_1) {
				param_total++;
			}
			if (param_total == 0) {
				delete result['param_array'][key_1];
			}
		}
	}

	// different parameter values
	if (config['diff'] == '1') {
		for (let c_raz_key in result['param_array']) {
			let c_razd_val = result['param_array'][c_raz_key];
			for (let c_opt_key in c_razd_val) {
				let c_opt_val = c_razd_val[c_opt_key];
				const array_unique = c_opt_val.filter(function(x, i, a) {
					return a.indexOf(x) == i;
				});
				if (array_unique.length == 1) {
					delete result['param_array'][c_raz_key][c_opt_key];
				}
			}
		}
	}
	{
		// delete categories in which there are no parameters
		for (let key_1 in result['param_array']) {
			let val_1 = result['param_array'][key_1];
			let param_total = 0;
			for (let key_2 in val_1) {
				param_total++;
			}
			if (param_total == 0) {
				delete result['param_array'][key_1];
			}
		}
	}

	return result;
}

async function getAnnArray(config, SESSION = null) {
	const db = await conn();
	const { root_cat_id, seria_id, cat_id, app } = config;

	// filter
	let and_cat_id = '';
	let and_root_cat_id = '';
	let and_seria_id = '';
	let and_app = '';
	{
		if (cat_id != undefined) {
			and_cat_id = ` AND  a.cat_id='${cat_id}' `;
		}
		if (root_cat_id != undefined) {
			and_root_cat_id = ` AND  a.root_cat_id='${root_cat_id}' `;
		}
		if (seria_id != undefined) {
			and_seria_id = ` AND  a.seria_id='${seria_id}' `;
		}
		if (app != undefined) {
			and_app = ` AND  a.app='${app}' `;
		}
	}

	let sql;
	{
		sql = `
			(
				SELECT
					a.*, a.sort AS ann_sort,
					c.mnemonic AS cat_mnemonic,
					c.compare AS cat_compare, c.extended_warranty AS cat_extended_warranty,
					s.name AS series_mnemonic, s.mnemonic AS seria_mnemonic, s.id AS seria_id, s.sort AS seria_sort,
					a_i.image
				FROM ann a

				INNER JOIN cat c ON c.id=a.root_cat_id
				INNER JOIN seria s ON s.id=a.seria_id

				LEFT JOIN ann_image a_i ON a_i.ann_id=a.id AND a_i.main='1'
				WHERE a.id!=0 AND a.is_disable='0'
					${and_cat_id} ${and_root_cat_id} ${and_seria_id} ${and_app}
				ORDER BY a.sort ASC
			)
			UNION
			(
				SELECT
					a.*, a.sort AS ann_sort,
					c.mnemonic AS cat_mnemonic,
					c.compare AS cat_compare, c.extended_warranty AS cat_extended_warranty,
					s.name AS series_mnemonic, s.mnemonic AS seria_mnemonic, s.id AS seria_id, s.sort AS seria_sort,
					a_i.image
				FROM ann a

				INNER JOIN cat c ON c.id=a.root_cat_id
				INNER JOIN seria s ON s.id=a.seria_id

				LEFT JOIN ann_image a_i ON a_i.ann_id=a.id AND a_i.main='1'

				INNER JOIN ann_add_cat aac ON aac.ann_id=a.id AND aac.cat_id='${root_cat_id}'

				WHERE a.id!=0 AND a.is_disable='0'
					${and_seria_id} ${and_app}
				ORDER BY a.sort ASC
			)
			ORDER BY seria_sort ASC, ann_sort ASC
		`;
	}

	let [result] = await db.query(sql);
	db.destroy();

	for (let item of result) {
		item['url'] = await bildUrl({ id: item['id'] });
		item['price_str'] = formatPrice(item['price']);

		if (config['no_text']) {
			delete item['text'];
			delete item['features'];
		}

		if (config['bild_seria_url']) {
			item['seria_url'] = await SeriaModel.bildUrl({ id: item['seria_id'] });
		}

		// add data
		if (config['get_main_param']) {
			const ch_array = await ChModel.getAnnTableChArray({
				id: item['id'],
				load_use_param: true,
				main_param: 1
			});
			item['param_array'] = ch_array[0]['param'];
		}

		item['in_compare'] = await checkInCompare(item, SESSION);

		if (config['count_compare']) {
			item['compare_total'] = await countCompare({ id: item['id'] }, SESSION);
		}

		if (config['get_compare_url']) {
			item['compare_url'] = await bildCompareUrl({ id: item['id'] }, SESSION);
		}
	}

	return result;
}

async function getAnnArrayForRegister(config) {
	const db = await conn();
	const { seria_id, root_cat_id, cat_id } = config;

	// filter
	let and_cat_id = '';
	let and_root_cat_id = '';
	let and_seria_id = '';
	if (cat_id != undefined) {
		and_cat_id = ` AND  a.cat_id='${cat_id}' `;
	}
	if (root_cat_id != undefined) {
		and_root_cat_id = ` AND  a.root_cat_id='${root_cat_id}' `;
	}
	if (seria_id != undefined) {
		and_seria_id = ` AND  a.seria_id='${seria_id}' `;
	}

	const sql = `
		(
			SELECT a.id, a.name, a.sort
			FROM ann a
			WHERE a.is_disable='0'  ${and_cat_id} ${and_root_cat_id} ${and_seria_id}
			ORDER BY a.sort ASC
		)
		UNION
		(
			SELECT a.id, a.name, a.sort
			FROM ann a
			INNER JOIN ann_add_cat aac ON aac.ann_id=a.id AND aac.cat_id='${root_cat_id}'
			WHERE a.is_disable='0' ${and_seria_id}
			ORDER BY a.sort ASC
		)
		ORDER BY sort ASC
	`;

	let [result] = await db.query(sql);
	db.destroy();

	return result;
}
async function getAnnImageArray(config) {
	const db = await conn();
	const { id } = config;

	const sql = `
		SELECT a_i.*
		FROM ann_image a_i
		WHERE a_i.ann_id='${id}'
		ORDER BY a_i.sort ASC
	`;

	let [result] = await db.query(sql);
	db.destroy();

	if (config['id_as_key'] == true) {
		let result_new = [];
		for (let item of result) {
			result_new[item['id']] = item;
		}
		result = result_new;
	}

	return result;
}

async function getAnnFeatureArray(config) {
	const db = await conn();
	const { id } = config;

	const sql = `
		SELECT a_i.*
		FROM ann_feature a_i
		WHERE a_i.ann_id='${id}'
		ORDER BY a_i.sort ASC
	`;

	let [result] = await db.query(sql);
	db.destroy();

	if (config['id_as_key'] == true) {
		let result_new = [];
		for (let item of result) {
			result_new[item['id']] = item;
		}
		result = result_new;
	}

	return result;
}

async function getAnnItemByMnemonic(config, SESSION) {
	const db = await conn();
	const { mnemonic } = config;

	const sql = `
		SELECT
			a.*,
			c.mnemonic AS cat_mnemonic,
			c.id AS cat_id,
			c.name_one AS cat_name_one,
			c.compare AS cat_compare, c.extended_warranty AS cat_extended_warranty,
			s.name AS series_mnemonic, s.mnemonic AS seria_mnemonic
		FROM ann a
		INNER JOIN cat c ON c.id=a.root_cat_id
		INNER JOIN seria s ON s.id=a.seria_id
		WHERE a.mnemonic='${mnemonic}'
	`;

	let [result] = await db.query(sql);
	db.destroy();

	result = result && result[0] ? result[0] : false;
	if (!result) {
		return false;
	}
	result['url'] = await bildUrl(result);
	result['image_array'] = await getAnnImageArray(result);
	result['price_str'] = formatPrice(result['price']);
	result['feature_array'] = await getAnnFeatureArray(result);
	result['ch_array'] = await ChModel.getAnnTableChArray({
		id: result['id'],
		load_use_param: true,
		main_param: 0
	});
	result['compare_total'] = await countCompare(result, SESSION);
	result['in_compare'] = await checkInCompare(result, SESSION);
	result['compare_url'] = await bildCompareUrl(result, SESSION);

	result['in_basket'] = BasketModel.checkInBasket(
		{ id: result['id'] },
		SESSION
	);
	result['in_basket_amount'] = BasketModel.checkInBasketAmount(
		{ id: result['id'] },
		SESSION
	);

	if (config['bild_seria_url']) {
		const SeriaModel = require('./seria');
		result['seria_url'] = await SeriaModel.bildUrl({ id: result['seria_id'] });
	}
	result['name_full'] = await bildFullName(result);
	return result;
}

async function searchAnn(config) {
	const db = await conn();
	let { query } = config;

	let sql, query_arr, and_query, and_query_arr;

	query = query.replace(/ +/g, ' ').trim();
	if (query) {
		and_query = `  AND (a.name LIKE '%${query}%' OR a.full_name LIKE '%${query}%') `;

		query_arr = query.split(' ');
		and_query_arr = 'AND ( ';

		let index = 0;
		for (let item of query_arr) {
			if (index != 0) {
				and_query_arr += ' AND ';
			}
			index++;
			and_query_arr += ` (a.name LIKE '%${item}%' OR a.full_name LIKE '%${item}%') `;
		}
		and_query_arr += ')';
	}

	if (query_arr.length == 1) {
		sql = `
		SELECT a.name, a.id, a.price,
				a.mnemonic AS ann_mnemonic,
				c.mnemonic AS cat_mnemonic,
				c2.name_one AS cat_name_one,
				a_i.image
			FROM ann a
			LEFT JOIN ann_image a_i ON a_i.ann_id=a.id AND a_i.main='1'
			INNER JOIN cat c ON c.id=a.cat_id
			LEFT JOIN cat c2 ON c2.id=a.root_cat_id
			WHERE a.id!=0 AND a.is_disable='0' ${and_query} AND a.price>0
			GROUP BY a.id
			ORDER BY a.name
			LIMIT 0,6
		`;
	} else {
		sql = `
		(
			SELECT a.name, a.id, a.price,
				a.mnemonic AS ann_mnemonic,
				c.mnemonic AS cat_mnemonic,
				c2.name_one AS cat_name_one,
				a_i.image
			FROM ann a
			LEFT JOIN ann_image a_i ON a_i.ann_id=a.id AND a_i.main='1'
			INNER JOIN cat c ON c.id=a.cat_id
			LEFT JOIN cat c2 ON c2.id=a.root_cat_id
			WHERE a.id!=0 AND a.is_disable='0' ${and_query}  AND a.price>0
			GROUP BY a.id
			ORDER BY a.name
		)
		UNION
		(
			SELECT a.name, a.id, a.price,
				a.mnemonic AS ann_mnemonic,
				c.mnemonic AS cat_mnemonic,
				c2.name_one AS cat_name_one,
				a_i.image
			FROM ann a
			LEFT JOIN ann_image a_i ON a_i.ann_id=a.id AND a_i.main='1'
			INNER JOIN cat c ON c.id=a.cat_id
			LEFT JOIN cat c2 ON c2.id=a.root_cat_id
			WHERE a.id!=0 AND a.is_disable='0' ${and_query_arr}  AND a.price>0
			GROUP BY a.id
			ORDER BY a.name
		)
		LIMIT 0,6
		`;
	}

	let [result] = await db.query(sql);
	db.destroy();

	for (let item of result) {
		if (!item['image']) {
			item['image'] = '';
		}
		item['url'] = await bildUrl(item);
		item['price_str'] = formatPrice(item['price']);
	}

	return result;
}

module.exports = {
	getAnnArrayForRegister,
	getAnnArray,
	getAnnItemByMnemonic,
	searchAnn,
	setCompare,
	getCompareAll,
	getAnnItemShot,
	formatPrice,
	getCompareItemArray
};
