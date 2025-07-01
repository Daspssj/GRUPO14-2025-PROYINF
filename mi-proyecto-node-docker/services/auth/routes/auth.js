console.log('✅ auth.js fue cargado');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- RUTA DE REGISTRO DE USUARIOS (NO REQUIERE AUTENTICACIÓN) ---
router.post('/registro', async (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;
    console.log(`--- INTENTO DE REGISTRO para correo: ${correo}, rol: ${rol} ---`);

    if (!nombre || !correo || !contrasena || !rol) {
        console.warn('⚠️ Faltan campos obligatorios para el registro.');
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (rol !== 'alumno' && rol !== 'docente') {
        console.warn('⚠️ Rol inválido proporcionado durante el registro:', rol);
        return res.status(400).json({ error: 'Rol inválido. Debe ser "alumno" o "docente".' });
    }

    try {
        // Verificar si el correo ya existe
        const userExists = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (userExists.rows.length > 0) {
            console.warn('⚠️ Intento de registro con correo ya existente:', correo);
            return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedContrasena = await bcrypt.hash(contrasena, salt);

        // Insertar nuevo usuario en la base de datos
        const newUser = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo, rol',
            [nombre, correo, hashedContrasena, rol]
        );
        console.log(`✅ Usuario registrado exitosamente con ID: ${newUser.rows[0].id}`);
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: newUser.rows[0] });

    } catch (err) {
        console.error('💥 Error en el registro de usuario:', err.message);
        res.status(500).json({ error: 'Error del servidor al registrar usuario', detalle: err.message });
    }
});


// --- RUTA DE LOGIN DE USUARIOS ---
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    console.log(`--- INTENTO DE LOGIN para correo: ${correo} ---`);

    try {
        // Buscar usuario por correo
        const user = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (user.rows.length === 0) {
            console.warn('⚠️ Intento de login fallido: Correo no encontrado.');
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }

        const usuario = user.rows[0];

        // Comparar contraseña hasheada
        const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!isMatch) {
            console.warn('⚠️ Intento de login fallido: Contraseña incorrecta.');
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }

        // Generar JWT
        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }); 
        console.log(`✅ Login exitoso para usuario ID: ${usuario.id}, Rol: ${usuario.rol}`);
        res.status(200).json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol } });

    } catch (err) {
        console.error('💥 Error en el login de usuario:', err.message);
        res.status(500).json({ error: 'Error del servidor al iniciar sesión', detalle: err.message });
    }
});


// --- RUTAS DE EJEMPLO PROTEGIDAS (Requieren Token y Roles Específicos) ---
// Estas rutas solo funcionarán si tienes el middleware verificarToken y authorizeRoles correctamente importados
// y expuestos en tu archivo ../../_common/middleware/auth.js.
// Si deseas usarlas, descomenta las importaciones y las rutas.

/*
const { verificarToken, authorizeRoles } = require('../../_common/middleware/auth'); 

// Ruta de ejemplo solo para administradores
router.get('/admin', verificarToken, authorizeRoles(['admin']), (req, res) => {
    console.log(`Acceso a /admin por usuario ID: ${req.usuario.id}, Rol: ${req.usuario.rol}`);
    res.json({ mensaje: '¡Bienvenido Administrador!', usuario: req.usuario });
});

// Ruta de ejemplo solo para alumnos
router.get('/alumno', verificarToken, authorizeRoles(['alumno']), (req, res) => {
    console.log(`Acceso a /alumno por usuario ID: ${req.usuario.id}, Rol: ${req.usuario.rol}`);
    res.json({ mensaje: '¡Bienvenido Alumno!', usuario: req.usuario });
});

// Ruta de ejemplo accesible para docentes y administradores
router.get('/docente-admin', verificarToken, authorizeRoles(['docente', 'admin']), (req, res) => {
    console.log(`Acceso a /docente-admin por usuario ID: ${req.usuario.id}, Rol: ${req.usuario.rol}`);
    res.json({ mensaje: '¡Bienvenido Docente/Admin!', usuario: req.usuario });
});
*/

module.exports = router;
