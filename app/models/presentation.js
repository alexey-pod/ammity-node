const conn = require('../db.js');
const pp_global = 10;

async function getPresentationItem(config) {
	const { id } = config;
	const db = await conn();
	const sql = `
		SELECT pr.*
		FROM presentation pr
		WHERE pr.id='${id}'
	`;
	const [result] = await db.query(sql);
	db.destroy();

	if (result.length) {
		return result[0];
	} else {
		return false;
	}
}

async function bildUrl(config) {
	const { id } = config;
	const db = await conn();
	const item = await getPresentationItem(config);
	let url = '';
	if (item['url'] == '') {
		url = '/pages/presentation/#pr_' + id;
	} else {
		url = item['url'];
	}
	return url;
}

async function getPresentationImageArray(config) {
	const db = await conn();
	const { id } = config;
	const sql = `
		SELECT a_i.*
		FROM presentation_image a_i
		WHERE a_i.presentation_id='${id}'
		ORDER BY a_i.sort ASC
	`;
	let [result] = await db.query(sql);
	db.destroy();

	if (config['id_as_key'] == true) {
		let result_new = {};
		for (let item of result) {
			result_new[item['id']] = item;
		}
		result = result_new;
	}

	return result;
}

async function getPresentationArray(config) {
	const db = await conn();

	const pp = config['pp'] ? config['pp'] : pp_global;
	let LIMIT = '';
	if (config['page'] != '-1') {
		const limitCount = (config['page'] - 1) * pp;
		LIMIT = `LIMIT ${limitCount}, ${pp}`;
	}

	// filter
	let and_show_in_mane = '';
	if (config['show_in_mane']) {
		let show_in_mane = config['show_in_mane'];
		and_show_in_mane = ` AND pr.show_in_mane='${show_in_mane}' `;
	}
	let and_show_in_pr_page = '';
	if (config['show_in_pr_page']) {
		let show_in_pr_page = config['show_in_pr_page'];
		and_show_in_pr_page = ` AND pr.show_in_pr_page='${show_in_pr_page}' `;
	}

	const sql = `
		SELECT pr.*
		FROM presentation pr
		WHERE pr.id!=0 AND pr.is_disable='0'
			${and_show_in_mane} ${and_show_in_pr_page}
		ORDER BY pr.SORT ASC
		${LIMIT}
	`;

	const [result] = await db.query(sql);
	db.destroy();

	if (config['get_image']) {
		for (let item of result) {
			item['image_array'] = await getPresentationImageArray({ id: item['id'] });
		}
	}

	if (config['bild_url']) {
		for (let item of result) {
			item['url'] = await bildUrl({ id: item['id'] });
		}
	}

	return result;
}

module.exports = { getPresentationArray };
