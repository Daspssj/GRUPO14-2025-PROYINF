/* eslint-disable no-console */
console.log('✅ auth.js fue cargado');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// === Config & helpers ===
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_ISSUER = process.env.JWT_ISSUER || 'paes-auth';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const AUTH_PUBLIC_BASE_URL = process.env.AUTH_PUBLIC_BASE_URL || 'http://localhost';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function toBase64Url(obj) {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return Buffer.from(json).toString('base64url');
}

function signAccessToken({ uid, rol }, expiresIn = '2h') {
  return jwt.sign({ uid, rol }, JWT_SECRET, { issuer: JWT_ISSUER, expiresIn });
}

function signTempOnboardingToken(claims, expiresIn = '10m') {
  // claims: { sub, email, name, picture }
  return jwt.sign(
    { purpose: 'onboarding', ...claims, aud: 'paes-frontend' },
    JWT_SECRET,
    { issuer: JWT_ISSUER, expiresIn }
  );
}

function verifyTempOnboardingToken(token) {
  const payload = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
  if (payload.purpose !== 'onboarding') {
    const err = new Error('invalid_purpose');
    err.statusCode = 400;
    throw err;
  }
  return payload;
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function normalizeRol(rolRaw) {
  const r = String(rolRaw || '').trim().toLowerCase();
  // aceptamos "profesor" pero mapeamos a "docente"
  if (r === 'profesor') return 'docente';
  return r;
}

// === DB Pool (único para este router) ===
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'paes_db',
});

// =========================================================
//                 REGISTRO (local)
// =========================================================
/**
 * POST /registro  (pública)
 * Crea usuario local (contraseña hasheada). No devuelve token.
 */
