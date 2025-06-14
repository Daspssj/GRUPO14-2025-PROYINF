const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken } = require('../middleware/auth');

// Crear un resultado al comenzar el ensayo
router.post('/crear-resultado', verificarToken, async (req, res) => {
  const alumno_id = req.usuario.id;
  const { ensayo_id } = req.body;

  if (!ensayo_id || !alumno_id) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO resultados (ensayo_id, alumno_id)
       VALUES ($1, $2)
       RETURNING id`,
      [ensayo_id, alumno_id]
    );

    const resultado_id = result.rows[0].id;

    res.status(201).json({ mensaje: 'Resultado creado', resultado_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear resultado' });
  }
});

// Calcular el puntaje total al finalizar
router.post('/calcular-resultado', verificarToken, async (req, res) => {
  const resultado_id = req.body.resultado_id;

  const verificacion = await pool.query(
    'SELECT * FROM resultados WHERE id = $1 AND alumno_id = $2',
    [resultado_id, req.usuario.id]
  );

  if (verificacion.rows.length === 0) {
    return res.status(403).json({ error: 'No autorizado para este resultado' });
  }

  if (!resultado_id) {
    return res.status(400).json({ error: 'Falta el resultado_id' });
  }

  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM respuestas WHERE resultado_id = $1 AND correcta = true',
      [resultado_id]
    );

    const puntaje = parseInt(result.rows[0].count);

    await pool.query(
      'UPDATE resultados SET puntaje = $1 WHERE id = $2',
      [puntaje, resultado_id]
    );

    res.json({ mensaje: 'Puntaje calculado y guardado', puntaje });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular el resultado' });
  }
});

router.get('/ver-resultados', verificarToken, async (req, res) => {
  const alumno_id = req.usuario.id;

  if (!alumno_id) {
    return res.status(400).json({ error: 'Falta el alumno_id' });
  }

  try {
    const result = await pool.query(`
      SELECT r.id AS resultado_id, e.nombre AS ensayo, m.nombre AS materia,
             r.puntaje, r.fecha
      FROM resultados r
      JOIN ensayos e ON r.ensayo_id = e.id
      JOIN materias m ON e.materia_id = m.id
      WHERE r.alumno_id = $1
      ORDER BY r.fecha DESC
    `, [alumno_id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los resultados' });
  }
});

router.get('/ver-detalle-resultado', verificarToken, async (req, res) => {
  const resultado_id = req.query.resultado_id;

  // Validación adicional opcional (¿el resultado es del usuario?)
  const verificacion = await pool.query(
    'SELECT * FROM resultados WHERE id = $1 AND alumno_id = $2',
    [resultado_id, req.usuario.id]
  );

  if (verificacion.rows.length === 0) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.id AS pregunta_id,
        p.enunciado,
        p.opcion_a,
        p.opcion_b,
        p.opcion_c,
        p.opcion_d,
        p.respuesta_correcta,
        r.respuesta_dada,
        r.correcta
      FROM respuestas r
      JOIN preguntas p ON r.pregunta_id = p.id
      WHERE r.resultado_id = $1
      ORDER BY p.id
    `, [resultado_id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener detalle del resultado' });
  }
});


module.exports = router;
