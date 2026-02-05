import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { searchMedia, getMediaDetails, isTMDBConfigured } from '../services/tmdb'
import { sanitizeImageUrl } from '../utils/validation'

export default function Recommendations() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('movie')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [overview, setOverview] = useState('')
  const [genre, setGenre] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [posterError, setPosterError] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Estados para búsqueda TMDB
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const tmdbEnabled = isTMDBConfigured()

  // Debounce para búsqueda
  useEffect(() => {
    if (!tmdbEnabled || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await searchMedia(searchQuery, type)
      setSearchResults(results)
      setSearching(false)
      setShowResults(true)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery, type, tmdbEnabled])

  const handleSelectMedia = async (media) => {
    setSelectedMedia(media)
    setTitle(media.title)
    setPosterUrl(media.posterUrl || '')
    setOverview(media.overview || '')
    setPosterError(false)
    setSearchQuery('')
    setShowResults(false)
    setSearchResults([])

    // Obtener detalles adicionales (géneros)
    const details = await getMediaDetails(media.id, type)
    if (details?.genres?.length > 0) {
      setGenre(details.genres[0]) // Primer género
    }
  }

  const handleClearSelection = () => {
    setSelectedMedia(null)
    setTitle('')
    setPosterUrl('')
    setOverview('')
    setGenre('')
    setSearchQuery('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const safePosterUrl = sanitizeImageUrl(posterUrl)

      const { error } = await supabase
        .from('recommendations')
        .insert([
          {
            user_id: user.id,
            title,
            type,
            rating,
            comment,
            poster_url: safePosterUrl,
            tmdb_id: selectedMedia?.id || null,
            overview: overview || null,
            genre: genre || null,
          }
        ])

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        navigate('/feed')
      }, 1500)

    } catch (error) {
      console.error('Error:', error.message)
      alert('Error al crear la recomendación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Nueva Recomendación</h1>
        <p className="text-gray-500 mt-1">Compartí una película o serie con tus amigos</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tipo</label>
            <div className="flex gap-2 p-1 bg-surface-200 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setType('movie')
                  handleClearSelection()
                }}
                className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  type === 'movie'
                    ? 'bg-brand text-dark-500 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎬 Película
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('series')
                  handleClearSelection()
                }}
                className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  type === 'series'
                    ? 'bg-brand text-dark-500 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📺 Serie
              </button>
            </div>
          </div>

          {/* Buscador TMDB */}
          {tmdbEnabled && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Buscar {type === 'movie' ? 'película' : 'serie'}
              </label>

              {selectedMedia ? (
                <div className="flex items-start gap-4 p-3 bg-surface-200 rounded-lg border border-brand/30">
                  {selectedMedia.posterUrl && (
                    <img
                      src={selectedMedia.posterUrl}
                      alt={selectedMedia.title}
                      className="w-14 h-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{selectedMedia.title}</p>
                    <p className="text-sm text-gray-500">
                      {selectedMedia.year} • {selectedMedia.type === 'movie' ? 'Película' : 'Serie'}
                      {genre && ` • ${genre}`}
                    </p>
                    {overview && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{overview}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="p-2 text-gray-500 hover:text-white hover:bg-surface-100 rounded-md transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowResults(true)}
                      className="input pl-10"
                      placeholder={`Buscar ${type === 'movie' ? 'película' : 'serie'}...`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      🔍
                    </span>
                    {searching && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand text-sm">
                        Buscando...
                      </span>
                    )}
                  </div>

                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-surface-100 border border-border rounded-lg shadow-xl max-h-80 overflow-y-auto">
                      {searchResults.map((media) => (
                        <button
                          key={media.id}
                          type="button"
                          onClick={() => handleSelectMedia(media)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-surface-200 transition-colors text-left border-b border-border last:border-0"
                        >
                          {media.posterUrl ? (
                            <img
                              src={media.posterUrl}
                              alt={media.title}
                              className="w-10 h-14 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-surface-200 rounded flex items-center justify-center">
                              {type === 'movie' ? '🎬' : '📺'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{media.title}</p>
                            <p className="text-sm text-gray-500">
                              {media.year || 'Sin año'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Campo de título manual */}
          {(!tmdbEnabled || !selectedMedia) && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {tmdbEnabled ? 'O escribí el título manualmente' : 'Título'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Ej: Inception"
                required={!selectedMedia}
              />
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tu calificación
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl p-1 transition-all duration-200 hover:scale-110 ${
                    star <= rating ? 'text-brand' : 'text-gray-600'
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 self-center">
                {rating}/5
              </span>
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tu comentario
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input min-h-[120px] resize-y"
              placeholder="¿Por qué la recomendás? ¿Qué te gustó?"
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-600 mt-1 text-right">
              {comment.length}/1000
            </p>
          </div>

          {/* URL del poster */}
          {(!tmdbEnabled || !selectedMedia) && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                URL del poster (opcional)
              </label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => {
                  setPosterUrl(e.target.value)
                  setPosterError(false)
                }}
                className="input"
                placeholder="https://ejemplo.com/poster.jpg"
              />
            </div>
          )}

          {/* Preview del poster */}
          {posterUrl && !posterError && !selectedMedia && (
            <div className="flex justify-center">
              <img
                src={posterUrl}
                alt="Preview"
                className="w-32 h-48 object-cover rounded-lg border border-border"
                onError={() => setPosterError(true)}
              />
            </div>
          )}

          {posterError && (
            <div className="text-center text-yellow-500 text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-md py-2">
              ⚠️ No se pudo cargar la imagen
            </div>
          )}

          {success && (
            <div className="bg-brand/10 border border-brand/30 text-brand px-4 py-3 rounded-md flex items-center gap-2">
              <span>✓</span>
              <span>¡Recomendación creada! Redirigiendo...</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="flex-1 btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title}
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
