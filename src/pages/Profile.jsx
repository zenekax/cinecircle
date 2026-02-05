import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import AvatarSelector from '../components/AvatarSelector'
import UserAvatar from '../components/UserAvatar'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    completedGoals: 0,
    totalGoals: 0,
    friends: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      // Cargar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') throw profileError

      if (profileData) {
        setProfile(profileData)
      } else {
        // Crear perfil si no existe
        const newProfile = {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0],
          avatar: 'popcorn',
          avatar_color: 'brand'
        }
        await supabase.from('profiles').insert([newProfile])
        setProfile(newProfile)
      }

      // Cargar estadísticas
      const [recsResponse, goalsResponse, friendsResponse] = await Promise.all([
        supabase
          .from('recommendations')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted')
      ])

      const completedGoals = goalsResponse.data?.filter(g => g.completed).length || 0
      const totalGoals = goalsResponse.data?.length || 0

      setStats({
        totalRecommendations: recsResponse.count || 0,
        completedGoals,
        totalGoals,
        friends: friendsResponse.count || 0,
      })

      // Cargar actividad reciente
      const { data: activity } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentActivity(activity || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarSelect = async ({ avatar, color }) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar, avatar_color: color })
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => ({ ...prev, avatar, avatar_color: color }))
    } catch (error) {
      console.error('Error guardando avatar:', error.message)
      alert('Error al guardar el avatar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Icons.User className="w-8 h-8 text-brand" />
        Mi Perfil
      </h2>

      {/* Info del usuario */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <button
            onClick={() => setShowAvatarSelector(true)}
            className="relative group"
            disabled={saving}
          >
            <UserAvatar
              avatar={profile?.avatar}
              color={profile?.avatar_color}
              username={profile?.username}
              size="2xl"
              className="transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Icons.Edit className="w-8 h-8 text-white" />
            </div>
          </button>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold">
              {profile?.username || user?.user_metadata?.username || 'Usuario'}
            </h3>
            <p className="text-gray-400">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Miembro desde {new Date(user?.created_at).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long'
              })}
            </p>
            <button
              onClick={() => setShowAvatarSelector(true)}
              className="btn btn-secondary text-sm mt-3"
            >
              <Icons.Edit className="w-4 h-4 mr-2" />
              Cambiar avatar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center py-4">
          <div className="text-3xl font-bold text-brand">
            {stats.totalRecommendations}
          </div>
          <div className="text-gray-400 text-sm mt-1">Recomendaciones</div>
        </div>

        <div className="card text-center py-4">
          <div className="text-3xl font-bold text-blue-500">
            {stats.friends}
          </div>
          <div className="text-gray-400 text-sm mt-1">Amigos</div>
        </div>

        <div className="card text-center py-4">
          <div className="text-3xl font-bold text-green-500">
            {stats.completedGoals}
          </div>
          <div className="text-gray-400 text-sm mt-1">Metas Completadas</div>
        </div>

        <div className="card text-center py-4">
          <div className="text-3xl font-bold text-purple-500">
            {stats.totalGoals}
          </div>
          <div className="text-gray-400 text-sm mt-1">Metas Totales</div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icons.Film className="w-5 h-5 text-gray-400" />
          Actividad Reciente
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No hay actividad reciente
          </p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                <div className="text-2xl">
                  {item.type === 'movie' ? '🎬' : '📺'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-400">
                    {'⭐'.repeat(item.rating)} • {new Date(item.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <AvatarSelector
          currentAvatar={profile?.avatar}
          currentColor={profile?.avatar_color}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </div>
  )
}
