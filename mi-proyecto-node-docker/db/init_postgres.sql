-- init_postgres.sql

-- Creación de tablas adaptadas a PostgreSQL

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  correo VARCHAR(100) UNIQUE,
  contrasena VARCHAR(255),
  rol VARCHAR(10) CHECK (rol IN ('alumno', 'docente'))
);

INSERT INTO usuarios (id, nombre, correo, contrasena, rol) VALUES
(1, 'Juan Pérez', 'juan@correo.com', '1234', 'docente'),
(2, 'Camila Yael Loayza Arredondo', 'caca@gmail.com', '123', 'alumno'),
(3, 'Agustin Santibañez', 'agus@gmail.com', '123', 'docente'),
(4, 'alicia', 'ali@gmail.com', '123', 'docente');

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

CREATE TABLE materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100)
);

INSERT INTO materias (id, nombre) VALUES
(1, 'Lenguaje'),
(2, 'Matematicas1'),
(3, 'Matematicas2'),
(4, 'Biologia'),
(5, 'Quimica'),
(6, 'Fisica'),
(7, 'Historia y ciencias sociales');

CREATE TABLE ensayos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  fecha_creacion DATE,
  docente_id INTEGER REFERENCES usuarios(id),
  materia_id INTEGER REFERENCES materias(id)
);

CREATE TABLE preguntas (
  id SERIAL PRIMARY KEY,
  enunciado TEXT,
  imagen VARCHAR(255),
  opcion_a VARCHAR(255),
  opcion_b VARCHAR(255),
  opcion_c VARCHAR(255),
  opcion_d VARCHAR(255),
  respuesta_correcta VARCHAR(1) CHECK (respuesta_correcta IN ('A','B','C','D')),
  materia_id INTEGER REFERENCES materias(id)
);

CREATE TABLE ensayo_pregunta (
  id SERIAL PRIMARY KEY,
  ensayo_id INTEGER REFERENCES ensayos(id),
  pregunta_id INTEGER REFERENCES preguntas(id)
);

CREATE TABLE resultados (
  id SERIAL PRIMARY KEY,
  ensayo_id INTEGER REFERENCES ensayos(id),
  alumno_id INTEGER REFERENCES usuarios(id),
  puntaje INTEGER,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE respuestas (
  id SERIAL PRIMARY KEY,
  resultado_id INTEGER REFERENCES resultados(id),
  pregunta_id INTEGER REFERENCES preguntas(id),
  respuesta_dada VARCHAR(1) CHECK (respuesta_dada IN ('A','B','C','D')),
  correcta BOOLEAN
);

-- Actualizar secuencia de IDs de usuarios si fuera necesario (solo si insertas manualmente)
-- SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

-- Crear la nueva tabla areas_tematicas
CREATE TABLE areas_tematicas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  materia_id INTEGER REFERENCES materias(id),
  tipo_eje VARCHAR(50), -- 'comun', 'electivo', 'general'
  sub_materia VARCHAR(100) -- 'Biologia', 'Fisica', 'Quimica' (solo para Ciencias)
);

-- Modificar la tabla preguntas
ALTER TABLE preguntas
ADD COLUMN area_tematica_id INTEGER REFERENCES areas_tematicas(id);

-- Insertar todas las áreas temáticas
-- Matemática 1 (materia_id = 2)
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