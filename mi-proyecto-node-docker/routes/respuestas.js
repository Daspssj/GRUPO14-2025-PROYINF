const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken } = require('../middleware/auth');

router.post('/responder-pregunta', verificarToken, async (req, res) => {
  const { resultado_id, pregunta_id, respuesta_dada } = req.body;

  // Validar que el resultado le pertenece al usuario
  const verificacion = await pool.query(
    'SELECT * FROM resultados WHERE id = $1 AND alumno_id = $2',
    [resultado_id, req.usuario.id]
  );

  if (verificacion.rows.length === 0) {
    return res.status(403).json({ error: 'No autorizado para responder este ensayo' });
  }

  if (!resultado_id || !pregunta_id || !respuesta_dada) {
    return res.status(400).json({ error: 'Faltan datos para registrar respuesta' });
  }

  try {
    const result = await pool.query('SELECT respuesta_correcta FROM preguntas WHERE id = $1', [pregunta_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    const correcta = respuesta_dada.toUpperCase() === result.rows[0].respuesta_correcta;

    const existente = await pool.query(
      'SELECT * FROM respuestas WHERE resultado_id = $1 AND pregunta_id = $2',
      [resultado_id, pregunta_id]
    );

    if (existente.rows.length > 0) {
      await pool.query(
        'UPDATE respuestas SET respuesta_dada = $1, correcta = $2 WHERE resultado_id = $3 AND pregunta_id = $4',
        [respuesta_dada, correcta, resultado_id, pregunta_id]
      );
    } else {
      await pool.query(
        `INSERT INTO respuestas (resultado_id, pregunta_id, respuesta_dada, correcta)
         VALUES ($1, $2, $3, $4)`,
        [resultado_id, pregunta_id, respuesta_dada, correcta]
      );
    }

    res.status(200).json({ mensaje: 'Respuesta registrada o actualizada', correcta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar respuesta' });
  }
});

module.exports = router;
