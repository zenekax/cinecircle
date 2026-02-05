-- PLATFORM COLUMN - Ejecutar en Supabase SQL Editor
-- Agrega la columna 'platform' a la tabla recommendations para guardar dónde se vio la película/serie

-- Agregar columna platform
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS platform TEXT;

-- Crear un índice para búsquedas por plataforma (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_recommendations_platform ON recommendations(platform);

-- Verificar que se agregó correctamente
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'recommendations' AND column_name = 'platform';
