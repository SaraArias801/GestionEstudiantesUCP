const dotenv = require('dotenv');
const app = require('./app');
const { ping } = require('./database');

dotenv.config();

const port = Number(process.env.PORT || 3000);

async function start() {
  try {
    await ping();
    console.log('Conexión exitosa con la base de datos');
  } catch (error) {
    console.error('No fue posible conectar con la base de datos:', error.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
  });
}

start();
