'use strict';

const mysql = require('mysql');
const config = require('config');

class Db {
	constructor() {
		this.connection = mysql.createPool({
			connectionLimit: 100,
			host: "localhost",
			user: "root",
			password: "",
			database: "chattest",
			debug: false
		});
	}
	query(sql, args) {
		return new Promise((resolve, reject) => {
			this.connection.query(sql, args, (err, rows) => {
				if (err)
					return reject(err);
				resolve(rows);
			});
		});
	}
	close() {
		return new Promise((resolve, reject) => {
			this.connection.end(err => {
				if (err)
					return reject(err);
				resolve();
			});
		});
	}
}
module.exports = new Db();
