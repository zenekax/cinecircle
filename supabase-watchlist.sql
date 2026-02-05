-- =============================================
-- WATCHLIST - Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
  tmdb_id INTEGER,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('movie', 'series')) NOT NULL,
  poster_url TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS watchlist_watched_idx ON watchlist(user_id, watched);

-- 3. Habilitar RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes (para evitar errores)
DROP POLICY IF EXISTS "Users can view their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can add to their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can update their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can delete from their own watchlist" ON watchlist;

-- 5. Crear políticas
CREATE POLICY "Users can view their own watchlist"
  ON watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own watchlist"
  ON watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist"
  ON watchlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist"
  ON watchlist FOR DELETE
  USING (auth.uid() = user_id);
