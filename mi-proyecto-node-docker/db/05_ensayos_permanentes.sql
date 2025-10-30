-- 05_ensayos_permanentes.sql
SET search_path TO "$user", public;

-- Disponibilidad y max intentos en ensayos
ALTER TABLE ensayos
  ADD COLUMN IF NOT EXISTS disponibilidad VARCHAR(20) NOT NULL DEFAULT 'permanente',
  ADD COLUMN IF NOT EXISTS max_intentos INT NULL,
  ADD CONSTRAINT ensayos_disponibilidad_ck CHECK (disponibilidad IN ('permanente','ventana')),
  ADD CONSTRAINT ensayos_max_intentos_ck CHECK (max_intentos IS NULL OR max_intentos > 0);

-- Backfill para existentes
UPDATE ensayos SET disponibilidad = 'permanente' WHERE disponibilidad IS NULL;