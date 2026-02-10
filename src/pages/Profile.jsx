import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import AvatarSelector from '../components/AvatarSelector'
import UserAvatar from '../components/UserAvatar'
import { BadgeList, BadgeProgress, calculateBadges } from '../components/Badges'

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
    movies: 0,
    series: 0,
    likesReceived: 0,
    commentsReceived: 0,
    topGenres: [],
    watchlistPending: 0,
    watchlistWatched: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [badges, setBadges] = useState([])

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
      const [recsResponse, goalsResponse, friendsResponse, watchlistResponse] = await Promise.all([
        supabase
          .from('recommendations')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted'),
        supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', user.id)
      ])

      const recs = recsResponse.data || []
      const recIds = recs.map(r => r.id)

      // Contar likes y comentarios recibidos
      let likesReceived = 0
      let commentsReceived = 0

      if (recIds.length > 0) {
        const [likesRes, commentsRes] = await Promise.all([
          supabase.from('likes').select('id', { count: 'exact', head: true }).in('recommendation_id', recIds),
          supabase.from('comments').select('id', { count: 'exact', head: true }).in('recommendation_id', recIds)
        ])
        likesReceived = likesRes.count || 0
        commentsReceived = commentsRes.count || 0
      }

      // Calcular géneros favoritos
      const genreCounts = {}
      recs.forEach(r => {
        if (r.genre) {
          genreCounts[r.genre] = (genreCounts[r.genre] || 0) + 1
        }
      })
      const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre, count]) => ({ genre, count }))

      const completedGoals = goalsResponse.data?.filter(g => g.completed).length || 0
      const totalGoals = goalsResponse.data?.length || 0

      const watchlist = watchlistResponse.data || []

      const newStats = {
        totalRecommendations: recs.length,
        completedGoals,
        totalGoals,
        friends: friendsResponse.count || 0,
        movies: recs.filter(r => r.type === 'movie').length,
        series: recs.filter(r => r.type === 'series').length,
        likesReceived,
        commentsReceived,
        topGenres,
        watchlistPending: watchlist.filter(w => !w.watched).length,
        watchlistWatched: watchlist.filter(w => w.watched).length,
      }

      setStats(newStats)

      // Calcular insignias (incluyendo las de Cafecito)
      const userBadges = calculateBadges({
        totalRecommendations: recs.length,
        totalLikesReceived: likesReceived,
        totalFriends: friendsResponse.count || 0,
        watchlistCount: watchlist.length,
        watchedCount: watchlist.filter(w => w.watched).length,
        createdAt: user?.created_at,
        username: profileData?.username
      }, profileData?.cafecito_badges || [])
      setBadges(userBadges)

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

      {/* Insignias */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Icons.Award className="w-5 h-5 text-yellow-500" />
          Mis Insignias
          {badges.length > 0 && (
            <span className="text-sm font-normal text-gray-400">({badges.length})</span>
          )}
        </h3>

        {badges.length > 0 ? (
          <div className="mb-6">
            <BadgeList badges={badges} maxDisplay={10} size="md" />
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-6">
            ¡Empezá a recomendar películas para desbloquear insignias!
          </p>
        )}

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Próximas insignias</h4>
          <BadgeProgress stats={{
            totalRecommendations: stats.totalRecommendations,
            totalLikesReceived: stats.likesReceived,
            totalFriends: stats.friends
          }} />
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
          <div className="text-3xl font-bold text-red-500">
            {stats.likesReceived}
          </div>
          <div className="text-gray-400 text-sm mt-1">Likes Recibidos</div>
        </div>

        <div className="card text-center py-4">
          <div className="text-3xl font-bold text-purple-500">
            {stats.commentsReceived}
          </div>
          <div className="text-gray-400 text-sm mt-1">Comentarios</div>
        </div>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Películas vs Series */}
        <div className="card">
          <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Icons.BarChart className="w-4 h-4" />
            Tipo de contenido
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <Icons.Clapperboard className="w-4 h-4 text-blue-400" />
                  Películas
                </span>
                <span className="text-white font-medium">{stats.movies}</span>
              </div>
              <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${stats.totalRecommendations ? (stats.movies / stats.totalRecommendations) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <Icons.Tv className="w-4 h-4 text-purple-400" />
                  Series
                </span>
                <span className="text-white font-medium">{stats.series}</span>
              </div>
              <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${stats.totalRecommendations ? (stats.series / stats.totalRecommendations) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Géneros favoritos */}
        <div className="card">
          <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Icons.StarFilled className="w-4 h-4" />
            Géneros favoritos
          </h4>
          {stats.topGenres.length > 0 ? (
            <div className="space-y-3">
              {stats.topGenres.map((item, index) => (
                <div key={item.genre} className="flex items-center gap-3">
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{item.genre}</span>
                      <span className="text-gray-400">{item.count} recos</span>
                    </div>
                    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{ width: `${(item.count / stats.totalRecommendations) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              Agregá recomendaciones para ver tus géneros favoritos
            </p>
          )}
        </div>

        {/* Watchlist */}
        <div className="card">
          <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Icons.Bookmark className="w-4 h-4" />
            Mi Watchlist
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{stats.watchlistPending}</div>
              <div className="text-xs text-gray-400 mt-1">Pendientes</div>
            </div>
            <div className="text-center p-3 bg-brand/10 rounded-lg">
              <div className="text-2xl font-bold text-brand">{stats.watchlistWatched}</div>
              <div className="text-xs text-gray-400 mt-1">Vistas</div>
            </div>
          </div>
        </div>

        {/* Metas */}
        <div className="card">
          <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Icons.Target className="w-4 h-4" />
            Metas
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{stats.completedGoals}</div>
              <div className="text-xs text-gray-400 mt-1">Completadas</div>
            </div>
            <div className="text-center p-3 bg-surface-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-400">{stats.totalGoals - stats.completedGoals}</div>
              <div className="text-xs text-gray-400 mt-1">Pendientes</div>
            </div>
          </div>
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
                <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
                  {item.type === 'movie' ? (
                    <Icons.Clapperboard className="w-5 h-5 text-brand" />
                  ) : (
                    <Icons.Tv className="w-5 h-5 text-brand" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icons.StarFilled
                          key={star}
                          className={`w-3 h-3 ${star <= item.rating ? 'text-brand' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span>•</span>
                    <span>{new Date(item.created_at).toLocaleDateString('es-AR')}</span>
                  </div>
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
