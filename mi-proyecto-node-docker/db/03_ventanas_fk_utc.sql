CREATE EXTENSION IF NOT EXISTS btree_gist;

-- FK real a cursos
ALTER TABLE ventanas_rendicion
  ADD CONSTRAINT fk_ventana_curso
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE;

-- Convertir a TIMESTAMPTZ según cómo estaban guardados:
-- Si estaban en CHILE local: usa America/Santiago
-- Si ya eran UTC: usa 'UTC'
ALTER TABLE ventanas_rendicion
  ALTER COLUMN inicio TYPE TIMESTAMPTZ USING inicio AT TIME ZONE 'UTC',
  ALTER COLUMN fin    TYPE TIMESTAMPTZ USING fin    AT TIME ZONE 'UTC';

-- Consistencia: fin = inicio + duracion
ALTER TABLE ventanas_rendicion
  ADD CONSTRAINT ventanas_fin_consistente_ck
  CHECK (fin = (inicio + (duracion_min || ' minutes')::interval));

-- Rango y no-solape por (curso_id, ensayo_id)
ALTER TABLE ventanas_rendicion
  ADD COLUMN IF NOT EXISTS periodo tstzrange;

UPDATE ventanas_rendicion
   SET periodo = tstzrange(inicio, fin, '[)');

ALTER TABLE ventanas_rendicion
  ALTER COLUMN periodo SET NOT NULL;

ALTER TABLE ventanas_rendicion
  ADD CONSTRAINT ventanas_no_solape
  EXCLUDE USING gist (
    curso_id WITH =,
    ensayo_id WITH =,
    periodo WITH &&
  );

-- updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ventanas_updated_at ON ventanas_rendicion;
CREATE TRIGGER trg_ventanas_updated_at
BEFORE UPDATE ON ventanas_rendicion
FOR EACH ROW EXECUTE FUNCTION set_updated_at();