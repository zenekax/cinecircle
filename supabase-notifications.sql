-- Tabla para Notificaciones
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'friend_request', 'friend_accepted', 'message')),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Permitir insertar notificaciones (para triggers)
CREATE POLICY "Allow insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Función para crear notificación de like
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  rec_owner_id UUID;
  rec_title TEXT;
BEGIN
  -- Obtener el dueño de la recomendación
  SELECT user_id, title INTO rec_owner_id, rec_title
  FROM recommendations
  WHERE id = NEW.recommendation_id;

  -- No notificar si te das like a ti mismo
  IF rec_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, from_user_id, recommendation_id, message)
    VALUES (rec_owner_id, 'like', NEW.user_id, NEW.recommendation_id, rec_title);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificación de comentario
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  rec_owner_id UUID;
  rec_title TEXT;
BEGIN
  -- Obtener el dueño de la recomendación
  SELECT user_id, title INTO rec_owner_id, rec_title
  FROM recommendations
  WHERE id = NEW.recommendation_id;

  -- No notificar si comentas tu propia publicación
  IF rec_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, from_user_id, recommendation_id, message)
    VALUES (rec_owner_id, 'comment', NEW.user_id, NEW.recommendation_id, rec_title);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS on_like_notify ON likes;
CREATE TRIGGER on_like_notify
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

DROP TRIGGER IF EXISTS on_comment_notify ON comments;
CREATE TRIGGER on_comment_notify
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();
