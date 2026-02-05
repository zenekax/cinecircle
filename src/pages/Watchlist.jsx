import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'

export default function Watchlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'pending', 'watched'
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadWatchlist()
  }, [])

  const loadWatchlist = async () => {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleWatched = async (item) => {
    const newWatched = !item.watched

    // Optimistic update
    setItems(prev => prev.map(i =>
      i.id === item.id
        ? { ...i, watched: newWatched, watched_at: newWatched ? new Date().toISOString() : null }
        : i
    ))

    try {
      const { error } = await supabase
        .from('watchlist')
        .update({
          watched: newWatched,
          watched_at: newWatched ? new Date().toISOString() : null
        })
        .eq('id', item.id)

      if (error) throw error
    } catch (error) {
      // Revert
      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, watched: !newWatched } : i
      ))
      console.error('Error:', error.message)
    }
  }

  const removeFromWatchlist = async (itemId) => {
    if (!confirm('¿Eliminar de tu lista?')) return

    // Optimistic update
    setItems(prev => prev.filter(i => i.id !== itemId))

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    } catch (error) {
      loadWatchlist() // Reload on error
      console.error('Error:', error.message)
    }
  }

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.watched
    if (filter === 'watched') return item.watched
    return true
  })

  const stats = {
    total: items.length,
    pending: items.filter(i => !i.watched).length,
    watched: items.filter(i => i.watched).length
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-28 bg-surface-100 rounded-lg" />
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
          <Icons.Bookmark className="w-7 h-7 text-brand" />
          Mi Watchlist
        </h1>
        <p className="text-gray-500 mt-1">Películas y series que querés ver</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          <p className="text-xs text-gray-500">Pendientes</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-brand">{stats.watched}</p>
          <p className="text-xs text-gray-500">Vistas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-brand text-white'
              : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
          }`}
        >
          Todas ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === 'pending'
              ? 'bg-yellow-500 text-black'
              : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
          }`}
        >
          Pendientes ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('watched')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === 'watched'
              ? 'bg-brand text-white'
              : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
          }`}
        >
          Vistas ({stats.watched})
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="card text-center py-16">
          <Icons.Bookmark className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Tu watchlist está vacía
          </h3>
          <p className="text-gray-500 mb-4">
            Agregá películas o series desde el feed para verlas después
          </p>
          <button
            onClick={() => navigate('/feed')}
            className="btn btn-primary"
          >
            Explorar Feed
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            No hay {filter === 'pending' ? 'pendientes' : 'vistas'} en tu lista
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`card transition-all ${item.watched ? 'opacity-60' : ''}`}
            >
              <div className="flex gap-4">
                {/* Poster */}
                {item.poster_url ? (
                  <img
                    src={item.poster_url}
                    alt={item.title}
                    className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-28 bg-surface-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {item.type === 'movie' ? (
                      <Icons.Clapperboard className="w-8 h-8 text-gray-600" />
                    ) : (
                      <Icons.Tv className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-semibold leading-tight ${item.watched ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.type === 'movie' ? 'Película' : 'Serie'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleWatched(item)}
                        className={`p-2 rounded-lg transition-all ${
                          item.watched
                            ? 'text-brand bg-brand/10'
                            : 'text-gray-500 hover:text-brand hover:bg-brand/10'
                        }`}
                        title={item.watched ? 'Marcar como pendiente' : 'Marcar como vista'}
                      >
                        {item.watched ? (
                          <Icons.CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icons.Circle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Eliminar de la lista"
                      >
                        <Icons.Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Date info */}
                  <div className="mt-3 text-xs text-gray-600">
                    {item.watched ? (
                      <span className="text-brand">
                        ✓ Vista el {new Date(item.watched_at).toLocaleDateString('es-AR')}
                      </span>
                    ) : (
                      <span>
                        Agregada el {new Date(item.added_at).toLocaleDateString('es-AR')}
                      </span>
                    )}
                  </div>

                  {/* Link to post if exists */}
                  {item.recommendation_id && (
                    <button
                      onClick={() => navigate(`/post/${item.recommendation_id}`)}
                      className="mt-2 text-sm text-brand hover:underline"
                    >
                      Ver recomendación →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