router.post('/registro', async (req, res) => {
  let { nombre, correo, contrasena, rol } = req.body;
  nombre = (nombre || '').trim();
  correo = normalizeEmail(correo);
  rol = normalizeRol(rol);

  console.log(`--- INTENTO DE REGISTRO correo:${correo} rol:${rol} ---`);

  if (!nombre || !correo || !contrasena || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (!['alumno', 'docente'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser "alumno" o "docente".' });
  }
  if (contrasena.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const exists = await pool.query('SELECT 1 FROM usuarios WHERE correo = $1 LIMIT 1', [correo]);
    if (exists.rows.length) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);

    const ins = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol, correo_verificado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, correo, rol`,
      [nombre, correo, hash, rol, false]
    );

    return res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: ins.rows[0] });
  } catch (err) {
    console.error('💥 Error en /registro:', err);
    return res.status(500).json({ error: 'Error del servidor al registrar usuario' });
  }
});

// =========================================================
/**
 * POST /login  (pública)
 * Genera JWT con { uid, rol } alineado al verify y a Google OAuth
 */
// =========================================================
router.post('/login', async (req, res) => {
  const correo = normalizeEmail(req.body?.correo);
  const contrasena = req.body?.contrasena || '';
  console.log(`--- INTENTO DE LOGIN correo:${correo} ---`);

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Debes ingresar correo y contraseña.' });
  }

  try {
    const q = await pool.query('SELECT * FROM usuarios WHERE correo = $1 LIMIT 1', [correo]);
    if (!q.rows.length) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }
    const usuario = q.rows[0];

    const ok = await bcrypt.compare(contrasena, usuario.contrasena || '');
    if (!ok) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const token = signAccessToken({ uid: usuario.id, rol: usuario.rol });

    return res.status(200).json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (err) {
    console.error('💥 Error en /login:', err);
    return res.status(500).json({ error: 'Error del servidor al iniciar sesión' });
  }
});

// =========================================================
//                 GOOGLE OAUTH
// =========================================================

/**
 * Lazy import + client cache para openid-client
 */
let _oidcClientPromise = null;
async function getOidcClient() {
  if (_oidcClientPromise) return _oidcClientPromise;
  _oidcClientPromise = (async () => {
    const { Issuer, generators } = await import('openid-client'); // ESM dinámico
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
    }

    const googleIssuer = await Issuer.discover('https://accounts.google.com');
    const client = new googleIssuer.Client({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uris: [`${AUTH_PUBLIC_BASE_URL}/api/auth/oauth/google/callback`],
      response_types: ['code'],
    });

    return { client, generators };
  })();
  return _oidcClientPromise;
}

/**
 * GET /oauth/google/start
 * Redirige a Google con scope 'openid email profile' y state firmado (JWT).
 */
router.get('/oauth/google/start', async (req, res) => {
  try {
    const { client, generators } = await getOidcClient();

    // 1) Generamos nonce y lo guardamos DENTRO del state (firmado con JWT)
    const nonce = generators.nonce();
    const state = jwt.sign(
      { flow: 'google', nonce, t: Date.now() }, // <= guardamos el nonce aquí
      JWT_SECRET,
      { issuer: JWT_ISSUER, expiresIn: '10m' }
    );

    const authUrl = client.authorizationUrl({
      scope: 'openid email profile',
      state,
      nonce, // <= también se envía al authorize endpoint
    });

    return res.redirect(authUrl);
  } catch (err) {
    console.error('💥 Error en /oauth/google/start:', err);
    return res.status(500).send('Error iniciando OAuth con Google');
  }
});

/**
 * GET /oauth/google/callback
 * Si el email existe -> emite token final y redirige a /oauth-success
 * Si no existe -> emite token temporal (purpose:onboarding) y redirige a /onboarding
 */
// --- GET /oauth/google/callback ---
router.get('/oauth/google/callback', async (req, res) => {
  try {
    const { client } = await getOidcClient();
    const params = client.callbackParams(req);

    // 2) Verificamos el state y recuperamos el nonce original
    let decodedState;
    try {
      decodedState = jwt.verify(params.state, JWT_SECRET, { issuer: JWT_ISSUER });
    } catch (e) {
      console.error('✋ state inválido:', e?.message);
      return res.redirect(`${FRONTEND_BASE_URL}/login?error=oauth_state_invalid`);
    }
    const nonce = decodedState?.nonce; // <= ÉSTE es el que espera openid-client

    // 3) Pasamos { state, nonce } a client.callback para validar el id_token
    const tokenSet = await client.callback(
      `${AUTH_PUBLIC_BASE_URL}/api/auth/oauth/google/callback`,
      params,
      { state: params.state, nonce } // <= ¡la clave del fix!
    );

    const claims = tokenSet.claims();
    const email = normalizeEmail(claims.email);
    const email_verified = !!claims.email_verified;
    const sub = claims.sub;
    const name = claims.name || '';
    const picture = claims.picture || '';

    if (!email || !email_verified) {
      return res.redirect(`${FRONTEND_BASE_URL}/login?error=email_not_verified`);
    }

    // ... (resto del callback igual que ya lo tienes)
    const q = await pool.query('SELECT id, nombre, correo, rol FROM usuarios WHERE correo = $1 LIMIT 1', [email]);
    if (q.rows.length) {
      const usuario = q.rows[0];
      const finalToken = signAccessToken({ uid: usuario.id, rol: usuario.rol });
      const usuarioB64 = toBase64Url(usuario);
      const url = `${FRONTEND_BASE_URL}/oauth-success?token=${encodeURIComponent(finalToken)}&usuario=${encodeURIComponent(usuarioB64)}`;
      return res.redirect(url);
    }

    const temp = signTempOnboardingToken({ sub, email, name, picture });
    const url = `${FRONTEND_BASE_URL}/onboarding?temp_token=${encodeURIComponent(temp)}`
      + (name ? `&name=${encodeURIComponent(name)}` : '')
      + (email ? `&email=${encodeURIComponent(email)}` : '')
      + (picture ? `&picture=${encodeURIComponent(picture)}` : '');
    return res.redirect(url);

  } catch (err) {
    console.error('💥 Error en /oauth/google/callback:', err);
    return res.redirect(`${FRONTEND_BASE_URL}/login?error=oauth_callback_error`);
  }
});

// =========================================================
//           COMPLETAR PERFIL (Onboarding primera vez)
// =========================================================
/**
 * POST /complete-profile
 * Header: Authorization: Bearer <TEMP_JWT> (purpose:onboarding)
 * Body: { rol: 'alumno' | 'docente' }
 * - Crea usuario (con correo_verificado=true, contrasena=NULL, avatar_url)
 * - Inserta vínculo en usuario_proveedores (proveedor='google', proveedor_uid=sub) ON CONFLICT DO NOTHING
 * - Devuelve { token, usuario }
 */
router.post('/complete-profile', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const rolRaw = req.body?.rol;
  const rol = normalizeRol(rolRaw);

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_authorization' });
  }
  if (!['alumno', 'docente'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser "alumno" o "docente".' });
  }

  const tempToken = authHeader.substring('Bearer '.length).trim();

  let payload;
  try {
    payload = verifyTempOnboardingToken(tempToken);
  } catch (err) {
    console.error('✋ temp token inválido:', err?.message);
    const status = err.statusCode || 401;
    return res.status(status).json({ error: 'invalid_or_expired_temp_token' });
  }

  const { email, sub, name, picture } = payload;
  const correo = normalizeEmail(email);

  // transacción
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Si la carrera de onboarding ocurre 2 veces, manejamos idempotencia:
    const existing = await client.query('SELECT id, nombre, correo, rol FROM usuarios WHERE correo = $1 LIMIT 1', [correo]);
    let usuario;

    if (!existing.rows.length) {
    const insUser = await client.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol, correo_verificado, avatar_url, auth_origen)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nombre, correo, rol`,
      [name || correo, correo, null, rol, true, picture || null, 'google']
    );
      usuario = insUser.rows[0];
    } else {
      // Si por carrera ya existe, NO cambiamos su rol aquí (flujo definido: sin upgrades)
      usuario = existing.rows[0];
    }

    // Vincular proveedor (idempotente)
    await client.query(
      `INSERT INTO usuario_proveedores (usuario_id, proveedor, proveedor_uid)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [usuario.id, 'google', String(sub)]
    );

    await client.query('COMMIT');

    // Emitir token final
    const finalToken = signAccessToken({ uid: usuario.id, rol: usuario.rol });

    return res.status(200).json({
      token: finalToken,
      usuario,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('💥 Error en /complete-profile:', err);
    return res.status(500).json({ error: 'server_error' });
  } finally {
    client.release();
  }
});

// =========================================================
//           RUTA AUXILIAR (opcional) para probar auth
// =========================================================
/**
 * GET /me  (protegida si montas verifyToken antes de este router)
 * Devuelve `req.user` si ya lo poblas en un middleware verify
 * (este archivo no implementa verifyToken; se asume en index.js del servicio)
 */
router.get('/me', (req, res) => {
  if (!req.user?.uid) return res.status(401).json({ error: 'unauthorized' });
  res.json({ user: req.user });
});

// =========================================================
//           ELIMINADA: /upgrade-docente
// =========================================================
// router.post('/upgrade-docente', ... )  --> ❌ eliminado por definición del flujo

module.exports = router;
