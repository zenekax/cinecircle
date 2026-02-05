import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import UserAvatar from '../components/UserAvatar'

export default function Feed() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadRecommendations()

    const subscription = supabase
      .channel('recommendations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'recommendations' },
        () => {
          loadRecommendations()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          profiles (username, avatar_url, avatar, avatar_color)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecommendations(data || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icons.StarFilled
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-brand' : 'text-gray-700'}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-36 bg-surface-100 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-surface-100 rounded w-1/3" />
                  <div className="h-4 bg-surface-100 rounded w-1/4" />
                  <div className="h-4 bg-surface-100 rounded w-full" />
                  <div className="h-4 bg-surface-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Feed</h1>
        <p className="text-gray-500 mt-1">Descubrí qué están viendo tus amigos</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="card text-center py-16">
          <Icons.Film className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No hay recomendaciones todavía
          </h3>
          <p className="text-gray-500">
            ¡Sé el primero en compartir una película o serie!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="card card-hover animate-fade-in"
            >
              <div className="flex gap-4">
                {/* Poster */}
                {rec.poster_url ? (
                  <img
                    src={rec.poster_url}
                    alt={rec.title}
                    className="w-24 h-36 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-24 h-36 bg-surface-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {rec.type === 'movie' ? (
                      <Icons.Clapperboard className="w-8 h-8 text-gray-600" />
                    ) : (
                      <Icons.Tv className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white leading-tight">
                        {rec.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        {rec.type === 'movie' ? (
                          <Icons.Clapperboard className="w-3.5 h-3.5 text-gray-500" />
                        ) : (
                          <Icons.Tv className="w-3.5 h-3.5 text-gray-500" />
                        )}
                        <span className="text-sm text-gray-500">
                          {rec.type === 'movie' ? 'Película' : 'Serie'}
                        </span>
                        {rec.genre && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-sm text-gray-500">{rec.genre}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StarRating rating={rec.rating} />
                      <div className="text-xs text-gray-500 mt-1.5">
                        {new Date(rec.created_at).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Overview/Resumen de TMDB */}
                  {rec.overview && (
                    <p className="text-gray-500 text-xs mb-2 line-clamp-2 italic">
                      {rec.overview}
                    </p>
                  )}

                  {/* Comment */}
                  {rec.comment && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      "{rec.comment}"
                    </p>
                  )}

                  {/* User */}
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      avatar={rec.profiles?.avatar}
                      color={rec.profiles?.avatar_color}
                      username={rec.profiles?.username}
                      size="sm"
                    />
                    <span className="text-sm text-gray-500">
                      {rec.profiles?.username || 'Usuario'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
