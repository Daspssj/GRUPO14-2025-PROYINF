// services/resultados/index.js
require('dotenv').config();

const express = require('express');
const verify = require('../_common/middleware/verifyToken'); // ruta correcta desde /services/resultados
const routes = require('./routes/resultados');

const SERVICE_NAME = process.env.SERVICE_NAME || 'resultados-service';
const PORT = Number(process.env.PORT || 5002);

// Rutas públicas
const PUBLIC_PATHS = new Set(['/health']);

const app = express();
app.use(express.json());

// Exigir JWT para todo excepto públicas
app.use((req, res, next) => {
  if (req.method === 'OPTIONS' || req.method === 'HEAD') return next();
  if (PUBLIC_PATHS.has(req.path)) return next();
  return verify(req, res, next);
});

app.get('/health', (_req, res) => res.json({ ok: true, service: SERVICE_NAME }));

// Router principal
app.use('/', routes);

app.listen(PORT, () => console.log(`[${SERVICE_NAME}] escuchando en puerto ${PORT}`));
