require('dotenv').config();
const pg = require('pg');
const Pool = pg.Pool;

pg.types.setTypeParser(1082, function (stringValue) {
  return stringValue; //1082 for date type
});

const pool = new Pool({
  user: 'postgres',
  password: process.env.POSTGRESQL_SECRET,
  host: 'localhost',
  port: 5432,
  database: 'teamup',
});

module.exports = pool;
