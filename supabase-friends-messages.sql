-- ============================================
-- CINECIRCLE - SISTEMA DE AMIGOS Y MENSAJES
-- ============================================
-- Ejecutar este script en Supabase SQL Editor
-- DESPUÉS de haber ejecutado supabase-setup.sql

-- ============================================
-- 1. TABLA DE AMISTADES
-- ============================================

CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Evitar duplicados y auto-amistad
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id),
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

-- Índices para búsquedas de amigos
CREATE INDEX IF NOT EXISTS friendships_requester_idx ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON friendships(status);

-- ============================================
-- 2. TABLA DE MENSAJES
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT,
  recommendation_id UUID REFERENCES recommendations ON DELETE SET NULL,
  tmdb_id INTEGER,
  tmdb_type TEXT CHECK (tmdb_type IN ('movie', 'series')),
  tmdb_title TEXT,
  tmdb_poster_url TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Al menos debe tener contenido o una recomendación/película
  CONSTRAINT message_has_content CHECK (
    content IS NOT NULL OR
    recommendation_id IS NOT NULL OR
    tmdb_id IS NOT NULL
  )
);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_unread_idx ON messages(receiver_id, read_at) WHERE read_at IS NULL;

-- ============================================
-- 3. AGREGAR tmdb_id A RECOMMENDATIONS
-- ============================================

ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS tmdb_id INTEGER;

-- ============================================
-- 4. RLS PARA FRIENDSHIPS
-- ============================================

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Ver amistades donde soy parte
CREATE POLICY "Ver mis amistades"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Enviar solicitud de amistad
CREATE POLICY "Enviar solicitud de amistad"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Actualizar solicitudes dirigidas a mí (aceptar/rechazar)
CREATE POLICY "Responder solicitud de amistad"
  ON friendships FOR UPDATE
  USING (auth.uid() = addressee_id);

-- Eliminar amistades donde soy parte
CREATE POLICY "Eliminar amistad"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ============================================
-- 5. RLS PARA MESSAGES
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Ver mensajes donde soy emisor o receptor
CREATE POLICY "Ver mis mensajes"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Enviar mensajes solo a amigos
CREATE POLICY "Enviar mensajes a amigos"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id = receiver_id) OR
        (addressee_id = auth.uid() AND requester_id = receiver_id)
      )
    )
  );

-- Actualizar mensajes recibidos (marcar como leído)
CREATE POLICY "Marcar mensajes como leídos"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Eliminar mensajes propios
CREATE POLICY "Eliminar mis mensajes"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================
-- 6. HABILITAR REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================
-- 7. FUNCIÓN PARA OBTENER AMIGOS
-- ============================================

CREATE OR REPLACE FUNCTION get_friends(user_uuid UUID)
RETURNS TABLE (
  friend_id UUID,
  username TEXT,
  avatar_url TEXT,
  friendship_id UUID,
  since TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN f.requester_id = user_uuid THEN f.addressee_id
      ELSE f.requester_id
    END as friend_id,
    p.username,
    p.avatar_url,
    f.id as friendship_id,
    f.updated_at as since
  FROM friendships f
  JOIN profiles p ON p.id = CASE
    WHEN f.requester_id = user_uuid THEN f.addressee_id
    ELSE f.requester_id
  END
  WHERE f.status = 'accepted'
  AND (f.requester_id = user_uuid OR f.addressee_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. FUNCIÓN PARA CONTAR MENSAJES NO LEÍDOS
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages
    WHERE receiver_id = user_uuid
    AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ✅ CONFIGURACIÓN DE AMIGOS Y MENSAJES COMPLETA
-- ============================================
