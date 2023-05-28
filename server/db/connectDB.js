require('dotenv').config();
const pg = require('pg');
const Pool = pg.Pool;

pg.types.setTypeParser(1082, function (stringValue) {
  return stringValue; //1082 for date type
});

const pool = new Pool({
  user: 'postgres',
  password: process.env.POSTGRESQL_SECRET,
  host: 'team-up-database-postgresql.cl5lnyzxynx4.ap-southeast-1.rds.amazonaws.com',
  port: 5432,
  database: 'teamup',
});

module.exports = pool;
