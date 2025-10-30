ALTER TABLE resultados
  ADD COLUMN IF NOT EXISTS ventana_id INT REFERENCES ventanas_rendicion(id) ON DELETE SET NULL;