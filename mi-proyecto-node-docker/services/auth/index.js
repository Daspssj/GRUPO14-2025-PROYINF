// index.js ─ Plantilla del microservicio Auth
require('dotenv').config();

const express = require('express');
// const cors = require('cors'); // CORS lo maneja el Gateway (Nginx)
const verify = require('../_common/middleware/verifyToken');

const cookieParser = require('cookie-parser');      // opcional
const session = require('express-session');         // opcional (no estrictamente necesario si usamos state JWT)

const routes = require('./routes/auth');            // <-- AQUÍ están /login, /registro, OAuth Google y /complete-profile

// ───────────── Config ─────────────
const SERVICE_NAME = process.env.SERVICE_NAME || 'auth-service';
const PORT = Number(process.env.PORT || 5001);

/**
 * NOTA IMPORTANTE SOBRE NGINX:
 * Con la configuración que te dejé, Nginx hace proxy:
 *   location /api/auth/ { proxy_pass http://auth_service/; }
 * Esto significa que al servicio le llega la ruta SIN el prefijo `/api/auth`.
 * Ej.: GET /api/auth/me  --> el servicio recibe: GET /me
 */

// Rutas PÚBLICAS (no requieren verifyToken)
const PUBLIC_PATHS = new Set([
  '/health',
  '/login',
  '/registro',
  '/oauth/google/start',
  '/oauth/google/callback',
  '/complete-profile', // usa token temporal (purpose:onboarding), por eso NO pasa por verify normal
]);

const app = express();
app.use(express.json());

// Cookies + sesión (opcional). Puedes quitar esto si no la usas.
app.use(cookieParser());
app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // en prod con HTTPS: true
    },
  })
);

// Middleware para exigir JWT en rutas privadas
app.use((req, res, next) => {
  // Preflight y HEAD no requieren auth
  if (req.method === 'OPTIONS' || req.method === 'HEAD') return next();

  // Si la ruta actual es pública, no pedir JWT
  if (PUBLIC_PATHS.has(req.path)) return next();

  // El resto pasa por verifyToken (espera payload { uid, rol })
  return verify(req, res, next);
});

// Salud
app.get('/health', (_req, res) => res.json({ ok: true, service: SERVICE_NAME }));

/**
 * Monta el router principal en raíz "/"
 * - IMPORTANTE: como Nginx quita el prefijo, aquí deben estar las rutas sin "/api/auth".
 *   Ej.: router.get('/me') => expone GET /me (que Nginx mapea desde /api/auth/me)
 */
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`[${SERVICE_NAME}] escuchando en puerto ${PORT}`);
});