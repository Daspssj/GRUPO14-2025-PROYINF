-- =========================
-- Poblar preguntas para M1
-- =========================

-- Números (5 preguntas)
INSERT INTO preguntas (enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id, area_tematica_id)
VALUES
('¿Cuál de los siguientes números es un número primo?', '1', '4', '7', '9', 'C', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Números' AND materia_id = 2)),
('¿Cuánto es 8 + 5?', '12', '13', '14', '15', 'B', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Números' AND materia_id = 2)),
('¿Cuál es el valor absoluto de -9?', '9', '-9', '0', '1', 'A', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Números' AND materia_id = 2)),
('¿Cuál es el resultado de 15 - 7?', '6', '7', '8', '9', 'C', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Números' AND materia_id = 2)),
('¿Cuál es el doble de 6?', '10', '12', '14', '16', 'B', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Números' AND materia_id = 2));

-- Álgebra y Funciones (5 preguntas)
INSERT INTO preguntas (enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id, area_tematica_id)
VALUES
('Resuelve la ecuación: 2x + 5 = 11', '2', '3', '4', '5', 'B', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Álgebra y Funciones' AND materia_id = 2)),
('¿Cuál es el valor de x en la ecuación x - 4 = 10?', '6', '7', '14', '16', 'C', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Álgebra y Funciones' AND materia_id = 2)),
('¿Cuál es el resultado de (3x) si x = 2?', '5', '6', '7', '8', 'B', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Álgebra y Funciones' AND materia_id = 2)),
('¿Cuál es la incógnita en la ecuación 5 + y = 12?', '5', '6', '7', 'y', 'C', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Álgebra y Funciones' AND materia_id = 2)),
('¿Cuál es el resultado de 4x si x = 3?', '7', '10', '12', '14', 'C', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Álgebra y Funciones' AND materia_id = 2));

-- Geometría (5 preguntas)
INSERT INTO preguntas (enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id, area_tematica_id)
VALUES
('¿Cuál es el área de un cuadrado de lado 5 cm?', '10 cm²', '20 cm²', '25 cm²', '30 cm²', 'C', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Geometría' AND materia_id = 2)),
('¿Cuántos lados tiene un hexágono?', '5', '6', '7', '8', 'B', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Geometría' AND materia_id = 2)),
('¿Cuál es el perímetro de un triángulo equilátero de lado 4 cm?', '8 cm', '10 cm', '12 cm', '14 cm', 'C', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Geometría' AND materia_id = 2)),
('¿Cuántos grados suma un triángulo?', '90°', '180°', '270°', '360°', 'B', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Geometría' AND materia_id = 2)),
('¿Cuál es el volumen de un cubo de lado 2 cm?', '4 cm³', '6 cm³', '8 cm³', '12 cm³', 'C', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Geometría' AND materia_id = 2));

-- Probabilidad y Estadística (5 preguntas)
INSERT INTO preguntas (enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, materia_id, area_tematica_id)
VALUES
('¿Cuál es la probabilidad de obtener un 5 al lanzar un dado de 6 caras?', '1/2', '1/3', '1/6', '1/4', 'C', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Probabilidad y Estadística' AND materia_id = 2)),
('¿Cuál es la media de los números 2, 4 y 6?', '3', '4', '5', '6', 'B', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Probabilidad y Estadística' AND materia_id = 2)),
('¿Cuál es la moda de la serie 2, 3, 3, 5, 7?', '2', '3', '5', '7', 'B', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Probabilidad y Estadística' AND materia_id = 2)),
('¿Cuál es la probabilidad de sacar una carta roja de una baraja española?', '1/2', '1/3', '1/4', '1/5', 'A', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Probabilidad y Estadística' AND materia_id = 2)),
('¿Cuál es la mediana de los números 1, 3, 5?', '1', '3', '5', '4', 'B', 2, (SELECT id FROM areas_tematicas WHERE nombre = 'Probabilidad y Estadística' AND materia_id = 2));