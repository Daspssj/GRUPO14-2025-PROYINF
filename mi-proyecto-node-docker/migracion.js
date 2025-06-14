const pool = require('./db');

async function migrar() {
  let intentos = 0;
  const maxIntentos = 5;
  const esperaEntreIntentos = 5000; // 5 segundos

  while (intentos < maxIntentos) {
    try {
      await pool.query(`
      CREATE TABLE areas_tematicas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  materia_id INTEGER REFERENCES materias(id),
  tipo_eje VARCHAR(50), -- 'comun', 'electivo', 'general'
  sub_materia VARCHAR(100) -- 'Biologia', 'Fisica', 'Quimica' (solo para Ciencias)
); ALTER TABLE preguntas 
ADD COLUMN area_tematica_id INTEGER REFERENCES areas_tematicas(id); -- Matemática 1 (materia_id = 2)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Números', 2, 'general', NULL),
('Álgebra y Funciones', 2, 'general', NULL),
('Geometría', 2, 'general', NULL),
('Probabilidad y Estadística', 2, 'general', NULL);

-- Matemática 2 (materia_id = 3)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Números', 3, 'general', NULL),
('Álgebra y Funciones', 3, 'general', NULL),
('Geometría', 3, 'general', NULL),
('Cálculo', 3, 'general', NULL),
('Probabilidad y Estadística', 3, 'general', NULL);

-- Lenguaje (materia_id = 1)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Textos Literarios', 1, 'general', NULL),
('Textos No Literarios', 1, 'general', NULL);

-- Biología - Eje Común (materia_id = 4)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Organización, estructura y actividad celular', 4, 'comun', 'Biologia'),
('Procesos y funciones biológicas', 4, 'comun', 'Biologia'),
('Herencia y evolución', 4, 'comun', 'Biologia'),
('Organismo y ambiente', 4, 'comun', 'Biologia');

-- Física - Eje Común (materia_id = 6)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Ondas', 6, 'comun', 'Fisica'),
('Mecánica', 6, 'comun', 'Fisica'),
('Energía-Tierra', 6, 'comun', 'Fisica'),
('Electricidad', 6, 'comun', 'Fisica');

-- Química - Eje Común (materia_id = 5)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Estructura atómica', 5, 'comun', 'Quimica'),
('Química orgánica', 5, 'comun', 'Quimica'),
('Reacciones químicas y estequiometría', 5, 'comun', 'Quimica');

-- Biología - Eje Electivo (materia_id = 4)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Organización, estructura y actividad celular', 4, 'electivo', 'Biologia'),
('Procesos y funciones biológicas', 4, 'electivo', 'Biologia'),
('Herencia y evolución', 4, 'electivo', 'Biologia'),
('Organismo y ambiente', 4, 'electivo', 'Biologia');

-- Física - Eje Electivo (materia_id = 6)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Ondas', 6, 'electivo', 'Fisica'),
('Mecánica', 6, 'electivo', 'Fisica'),
('Energía-Tierra', 6, 'electivo', 'Fisica'),
('Electricidad', 6, 'electivo', 'Fisica');

-- Química - Eje Electivo (materia_id = 5)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Estructura atómica', 5, 'electivo', 'Quimica'),
('Química orgánica', 5, 'electivo', 'Quimica'),
('Reacciones químicas y estequiometría', 5, 'electivo', 'Quimica');

-- Historia y Ciencias Sociales (materia_id = 7)
INSERT INTO areas_tematicas (nombre, materia_id, tipo_eje, sub_materia) VALUES
('Historia', 7, 'general', NULL),
('Ciencias Sociales', 7, 'general', NULL);
`);
      console.log('Migración completada');
      return; // Sale de la función si la migración se completa
    } catch (err) {
      console.error(`Error en la migración (intento ${intentos + 1}):`, err);
      intentos++;
      await new Promise(resolve => setTimeout(resolve, esperaEntreIntentos)); // Espera antes de reintentar
    }
  }

  console.error('Migración fallida después de varios intentos.');
}

migrar();