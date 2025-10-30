const jwt = require('jsonwebtoken');

// Usa los mismos defaults que usa el servicio de auth:
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_ISSUER = process.env.JWT_ISSUER || 'paes-auth';

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado' });
  }

  const token = authHeader.slice(7).trim();

  try {
    // Verifica también el issuer para ser 100% consistente con auth
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });

    // Esperamos payload con { uid, rol }
    if (!decoded || typeof decoded.uid === 'undefined') {
      return res.status(401).json({ error: 'invalid_token_payload' });
    }

    // Normaliza/expone en ambos lugares y con alias "id"
    const userNorm = { ...decoded, id: decoded.uid };
    req.usuario = userNorm;   // lo que ya usabas
    req.user = userNorm;      // compatibilidad con otros handlers

    return next();
  } catch (err) {
    // Token expirado o firma inválida
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = verificarToken;