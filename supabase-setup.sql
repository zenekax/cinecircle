-- ============================================
-- CINECIRCLE - CONFIGURACIÓN DE BASE DE DATOS
-- ============================================
-- Ejecutar este script completo en Supabase SQL Editor
-- SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================
-- 1. CREAR TABLAS
-- ============================================

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recomendaciones
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de objetivos
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  deadline DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS recommendations_user_id_idx ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS recommendations_created_at_idx ON recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_deadline_idx ON goals(deadline);

-- ============================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. POLÍTICAS DE SEGURIDAD - PROFILES
-- ============================================

-- Cualquiera puede ver perfiles (para mostrar nombres de usuario)
CREATE POLICY "Profiles son públicos para lectura"
  ON profiles FOR SELECT
  USING (true);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Usuarios pueden crear su perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Los usuarios pueden actualizar solo su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 5. POLÍTICAS DE SEGURIDAD - RECOMMENDATIONS
-- ============================================

-- Todos pueden ver todas las recomendaciones
CREATE POLICY "Recomendaciones son públicas"
  ON recommendations FOR SELECT
  USING (true);

-- Los usuarios pueden crear sus propias recomendaciones
CREATE POLICY "Usuarios pueden crear recomendaciones"
  ON recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar solo sus propias recomendaciones
CREATE POLICY "Usuarios pueden actualizar sus recomendaciones"
  ON recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar solo sus propias recomendaciones
CREATE POLICY "Usuarios pueden eliminar sus recomendaciones"
  ON recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. POLÍTICAS DE SEGURIDAD - GOALS
-- ============================================

-- Todos pueden ver todos los objetivos
CREATE POLICY "Goals son públicos"
  ON goals FOR SELECT
  USING (true);

-- Los usuarios pueden crear sus propios objetivos
CREATE POLICY "Usuarios pueden crear goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar solo sus propios objetivos
CREATE POLICY "Usuarios pueden actualizar sus goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar solo sus propios objetivos
CREATE POLICY "Usuarios pueden eliminar sus goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. FUNCIÓN PARA AUTO-CREAR PERFIL
-- ============================================

-- Cuando un usuario se registra, crear automáticamente su perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. TRIGGER PARA AUTO-CREAR PERFIL
-- ============================================

-- Eliminar trigger si existe (para poder re-ejecutar este script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. HABILITAR REALTIME (OPCIONAL)
-- ============================================

-- Habilitar publicación de cambios para realtime
ALTER PUBLICATION supabase_realtime ADD TABLE recommendations;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;

-- ============================================
-- ✅ CONFIGURACIÓN COMPLETA
-- ============================================
-- 
-- Próximos pasos:
-- 1. Ir a Settings > API en Supabase
-- 2. Copiar Project URL y anon public key
-- 3. Agregarlos a tu archivo .env
-- 4. npm install
-- 5. npm run dev
-- 
-- ============================================
