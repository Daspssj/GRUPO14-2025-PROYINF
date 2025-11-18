/* eslint-disable no-console */
const express = require('express');
const router = express.Router();
const pool = require('../db');
const verificarToken = require('../../_common/middleware/verifyToken');
const authorizeRoles = require('../../_common/middleware/authorizeRoles');

// TAREA 4 (NUEVO): Endpoint para iniciar una rendición, validando el acceso (Criterio de Aceptación #2)
// ---
router.post('/rendiciones', verificarToken, authorizeRoles(['alumno']), async (req, res) => {
  const { ventana_id, ensayo_id } = req.body;
  const alumno_id = req.usuario.id; // Usamos req.usuario.id (proviene de verifyToken)

  if ((!ventana_id && !ensayo_id) || (ventana_id && ensayo_id)) {
    return res.status(400).json({ error: 'Debes proporcionar un "ventana_id" o un "ensayo_id", pero no ambos.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (ventana_id) {
      // --- Lógica para ENSAYO POR VENTANA ---
      const ventanaResult = await client.query(
        `SELECT vr.inicio,
                vr.fin,
                vr.curso_id,
                e.id           AS ensayo_id,
                e.max_intentos AS max_intentos
           FROM ventanas_rendicion vr
           JOIN ensayos e ON vr.ensayo_id = e.id
          WHERE vr.id = $1`,
        [ventana_id]
      );

      if (ventanaResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Ventana de rendición no encontrada.' });
      }
      const ventana = ventanaResult.rows[0];

      const ahora = new Date();
      if (ahora < ventana.inicio || ahora > ventana.fin) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Esta evaluación no está disponible en este momento.' });
      }

      const membresiaResult = await client.query(
        `SELECT 1
           FROM curso_miembros
          WHERE curso_id = $1 AND usuario_id = $2`,
        [ventana.curso_id, alumno_id]
      );
      if (membresiaResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'No tienes permiso para rendir esta evaluación.' });
      }

      // ───── LÍMITE DE INTENTOS PARA ENSAYO POR VENTANA ─────
      // Normalizamos: null o 0 (o '0') = ilimitado
      const max = ventana.max_intentos;
      const numMax = max == null ? null : Number(max);
      const limite = (numMax === null || numMax === 0) ? null : numMax;

      if (limite !== null) {
        // Hay límite de intentos (>= 1) → contamos por ensayo
        const intentosResult = await client.query(
          `SELECT COUNT(*) AS num_intentos
             FROM resultados
            WHERE alumno_id = $1 AND ensayo_id = $2`,
          [alumno_id, ventana.ensayo_id]
        );

        const usados = parseInt(intentosResult.rows[0].num_intentos, 10);
        if (usados >= limite) {
          await client.query('ROLLBACK');
          return res.status(409).json({ error: 'Has alcanzado el límite de intentos para este ensayo.' });
        }
      }
      // Si limite es null → ilimitado: no se valida límite para esta ventana/ensayo

      const resultadoResult = await client.query(
        `INSERT INTO resultados (ensayo_id, alumno_id, fecha, ventana_id)
         VALUES ($1, $2, NOW(), $3)
         RETURNING id`,
        [ventana.ensayo_id, alumno_id, ventana_id]
      );
      await client.query('COMMIT');
      return res.status(201).json({
        mensaje: 'Rendición iniciada.',
        resultado_id: resultadoResult.rows[0].id
      });

    } else if (ensayo_id) {
      // --- Lógica para ENSAYO PERMANENTE ---
      const ensayoResult = await client.query(
        `SELECT disponibilidad, max_intentos
           FROM ensayos
          WHERE id = $1`,
        [ensayo_id]
      );
      if (ensayoResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Ensayo no encontrado.' });
      }
      const ensayo = ensayoResult.rows[0];

      if (ensayo.disponibilidad !== 'permanente') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Este ensayo solo se puede rendir a través de una ventana asignada.' });
      }

      // Normalizamos: null o 0 (o '0') = ilimitado también para permanentes
      const maxP = ensayo.max_intentos;
      const numMaxP = maxP == null ? null : Number(maxP);
      const limitePermanente = (numMaxP === null || numMaxP === 0) ? null : numMaxP;

      if (limitePermanente !== null) {
        const intentosResult = await client.query(
          `SELECT COUNT(*) AS num_intentos
             FROM resultados
            WHERE alumno_id = $1 AND ensayo_id = $2`,
          [alumno_id, ensayo_id]
        );
        const usadosP = parseInt(intentosResult.rows[0].num_intentos, 10);
        if (usadosP >= limitePermanente) {
          await client.query('ROLLBACK');
          return res.status(403).json({ error: 'Has alcanzado el límite de intentos para este ensayo.' });
        }
      }
      // limitePermanente null → ilimitado: sin validación de límite

      const resultadoResult = await client.query(
        `INSERT INTO resultados (ensayo_id, alumno_id, fecha, ventana_id)
         VALUES ($1, $2, NOW(), NULL)
         RETURNING id`,
        [ensayo_id, alumno_id]
      );
      await client.query('COMMIT');
      return res.status(201).json({
        mensaje: 'Rendición iniciada.',
        resultado_id: resultadoResult.rows[0].id
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('💥 Error al iniciar rendición en /rendiciones:', error);
    res.status(500).json({ error: 'Error interno del servidor.', detalle: error.message });
  } finally {
    client.release();
  }
});

