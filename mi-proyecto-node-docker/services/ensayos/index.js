// services/ensayos/index.js (VERSIÓN CORREGIDA Y SIMPLIFICADA)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const verifyToken = require('../_common/middleware/verifyToken');
const ensayosRoutes = require('./routes/ensayos');

const app = express();
const PORT = process.env.PORT || 5003;
const SERVICE_NAME = 'ensayos-service';

// --- Middlewares Globales ---
// 1. CORS: Permite peticiones de otros orígenes.
app.use(cors());
// 2. Body Parser: INDISPENSABLE para leer req.body en peticiones POST/PUT.
app.use(express.json());

// --- Rutas ---
// Ruta de salud pública (se define ANTES de la autenticación).
app.get('/health', (req, res) => res.status(200).json({ ok: true, service: SERVICE_NAME }));

// Para el resto de las rutas, primero aplicamos el middleware de verificación de token
// y LUEGO montamos todas las rutas de negocio.
app.use('/', verifyToken, ensayosRoutes);

// --- Iniciar servidor ---
app.listen(PORT, () => {
    console.log(`[${SERVICE_NAME}] escuchando en puerto ${PORT}`);
});