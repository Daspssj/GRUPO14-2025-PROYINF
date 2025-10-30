// services/auth/google-oauth.js
// ✅ CommonJS compatible con openid-client (ESM) vía import() dinámico
// ✅ Logs para diagnosticar rápidamente

const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'paes_db',
});

// ---- Helper: import dinámico con normalización y caché ----
async function oidc() {
  if (!global.__oidc) {
    console.log('[oauth] Cargando openid-client vía import()');
    const mod = await import('openid-client');
    global.__oidc = mod?.default ? mod.default : mod; // normaliza default/named
    console.log('[oauth] openid-client keys:', Object.keys(global.__oidc || {}));
  }
  return global.__oidc;
}

let googleClient;

// ---- Inicializa (o reutiliza) el cliente OIDC de Google ----
async function getGoogleClient() {
  if (googleClient) return googleClient;
  try {
    const { Issuer } = await oidc();
    console.log('[oauth] Descubriendo configuración de Google OIDC…');
    const google = await Issuer.discover('https://accounts.google.com');
    console.log('[oauth] Descubrimiento OK');
    googleClient = new google.Client({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uris: [`${process.env.AUTH_PUBLIC_BASE_URL}/api/auth/oauth/google/callback`],
      response_types: ['code'],
    });
    return googleClient;
  } catch (err) {
    console.error('[oauth] Error en getGoogleClient():', err);
    throw err;
  }
}

// ---- Upsert de usuario con datos de Google ----
async function upsertUserFromGoogle({ email, name, picture, sub }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: existing } = await client.query(
      'SELECT * FROM usuarios WHERE LOWER(correo) = LOWER($1) LIMIT 1',
      [email]
    );

    let userId;
    if (existing.length) {
      userId = existing[0].id;
      await client.query(
        'UPDATE usuarios SET nombre = COALESCE($1, nombre), avatar_url = COALESCE($2, avatar_url), correo_verificado = true WHERE id = $3',
        [name || null, picture || null, userId]
      );
    } else {
      const ins = await client.query(
        `INSERT INTO usuarios (nombre, correo, contrasena, rol, avatar_url, correo_verificado)
         VALUES ($1, $2, NULL, 'alumno', $3, true) RETURNING id`,
        [name || email.split('@')[0], email, picture || null]
      );
      userId = ins.rows[0].id;
    }

    await client.query(
      `INSERT INTO usuario_proveedores (usuario_id, proveedor, proveedor_uid)
       VALUES ($1, 'google', $2)
       ON CONFLICT (proveedor, proveedor_uid) DO NOTHING`,
      [userId, sub]
    );

    await client.query('COMMIT');
    return { id: userId, nombre: name || email, correo: email, avatar_url: picture || null, rol: 'alumno' };
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[oauth] Error upsertUserFromGoogle():', e);
    throw e;
  } finally {
    client.release();
  }
}

// ---- Rutas ----
module.exports.start = async (req, res) => {
  try {
    console.log('[oauth] START → /oauth/google/start');
    const { generators } = await oidc();
    const client = await getGoogleClient();

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const state = generators.state();
    const nonce = generators.nonce();

    req.session.pkce = { code_verifier, state, nonce };
    const url = client.authorizationUrl({
      scope: 'openid email profile',
      code_challenge,
      code_challenge_method: 'S256',
      state,
      nonce
    });

    console.log('[oauth] Redirect →', url);
    return res.redirect(url);
  } catch (err) {
    console.error('[oauth] Error en START:', err);
    return res.status(500).json({ error: 'OAuth start failed', detail: (err && err.message) || String(err) });
  }
};

module.exports.callback = async (req, res) => {
  try {
    console.log('[oauth] CALLBACK → /oauth/google/callback');
    const client = await getGoogleClient();
    const params = client.callbackParams(req);

    const mem = req.session.pkce;
    if (!mem || params.state !== mem.state) {
      console.warn('[oauth] Estado/PKCE inválido', { got: params.state, expect: mem && mem.state });
      return res.status(400).send('Estado inválido');
    }

    const tokenSet = await client.callback(
      `${process.env.AUTH_PUBLIC_BASE_URL}/api/auth/oauth/google/callback`,
      params,
      { code_verifier: mem.code_verifier, state: mem.state, nonce: mem.nonce }
    );

    const claims = tokenSet.claims();
    console.log('[oauth] Claims:', { email: claims.email, email_verified: claims.email_verified });

    if (!claims.email || claims.email_verified !== true) {
      return res.status(403).send('Email no verificado en Google');
    }

    const usuario = await upsertUserFromGoogle({
      email: claims.email, name: claims.name, picture: claims.picture, sub: claims.sub
    });

    const token = jwt.sign(
      { uid: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'dev-secret',
      { issuer: process.env.JWT_ISSUER || 'paes-auth', expiresIn: '2h' }
    );

    const url = new URL('/oauth-success', process.env.FRONTEND_BASE_URL);
    url.searchParams.set('token', token);
    url.searchParams.set('usuario', JSON.stringify(usuario)); // URLSearchParams ya se encarga de codificar
    console.log('[oauth] Redirect final →', url.toString());
    return res.redirect(url.toString());
  } catch (err) {
    console.error('[oauth] Error en CALLBACK:', err);
    return res.status(500).json({ error: 'OAuth callback failed', detail: (err && err.message) || String(err) });
  }
};