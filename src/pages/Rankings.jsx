import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Icons } from '../components/Icons'

export default function Rankings() {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month') // 'week', 'month', 'all'
  const [type, setType] = useState('all') // 'all', 'movie', 'series'
  const navigate = useNavigate()

  useEffect(() => {
    loadRankings()
  }, [period, type])

  const loadRankings = async () => {
    setLoading(true)
    try {
      // Calcular fecha de inicio según el período
      const now = new Date()
      let startDate = null

      if (period === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      // Query base
      let query = supabase
        .from('recommendations')
        .select(`
          id,
          title,
          type,
          poster_url,
          genre,
          user_id,
          created_at,
          profiles (username)
        `)

      // Filtrar por fecha si hay período
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }

      // Filtrar por tipo
      if (type !== 'all') {
        query = query.eq('type', type)
      }

      const { data: recs, error } = await query

      if (error) throw error

      // Obtener likes para cada recomendación
      const recIds = recs?.map(r => r.id) || []

      if (recIds.length === 0) {
        setRankings([])
        setLoading(false)
        return
      }

      const { data: likes } = await supabase
        .from('likes')
        .select('recommendation_id')
        .in('recommendation_id', recIds)

      const { data: comments } = await supabase
        .from('comments')
        .select('recommendation_id')
        .in('recommendation_id', recIds)

      // Contar likes y comentarios por recomendación
      const likesCount = {}
      const commentsCount = {}

      likes?.forEach(l => {
        likesCount[l.recommendation_id] = (likesCount[l.recommendation_id] || 0) + 1
      })

      comments?.forEach(c => {
        commentsCount[c.recommendation_id] = (commentsCount[c.recommendation_id] || 0) + 1
      })

      // Calcular score y ordenar
      const rankedRecs = recs.map(rec => ({
        ...rec,
        likes: likesCount[rec.id] || 0,
        comments: commentsCount[rec.id] || 0,
        score: (likesCount[rec.id] || 0) * 2 + (commentsCount[rec.id] || 0) // Likes valen doble
      }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Top 10

      setRankings(rankedRecs)
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getMedalEmoji = (position) => {
    switch (position) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `#${position + 1}`
    }
  }

  const getMedalClass = (position) => {
    switch (position) {
      case 0: return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 1: return 'bg-gray-400/20 border-gray-400/50 text-gray-300'
      case 2: return 'bg-orange-600/20 border-orange-600/50 text-orange-400'
      default: return 'bg-surface-100 border-surface-200 text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-surface-100 rounded-lg" />
                <div className="w-16 h-24 bg-surface-100 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-surface-100 rounded w-1/3" />
                  <div className="h-4 bg-surface-100 rounded w-1/4" />
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
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Icons.Trophy className="w-7 h-7 text-yellow-500" />
          Rankings
        </h1>
        <p className="text-gray-500 mt-1">Las películas y series más populares</p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* Period filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              period === 'week'
                ? 'bg-brand text-white'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
            }`}
          >
            Esta semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              period === 'month'
                ? 'bg-brand text-white'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
            }`}
          >
            Este mes
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              period === 'all'
                ? 'bg-brand text-white'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
            }`}
          >
            Todos los tiempos
          </button>
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setType('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              type === 'all'
                ? 'bg-brand/20 text-brand border border-brand'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200 border border-transparent'
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setType('movie')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              type === 'movie'
                ? 'bg-brand/20 text-brand border border-brand'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200 border border-transparent'
            }`}
          >
            <Icons.Clapperboard className="w-3.5 h-3.5" />
            Películas
          </button>
          <button
            onClick={() => setType('series')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              type === 'series'
                ? 'bg-brand/20 text-brand border border-brand'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200 border border-transparent'
            }`}
          >
            <Icons.Tv className="w-3.5 h-3.5" />
            Series
          </button>
        </div>
      </div>

      {/* Rankings List */}
      {rankings.length === 0 ? (
        <div className="card text-center py-16">
          <Icons.Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No hay rankings todavía
          </h3>
          <p className="text-gray-500">
            {period === 'week'
              ? 'No hay recomendaciones esta semana'
              : period === 'month'
              ? 'No hay recomendaciones este mes'
              : 'No hay recomendaciones todavía'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((item, index) => (
            <div
              key={item.id}
              onClick={() => navigate(`/post/${item.id}`)}
              className={`card cursor-pointer transition-all hover:scale-[1.01] ${
                index < 3 ? 'border-2 ' + getMedalClass(index).split(' ').filter(c => c.includes('border')).join(' ') : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Position */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border ${getMedalClass(index)}`}>
                  {getMedalEmoji(index)}
                </div>

                {/* Poster */}
                {item.poster_url ? (
                  <img
                    src={item.poster_url}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 bg-surface-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {item.type === 'movie' ? (
                      <Icons.Clapperboard className="w-6 h-6 text-gray-600" />
                    ) : (
                      <Icons.Tv className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {item.type === 'movie' ? 'Película' : 'Serie'}
                    </span>
                    {item.genre && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{item.genre}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    por {item.profiles?.username || 'Usuario'}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-red-400">
                    <Icons.HeartFilled className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Icons.MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{item.comments}</span>
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
