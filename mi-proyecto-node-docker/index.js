const express = require('express');
const pool = require('./db'); // Importar la conexión
const authRoutes = require('./routes/auth');
const cors = require('cors');
const materiasRoutes = require('./routes/materias');
const preguntasRoutes = require('./routes/preguntas');
const ensayoRoutes = require('./routes/ensayos'); // ✅ importar
const resultadoRoutes = require('./routes/resultados');
const respuestaRoutes = require('./routes/respuestas');

const port = 3000;
const app = express();

// ✅ Definir corsOptions ANTES de usarlo
const corsOptions = {
  origin: 'http://localhost:3001', // 👈 Reemplaza con el origen real de tu frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Habilitar el envío de cookies, si es necesario
};

app.use(express.json()); // Para leer JSON
app.use(cors(corsOptions)); // ✅ Solo una vez, con las opciones configuradas

// Registrar todas las rutas
app.use('/api', authRoutes);
app.use('/api', materiasRoutes);
app.use('/api', preguntasRoutes);
app.use('/api', ensayoRoutes); // ✅ usar
app.use('/api', resultadoRoutes);
app.use('/api', respuestaRoutes);

// Rutas de prueba
app.get('/save', async (req, res) => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, content TEXT)');
    await pool.query('INSERT INTO messages (content) VALUES ($1)', ['Hola desde PostgreSQL!']);
    res.send('Mensaje guardado en la base de datos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

app.get('/', (req, res) => {
  res.send('¡Bienvenido! Usa /save para guardar un mensaje y /messages para verlos.');
});

// ✅ Solo una vez este llamado
app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`);
});