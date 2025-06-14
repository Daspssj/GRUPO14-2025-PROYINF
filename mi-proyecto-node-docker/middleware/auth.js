const jwt = require('jsonwebtoken');
const SECRET = 'secretoUltraSeguro123'; // ¡puedes moverlo a un .env más adelante!

function verificarToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { verificarToken, SECRET };
