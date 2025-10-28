const express = require('express');
const { pool } = require('../database');

const router = express.Router();

const editableFields = [
  'nombre',
  'apellido',
  'edad',
  'grado',
  'curso',
  'email',
  'telefono',
  'nota_p1',
  'nota_p2',
  'nota_p3',
  'nota_p4'
];

router.get('/', async (req, res, next) => {
  const { grado, estado, search, limit, offset } = req.query;

  try {
    const whereClauses = [];
    const values = [];

    if (grado) {
      whereClauses.push('grado = ?');
      values.push(grado);
    }

    if (estado) {
      whereClauses.push('estado = ?');
      values.push(estado);
    }

    if (search) {
      whereClauses.push('(nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)');
      const like = `%${search}%`;
      values.push(like, like, like);
    }

    let query = 'SELECT * FROM estudiantes';

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ' ORDER BY id DESC';

    const numericLimit = Number(limit);
    const numericOffset = Number(offset);

    if (!Number.isNaN(numericLimit) && numericLimit > 0) {
      query += ' LIMIT ?';
      values.push(numericLimit);
    }

    if (!Number.isNaN(numericOffset) && numericOffset >= 0) {
      if (Number.isNaN(numericLimit) || numericLimit <= 0) {
        query += ' LIMIT 18446744073709551615';
      }

      query += ' OFFSET ?';
      values.push(numericOffset);
    }

    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM estudiantes WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const payload = req.body || {};
  const requiredFields = editableFields.filter((field) => field !== 'telefono' && field !== 'curso');
  const missingFields = requiredFields.filter((field) => payload[field] === undefined);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Faltan campos obligatorios',
      fields: missingFields
    });
  }

  try {
    const insertFields = editableFields.filter((field) => payload[field] !== undefined);
    const values = insertFields.map((field) => payload[field]);

    const placeholders = insertFields.map(() => '?').join(', ');
    const columns = insertFields.join(', ');

    const [result] = await pool.query(
      `INSERT INTO estudiantes (${columns}) VALUES (${placeholders})`,
      values
    );

    const [rows] = await pool.query('SELECT * FROM estudiantes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const payload = req.body || {};

  try {
    const updates = [];
    const values = [];

    editableFields.forEach((field) => {
      if (payload[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(payload[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron campos para actualizar' });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE estudiantes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    const [rows] = await pool.query('SELECT * FROM estudiantes WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM estudiantes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
