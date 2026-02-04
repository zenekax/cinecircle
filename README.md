# 🎬 CineCircle - App de Recomendaciones

Aplicación web para compartir recomendaciones de películas y series con amigos, y establecer objetivos semanales.

## 🚀 Características

- ✅ Feed de recomendaciones en tiempo real
- ✅ Sistema de calificaciones y comentarios
- ✅ Objetivos semanales compartidos
- ✅ Perfil de usuario con estadísticas
- ✅ PWA - Instalable como app nativa
- ✅ Responsive - Funciona en móvil y desktop
- ✅ 100% Gratis (hosting y base de datos)

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en Supabase (gratis)
- Cuenta en Netlify (gratis) o Vercel

## 🛠️ Configuración

### 1. Configurar Supabase

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Crear un nuevo proyecto (gratis)
3. Esperar a que se inicialice (2-3 minutos)
4. Ir a **SQL Editor** en el menú lateral
5. Ejecutar el siguiente SQL para crear las tablas:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recomendaciones
CREATE TABLE recommendations (
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
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  deadline DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para profiles
CREATE POLICY "Profiles son públicos para lectura"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para recommendations
CREATE POLICY "Recomendaciones son públicas"
  ON recommendations FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden crear recomendaciones"
  ON recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus recomendaciones"
  ON recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus recomendaciones"
  ON recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para goals
CREATE POLICY "Goals son públicos"
  ON goals FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden crear goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

6. Ir a **Settings > API**
7. Copiar:
   - `Project URL`
   - `anon public` key

### 2. Configurar el Proyecto Localmente

```bash
# Clonar o descargar el proyecto
cd cineCircle

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env y agregar tus credenciales de Supabase
# VITE_SUPABASE_URL=tu-url-aqui
# VITE_SUPABASE_ANON_KEY=tu-key-aqui
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

Abrí http://localhost:5173 en tu navegador

## 🌐 Deploy a Netlify (GRATIS)

### Opción A: Deploy desde GitHub

1. Subir el proyecto a GitHub
2. Ir a [netlify.com](https://netlify.com)
3. Click en "Add new site" > "Import an existing project"
4. Conectar con GitHub y seleccionar tu repo
5. Configurar:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. En "Environment variables" agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click en "Deploy site"

### Opción B: Deploy manual

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## 📱 Convertir en PWA (App Instalable)

La app ya está configurada como PWA. Cuando los usuarios entren desde el móvil:

1. Chrome/Safari mostrará "Agregar a pantalla de inicio"
2. Se instalará como app nativa
3. Funciona offline para contenido cacheado

Para personalizar los íconos:
1. Crear íconos de 192x192 y 512x512 píxeles
2. Guardarlos en `/public/` como `icon-192.png` y `icon-512.png`

## 🎯 Uso

### Registro
- Email + contraseña
- Nombre de usuario

### Feed
- Ver todas las recomendaciones
- Actualización en tiempo real

### Recomendar
- Título
- Tipo (película/serie)
- Calificación (1-5 ⭐)
- Comentario
- Poster (opcional)

### Objetivos
- Crear objetivos semanales
- Marcar como completados
- Ver objetivos de amigos

### Perfil
- Estadísticas personales
- Actividad reciente

## 🔧 Tecnologías

- **Frontend**: React + Vite
- **Estilos**: TailwindCSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Hosting**: Netlify/Vercel
- **Tiempo Real**: Supabase Realtime

## 💰 Costos

- Hosting (Netlify/Vercel): **$0**
- Base de datos (Supabase): **$0** hasta 500MB
- Total: **$0** 🎉

## 🚀 Próximas Features

- [ ] Sistema de "me gusta"
- [ ] Comentarios en recomendaciones
- [ ] Búsqueda de películas con API
- [ ] Notificaciones push
- [ ] Sistema de amigos
- [ ] Chat grupal
- [ ] Integración con TMDB para posters automáticos

## 📝 Notas

- Supabase free tier: 500MB de storage, 50K usuarios
- Netlify free tier: 100GB bandwidth/mes
- Las credenciales deben estar en variables de entorno
- No commitear archivos .env al repositorio

## 🐛 Troubleshooting

### Error de conexión con Supabase
- Verificar que las credenciales en `.env` sean correctas
- Verificar que las tablas estén creadas

### Build falla en Netlify
- Verificar que las variables de entorno estén configuradas
- Verificar que `npm run build` funcione localmente

### PWA no se instala
- Verificar que estés usando HTTPS
- Los íconos deben existir en `/public/`

## 📧 Contacto

¿Dudas? Contactame en [tu-email]

---

Hecho con ❤️ para compartir buenas pelis con amigos
