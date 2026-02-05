-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- =====================================================

-- 1. Agregar columnas de avatar a profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'popcorn',
ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT 'brand';

-- 2. Agregar columnas de overview y genre a recommendations
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS overview TEXT,
ADD COLUMN IF NOT EXISTS genre TEXT;

-- 3. Arreglar foreign keys de friendships (para que funcionen las solicitudes)
ALTER TABLE friendships
DROP CONSTRAINT IF EXISTS friendships_requester_id_fkey;

ALTER TABLE friendships
DROP CONSTRAINT IF EXISTS friendships_addressee_id_fkey;

ALTER TABLE friendships
ADD CONSTRAINT friendships_requester_id_fkey
FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE friendships
ADD CONSTRAINT friendships_addressee_id_fkey
FOREIGN KEY (addressee_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. Actualizar RLS para profiles (permitir leer avatares de otros usuarios)
DROP POLICY IF EXISTS "Usuarios pueden ver perfiles públicos" ON profiles;
CREATE POLICY "Usuarios pueden ver perfiles públicos" ON profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 5. Asegurar que profiles permite insert para nuevos usuarios
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON profiles;
CREATE POLICY "Usuarios pueden crear su propio perfil" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- LISTO! Después de ejecutar esto:
-- - Los avatares funcionarán
-- - El resumen de películas se guardará
-- - Las solicitudes de amistad mostrarán correctamente
-- =====================================================
