/* eslint-disable no-console */
const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'paes_db',
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
    n(req.usuario?.uid) ??   // <- tu verifyToken coloca aquí el payload
    n(req.user?.uid)         // <- alias de compatibilidad
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

/**
 * alumnoId a consultar, según rol:
 * - Alumno: SIEMPRE su propio uid (ignora overrides para seguridad).
 * - Docente/Admin: usa el que venga por body/query si existe; si no viene, devuelve null.
 */
function pickAlumnoIdForQuery(req) {
  if (isAlumno(req)) {
    return n(req.usuario?.uid) ?? n(req.user?.uid) ?? null;
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
      const alumnoId = n(req.usuario?.uid) ?? n(req.user?.uid);
      if (!alumnoId) return res.status(401).json({ error: 'invalid_token_payload' });

      const q = await pool.query(
        `SELECT r.id         AS resultado_id,
                e.nombre     AS ensayo_nombre,
                m.nombre     AS materia_nombre,
                r.puntaje,
                r.fecha
           FROM resultados r
           JOIN ensayos   e ON e.id = r.ensayo_id
           JOIN materias  m ON m.id = e.materia_id
          WHERE r.alumno_id = $1
          ORDER BY r.fecha DESC`,
        [alumnoId]
      );
      return res.json(q.rows);
    }

    // Docente/Admin: puede filtrar por alumno_id (opcional)
    const alumnoId = pickAlumnoIdForQuery(req);

    // Puedes decidir la política:
    // a) Requerir alumno_id para no listar todo el universo:
    // if (!alumnoId) return res.status(400).json({ error: 'alumno_id requerido para docentes' });

    // b) O permitir listar todo (con datos del alumno). Te dejo ambas variantes:
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
           JOIN ensayos   e ON e.id = r.ensayo_id
           JOIN materias  m ON m.id = e.materia_id
           LEFT JOIN usuarios u ON u.id = r.alumno_id   -- ajusta si tu tabla de usuarios se llama distinto
          WHERE r.alumno_id = $1
          ORDER BY r.fecha DESC`,
        [alumnoId]
      );
      return res.json(q.rows);
    } else {
      // Variante “listar todo” para docentes/admin (si prefieres, comenta esto y usa la opción (a) arriba)
      const q = await pool.query(
        `SELECT r.id         AS resultado_id,
                e.nombre     AS ensayo_nombre,
                m.nombre     AS materia_nombre,
                r.puntaje,
                r.fecha,
                u.nombre     AS alumno_nombre,
                u.correo     AS alumno_correo
           FROM resultados r
           JOIN ensayos   e ON e.id = r.ensayo_id
           JOIN materias  m ON m.id = e.materia_id
           LEFT JOIN usuarios u ON u.id = r.alumno_id
          ORDER BY r.fecha DESC
          LIMIT 500`  // evita respuestas gigantes; ajusta según necesidad
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
// NUEVO: GET /ver-detalle-resultado?resultado_id=123
// Devuelve la grilla de preguntas + tu respuesta + la correcta + flag correcta
// Estructura que espera el front:
// [
//   {
//     pregunta_id,
//     texto,
//     opcion_a, opcion_b, opcion_c, opcion_d,
//     respuesta_dada_id,       // 'A'|'B'|'C'|'D' o null
//     respuesta_correcta_id,   // 'A'|'B'|'C'|'D'
//     correcta                 // true|false
//   },
//   ...
// ]
// ─────────────────────────────────────────────────────────────
router.get('/ver-detalle-resultado', async (req, res) => {
  const rid = n(req.query?.resultado_id);
  if (!rid) return res.status(400).json({ error: 'resultado_id requerido' });

  const rol = getRole(req);
  const alumnoIdToken = n(req.usuario?.uid) ?? n(req.user?.uid) ?? null;

  try {
    // 1) Verifica que el resultado exista (y trae alumno_id + ensayo_id)
    const qr = await pool.query(
      'SELECT alumno_id, ensayo_id FROM resultados WHERE id = $1',
      [rid]
    );
    if (!qr.rows.length) return res.status(404).json({ error: 'Resultado no existe' });

    const { alumno_id: alumnoIdDb, ensayo_id: ensayoId } = qr.rows[0];

    // REGLA DE ACCESO:
    // - Alumno: solo si el resultado es suyo
    // - Docente/Admin: permitido ver cualquiera
    if (rol === 'alumno') {
      if (!alumnoIdToken || alumnoIdDb !== alumnoIdToken) {
        return res.status(403).json({ error: 'forbidden' });
      }
    }

    // 2) Traer detalle (sin cambios)
    const q = await pool.query(
      `SELECT
         p.id                        AS pregunta_id,
         p.enunciado                 AS texto,
         p.opcion_a, p.opcion_b, p.opcion_c, p.opcion_d,
         p.respuesta_correcta        AS respuesta_correcta_id,
         r.respuesta_dada            AS respuesta_dada_id,
         COALESCE(r.correcta, false) AS correcta
       FROM ensayo_pregunta ep
       JOIN preguntas p ON p.id = ep.pregunta_id
       LEFT JOIN respuestas r
         ON r.resultado_id = $1
        AND r.pregunta_id  = p.id
       WHERE ep.ensayo_id = $2
       ORDER BY ep.id ASC`,
      [rid, ensayoId]
    );

    return res.json(q.rows);
  } catch (err) {
    console.error('💥 /ver-detalle-resultado error:', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

// ─────────────────────────────────────────────────────────────
// NUEVO: GET /:resultado_id/preguntas-ensayo
// Devuelve { ensayo: {id,titulo}, preguntas: [...], respuestasPrevias: { [preguntaId]: 'A'|'B'|'C'|'D' } }
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
         JOIN ensayos   e ON e.id = r.ensayo_id
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
// NUEVO: POST /:resultado_id/responder
// Body: { pregunta_id, respuesta_dada: 'A'|'B'|'C'|'D' }
// Guarda/actualiza la respuesta y marca "correcta" según la pregunta.
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
                     correcta       = EXCLUDED.correcta`,
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
// NUEVO: POST /:resultado_id/finalizar
// Recalcula el puntaje = cantidad de respuestas correctas.
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