const express = require('express');
const session = require('express-session');
const authRoutes = require('./auth');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(session({
  secret: 'asdf1234', // cambiar por algo mas seguro
  resave: false,
  saveUninitialized: true
}));

// Rutas de autenticación
app.use('/auth', authRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Bienvenido');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});