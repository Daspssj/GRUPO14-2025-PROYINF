const express = require('express');
const router = express.Router();
const pool = require('../db'); // Usar pool en lugar de db

// Utilidad para obtener la fecha actual en formato YYYY-MM-DD
function getFechaActual() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// Utilidad para obtener el nombre por defecto
function generarNombrePorDefecto(tipo, tiposDeEnsayo) {
  const fecha = new Date().toLocaleDateString('es-CL');
  const tipoLabel = tiposDeEnsayo[tipo] || tipo;
  return `Ensayo ${tipoLabel} - ${fecha}`;
}

// Mapea los nombres de ejes del frontend a los de la BD
const ejeNombresM1 = {
  numeros: 'Números',
  algebra: 'Álgebra y Funciones',
  geometria: 'Geometría',
  probabilidad: 'Probabilidad y Estadística'
};

// Mapea los tipos de ensayo a materia_id
const tipoEnsayoToMateriaId = {
  CL: 1,
  M1: 2,
  M2: 3,
  CI: null, // Ciencias es especial, puedes manejarlo aparte
  HS: 7
};

// Mapea los tipos de ensayo a nombre legible
const tiposDeEnsayo = {
  CL: 'Competencia Lectora',
  M1: 'Competencia Matemática 1 (M1)',
  M2: 'Competencia Matemática 2 (M2)',
  CI: 'Ciencias',
  HS: 'Historia y Ciencias Sociales'
};

