import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import UserAvatar from '../components/UserAvatar'
import { FeedCardSkeleton, WeeklyPickSkeleton } from '../components/Skeleton'

// Función para obtener la semana del año (usada para seleccionar la reco semanal)
const getWeekNumber = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now - start
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.floor(diff / oneWeek)
}

export default function Feed() {
  const [recommendations, setRecommendations] = useState([])
  const [filteredRecs, setFilteredRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [likesMap, setLikesMap] = useState({}) // { recId: { count, liked } }
  const [commentsMap, setCommentsMap] = useState({}) // { recId: count }
  const [animatingLike, setAnimatingLike] = useState(null) // ID de rec que está animando
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedType, setSelectedType] = useState('all') // 'all', 'movie', 'tv'
  const [selectedPlatform, setSelectedPlatform] = useState('all') // Filtro por plataforma
  const [availableGenres, setAvailableGenres] = useState([]) // Géneros extraídos de las recomendaciones
  const [availablePlatforms, setAvailablePlatforms] = useState([]) // Plataformas extraídas de las recomendaciones
  const [weeklyPick, setWeeklyPick] = useState(null) // Recomendación de la semana
  const [trending, setTrending] = useState([]) // Top 5 más likeadas
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

  // Extraer géneros y plataformas únicos de las recomendaciones
  useEffect(() => {
    const genres = recommendations
      .map(rec => rec.genre)
      .filter(Boolean)
      .filter((genre, index, self) => self.indexOf(genre) === index)
      .sort()

    const platforms = recommendations
      .map(rec => rec.platform)
      .filter(Boolean)
      .filter((platform, index, self) => self.indexOf(platform) === index)
      .sort()

    setAvailableGenres(genres)
    setAvailablePlatforms(platforms)
  }, [recommendations])

  // Seleccionar recomendación de la semana (basada en la semana del año)
  useEffect(() => {
    if (recommendations.length === 0) {
      setWeeklyPick(null)
      return
    }

    // Usar la semana del año como "seed" para seleccionar consistentemente
    const weekNum = getWeekNumber()
    const index = weekNum % recommendations.length
    setWeeklyPick(recommendations[index])
  }, [recommendations])

  // Calcular tendencias (top 5 con más likes)
  useEffect(() => {
    if (recommendations.length === 0 || Object.keys(likesMap).length === 0) {
      setTrending([])
      return
    }

    // Ordenar por cantidad de likes y tomar los top 5
    const sorted = [...recommendations]
      .filter(rec => likesMap[rec.id]?.count > 0) // Solo los que tienen likes
      .sort((a, b) => (likesMap[b.id]?.count || 0) - (likesMap[a.id]?.count || 0))
      .slice(0, 5)

    setTrending(sorted)
  }, [recommendations, likesMap])

  // Filtrar recomendaciones cuando cambian los filtros
  useEffect(() => {
    let filtered = [...recommendations]

    // Filtrar por género
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(rec => rec.genre === selectedGenre)
    }

    // Filtrar por tipo (película/serie)
    if (selectedType !== 'all') {
      filtered = filtered.filter(rec => rec.type === selectedType)
    }

    // Filtrar por plataforma
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(rec => rec.platform === selectedPlatform)
    }

    setFilteredRecs(filtered)
  }, [recommendations, selectedGenre, selectedType, selectedPlatform])

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

    // Activar animación solo si va a dar like (no quitar)
    if (!currentLiked) {
      setAnimatingLike(recId)
      setTimeout(() => setAnimatingLike(null), 400)
    }

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

  const handleShare = (rec) => {
    const type = rec.type === 'movie' ? 'película' : 'serie'
    const platform = rec.platform ? ` en ${rec.platform}` : ''
    const rating = '⭐'.repeat(rec.rating)
    const text = `¡Te recomiendo esta ${type}!\n\n🎬 *${rec.title}*${platform}\n${rating}\n\n${rec.comment ? `"${rec.comment}"\n\n` : ''}Mirá más recomendaciones en CineCircle 👇\n${window.location.origin}/post/${rec.id}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 bg-surface-100 rounded w-20 mb-2 animate-pulse" />
            <div className="h-4 bg-surface-100 rounded w-48 animate-pulse" />
          </div>
          <div className="h-10 bg-surface-100 rounded w-28 animate-pulse" />
        </div>

        {/* Weekly pick skeleton */}
        <WeeklyPickSkeleton />

        {/* Filter skeletons */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-surface-100 rounded-full w-24 animate-pulse" />
            ))}
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-surface-100 rounded-full w-20 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Feed cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <FeedCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Feed</h1>
          <p className="text-gray-500 mt-1">Descubrí qué están viendo tus amigos</p>
        </div>
        <button
          onClick={() => navigate('/rankings')}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-all"
        >
          <Icons.Trophy className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Rankings</span>
        </button>
      </div>

      {/* Recomendación de la Semana */}
      {weeklyPick && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Icons.StarFilled className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-white">Recomendación de la Semana</h2>
          </div>
          <div
            onClick={() => navigate(`/post/${weeklyPick.id}`)}
            className="relative overflow-hidden rounded-xl cursor-pointer group"
          >
            {/* Background con poster blur */}
            <div className="absolute inset-0">
              {weeklyPick.poster_url ? (
                <img
                  src={weeklyPick.poster_url}
                  alt=""
                  className="w-full h-full object-cover blur-sm scale-110 opacity-30"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-brand/20 to-purple-500/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-surface-200/95 via-surface-200/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative p-5 flex gap-5">
              {/* Poster */}
              {weeklyPick.poster_url ? (
                <img
                  src={weeklyPick.poster_url}
                  alt={weeklyPick.title}
                  className="w-28 h-40 object-cover rounded-lg shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-28 h-40 bg-surface-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {weeklyPick.type === 'movie' ? (
                    <Icons.Clapperboard className="w-10 h-10 text-gray-600" />
                  ) : (
                    <Icons.Tv className="w-10 h-10 text-gray-600" />
                  )}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs font-medium rounded-full">
                    ⭐ Destacada
                  </span>
                  <span className="text-xs text-gray-500">
                    {weeklyPick.type === 'movie' ? 'Película' : 'Serie'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 truncate">
                  {weeklyPick.title}
                </h3>

                {weeklyPick.genre && (
                  <span className="text-sm text-brand mb-2">{weeklyPick.genre}</span>
                )}

                {weeklyPick.comment && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    "{weeklyPick.comment}"
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <UserAvatar
                      avatar={weeklyPick.profiles?.avatar}
                      color={weeklyPick.profiles?.avatar_color}
                      username={weeklyPick.profiles?.username}
                      size="sm"
                    />
                    <span className="text-sm text-gray-400">
                      {weeklyPick.profiles?.username || 'Usuario'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    {likesMap[weeklyPick.id]?.liked ? (
                      <Icons.HeartFilled className="w-4 h-4 text-red-500" />
                    ) : (
                      <Icons.Heart className="w-4 h-4" />
                    )}
                    <span className="text-sm">{likesMap[weeklyPick.id]?.count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tendencias - Top 5 más likeadas */}
      {trending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Icons.TrendingUp className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-semibold text-white">Tendencias</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map((rec, index) => (
              <div
                key={rec.id}
                onClick={() => navigate(`/post/${rec.id}`)}
                className="relative flex-shrink-0 w-32 cursor-pointer group"
              >
                {/* Número de ranking */}
                <div className="absolute -top-2 -left-2 w-7 h-7 bg-brand text-dark-500 rounded-full flex items-center justify-center font-bold text-sm z-10 shadow-lg">
                  {index + 1}
                </div>

                {/* Poster */}
                {rec.poster_url ? (
                  <img
                    src={rec.poster_url}
                    alt={rec.title}
                    className="w-32 h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-32 h-48 bg-surface-100 rounded-lg flex items-center justify-center">
                    {rec.type === 'movie' ? (
                      <Icons.Clapperboard className="w-8 h-8 text-gray-600" />
                    ) : (
                      <Icons.Tv className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                )}

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 rounded-b-lg">
                  <p className="text-white text-xs font-medium truncate">{rec.title}</p>
                  <div className="flex items-center gap-1 text-red-400 mt-0.5">
                    <Icons.HeartFilled className="w-3 h-3" />
                    <span className="text-xs">{likesMap[rec.id]?.count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

        {/* Filtro por plataforma - scroll horizontal */}
        {availablePlatforms.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedPlatform === 'all'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                  : 'bg-surface-100 text-gray-400 hover:bg-surface-200 border border-transparent'
              }`}
            >
              <Icons.Monitor className="w-3.5 h-3.5" />
              Todas
            </button>
            {availablePlatforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedPlatform === platform
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                    : 'bg-surface-100 text-gray-400 hover:bg-surface-200 border border-transparent'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        )}

        {/* Filtro por género - scroll horizontal */}
        {availableGenres.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedGenre === 'all'
                  ? 'bg-brand/20 text-brand border border-brand'
                  : 'bg-surface-100 text-gray-400 hover:bg-surface-200 border border-transparent'
              }`}
            >
              Todos los géneros
            </button>
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? 'bg-brand/20 text-brand border border-brand'
                    : 'bg-surface-100 text-gray-400 hover:bg-surface-200 border border-transparent'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}

        {/* Contador de resultados */}
        {(selectedGenre !== 'all' || selectedType !== 'all' || selectedPlatform !== 'all') && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredRecs.length} {filteredRecs.length === 1 ? 'resultado' : 'resultados'}
              {selectedType !== 'all' && ` • ${selectedType === 'movie' ? 'Películas' : 'Series'}`}
              {selectedPlatform !== 'all' && ` • ${selectedPlatform}`}
              {selectedGenre !== 'all' && ` • ${selectedGenre}`}
            </p>
            <button
              onClick={() => {
                setSelectedGenre('all')
                setSelectedType('all')
                setSelectedPlatform('all')
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
              setSelectedPlatform('all')
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
                {/* Poster - Clickeable */}
                {rec.poster_url ? (
                  <img
                    src={rec.poster_url}
                    alt={rec.title}
                    className="w-24 h-36 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/post/${rec.id}`)}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div
                    className="w-24 h-36 bg-surface-100 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-surface-200 transition-colors"
                    onClick={() => navigate(`/post/${rec.id}`)}
                  >
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
                      <h3
                        className="text-lg font-semibold text-white leading-tight cursor-pointer hover:text-brand transition-colors"
                        onClick={() => navigate(`/post/${rec.id}`)}
                      >
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
                        {rec.platform && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-xs px-2 py-0.5 bg-brand/20 text-brand rounded-full">
                              {rec.platform}
                            </span>
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
                          <Icons.HeartFilled className={`w-4 h-4 ${animatingLike === rec.id ? 'animate-like' : ''}`} />
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

                      <button
                        onClick={() => handleShare(rec)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-500 hover:text-green-500 hover:bg-green-500/10 transition-all"
                        title="Compartir en WhatsApp"
                      >
                        <Icons.Share className="w-4 h-4" />
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
