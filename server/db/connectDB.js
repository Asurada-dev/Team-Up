require('dotenv').config();
const fs = require('fs');
const pg = require('pg');
const Pool = pg.Pool;

pg.types.setTypeParser(1082, function (stringValue) {
  return stringValue; //1082 for date type
});

const pool = new Pool({
  user: process.env.RDS_POSTGRESQL_USER,
  password: process.env.RDS_POSTGRESQL_SECRET,
  host: process.env.RDS_POSTGRESQL_HOST,
  port: 5432,
  database: process.env.RDS_POSTGRESQL_DATABASE,
  ssl: {
    ca: fs.readFileSync(process.env.RDS_POSTGRESQL_CA),
    rejectUnauthorized: true,
  },
});

module.exports = pool;