// Endpoint para que el alumno obtenga sus intentos (para VerEnsayos.jsx)
router.get('/mis-resultados', verificarToken, authorizeRoles(['alumno']), async (req, res) => {
    // (CORREGIDO: Estandarizado para usar .id primero)
    const alumno_id = n(req.usuario?.id) ?? n(req.usuario?.uid) ?? n(req.user?.uid); 

    if (!alumno_id) {
        return res.status(401).json({ error: 'Token de alumno inválido o no encontrado.' });
    }

    try {
        const { rows } = await pool.query(
            `SELECT id, ensayo_id, ventana_id, fecha 
             FROM resultados 
             WHERE alumno_id = $1`,
            [alumno_id]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('💥 Error en /mis-resultados:', error);
        res.status(500).json({ error: 'Error interno del servidor.', detalle: error.message });
    }
});

// Helpers
function n(x) {
  const v = Number(x);
  return Number.isFinite(v) && v > 0 ? v : null;
}

function pickAlumnoId(req) {
  return (
    n(req.body?.alumno_id) ??
    n(req.query?.alumno_id) ??
    n(req.usuario?.id) ?? // <-- CORREGIDO (prefiriendo .id)
    n(req.usuario?.uid) ??   
    n(req.user?.uid)     
  );
}

function pickEnsayoId(req) {
  return n(req.body?.ensayo_id) ?? n(req.query?.ensayo_id);
}

function upperABCD(x) {
  const s = String(x || '').trim().toUpperCase();
  return ['A','B','C','D'].includes(s) ? s : null;
}

function getRole(req) {
  return (req.usuario?.rol || req.user?.rol || '').toLowerCase();
}

function isAlumno(req) {
  return getRole(req) === 'alumno';
}

function isDocenteOrAdmin(req) {
  const r = getRole(req);
  return r === 'docente' || r === 'admin';
}

function pickAlumnoIdForQuery(req) {
  if (isAlumno(req)) {
    // (CORREGIDO: Estandarizado para usar .id primero)
    return n(req.usuario?.id) ?? n(req.usuario?.uid) ?? n(req.user?.uid);
  }
  return n(req.body?.alumno_id) ?? n(req.query?.alumno_id) ?? null;
}

// ─────────────────────────────────────────────────────────────
// GET/POST /ver-resultados  (ya lo tenías)
// ─────────────────────────────────────────────────────────────
async function verResultadosHandler(req, res) {
  try {
    const rol = getRole(req);

    // Alumno: lista SOLO los suyos (uid del token)
    if (isAlumno(req)) {
      // (CORREGIDO: Estandarizado para usar .id primero)
      const alumnoId = n(req.usuario?.id) ?? n(req.usuario?.uid) ?? n(req.user?.uid);
      if (!alumnoId) return res.status(401).json({ error: 'invalid_token_payload' });

      const q = await pool.query(
        `SELECT r.id         AS resultado_id,
                e.nombre     AS ensayo_nombre,
                m.nombre     AS materia_nombre,
                r.puntaje,
                r.fecha
           FROM resultados r
           JOIN ensayos    e ON e.id = r.ensayo_id
           JOIN materias   m ON m.id = e.materia_id
          WHERE r.alumno_id = $1
          ORDER BY r.fecha DESC`,
        [alumnoId]
      );
      return res.json(q.rows);
    }

    // Docente/Admin: puede filtrar por alumno_id (opcional)
    const alumnoId = pickAlumnoIdForQuery(req);

    if (alumnoId) {
      const q = await pool.query(
        `SELECT r.id         AS resultado_id,
                e.nombre     AS ensayo_nombre,
                m.nombre     AS materia_nombre,
                r.puntaje,
                r.fecha,
                u.nombre     AS alumno_nombre,
                u.correo     AS alumno_correo
           FROM resultados r
           JOIN ensayos    e ON e.id = r.ensayo_id
           JOIN materias   m ON m.id = e.materia_id
           LEFT JOIN usuarios u ON u.id = r.alumno_id  -- ajusta si tu tabla de usuarios se llama distinto
          WHERE r.alumno_id = $1
          ORDER BY r.fecha DESC`,
        [alumnoId]
      );
      return res.json(q.rows);
    } else {
      // Variante “listar todo” para docentes/admin
      const q = await pool.query(
        `SELECT r.id         AS resultado_id,
                e.nombre     AS ensayo_nombre,
                m.nombre     AS materia_nombre,
                r.puntaje,
                r.fecha,
                u.nombre     AS alumno_nombre,
                u.correo     AS alumno_correo
           FROM resultados r
           JOIN ensayos    e ON e.id = r.ensayo_id
           JOIN materias   m ON m.id = e.materia_id
           LEFT JOIN usuarios u ON u.id = r.alumno_id
          ORDER BY r.fecha DESC
          LIMIT 500`
      );
      return res.json(q.rows);
    }
  } catch (err) {
    console.error('💥 /ver-resultados error:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}

router.get('/ver-resultados', verResultadosHandler);
router.post('/ver-resultados', verResultadosHandler);

// ─────────────────────────────────────────────────────────────
// POST /crear-resultado  (ya lo tenías)
// ─────────────────────────────────────────────────────────────
router.post('/crear-resultado', async (req, res) => {
  const client = await pool.connect();
  try {
    const alumnoId = pickAlumnoId(req);
    const ensayoId = pickEnsayoId(req);
    if (!alumnoId || !ensayoId) {
      return res.status(400).json({ error: 'Faltan datos para crear el resultado' });
    }

    const ex = await client.query('SELECT id FROM ensayos WHERE id = $1', [ensayoId]);
    if (!ex.rows.length) return res.status(404).json({ error: 'Ensayo no existe' });

    await client.query('BEGIN');
    const ins = await client.query(
      `INSERT INTO resultados (ensayo_id, alumno_id, puntaje)
       VALUES ($1, $2, 0)
       RETURNING id`,
      [ensayoId, alumnoId]
    );
    await client.query('COMMIT');
    return res.status(201).json({ resultado_id: ins.rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('💥 /crear-resultado error:', err);
    return res.status(500).json({ error: 'server_error' });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────────────────────
// (INICIO DE LA CORRECCIÓN: Funcionalidad /ver-detalle-resultado)
// ─────────────────────────────────────────────────────────────

// 1. Lógica de negocio (reutilizable)
async function getDetalleResultado(resultado_id, alumnoIdToken) {
    const rid = n(resultado_id);
    if (!rid) {
        throw { status: 400, error: 'resultado_id requerido' };
    }

    // Si alumnoIdToken tiene un valor, asumimos rol 'alumno'
    const rol = alumnoIdToken ? 'alumno' : 'docente'; 

    try {
        // 1) Verifica que el resultado exista (y trae alumno_id + ensayo_id)
        const qr = await pool.query(
            'SELECT alumno_id, ensayo_id FROM resultados WHERE id = $1',
            [rid]
        );
        if (!qr.rows.length) {
            throw { status: 404, error: 'Resultado no existe' };
        }

        const { alumno_id: alumnoIdDb, ensayo_id: ensayoId } = qr.rows[0];

        // Regla de acceso
        if (rol === 'alumno') {
            if (!alumnoIdToken || alumnoIdDb !== alumnoIdToken) {
                throw { status: 403, error: 'forbidden' };
            }
        }
        // (Docente/Admin puede ver todo)

        // 2) Traer detalle
        // (CORREGIDO: Se eliminó la 'M' y la 'S' sobrantes de la consulta SQL)
        const q = await pool.query(
            `SELECT
                p.id                      AS pregunta_id, 
                p.enunciado               AS texto,
                p.opcion_a, p.opcion_b, p.opcion_c, p.opcion_d,
                p.respuesta_correcta      AS respuesta_correcta_id,
                r.respuesta_dada          AS respuesta_dada_id,
                COALESCE(r.correcta, false) AS correcta
             FROM ensayo_pregunta ep
             JOIN preguntas p ON p.id = ep.pregunta_id
             LEFT JOIN respuestas r
              ON r.resultado_id = $1
             AND r.pregunta_id  = p.id
             WHERE ep.ensayo_id = $2
             ORDER BY ep.pregunta_id ASC`,
            [rid, ensayoId]
        );

        return q.rows; // Devuelve los datos
    } catch (err) {
        // Si ya tiene status, lo propaga. Si no, es un 500.
        if (err.status) throw err; 
        console.error('💥 /ver-detalle-resultado lógica interna error:', err);
        throw { status: 500, error: 'server_error' };
    }
}


// 2. Ruta POST (Ya existía, ahora usa el helper)
router.post('/ver-detalle-resultado', async (req, res) => {
  const rid = n(req.body?.resultado_id);
  // (CORREGIDO: Estandarizado para usar .id primero)
  const alumnoIdToken = n(req.usuario?.id) ?? n(req.usuario?.uid) ?? n(req.user?.uid);

  try {
    const detalle = await getDetalleResultado(rid, alumnoIdToken);
    return res.json(detalle);
  } catch (err) {
    console.error('💥 POST /ver-detalle-resultado error:', err);
    return res.status(err.status || 500).json({ error: err.error || 'server_error' });
  }
});


// 3. Ruta GET (La que faltaba, ahora usa el helper)
router.get('/ver-detalle-resultado', async (req, res) => {
  // Lee el ID desde req.query (ej: ?resultado_id=2)
  const rid = n(req.query?.resultado_id);
  // (CORREGIDO: Estandarizado para usar .id primero)
  const alumnoIdToken = n(req.usuario?.id) ?? n(req.usuario?.uid) ?? n(req.user?.uid) ?? null;

  try {
    // Reutiliza la misma lógica de negocio
    const detalle = await getDetalleResultado(rid, alumnoIdToken);
    return res.json(detalle);
  } catch (err) {
    // Manejo de errores mejorado
    console.error('💥 GET /ver-detalle-resultado error:', err);
    return res.status(err.status || 500).json({ error: err.error || 'server_error' });
  }
});
// ─────────────────────────────────────────────────────────────
// (FIN DE LA CORRECCIÓN)
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// GET /:resultado_id/preguntas-ensayo
// ─────────────────────────────────────────────────────────────
router.get('/:resultado_id/preguntas-ensayo', async (req, res) => {
  const rid = n(req.params?.resultado_id);
  if (!rid) return res.status(400).json({ error: 'resultado_id inválido' });

  const alumnoIdToken = pickAlumnoId(req);

  try {
    // 1) Verifica que el resultado existe y pertenece al alumno
    const qr = await pool.query(
      `SELECT r.id, r.alumno_id, r.ensayo_id, e.nombre AS ensayo_nombre
         FROM resultados r
         JOIN ensayos    e ON e.id = r.ensayo_id
        WHERE r.id = $1`,
      [rid]
    );
    if (!qr.rows.length) return res.status(404).json({ error: 'Resultado no existe' });

    const rowR = qr.rows[0];
    if (alumnoIdToken && rowR.alumno_id !== alumnoIdToken) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const ensayoId = rowR.ensayo_id;

    // 2) Trae preguntas del ensayo
    const qp = await pool.query(
      `SELECT p.id,
              p.enunciado,
              p.opcion_a, p.opcion_b, p.opcion_c, p.opcion_d
         FROM ensayo_pregunta ep
         JOIN preguntas p ON p.id = ep.pregunta_id
        WHERE ep.ensayo_id = $1
        ORDER BY ep.id ASC`,
      [ensayoId]
    );

    const preguntas = qp.rows.map(p => ({
      id: p.id,
      texto: p.enunciado,
      opciones: [
        { id: 'A', texto: p.opcion_a },
        { id: 'B', texto: p.opcion_b },
        { id: 'C', texto: p.opcion_c },
        { id: 'D', texto: p.opcion_d },
      ],
    }));

    // 3) Respuestas previas del alumno en este resultado (si existen)
    const qprev = await pool.query(
      `SELECT pregunta_id, respuesta_dada
         FROM respuestas
        WHERE resultado_id = $1`,
      [rid]
    );
    const respuestasPrevias = {};
    for (const r of qprev.rows) {
      respuestasPrevias[r.pregunta_id] = r.respuesta_dada;
    }

    return res.json({
      ensayo: { id: ensayoId, titulo: rowR.ensayo_nombre }, // el front espera "titulo"
      preguntas,
      respuestasPrevias,
    });
  } catch (err) {
    console.error('💥 /:resultado_id/preguntas-ensayo error:', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /:resultado_id/responder
// ─────────────────────────────────────────────────────────────
router.post('/:resultado_id/responder', async (req, res) => {
  const rid = n(req.params?.resultado_id);
  const preguntaId = n(req.body?.pregunta_id);
  const resp = upperABCD(req.body?.respuesta_dada);

  if (!rid || !preguntaId || !resp) {
    return res.status(400).json({ error: 'Datos inválidos (resultado_id, pregunta_id, respuesta_dada)' });
  }

  const alumnoIdToken = pickAlumnoId(req);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verifica ownership del resultado
    const qr = await client.query(
      'SELECT alumno_id FROM resultados WHERE id = $1',
      [rid]
    );
    if (!qr.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Resultado no existe' });
    }
    if (alumnoIdToken && qr.rows[0].alumno_id !== alumnoIdToken) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'forbidden' });
    }

    // Obtiene la respuesta correcta de la pregunta
    const qp = await client.query(
      'SELECT respuesta_correcta FROM preguntas WHERE id = $1',
      [preguntaId]
    );
    if (!qp.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pregunta no existe' });
    }
    const correcta = (qp.rows[0].respuesta_correcta || '').toUpperCase() === resp;

    // UPSERT en respuestas
    await client.query(
      `INSERT INTO respuestas (resultado_id, pregunta_id, respuesta_dada, correcta)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (resultado_id, pregunta_id)
       DO UPDATE SET respuesta_dada = EXCLUDED.respuesta_dada,
                     correcta         = EXCLUDED.correcta`,
      [rid, preguntaId, resp, correcta]
    );

    await client.query('COMMIT');
    return res.json({ ok: true, correcta });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('💥 /:resultado_id/responder error:', err);
    return res.status(500).json({ error: 'server_error' });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────────────────────
// POST /:resultado_id/finalizar
// ─────────────────────────────────────────────────────────────
router.post('/:resultado_id/finalizar', async (req, res) => {
  const rid = n(req.params?.resultado_id);
  if (!rid) return res.status(400).json({ error: 'resultado_id inválido' });

  const alumnoIdToken = pickAlumnoId(req);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verifica ownership
    const qr = await client.query(
      'SELECT alumno_id FROM resultados WHERE id = $1',
      [rid]
    );
    if (!qr.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Resultado no existe' });
    }
    if (alumnoIdToken && qr.rows[0].alumno_id !== alumnoIdToken) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'forbidden' });
    }

    // Cuenta correctas
    const qc = await client.query(
      `SELECT COUNT(*)::int AS correctas
         FROM respuestas
        WHERE resultado_id = $1 AND correcta = true`,
      [rid]
    );
    const puntaje = qc.rows[0].correctas || 0;

    await client.query(
      'UPDATE resultados SET puntaje = $1, fecha = NOW() WHERE id = $2',
      [puntaje, rid]
    );

    await client.query('COMMIT');
    return res.json({ ok: true, puntaje });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('💥 /:resultado_id/finalizar error:', err);
    return res.status(500).json({ error: 'server_error' });
  } finally {
    client.release();
  }
});

/* ==================== Endpoints “docente” (wrappers) ==================== */
async function verResultadosDocenteWrapper(req, res) {
  if (!isDocenteOrAdmin(req)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  // Reusa el handler general (ya soporta docente/admin y alumno_id opcional)
  return verResultadosHandler(req, res);
}

router.get('/ver-resultados-docente', verResultadosDocenteWrapper);
router.post('/ver-resultados-docente', verResultadosDocenteWrapper);


module.exports = router;