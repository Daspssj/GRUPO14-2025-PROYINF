// colegios.js: La función completa debe ser así

import { pool } from "../db.js";

function normalizeString(str) {
    if (!str) return str;
    // Tildes, minúsculas, y quitar espacios
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              .toLowerCase().replace(/\s/g, '');
}

export async function listColegios(req, res) {
  const q = (req.query.query || "").trim();
  if (!q) {
    const { rows } = await pool.query(
      "SELECT id, nombre, comuna FROM colegios ORDER BY nombre LIMIT 50"
    );
    return res.json(rows);
  }
  const { rows } = await pool.query(
    `SELECT id, nombre, comuna
       FROM colegios
      WHERE nombre ILIKE $1 OR COALESCE(comuna,'') ILIKE $1
      ORDER BY nombre
      LIMIT 50`,
    [`%${q}%`]
  );
  res.json(rows);
}

export async function createColegio(req, res) {
  const { nombre, comuna } = req.body || {};
  if (!nombre?.trim()) return res.status(422).json({ error: "nombre requerido" });

  // 1. APLICAR NORMALIZACIÓN AL NOMBRE (COMPLETA)
  const nombreNormalizado = normalizeString(nombre.trim()); 
  
  // 2. APLICAR NORMALIZACIÓN A LA COMUNA (Minúsculas para unicidad) <-- ¡EL FIX!
  const comunaNormalizada = comuna ? comuna.trim().toLowerCase() : null; 

  try {
    const { rows } = await pool.query(
      // 3. INSERTAR EL NOMBRE Y LA COMUNA NORMALIZADOS
      `INSERT INTO colegios (nombre, comuna, created_by)
       VALUES ($1, $2, $3)
       ON CONFLICT ON CONSTRAINT uq_colegios_nombre_comuna DO NOTHING
       RETURNING id, nombre, comuna`,
      // USAR LAS VARIABLES NORMALIZADAS
      [nombreNormalizado, comunaNormalizada, req.user?.id || null] 
    );

    if (!rows.length) {
      // 4. CASO: DUPLICADO -> 409 CONFLICT con sugerencias
      const sug = await pool.query(
        `SELECT id, nombre, comuna FROM colegios
           WHERE nombre = $1 AND comuna = $2 
           LIMIT 5`,
        // Buscar con las variables normalizadas
        [nombreNormalizado, comunaNormalizada]
      );
      return res.status(409).json({ error: "duplicado_probable", sugerencias: sug.rows });
    }
    
    // CASO: ÉXITO (201 Created)
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "db_error", detail: e.message });
  }
}