const express = require('express');
const cors = require('cors');

const estudiantesRouter = require('./routes/estudiantes.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/estudiantes', estudiantesRouter);

// Not found handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'El email ya existe en la base de datos' });
  }

  res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;
