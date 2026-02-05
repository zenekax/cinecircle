-- =============================================
-- NOTIFICATIONS - Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Crear tabla
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

-- 2. Índices
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- 3. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes (para evitar errores)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;

-- 5. Crear políticas
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 6. Función para notificar likes
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  rec_owner_id UUID;
  rec_title TEXT;
BEGIN
  SELECT user_id, title INTO rec_owner_id, rec_title
  FROM recommendations
  WHERE id = NEW.recommendation_id;

  IF rec_owner_id IS NOT NULL AND rec_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, from_user_id, recommendation_id, message)
    VALUES (rec_owner_id, 'like', NEW.user_id, NEW.recommendation_id, rec_title);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Función para notificar comentarios
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  rec_owner_id UUID;
  rec_title TEXT;
BEGIN
  SELECT user_id, title INTO rec_owner_id, rec_title
  FROM recommendations
  WHERE id = NEW.recommendation_id;

  IF rec_owner_id IS NOT NULL AND rec_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, from_user_id, recommendation_id, message)
    VALUES (rec_owner_id, 'comment', NEW.user_id, NEW.recommendation_id, rec_title);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Triggers
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