router.post('/crear-ensayo-automatico', async (req, res) => {
  const { tipo, nombre, cantidad, docente_id, ejes } = req.body;
  const materia_id = tipoEnsayoToMateriaId[tipo] || null;
  let nombreFinal = nombre && nombre.trim() ? nombre : generarNombrePorDefecto(tipo, tiposDeEnsayo);

  console.log('Datos recibidos:', { tipo, nombre, cantidad, docente_id, ejes });

  try {
    let preguntasSeleccionadas = [];

    if (tipo === 'M1') {
      // 1. Obtener IDs de áreas temáticas seleccionadas
      const ejesSeleccionados = Object.entries(ejes)
        .filter(([k, v]) => v)
        .map(([k]) => ejeNombresM1[k]);

      console.log('Ejes seleccionados:', ejesSeleccionados);

      if (ejesSeleccionados.length === 0) {
        return res.status(400).json({ message: 'Debes seleccionar al menos un eje temático para M1.' });
      }

      // 2. Obtener IDs de áreas temáticas
      const { rows: areas } = await pool.query(
        `SELECT id, nombre FROM areas_tematicas WHERE materia_id = $1 AND nombre = ANY($2)`,
        [2, ejesSeleccionados]
      );

      console.log('Áreas encontradas:', areas);

      if (areas.length === 0) {
        return res.status(400).json({ message: 'No se encontraron áreas temáticas para los ejes seleccionados.' });
      }

      // 3. Contar preguntas por área temática
      const preguntasPorEje = {};
      let totalDisponibles = 0;
      for (const area of areas) {
        const { rows } = await pool.query(
          `SELECT COUNT(*) FROM preguntas WHERE materia_id = 2 AND area_tematica_id = $1`,
          [area.id]
        );
        preguntasPorEje[area.id] = parseInt(rows[0].count, 10);
        totalDisponibles += preguntasPorEje[area.id];
      }

      console.log('Preguntas por eje:', preguntasPorEje);
      console.log('Total disponibles:', totalDisponibles);

      if (totalDisponibles === 0) {
        return res.status(400).json({ message: 'No hay preguntas disponibles para los ejes seleccionados.' });
      }

      if (totalDisponibles < cantidad) {
        return res.status(400).json({ 
          message: `Solo hay ${totalDisponibles} preguntas disponibles, pero solicitas ${cantidad}.` 
        });
      }

      // 4. Calcular cuántas preguntas por eje
      const preguntasPorSeleccion = {};
      let totalAsignadas = 0;
      for (const area of areas) {
        const n = Math.round((preguntasPorEje[area.id] / totalDisponibles) * cantidad);
        preguntasPorSeleccion[area.id] = Math.min(n, preguntasPorEje[area.id]); // No exceder disponibles
        totalAsignadas += preguntasPorSeleccion[area.id];
      }

      // Ajustar si hay diferencia por redondeo
      let diferencia = cantidad - totalAsignadas;
      const areaIds = areas.map(a => a.id);
      let i = 0;
      while (diferencia !== 0 && i < areaIds.length * 10) { // Evitar bucle infinito
        const areaId = areaIds[i % areaIds.length];
        if (diferencia > 0 && preguntasPorSeleccion[areaId] < preguntasPorEje[areaId]) {
          preguntasPorSeleccion[areaId]++;
          diferencia--;
        } else if (diferencia < 0 && preguntasPorSeleccion[areaId] > 0) {
          preguntasPorSeleccion[areaId]--;
          diferencia++;
        }
        i++;
      }

      console.log('Preguntas por selección:', preguntasPorSeleccion);

      // 5. Seleccionar preguntas aleatorias por eje
      for (const area of areas) {
        if (preguntasPorSeleccion[area.id] > 0) {
          const { rows } = await pool.query(
            `SELECT id FROM preguntas WHERE materia_id = 2 AND area_tematica_id = $1 ORDER BY RANDOM() LIMIT $2`,
            [area.id, preguntasPorSeleccion[area.id]]
          );
          preguntasSeleccionadas.push(...rows.map(r => r.id));
        }
      }

    } else {
      // Otros tipos de ensayo: selecciona preguntas aleatorias de la materia correspondiente
      if (!materia_id) {
        return res.status(400).json({ message: 'Tipo de ensayo no soportado aún.' });
      }
      
      // Verificar que hay suficientes preguntas
      const { rows: countRows } = await pool.query(
        `SELECT COUNT(*) FROM preguntas WHERE materia_id = $1`,
        [materia_id]
      );
      const totalDisponibles = parseInt(countRows[0].count, 10);
      
      if (totalDisponibles < cantidad) {
        return res.status(400).json({ 
          message: `Solo hay ${totalDisponibles} preguntas disponibles para esta materia, pero solicitas ${cantidad}.` 
        });
      }

      const { rows } = await pool.query(
        `SELECT id FROM preguntas WHERE materia_id = $1 ORDER BY RANDOM() LIMIT $2`,
        [materia_id, cantidad]
      );
      preguntasSeleccionadas = rows.map(r => r.id);
    }

    console.log('Preguntas seleccionadas:', preguntasSeleccionadas.length);

    // 6. Crear el ensayo
    const { rows: ensayoRows } = await pool.query(
      `INSERT INTO ensayos (nombre, fecha_creacion, docente_id, materia_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [nombreFinal, getFechaActual(), docente_id, materia_id]
    );
    const ensayoId = ensayoRows[0].id;

    console.log('Ensayo creado con ID:', ensayoId);

    // 7. Insertar preguntas en ensayo_pregunta
    for (const preguntaId of preguntasSeleccionadas) {
      await pool.query(
        `INSERT INTO ensayo_pregunta (ensayo_id, pregunta_id) VALUES ($1, $2)`,
        [ensayoId, preguntaId]
      );
    }

    console.log('Preguntas asociadas al ensayo');

    res.status(201).json({ 
      message: 'Ensayo creado con éxito', 
      ensayoId,
      preguntasSeleccionadas: preguntasSeleccionadas.length,
      nombre: nombreFinal
    });

  } catch (error) {
    console.error('Error al crear ensayo:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear el ensayo' });
  }
});

// Ruta para obtener ensayos (para la lista)
router.get('/ensayos', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.*, m.nombre as materia_nombre, u.nombre as docente_nombre,
             COUNT(ep.pregunta_id) as total_preguntas
      FROM ensayos e
      LEFT JOIN materias m ON e.materia_id = m.id
      LEFT JOIN usuarios u ON e.docente_id = u.id
      LEFT JOIN ensayo_pregunta ep ON e.id = ep.ensayo_id
      GROUP BY e.id, m.nombre, u.nombre
      ORDER BY e.fecha_creacion DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener ensayos:', error);
    res.status(500).json({ message: 'Error al obtener ensayos' });
  }
});

module.exports = router;