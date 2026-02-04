# 🚀 INICIO RÁPIDO - CineCircle

## ⚡ Setup en 5 minutos

### Paso 1: Configurar Supabase (2 min)

1. Ir a **https://supabase.com** y crear cuenta
2. Click en **"New Project"**
3. Completar:
   - Project name: `cinecircle`
   - Database password: (guardar en lugar seguro)
   - Region: Elegir la más cercana
   - Plan: Free
4. Click **"Create new project"**
5. ⏳ Esperar 2-3 minutos mientras se crea

### Paso 2: Crear Base de Datos (1 min)

1. En el menú lateral, ir a **"SQL Editor"**
2. Copiar TODO el contenido del archivo `supabase-setup.sql`
3. Pegarlo en el editor
4. Click en **"Run"** (botón verde abajo a la derecha)
5. ✅ Debe decir "Success. No rows returned"

### Paso 3: Obtener Credenciales (30 seg)

1. Ir a **Settings** (engranaje en el menú lateral)
2. Click en **"API"**
3. Copiar estos dos valores:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key (bajo "Project API keys")

### Paso 4: Configurar Proyecto Local (1 min)

```bash
# 1. Abrir terminal en la carpeta del proyecto
cd cineCircle

# 2. Instalar dependencias
npm install

# 3. Crear archivo de configuración
cp .env.example .env

# 4. Editar .env con tu editor favorito
# Reemplazar con tus credenciales de Supabase:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# 5. Iniciar el servidor de desarrollo
npm run dev
```

### Paso 5: ¡Probar! (30 seg)

1. Abrir http://localhost:5173
2. Registrarte con email y contraseña
3. Empezar a recomendar pelis! 🎬

---

## 📱 Deploy a Internet (GRATIS)

### Con Netlify:

```bash
# 1. Instalar CLI de Netlify
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Crear el build
npm run build

# 4. Deploy
netlify deploy --prod

# 5. Configurar variables de entorno en Netlify
# Site settings > Build & deploy > Environment
# Agregar:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
```

### Desde GitHub:

1. Subir el proyecto a GitHub
2. Ir a **netlify.com** > "Add new site"
3. Importar desde GitHub
4. Configurar:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Agregar variables de entorno
6. Deploy! 🚀

---

## ✅ Checklist

- [ ] Cuenta en Supabase creada
- [ ] Proyecto Supabase creado
- [ ] Script SQL ejecutado correctamente
- [ ] Credenciales copiadas
- [ ] Archivo `.env` creado y configurado
- [ ] `npm install` ejecutado
- [ ] `npm run dev` funcionando
- [ ] Puedo registrarme y loguearme
- [ ] Puedo crear una recomendación
- [ ] Deploy a Netlify (opcional)

---

## 🆘 ¿Problemas?

### No puedo registrarme
- ✅ Verificar que el script SQL se haya ejecutado
- ✅ Verificar credenciales en `.env`
- ✅ Verificar que Supabase esté funcionando (ir al dashboard)

### Las recomendaciones no aparecen
- ✅ Abrir DevTools (F12) > Console
- ✅ Buscar errores en rojo
- ✅ Verificar políticas de RLS en Supabase

### Error al hacer build
- ✅ Ejecutar `npm install` nuevamente
- ✅ Verificar versión de Node (debe ser 18+)
- ✅ Eliminar `node_modules` y `package-lock.json`, luego `npm install`

---

## 🎯 Próximos Pasos

1. Invitar a tus amigos a registrarse
2. Empezar a compartir recomendaciones
3. Crear objetivos semanales
4. ¡Disfrutar! 🍿

---

**¿Todo listo?** → `npm run dev` y a recomendar pelis! 🎬
