const { Pool } = require('pg');
require('dotenv').config();
const devConfig = {
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	host: process.env.PG_HOST,
	port: process.env.PG_PORT,
	database: process.env.PG_DB,
};
const proConfig = {
	connectionStrong: process.env.DATABASE_URL, //heroku addons
};
const pool = new Pool(devConfig);

module.exports = pool;
