const conn = require('../db.js');

async function getAll() {
	const db = await conn();
	const sql = 'SELECT * FROM config';
	const [result] = await db.query(sql);
	db.destroy();
	let config = {};
	result.forEach(function(item) {
		config[item.key] = item.val;
	});
	return config;
}

module.exports = { getAll };
