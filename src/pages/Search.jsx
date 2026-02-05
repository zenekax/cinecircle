import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import UserAvatar from '../components/UserAvatar'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'content', 'users'
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({ content: [], users: [] })
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults({ content: [], users: [] })
      return
    }

    setLoading(true)
    try {
      const searchTerm = searchQuery.trim().toLowerCase()

      // Buscar contenido (recomendaciones)
      const { data: contentData } = await supabase
        .from('recommendations')
        .select(`
          id,
          title,
          type,
          poster_url,
          genre,
          rating,
          user_id,
          created_at,
          profiles (username, avatar, avatar_color)
        `)
        .ilike('title', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      // Buscar usuarios
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username, avatar, avatar_color')
        .ilike('username', `%${searchTerm}%`)
        .neq('id', user.id)
        .limit(10)

      setResults({
        content: contentData || [],
        users: usersData || []
      })
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
    }
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query)
      } else {
        setResults({ content: [], users: [] })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const totalResults = results.content.length + results.users.length

  const filteredContent = activeTab === 'users' ? [] : results.content
  const filteredUsers = activeTab === 'content' ? [] : results.users

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Icons.Search className="w-7 h-7 text-brand" />
          Buscar
        </h1>
        <p className="text-gray-500 mt-1">Encontrá películas, series y usuarios</p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Buscar películas, series o usuarios..."
            className="input pl-12 pr-4 py-3 text-lg"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setResults({ content: [], users: [] })
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Tabs */}
      {query.trim().length >= 2 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-brand text-white'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
            }`}
          >
            Todo ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'content'
                ? 'bg-brand text-white'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
            }`}
          >
            Contenido ({results.content.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-brand text-white'
                : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
            }`}
          >
            Usuarios ({results.users.length})
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && query.trim().length >= 2 && (
        <div className="space-y-6">
          {/* Users */}
          {filteredUsers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Icons.Users className="w-4 h-4" />
                Usuarios
              </h3>
              <div className="grid gap-2">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => navigate(`/user/${u.id}`)}
                    className="card flex items-center gap-4 hover:bg-surface-200 transition-colors text-left"
                  >
                    <UserAvatar
                      avatar={u.avatar}
                      color={u.avatar_color}
                      username={u.username}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-white">{u.username}</p>
                      <p className="text-sm text-gray-500">Ver perfil</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {filteredContent.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Icons.Film className="w-4 h-4" />
                Películas y Series
              </h3>
              <div className="space-y-3">
                {filteredContent.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/post/${item.id}`)}
                    className="card w-full flex gap-4 hover:bg-surface-200 transition-colors text-left"
                  >
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
                      <h4 className="font-semibold text-white truncate">{item.title}</h4>
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
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icons.StarFilled
                            key={star}
                            className={`w-3 h-3 ${star <= item.rating ? 'text-brand' : 'text-gray-700'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Recomendado por {item.profiles?.username || 'Usuario'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {totalResults === 0 && (
            <div className="card text-center py-12">
              <Icons.Search className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-500">
                Intentá con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && query.trim().length < 2 && (
        <div className="card text-center py-16">
          <Icons.Search className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Buscá lo que quieras
          </h3>
          <p className="text-gray-500">
            Escribí al menos 2 caracteres para buscar
          </p>
        </div>
      )}
    </div>
  )
}
