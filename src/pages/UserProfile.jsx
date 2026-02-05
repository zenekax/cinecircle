import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import UserAvatar from '../components/UserAvatar'

export default function UserProfile() {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [stats, setStats] = useState({ recommendations: 0, friends: 0 })
  const [loading, setLoading] = useState(true)
  const [friendshipStatus, setFriendshipStatus] = useState(null) // null, 'friends', 'pending_sent', 'pending_received'

  const isOwnProfile = user?.id === userId

  useEffect(() => {
    if (userId) {
      loadProfile()
      loadRecommendations()
      loadStats()
      if (user && !isOwnProfile) {
        checkFriendship()
      }
    }
  }, [userId, user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error cargando perfil:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecommendations(data || [])
    } catch (error) {
      console.error('Error cargando recomendaciones:', error.message)
    }
  }

  const loadStats = async () => {
    try {
      const { count: recCount } = await supabase
        .from('recommendations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: friendCount } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted')

      setStats({
        recommendations: recCount || 0,
        friends: friendCount || 0
      })
    } catch (error) {
      console.error('Error cargando stats:', error.message)
    }
  }

  const checkFriendship = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        if (data.status === 'accepted') {
          setFriendshipStatus('friends')
        } else if (data.status === 'pending') {
          if (data.requester_id === user.id) {
            setFriendshipStatus('pending_sent')
          } else {
            setFriendshipStatus('pending_received')
          }
        }
      }
    } catch (error) {
      console.error('Error verificando amistad:', error.message)
    }
  }

  const sendFriendRequest = async () => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert([{
          requester_id: user.id,
          addressee_id: userId
        }])

      if (error) throw error
      setFriendshipStatus('pending_sent')
    } catch (error) {
      console.error('Error enviando solicitud:', error.message)
      alert('Error al enviar solicitud')
    }
  }

  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icons.StarFilled
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'text-brand' : 'text-gray-700'}`}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando perfil...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">Usuario no encontrado</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary mt-4">
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header con botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <Icons.ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      {/* Perfil */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <UserAvatar
            avatar={profile.avatar}
            color={profile.avatar_color}
            username={profile.username}
            size="2xl"
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
            <p className="text-gray-400 mt-1">
              Miembro desde {new Date(profile.created_at).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long'
              })}
            </p>

            {/* Botón de acción */}
            {!isOwnProfile && user && (
              <div className="mt-4">
                {friendshipStatus === 'friends' ? (
                  <button
                    onClick={() => navigate(`/messages/${userId}`)}
                    className="btn btn-primary"
                  >
                    <Icons.MessageCircle className="w-4 h-4 mr-2" />
                    Enviar mensaje
                  </button>
                ) : friendshipStatus === 'pending_sent' ? (
                  <button disabled className="btn btn-secondary opacity-50 cursor-not-allowed">
                    <Icons.Clock className="w-4 h-4 mr-2" />
                    Solicitud enviada
                  </button>
                ) : friendshipStatus === 'pending_received' ? (
                  <button
                    onClick={() => navigate('/friends')}
                    className="btn btn-primary"
                  >
                    Responder solicitud
                  </button>
                ) : (
                  <button onClick={sendFriendRequest} className="btn btn-primary">
                    <Icons.UserPlus className="w-4 h-4 mr-2" />
                    Agregar amigo
                  </button>
                )}
              </div>
            )}

            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile')}
                className="btn btn-secondary mt-4"
              >
                <Icons.Edit className="w-4 h-4 mr-2" />
                Editar perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center py-4">
          <p className="text-3xl font-bold text-brand">{stats.recommendations}</p>
          <p className="text-sm text-gray-400 mt-1">Recomendaciones</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-3xl font-bold text-blue-500">{stats.friends}</p>
          <p className="text-sm text-gray-400 mt-1">Amigos</p>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icons.Film className="w-5 h-5 text-gray-400" />
          Recomendaciones de {profile.username}
        </h3>

        {recommendations.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            {isOwnProfile ? 'No tenés recomendaciones todavía' : 'Este usuario no tiene recomendaciones'}
          </p>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                {rec.poster_url ? (
                  <img
                    src={rec.poster_url}
                    alt={rec.title}
                    className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 bg-surface-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {rec.type === 'movie' ? (
                      <Icons.Clapperboard className="w-6 h-6 text-gray-600" />
                    ) : (
                      <Icons.Tv className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-white">{rec.title}</h4>
                      <p className="text-sm text-gray-500">
                        {rec.type === 'movie' ? 'Película' : 'Serie'}
                        {rec.genre && ` • ${rec.genre}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StarRating rating={rec.rating} />
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(rec.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  </div>
                  {rec.comment && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">"{rec.comment}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
