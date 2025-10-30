-- 06_indices_extra.sql
SET search_path TO "$user", public;

-- Búsquedas frecuentes (catálogos y alumno)
CREATE INDEX IF NOT EXISTS idx_ensayos_docente ON ensayos (docente_id);
CREATE INDEX IF NOT EXISTS idx_ensayos_disponibilidad ON ensayos (disponibilidad);
CREATE INDEX IF NOT EXISTS idx_ventanas_lookup ON ventanas_rendicion (ensayo_id, curso_id, inicio, fin);
CREATE INDEX IF NOT EXISTS idx_resultados_alumno ON resultados (alumno_id, ensayo_id);