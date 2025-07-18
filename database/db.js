require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('Postgres connected. Server time:', res.rows[0].now);
  })
  .catch(err => {
    console.error('Connection error:', err.stack);
  });

module.exports = pool;
