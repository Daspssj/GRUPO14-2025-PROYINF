-- 01_schema.sql
SET search_path TO "$user", public;

-- Extensión para correos case-insensitive
CREATE EXTENSION IF NOT EXISTS citext;

-- =========================
-- Tabla: usuarios
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo CITEXT UNIQUE NOT NULL,
  contrasena VARCHAR(255),                  -- NULL para OAuth
  rol VARCHAR(50) NOT NULL,
  avatar_url VARCHAR(255),
  correo_verificado BOOLEAN NOT NULL DEFAULT false,
  auth_origen TEXT NOT NULL DEFAULT 'local',   -- 'local' | 'google'
  CONSTRAINT usuarios_contrasena_local_ck
    CHECK (
      (auth_origen = 'local'  AND contrasena IS NOT NULL AND char_length(contrasena) > 0) OR
      (auth_origen <> 'local' AND contrasena IS NULL)
    )
);

-- =========================
-- Tabla: materias
-- =========================
CREATE TABLE IF NOT EXISTS materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) UNIQUE NOT NULL
);

-- =========================
-- Tabla: preguntas
-- =========================
CREATE TABLE IF NOT EXISTS preguntas (
  id SERIAL PRIMARY KEY,
  enunciado TEXT NOT NULL,
  imagen VARCHAR(255),
  opcion_a TEXT NOT NULL,
  opcion_b TEXT NOT NULL,
  opcion_c TEXT NOT NULL,
  opcion_d TEXT NOT NULL,
  respuesta_correcta VARCHAR(1) NOT NULL,  -- 'A', 'B', 'C' o 'D'
  materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE
);

-- =========================
-- Tabla: ensayos
-- =========================
CREATE TABLE IF NOT EXISTS ensayos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  docente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE
);

-- =========================
-- Tabla: ensayo_pregunta
-- =========================
CREATE TABLE IF NOT EXISTS ensayo_pregunta (
  id SERIAL PRIMARY KEY,
  ensayo_id INTEGER NOT NULL REFERENCES ensayos(id) ON DELETE CASCADE,
  pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  UNIQUE (ensayo_id, pregunta_id)
);

-- =========================
-- Tabla: resultados
-- =========================
CREATE TABLE IF NOT EXISTS resultados (
  id SERIAL PRIMARY KEY,
  ensayo_id INTEGER NOT NULL REFERENCES ensayos(id) ON DELETE CASCADE,
  alumno_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  puntaje INTEGER DEFAULT 0,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Tabla: respuestas
-- =========================
CREATE TABLE IF NOT EXISTS respuestas (
  id SERIAL PRIMARY KEY,
  resultado_id INTEGER NOT NULL REFERENCES resultados(id) ON DELETE CASCADE,
  pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  respuesta_dada VARCHAR(1) NOT NULL,
  correcta BOOLEAN NOT NULL,
  UNIQUE (resultado_id, pregunta_id)
);

-- =========================
-- Tabla: usuario_proveedores (OAuth)
-- =========================
CREATE TABLE IF NOT EXISTS usuario_proveedores (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  proveedor VARCHAR(50) NOT NULL,          -- 'google'
  proveedor_uid VARCHAR(255) NOT NULL,     -- sub del proveedor
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (usuario_id, proveedor)
);

-- Índice único para ON CONFLICT DO NOTHING con (proveedor, proveedor_uid)
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_proveedores_proveedor_uid
  ON usuario_proveedores (proveedor, proveedor_uid);