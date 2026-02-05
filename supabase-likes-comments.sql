-- =====================================================
-- SISTEMA DE LIKES Y COMENTARIOS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Tabla de Likes
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recommendation_id)
);

-- 2. Tabla de Comentarios
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para Likes
DROP POLICY IF EXISTS "Usuarios pueden ver todos los likes" ON likes;
CREATE POLICY "Usuarios pueden ver todos los likes" ON likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden dar like" ON likes;
CREATE POLICY "Usuarios pueden dar like" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden quitar su like" ON likes;
CREATE POLICY "Usuarios pueden quitar su like" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Políticas para Comentarios
DROP POLICY IF EXISTS "Usuarios pueden ver todos los comentarios" ON comments;
CREATE POLICY "Usuarios pueden ver todos los comentarios" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden comentar" ON comments;
CREATE POLICY "Usuarios pueden comentar" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden borrar su comentario" ON comments;
CREATE POLICY "Usuarios pueden borrar su comentario" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_likes_recommendation ON likes(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_recommendation ON comments(recommendation_id);

-- =====================================================
-- LISTO! Las tablas de likes y comentarios están creadas
-- =====================================================
