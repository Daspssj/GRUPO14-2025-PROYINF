
-- 02_colegios_cursos.sql
SET search_path TO "$user", public;


-- ====== COLEGIOS ======
CREATE TABLE IF NOT EXISTS colegios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  comuna VARCHAR(255),
  
  -- SÓLO comuna_norm (COALESCE es inmutable)
  comuna_norm VARCHAR(255) GENERATED ALWAYS AS (COALESCE(comuna, '')) STORED,

  -- Columna REQUERIDA por el backend (¡Asegúrate de que esté aquí!)
  created_by INT REFERENCES usuarios(id) ON DELETE SET NULL, 

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_colegios_nombre_comuna UNIQUE (nombre, comuna_norm)
);

CREATE INDEX IF NOT EXISTS idx_colegios_nombre_norm ON colegios (nombre);

-- updated_at automático (reutiliza o crea la función si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $f$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END; $f$ LANGUAGE plpgsql;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_colegios_updated_at ON colegios;
CREATE TRIGGER trg_colegios_updated_at
BEFORE UPDATE ON colegios
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ====== CURSOS ======
CREATE TABLE IF NOT EXISTS cursos (
  id SERIAL PRIMARY KEY,
  colegio_id INT NOT NULL REFERENCES colegios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  anio INT,
  seccion VARCHAR(50),

  -- columnas generadas para normalizar NULL
  anio_norm INT GENERATED ALWAYS AS (COALESCE(anio, 0)) STORED,
  seccion_norm VARCHAR(50) GENERATED ALWAYS AS (COALESCE(seccion, '')) STORED,

  created_by INT REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_cursos_compuesto UNIQUE (colegio_id, nombre, anio_norm, seccion_norm)
);

CREATE INDEX IF NOT EXISTS idx_cursos_colegio ON cursos (colegio_id);
CREATE INDEX IF NOT EXISTS idx_cursos_busqueda ON cursos (colegio_id, nombre, anio, seccion);

DROP TRIGGER IF EXISTS trg_cursos_updated_at ON cursos;
CREATE TRIGGER trg_cursos_updated_at
BEFORE UPDATE ON cursos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ====== CURSO_MIEMBROS ======
CREATE TABLE IF NOT EXISTS curso_miembros (
  id SERIAL PRIMARY KEY,
  curso_id INT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_en_curso VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT curso_miembros_rol_ck CHECK (rol_en_curso IN ('alumno','docente')),
  UNIQUE (curso_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_curso_miembros_curso ON curso_miembros (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_miembros_usuario ON curso_miembros (usuario_id);