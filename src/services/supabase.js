import { createClient } from '@supabase/supabase-js'

// IMPORTANTE: Reemplazar con tus credenciales de Supabase
// 1. Ir a https://supabase.com
// 2. Crear proyecto gratis
// 3. Ir a Settings > API
// 4. Copiar la URL y anon key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
