BEGIN;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  correo VARCHAR(100) UNIQUE,
  contrasena VARCHAR(255),
  rol VARCHAR(20) CHECK (rol IN ('alumno', 'docente'))
);

CREATE TABLE materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100)
);

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
  respuesta_correcta CHAR(1) CHECK (respuesta_correcta IN ('A','B','C','D')),
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
  respuesta_dada CHAR(1) CHECK (respuesta_dada IN ('A','B','C','D')),
  correcta BOOLEAN
);

-- Datos base

INSERT INTO usuarios (id, nombre, correo, contrasena, rol) VALUES
(1, 'Juan Pérez', 'juan@correo.com', '1234', 'docente'),
(2, 'Camila Yael Loayza Arredondo', 'caca@gmail.com', '123', 'alumno'),
(3, 'Agustin Santibañez', 'agus@gmail.com', '123', 'docente'),
(4, 'alicia', 'ali@gmail.com', '123', 'docente');

INSERT INTO materias (id, nombre) VALUES
(1, 'Matematica I'),
(2, 'Matematica II'),
(3, 'Lenguaje'),
(4, 'Ciencias'),
(5, 'Historia y Cs. Sociales');

INSERT INTO ensayos (id, nombre, fecha_creacion, docente_id, materia_id) VALUES
(1, 'Ensayo 1 prueba', '2025-04-25', 3, 2);

INSERT INTO preguntas (id, enunciado, imagen, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id) VALUES
(1, 'Pregunta de testeo cuanto es la derivada de 2x', 'https://matematicasconmuchotruco.wordpress.com/wp-content/uploads/2020/03/derivada-.png?w=584', '2', '0', '10', 'x2', 'A', 2),
(2, '¿Cuál es la derivada de x^2?', NULL, '2x', 'x', 'x^2', '0', 'A', 1),
(3, '¿Cuál es la solución de 2x + 4 = 10?', NULL, 'x=1', 'x=2', 'x=3', 'x=4', 'C', 1),
(4, '¿Qué representa el área bajo una curva en una integral definida?', NULL, 'Volumen', 'Derivada', 'Área', 'Altura', 'C', 1),
(5, '¿Cuál es el límite de (1/x) cuando x → ∞?', NULL, '0', '1', 'Infinito', 'No existe', 'A', 1),
(6, '¿Qué valor tiene el determinante de una matriz identidad 3x3?', NULL, '0', '1', '3', '-1', 'B', 1),
(7, '¿Cuál es la integral de 2x?', NULL, 'x^2 + C', '2x^2', 'x^2', 'x + C', 'A', 2),
(8, '¿Qué es una función par?', NULL, 'Simétrica respecto al eje y', 'Creciente siempre', 'Simétrica respecto al eje x', 'Discontinua', 'A', 2),
(9, '¿Qué significa derivar una función?', NULL, 'Sumarla', 'Invertirla', 'Obtener su tasa de cambio', 'Elevarla al cuadrado', 'C', 2),
(10, '¿Cuándo una función es creciente?', NULL, 'Cuando su derivada es negativa', 'Cuando su derivada es cero', 'Cuando su derivada es positiva', 'Cuando es constante', 'C', 2),
(11, '¿Qué es un punto de inflexión?', NULL, 'Donde cambia la concavidad', 'Donde hay una raíz', 'Donde se anula la derivada', 'Un mínimo absoluto', 'A', 2),
(12, '¿Qué es una metáfora?', NULL, 'Comparación sin "como"', 'Exageración', 'Repetición sonora', 'Contradicción', 'A', 3),
(13, '¿Qué tipo de texto tiene como fin convencer?', NULL, 'Narrativo', 'Descriptivo', 'Argumentativo', 'Expositivo', 'C', 3),
(14, '¿Qué significa “ambivalente”?', NULL, 'Con doble sentido', 'Con dos interpretaciones opuestas', 'Rápido y lento', 'Antiguo y moderno', 'B', 3),
(15, '¿Qué es un narrador omnisciente?', NULL, 'Un personaje', 'Observador externo', 'Sabe todo de todos', 'Solo en primera persona', 'C', 3),
(16, '¿Qué es el hipérbaton?', NULL, 'Inversión del orden lógico', 'Repetición', 'Contraste', 'Pregunta sin respuesta', 'A', 3),
(17, '¿Cuál es la fórmula del agua?', NULL, 'H2O', 'CO2', 'NaCl', 'CH4', 'A', 4),
(18, '¿Qué célula no tiene núcleo?', NULL, 'Animal', 'Eucariota', 'Procariota', 'Vegetal', 'C', 4),
(19, '¿Qué órgano filtra la sangre?', NULL, 'Hígado', 'Riñón', 'Corazón', 'Pulmón', 'B', 4),
(20, '¿Qué ley de Newton habla de acción y reacción?', NULL, 'Primera', 'Segunda', 'Tercera', 'Cuarta', 'C', 4),
(21, '¿Qué es el ADN?', NULL, 'Un ácido nucleico', 'Una proteína', 'Una enzima', 'Un carbohidrato', 'A', 4),
(22, '¿En qué año fue la independencia de Chile?', NULL, '1810', '1818', '1821', '1833', 'B', 5),
(23, '¿Qué presidente chileno implementó la Reforma Agraria?', NULL, 'Allende', 'Frei Montalva', 'Pinochet', 'Aylwin', 'B', 5),
(24, '¿Qué fue la Guerra Fría?', NULL, 'Conflicto armado global', 'Conflicto ideológico EE.UU-URSS', 'Guerra civil europea', 'Revolución industrial', 'B', 5),
(25, '¿Qué significa ONU?', NULL, 'Organismo Nacional Unido', 'Organización de Naciones Unidas', 'Oficina Nacional de Unificación', 'Organismo Neutral Universal', 'B', 5),
(26, '¿Qué provocó la Primera Guerra Mundial?', NULL, 'Pearl Harbor', 'Caída de URSS', 'Asesinato del archiduque Fernando', 'Golpe alemán', 'C', 5);

INSERT INTO ensayo_pregunta (id, ensayo_id, pregunta_id) VALUES
(1, 1, 1), (2, 1, 7), (3, 1, 8), (4, 1, 9), (5, 1, 10), (6, 1, 11);

COMMIT;
