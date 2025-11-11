//Invocacion de la BD
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

//Esta metiendo problemas, ayuda
dotenv.config();

//Metodo de mysql es la herramiento para manipular la BD (Pool)
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

//Manda datos y si todo esta ok devuelvo true, creo
async function ping() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release(); //Para que no se quede mandando datos pa' siempre
  }
}

module.exports = {
  pool,
  ping
};
