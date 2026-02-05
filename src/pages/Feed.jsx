import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import UserAvatar from '../components/UserAvatar'

// Géneros disponibles para filtrar
const GENRES = [
  { id: 'all', label: 'Todos', icon: 'Grid' },
  { id: 'Acción', label: 'Acción', icon: 'Zap' },
  { id: 'Comedia', label: 'Comedia', icon: 'Smile' },
  { id: 'Drama', label: 'Drama', icon: 'Heart' },
  { id: 'Terror', label: 'Terror', icon: 'Ghost' },
  { id: 'Suspenso', label: 'Suspenso', icon: 'Eye' },
  { id: 'Ciencia Ficción', label: 'Sci-Fi', icon: 'Rocket' },
  { id: 'Romance', label: 'Romance', icon: 'HeartFilled' },
  { id: 'Animación', label: 'Animación', icon: 'Sparkles' },
  { id: 'Documental', label: 'Documental', icon: 'FileText' },
]

export default function Feed() {
  const [recommendations, setRecommendations] = useState([])
  const [filteredRecs, setFilteredRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [likesMap, setLikesMap] = useState({}) // { recId: { count, liked } }
  const [commentsMap, setCommentsMap] = useState({}) // { recId: count }
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedType, setSelectedType] = useState('all') // 'all', 'movie', 'tv'
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadRecommendations()

    const subscription = supabase
      .channel('feed-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'recommendations' },
        () => loadRecommendations()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        () => loadLikesAndComments()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => loadLikesAndComments()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Filtrar recomendaciones cuando cambian los filtros
  useEffect(() => {
    let filtered = [...recommendations]

    // Filtrar por género
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(rec =>
        rec.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
      )
    }

    // Filtrar por tipo (película/serie)
    if (selectedType !== 'all') {
      filtered = filtered.filter(rec => rec.type === selectedType)
    }

    setFilteredRecs(filtered)
  }, [recommendations, selectedGenre, selectedType])

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

      // Cargar likes y comentarios después de cargar recomendaciones
      if (data && data.length > 0) {
        await loadLikesAndComments(data.map(r => r.id))
      }
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadLikesAndComments = async (recIds) => {
    const ids = recIds || recommendations.map(r => r.id)
    if (ids.length === 0) return

    try {
      // Cargar likes
      const { data: allLikes } = await supabase
        .from('likes')
        .select('recommendation_id, user_id')
        .in('recommendation_id', ids)

      // Cargar comentarios count
      const { data: allComments } = await supabase
        .from('comments')
        .select('recommendation_id')
        .in('recommendation_id', ids)

      // Procesar likes
      const newLikesMap = {}
      ids.forEach(id => {
        const recLikes = allLikes?.filter(l => l.recommendation_id === id) || []
        newLikesMap[id] = {
          count: recLikes.length,
          liked: recLikes.some(l => l.user_id === user?.id)
        }
      })
      setLikesMap(newLikesMap)

      // Procesar comentarios
      const newCommentsMap = {}
      ids.forEach(id => {
        newCommentsMap[id] = allComments?.filter(c => c.recommendation_id === id).length || 0
      })
      setCommentsMap(newCommentsMap)
    } catch (error) {
      console.error('Error cargando likes/comentarios:', error.message)
    }
  }

  const handleLike = async (recId) => {
    const currentLiked = likesMap[recId]?.liked

    // Optimistic update
    setLikesMap(prev => ({
      ...prev,
      [recId]: {
        count: prev[recId]?.count + (currentLiked ? -1 : 1),
        liked: !currentLiked
      }
    }))

    try {
      if (currentLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('recommendation_id', recId)
      } else {
        await supabase
          .from('likes')
          .insert([{ user_id: user.id, recommendation_id: recId }])
      }
    } catch (error) {
      // Revert on error
      setLikesMap(prev => ({
        ...prev,
        [recId]: {
          count: prev[recId]?.count + (currentLiked ? 1 : -1),
          liked: currentLiked
        }
      }))
      console.error('Error:', error.message)
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Feed</h1>
        <p className="text-gray-500 mt-1">Descubrí qué están viendo tus amigos</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-3">
        {/* Filtro por tipo */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedType === 'all'
                ? 'bg-brand text-white'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setSelectedType('movie')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              selectedType === 'movie'
                ? 'bg-brand text-white'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
            }`}
          >
            <Icons.Clapperboard className="w-4 h-4" />
            Películas
          </button>
          <button
            onClick={() => setSelectedType('tv')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              selectedType === 'tv'
                ? 'bg-brand text-white'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
            }`}
          >
            <Icons.Tv className="w-4 h-4" />
            Series
          </button>
        </div>

        {/* Filtro por género - scroll horizontal */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedGenre === genre.id
                  ? 'bg-brand/20 text-brand border border-brand'
                  : 'bg-surface-100 text-gray-400 hover:bg-surface-200 border border-transparent'
              }`}
            >
              {genre.label}
            </button>
          ))}
        </div>

        {/* Contador de resultados */}
        {(selectedGenre !== 'all' || selectedType !== 'all') && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredRecs.length} {filteredRecs.length === 1 ? 'resultado' : 'resultados'}
              {selectedGenre !== 'all' && ` en ${selectedGenre}`}
              {selectedType !== 'all' && ` (${selectedType === 'movie' ? 'películas' : 'series'})`}
            </p>
            <button
              onClick={() => {
                setSelectedGenre('all')
                setSelectedType('all')
              }}
              className="text-sm text-brand hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {filteredRecs.length === 0 && recommendations.length > 0 ? (
        <div className="card text-center py-12">
          <Icons.Search className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No hay resultados
          </h3>
          <p className="text-gray-500 mb-4">
            No encontramos recomendaciones con estos filtros
          </p>
          <button
            onClick={() => {
              setSelectedGenre('all')
              setSelectedType('all')
            }}
            className="btn btn-secondary"
          >
            Limpiar filtros
          </button>
        </div>
      ) : filteredRecs.length === 0 ? (
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
          {filteredRecs.map((rec) => (
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

                  {/* User and Actions */}
                  <div className="flex items-center justify-between">
                    {/* User - Clickeable */}
                    <button
                      onClick={() => navigate(`/user/${rec.user_id}`)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <UserAvatar
                        avatar={rec.profiles?.avatar}
                        color={rec.profiles?.avatar_color}
                        username={rec.profiles?.username}
                        size="sm"
                      />
                      <span className="text-sm text-gray-500 hover:text-brand transition-colors">
                        {rec.profiles?.username || 'Usuario'}
                      </span>
                    </button>

                    {/* Like and Comment buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(rec.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                          likesMap[rec.id]?.liked
                            ? 'text-red-500 bg-red-500/10'
                            : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
                        }`}
                      >
                        {likesMap[rec.id]?.liked ? (
                          <Icons.HeartFilled className="w-4 h-4" />
                        ) : (
                          <Icons.Heart className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {likesMap[rec.id]?.count || 0}
                        </span>
                      </button>

                      <button
                        onClick={() => navigate(`/post/${rec.id}`)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-500 hover:text-brand hover:bg-brand/10 transition-all"
                      >
                        <Icons.MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {commentsMap[rec.id] || 0}
                        </span>
                      </button>
                    </div>
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
