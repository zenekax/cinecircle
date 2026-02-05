-- Tabla para Watchlist (Lista de "Quiero Ver")
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
  -- Para agregar películas/series directamente de TMDB (no solo del feed)
  tmdb_id INTEGER,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('movie', 'series')) NOT NULL,
  poster_url TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, recommendation_id),
  UNIQUE(user_id, tmdb_id)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS watchlist_watched_idx ON watchlist(user_id, watched);

-- RLS (Row Level Security)
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Políticas
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
