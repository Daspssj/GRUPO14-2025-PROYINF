const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken } = require('../middleware/auth');

router.post('/crear-pregunta', async (req, res) => {
  const {
    enunciado,
    imagen,
    opcion_a,
    opcion_b,
    opcion_c,
    opcion_d,
    respuesta_correcta,
    materia_id
  } = req.body;

  if (!enunciado || !opcion_a || !opcion_b || !opcion_c || !opcion_d || !respuesta_correcta || !materia_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO preguntas (
        enunciado, imagen, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [enunciado, imagen || null, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la pregunta' });
  }
});

router.get('/ver-preguntas', async (req, res) => {
  const { materia_id, busqueda } = req.query;

  let baseQuery = 'SELECT * FROM preguntas';
  const conditions = [];
  const values = [];

  if (materia_id) {
    values.push(materia_id);
    conditions.push(`materia_id = $${values.length}`);
  }

  if (busqueda) {
    values.push(`%${busqueda}%`);
    conditions.push(`enunciado ILIKE $${values.length}`);
  }

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    const result = await pool.query(baseQuery, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener preguntas' });
  }
});

router.delete('/eliminar-pregunta/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM preguntas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    res.json({ mensaje: 'Pregunta eliminada', pregunta: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar: esta pregunta ya está asociada a un ensayo' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar pregunta' });
  }
});

router.put('/preguntas/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const {
    enunciado,
    opcion_a,
    opcion_b,
    opcion_c,
    opcion_d,
    respuesta_correcta,
    materia_id,
    imagen
  } = req.body;

  try {
    await pool.query(
      'UPDATE preguntas SET enunciado = $1, opcion_a = $2, opcion_b = $3, opcion_c = $4, opcion_d = $5, respuesta_correcta = $6, materia_id = $7, imagen = $8 WHERE id = $9',
      [enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id, imagen, id]
    );
    res.status(200).json({ mensaje: 'Pregunta actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la pregunta' });
  }
});

router.delete('/preguntas/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM preguntas WHERE id = $1', [id]);
    res.json({ mensaje: 'Pregunta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la pregunta' });
  }
});


module.exports = router;
