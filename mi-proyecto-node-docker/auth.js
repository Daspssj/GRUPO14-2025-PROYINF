const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const pool = require('./db');
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4)',
      [nombre, correo, hashedPassword, rol]
    );
    res.status(201).send('Usuario registrado correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el registro');
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (result.rows.length === 0) {
      return res.status(401).send('Usuario no encontrado');
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPassword) {
      return res.status(401).send('Contraseña incorrecta');
    }

    req.session.user = {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol
    };
    res.send('Inicio de sesión exitoso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el login');
  }
});

// Cerrar sesión
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.send('Sesión cerrada');
});

// Ver usuario actual logueado
router.get('/whoami', (req, res) => {
  if (req.session.user) {
    res.json({ usuario: req.session.user });
  } else {
    res.status(401).send('No autenticado');
  }
});

// Vista protegida para alumnos
router.get('/alumno/panel', async (req, res) => {
  if (!req.session.user || req.session.user.rol !== 'alumno') {
    return res.status(403).send('Acceso no autorizado');
  }

  try {
    const { id, nombre } = req.session.user;

    // Obtener los ensayos disponibles
    const ensayos = await pool.query(
      `SELECT e.id, e.nombre, m.nombre AS materia
       FROM ensayos e
       JOIN materias m ON e.materia_id = m.id`
    );

    res.json({
      alumno: nombre,
      ensayos_disponibles: ensayos.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos del panel');
  }
});

// Ruta temporal para listar todos los usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, rol FROM usuarios ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener usuarios');
  }
});


module.exports = router;
