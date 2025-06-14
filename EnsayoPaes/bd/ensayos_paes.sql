-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-04-2025 a las 01:41:06
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ensayos_paes`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ensayos`
--

CREATE TABLE `ensayos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `docente_id` int(11) DEFAULT NULL,
  `materia_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `ensayos`
--

INSERT INTO `ensayos` (`id`, `nombre`, `fecha_creacion`, `docente_id`, `materia_id`) VALUES
(1, 'Ensayo 1 prueba', '2025-04-25', 3, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ensayo_pregunta`
--

CREATE TABLE `ensayo_pregunta` (
  `id` int(11) NOT NULL,
  `ensayo_id` int(11) DEFAULT NULL,
  `pregunta_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `ensayo_pregunta`
--

INSERT INTO `ensayo_pregunta` (`id`, `ensayo_id`, `pregunta_id`) VALUES
(1, 1, 1),
(2, 1, 7),
(3, 1, 8),
(4, 1, 9),
(5, 1, 10),
(6, 1, 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materias`
--

CREATE TABLE `materias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `materias`
--

INSERT INTO `materias` (`id`, `nombre`) VALUES
(1, 'Matematica I'),
(2, 'Matematica II'),
(3, 'Lenguaje'),
(4, 'Ciencias'),
(5, 'Historia y Cs. Sociales');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas`
--

CREATE TABLE `preguntas` (
  `id` int(11) NOT NULL,
  `enunciado` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `opcion_a` varchar(255) DEFAULT NULL,
  `opcion_b` varchar(255) DEFAULT NULL,
  `opcion_c` varchar(255) DEFAULT NULL,
  `opcion_d` varchar(255) DEFAULT NULL,
  `respuesta_correcta` enum('A','B','C','D') DEFAULT NULL,
  `materia_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `preguntas`
--

INSERT INTO `preguntas` (`id`, `enunciado`, `imagen`, `opcion_a`, `opcion_b`, `opcion_c`, `opcion_d`, `respuesta_correcta`, `materia_id`) VALUES
(1, 'Pregunta de testeo cuanto es la derivada de 2x', 'https://matematicasconmuchotruco.wordpress.com/wp-content/uploads/2020/03/derivada-.png?w=584', '2', '0', '10', 'x2', 'A', 2),
(2, '¿Cuál es la derivada de x^2?', NULL, '2x', 'x', 'x^2', '0', 'A', 1),
(3, '¿Cuál es la solución de 2x + 4 = 10?', NULL, 'x=1', 'x=2', 'x=3', 'x=4', 'C', 1),
(4, '¿Qué representa el área bajo una curva en una integral definida?', NULL, 'Volumen', 'Derivada', 'Área', 'Altura', 'C', 1),
(5, '¿Cuál es el límite de (1/x) cuando x ? ??', NULL, '0', '1', 'Infinito', 'No existe', 'A', 1),
(6, '¿Qué valor tiene el determinante de una matriz identidad 3x3?', NULL, '0', '1', '3', '-1', 'B', 1),
(7, '¿Cuál es la integral de 2x?', NULL, 'x^2 + C', '2x^2', 'x^2', 'x + C', 'A', 2),
(8, '¿Qué es una función par?', NULL, 'Simétrica respecto al eje y', 'Creciente siempre', 'Simétrica respecto al eje x', 'Discontinua', 'A', 2),
(9, '¿Qué significa derivar una función?', NULL, 'Sumarla', 'Invertirla', 'Obtener su tasa de cambio', 'Elevarla al cuadrado', 'C', 2),
(10, '¿Cuándo una función es creciente?', NULL, 'Cuando su derivada es negativa', 'Cuando su derivada es cero', 'Cuando su derivada es positiva', 'Cuando es constante', 'C', 2),
(11, '¿Qué es un punto de inflexión?', NULL, 'Donde cambia la concavidad', 'Donde hay una raíz', 'Donde se anula la derivada', 'Un mínimo absoluto', 'A', 2),
(12, '¿Qué es una metáfora?', NULL, 'Comparación sin \"como\"', 'Exageración', 'Repetición sonora', 'Contradicción', 'A', 3),
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respuestas`
--

CREATE TABLE `respuestas` (
  `id` int(11) NOT NULL,
  `resultado_id` int(11) DEFAULT NULL,
  `pregunta_id` int(11) DEFAULT NULL,
  `respuesta_dada` enum('A','B','C','D') DEFAULT NULL,
  `correcta` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultados`
--

CREATE TABLE `resultados` (
  `id` int(11) NOT NULL,
  `ensayo_id` int(11) DEFAULT NULL,
  `alumno_id` int(11) DEFAULT NULL,
  `puntaje` int(11) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `rol` enum('alumno','docente') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `contrasena`, `rol`) VALUES
(1, 'Juan Pérez', 'juan@correo.com', '1234', 'docente'),
(2, 'Camila Yael Loayza Arredondo', 'caca@gmail.com', '123', 'alumno'),
(3, 'Agustin SantibaÃ±ez', 'agus@gmail.com', '123', 'docente'),
(4, 'alicia', 'ali@gmail.com', '123', 'docente');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ensayos`
--
ALTER TABLE `ensayos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `docente_id` (`docente_id`),
  ADD KEY `materia_id` (`materia_id`);

--
-- Indices de la tabla `ensayo_pregunta`
--
ALTER TABLE `ensayo_pregunta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ensayo_id` (`ensayo_id`),
  ADD KEY `pregunta_id` (`pregunta_id`);

--
-- Indices de la tabla `materias`
--
ALTER TABLE `materias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `materia_id` (`materia_id`);

--
-- Indices de la tabla `respuestas`
--
ALTER TABLE `respuestas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resultado_id` (`resultado_id`),
  ADD KEY `pregunta_id` (`pregunta_id`);

--
-- Indices de la tabla `resultados`
--
ALTER TABLE `resultados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ensayo_id` (`ensayo_id`),
  ADD KEY `alumno_id` (`alumno_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ensayos`
--
ALTER TABLE `ensayos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `ensayo_pregunta`
--
ALTER TABLE `ensayo_pregunta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `materias`
--
ALTER TABLE `materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `respuestas`
--
ALTER TABLE `respuestas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resultados`
--
ALTER TABLE `resultados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ensayos`
--
ALTER TABLE `ensayos`
  ADD CONSTRAINT `ensayos_ibfk_1` FOREIGN KEY (`docente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `ensayos_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`);

--
-- Filtros para la tabla `ensayo_pregunta`
--
ALTER TABLE `ensayo_pregunta`
  ADD CONSTRAINT `ensayo_pregunta_ibfk_1` FOREIGN KEY (`ensayo_id`) REFERENCES `ensayos` (`id`),
  ADD CONSTRAINT `ensayo_pregunta_ibfk_2` FOREIGN KEY (`pregunta_id`) REFERENCES `preguntas` (`id`);

--
-- Filtros para la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD CONSTRAINT `preguntas_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`);

--
-- Filtros para la tabla `respuestas`
--
ALTER TABLE `respuestas`
  ADD CONSTRAINT `respuestas_ibfk_1` FOREIGN KEY (`resultado_id`) REFERENCES `resultados` (`id`),
  ADD CONSTRAINT `respuestas_ibfk_2` FOREIGN KEY (`pregunta_id`) REFERENCES `preguntas` (`id`);

--
-- Filtros para la tabla `resultados`
--
ALTER TABLE `resultados`
  ADD CONSTRAINT `resultados_ibfk_1` FOREIGN KEY (`ensayo_id`) REFERENCES `ensayos` (`id`),
  ADD CONSTRAINT `resultados_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
