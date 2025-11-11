//Libreria para hacer API
const express = require('express');
//Permite que el API y front esten en el mismo servidor (Mi PC), es una politica de seguridad
const cors = require('cors');

const estudiantesRouter = require('./routes/estudiantes.routes');

const app = express();

app.use(cors());
app.use(express.json());

//Para saber si esta funcionan la API con http://localhost:3000/health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

//Lo que venga de estudiantesRouter se use con http://localhost:3000/api/estudiantes
app.use('/api/estudiantes', estudiantesRouter);

//Handler por si se usa una ruta inexistente
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

//Errores de consola y lo que debe responder
app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'El email ya existe en la base de datos' });
  }

  res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;
