const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: 'localhost',
  port:  3307,
  user:'root',
  password: '',
  database: 'escuela_demo',
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit: 0,
  decimalNumbers: true
});

async function ping() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  ping
};
