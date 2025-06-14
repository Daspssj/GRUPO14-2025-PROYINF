const express = require('express');
const router = express.Router();
const pool = require('../db');

const { verificarToken } = require('../middleware/auth');


router.get('/materias', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre FROM materias');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});

module.exports = router;
