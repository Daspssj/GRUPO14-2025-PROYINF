import { pool } from "../db.js";

export async function listCursos(req, res) {
  const colegioId = Number(req.query.colegioId);
  const q = (req.query.query || "").trim();
  if (!colegioId) return res.status(422).json({ error: "colegioId requerido" });

  if (!q) {
    const { rows } = await pool.query(
      `SELECT id, nombre, anio, seccion
         FROM cursos
        WHERE colegio_id = $1
        ORDER BY nombre, anio NULLS LAST, seccion NULLS LAST
        LIMIT 100`, [colegioId]
    );
    return res.json(rows);
  }
  const { rows } = await pool.query(
    `SELECT id, nombre, anio, seccion
       FROM cursos
      WHERE colegio_id = $1
        AND (nombre ILIKE $2 OR COALESCE(seccion,'') ILIKE $2)
      ORDER BY nombre, anio NULLS LAST, seccion NULLS LAST
      LIMIT 100`, [colegioId, `%${q}%`]
  );
  res.json(rows);
}

export async function createCurso(req, res) {
  const { colegioId, nombre, anio, seccion } = req.body || {};
  if (!colegioId || !nombre?.trim()) {
    return res.status(422).json({ error: "colegioId y nombre son requeridos" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO cursos (colegio_id, nombre, anio, seccion, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ON CONSTRAINT uq_cursos_compuesto DO NOTHING
       RETURNING id, nombre, anio, seccion`,
      [colegioId, nombre.trim(), anio ?? null, seccion ?? null, req.user?.id ?? null]
    );

    if (!rows.length) {
      const sug = await pool.query(
        `SELECT id, nombre, anio, seccion
           FROM cursos
          WHERE colegio_id = $1 AND nombre ILIKE $2
          LIMIT 5`, [colegioId, `%${nombre}%`]
      );
      return res.status(409).json({ error: "duplicado_probable", sugerencias: sug.rows });
    }

    // Auto-membresía del creador si es docente
    if (req.user?.rol === "docente") {
      await pool.query(
        `INSERT INTO curso_miembros (curso_id, usuario_id, rol_en_curso)
         VALUES ($1, $2, 'docente')
         ON CONFLICT (curso_id, usuario_id) DO NOTHING`,
        [rows[0].id, req.user.id]
      );
    }

    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "db_error", detail: e.message });
  }
}

export async function unirseCurso(req, res) {
  const cursoId = Number(req.params.cursoId);
  if (!cursoId) return res.status(422).json({ error: "cursoId inválido" });
  if (!req.user?.id) return res.status(401).json({ error: "No auth" });

  const rol = req.user.rol === "docente" ? "docente" : "alumno";
  try {
    const { rows } = await pool.query( 
      `INSERT INTO curso_miembros (curso_id, usuario_id, rol_en_curso)
       VALUES ($1, $2, $3)
       ON CONFLICT (curso_id, usuario_id) DO NOTHING
       RETURNING id`, 
      [cursoId, req.user.id, rol]
    );

    if (!rows.length) {
      // D-02: Ya es miembro (OK)
      return res.status(409).json({ error: "ya_es_miembro" });
    }
    
    // FIX D-03: ¡El cambio crítico! Devolver el ID del curso.
    return res.status(200).json({ curso_id: cursoId }); // <-- Esta línea es la clave
    
  } catch (e) {
    return res.status(500).json({ error: "db_error", detail: e.message });
  }
}

export async function misCursos(req, res) {
  if (!req.user?.id) return res.status(401).json({ error: "No auth" });
  const { rows } = await pool.query(
    `SELECT cm.id as membresia_id, c.id as curso_id, c.nombre, c.anio, c.seccion,
            cm.rol_en_curso, c.colegio_id
       FROM curso_miembros cm
       JOIN cursos c ON c.id = cm.curso_id
      WHERE cm.usuario_id = $1
      ORDER BY c.nombre`, [req.user.id]
  );
  res.json(rows);
}

export async function borrarMembresia(req, res) {
  const membresiaId = Number(req.params.id);
  if (!membresiaId) return res.status(422).json({ error: "id inválido" });
  if (!req.user?.id) return res.status(401).json({ error: "No auth" });

  try {
    const { rows: info } = await pool.query(
      `SELECT cm.usuario_id, cm.curso_id
         FROM curso_miembros cm
        WHERE cm.id = $1`, [membresiaId]
    );
    if (!info.length) return res.status(404).json({ error: "membresia_no_encontrada" });

    const { usuario_id, curso_id } = info[0];
    if (usuario_id !== req.user.id && req.user.rol !== "docente") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 1) bloquea si tiene resultados en ensayos del curso
    const { rows: r1 } = await pool.query(
      `SELECT 1
         FROM resultados r
         JOIN ensayos e ON e.id = r.ensayo_id
        WHERE r.alumno_id = $1
          AND EXISTS (
            SELECT 1 FROM ventanas_rendicion v
             WHERE v.ensayo_id = e.id AND v.curso_id = $2
          )
        LIMIT 1`, [usuario_id, curso_id]
    );
    if (r1.length) return res.status(409).json({ error: "tiene_resultados" });

    // 2) bloquea si hay ventanas activas o futuras
    const { rows: r2 } = await pool.query(
      `SELECT 1 FROM ventanas_rendicion v
        WHERE v.curso_id = $1 AND v.fin >= NOW()
        LIMIT 1`, [curso_id]
    );
    if (r2.length) return res.status(409).json({ error: "ventanas_activas_o_futuras" });

    await pool.query(`DELETE FROM curso_miembros WHERE id = $1`, [membresiaId]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "db_error", detail: e.message });
  }
}