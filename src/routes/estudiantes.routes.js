// routes/estudiantes.routes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//Conexion a MYSQL
const { pool } = require('../database');

//Define rutas de la API
const router = express.Router();

// --- NUEVO: Middleware de DEPURACIÓN para este router ---
// Esto nos mostrará CADA petición que entra a este archivo
router.use((req, res, next) => {
    console.log(`--- [Router Estudiantes] Petición: ${req.method} ${req.originalUrl}`);
    next(); // Continúa con la siguiente ruta o middleware
});


// --- Middleware para verificar el token (sin cambios) ---
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log("--- ERROR: Token no proporcionado ---"); // Log para depurar
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("--- ERROR: Token inválido ---"); // Log para depurar
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

// =================================================================================
// ==  RUTAS PÚBLICAS (NO necesitan token) - DEBEN ESTAR PRIMERO                 ==
// =================================================================================

// Ruta para el Registro de Usuarios
router.post('/register', async (req, res) => {
  console.log("--- Entrando a la ruta /register ---");
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, email, password' });
  }

  try {
    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'El email ya está en uso' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
      [nombre, email, passwordHash]
    );

    res.status(201).json({ message: 'Usuario creado exitosamente', userId: result.insertId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para el Login
router.post('/login', async (req, res) => {
  console.log("--- Entrando a la ruta /login ---");
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const payload = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login exitoso',
      token: token,
      user: payload
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// =================================================================================
// ==  RUTAS PROTEGIDAS (SÍ necesitan token) - USAN `verificarToken`            ==
// =================================================================================

const editableFields = [
  'nombre', 'apellido', 'edad', 'grado', 'curso', 'email', 'telefono',
  'nota_p1', 'nota_p2', 'nota_p3', 'nota_p4'
];

//Inicio del buscador
router.get('/', verificarToken, async (req, res, next) => {
  console.log("--- Entrando a la ruta GET / (protegida) ---");
  const { grado, estado, search, limit, offset } = req.query;
  try {
    const whereClauses = []; const values = [];
    if (grado) { whereClauses.push('grado = ?'); values.push(grado); }
    if (estado) { whereClauses.push('estado = ?'); values.push(estado); }
    if (search) { whereClauses.push('(nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)'); const like = `%${search}%`; values.push(like, like, like); }
    let query = 'SELECT * FROM estudiantes';
    if (whereClauses.length > 0) { query += ` WHERE ${whereClauses.join(' AND ')}`; }
    query += ' ORDER BY id DESC';
    const numericLimit = Number(limit); const numericOffset = Number(offset);
    if (!Number.isNaN(numericLimit) && numericLimit > 0) { query += ' LIMIT ?'; values.push(numericLimit); }
    if (!Number.isNaN(numericOffset) && numericOffset >= 0) { if (Number.isNaN(numericLimit) || numericLimit <= 0) { query += ' LIMIT 18446744073709551615'; } query += ' OFFSET ?'; values.push(numericOffset); }
    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (error) { next(error); }
});

//Buscador por ID
router.get('/:id', verificarToken, async (req, res, next) => {
  console.log("--- Entrando a la ruta GET /:id (protegida) ---");
  const { id } = req.params;
  try { const [rows] = await pool.query('SELECT * FROM estudiantes WHERE id = ?', [id]); if (rows.length === 0) { return res.status(404).json({ message: 'Estudiante no encontrado' }); } res.json(rows[0]); } catch (error) { next(error); }
});

//Añadir nuevo estudiante
router.post('/', verificarToken, async (req, res, next) => {
  console.log("--- Entrando a la ruta POST / (protegida) ---");
  const payload = req.body || {};
  const requiredFields = editableFields.filter((field) => field !== 'telefono' && field !== 'curso');
  const missingFields = requiredFields.filter((field) => payload[field] === undefined);
  if (missingFields.length > 0) { return res.status(400).json({ message: 'Faltan campos obligatorios', fields: missingFields }); }
  try { const insertFields = editableFields.filter((field) => payload[field] !== undefined); const values = insertFields.map((field) => payload[field]); const placeholders = insertFields.map(() => '?').join(', '); const columns = insertFields.join(', '); const [result] = await pool.query(`INSERT INTO estudiantes (${columns}) VALUES (${placeholders})`, values); const [rows] = await pool.query('SELECT * FROM estudiantes WHERE id = ?', [result.insertId]); res.status(201).json(rows[0]); } catch (error) { next(error); }
});

//Editar estudiante
router.put('/:id', verificarToken, async (req, res, next) => {
  console.log("--- Entrando a la ruta PUT /:id (protegida) ---");
  const { id } = req.params; const payload = req.body || {};
  try { const updates = []; const values = []; editableFields.forEach((field) => { if (payload[field] !== undefined) { updates.push(`${field} = ?`); values.push(payload[field]); } }); if (updates.length === 0) { return res.status(400).json({ message: 'No se proporcionaron campos para actualizar' }); } values.push(id); const [result] = await pool.query(`UPDATE estudiantes SET ${updates.join(', ')} WHERE id = ?`, values); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Estudiante no encontrado' }); } const [rows] = await pool.query('SELECT * FROM estudiantes WHERE id = ?', [id]); res.json(rows[0]); } catch (error) { next(error); }
});

//Borrar estudiante
router.delete('/:id', verificarToken, async (req, res, next) => {
  console.log("--- Entrando a la ruta DELETE /:id (protegida) ---");
  const { id } = req.params;
  try { const [result] = await pool.query('DELETE FROM estudiantes WHERE id = ?', [id]); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Estudiante no encontrado' }); } res.status(204).send(); } catch (error) { next(error); }
});


module.exports = router;