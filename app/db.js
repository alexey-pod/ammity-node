const config = require('../app/config');
const mysql = require('mysql2/promise');

module.exports = async function conn() {
	const conn = await mysql.createConnection(config.get('mysql'));
	return conn;
};
