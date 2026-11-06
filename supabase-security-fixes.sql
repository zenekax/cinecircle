-- ============================================
-- CORRECCIONES DE SEGURIDAD (ejecutar una vez en el SQL Editor de Supabase)
-- ============================================

-- 1. Notificaciones: solo las crean los triggers (SECURITY DEFINER), nadie desde el cliente.
DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;

-- 2. Funciones SECURITY DEFINER: solo para el usuario logueado sobre sí mismo,
--    con search_path fijo.
CREATE OR REPLACE FUNCTION get_friends(user_uuid UUID)
RETURNS TABLE (
  friend_id UUID,
  username TEXT,
  avatar_url TEXT,
  friendship_id UUID,
  since TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  IF user_uuid IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT
    CASE WHEN f.requester_id = user_uuid THEN f.addressee_id ELSE f.requester_id END,
    p.username,
    p.avatar_url,
    f.id,
    f.updated_at
  FROM public.friendships f
  JOIN public.profiles p ON p.id = CASE
    WHEN f.requester_id = user_uuid THEN f.addressee_id
    ELSE f.requester_id
  END
  WHERE f.status = 'accepted'
  AND (f.requester_id = user_uuid OR f.addressee_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_unread_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  IF user_uuid IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.messages
    WHERE receiver_id = user_uuid
    AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

ALTER FUNCTION notify_on_like() SET search_path = public;
ALTER FUNCTION notify_on_comment() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

REVOKE EXECUTE ON FUNCTION get_friends(UUID), get_unread_count(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_friends(UUID), get_unread_count(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION notify_on_like(), notify_on_comment(), public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 3. Administradores: se decide en la base de datos, no por el nombre de usuario en el navegador.
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE
);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cada uno ve si es admin" ON admins
  FOR SELECT USING (auth.uid() = user_id);
-- Sin políticas de INSERT/UPDATE/DELETE: los admins se cargan solo desde el SQL Editor:
--   INSERT INTO admins (user_id) SELECT id FROM profiles WHERE username = 'TU_USUARIO';

CREATE POLICY "Admins pueden actualizar perfiles" ON profiles
  FOR UPDATE USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));
