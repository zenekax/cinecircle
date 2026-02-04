import { useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useParams, useNavigate } from 'react-router-dom'
import { searchMedia, isTMDBConfigured } from '../services/tmdb'

export default function Messages() {
  const { friendId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [friend, setFriend] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Estados para compartir película
  const [showMediaSearch, setShowMediaSearch] = useState(false)
  const [mediaSearchQuery, setMediaSearchQuery] = useState('')
  const [mediaSearchResults, setMediaSearchResults] = useState([])
  const [searchingMedia, setSearchingMedia] = useState(false)
  const [mediaType, setMediaType] = useState('movie')

  const tmdbEnabled = isTMDBConfigured()

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    if (friendId && user) {
      loadFriend()
      loadMessages()
      markAsRead()
    }
  }, [friendId, user])

  // Suscripción a mensajes en tiempo real
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.sender_id === friendId || payload.new.receiver_id === friendId) {
            loadMessages()
            markAsRead()
          }
          loadConversations()
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [friendId, user])

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Búsqueda de películas con debounce
  useEffect(() => {
    if (!tmdbEnabled || mediaSearchQuery.length < 2) {
      setMediaSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearchingMedia(true)
      const results = await searchMedia(mediaSearchQuery, mediaType)
      setMediaSearchResults(results)
      setSearchingMedia(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [mediaSearchQuery, mediaType, tmdbEnabled])

  const loadConversations = async () => {
    try {
      // Obtener todos los mensajes y agrupar por conversación
      const { data: msgs, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(username, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Agrupar por amigo
      const convMap = new Map()
      msgs?.forEach(msg => {
        const friendIdKey = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        const friendData = msg.sender_id === user.id ? msg.receiver : msg.sender

        if (!convMap.has(friendIdKey)) {
          convMap.set(friendIdKey, {
            friendId: friendIdKey,
            username: friendData?.username || 'Usuario',
            lastMessage: msg,
            unread: msg.receiver_id === user.id && !msg.read_at ? 1 : 0
          })
        } else if (msg.receiver_id === user.id && !msg.read_at) {
          convMap.get(friendIdKey).unread++
        }
      })

      setConversations(Array.from(convMap.values()))
    } catch (error) {
      console.error('Error cargando conversaciones:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFriend = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', friendId)
        .single()

      if (error) throw error
      setFriend(data)
    } catch (error) {
      console.error('Error cargando amigo:', error.message)
    }
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          recommendation:recommendations(title, type, poster_url, rating)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error cargando mensajes:', error.message)
    }
  }

  const markAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', friendId)
        .eq('receiver_id', user.id)
        .is('read_at', null)
    } catch (error) {
      console.error('Error marcando como leído:', error.message)
    }
  }

  const sendMessage = async (e) => {
    e?.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: friendId,
          content: newMessage.trim()
        }])

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error enviando mensaje:', error.message)
      alert('Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }

  const sendMediaRecommendation = async (media) => {
    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: friendId,
          tmdb_id: media.id,
          tmdb_type: media.type,
          tmdb_title: media.title,
          tmdb_poster_url: media.posterUrl,
          content: `Te recomiendo: ${media.title}`
        }])

      if (error) throw error

      setShowMediaSearch(false)
      setMediaSearchQuery('')
      setMediaSearchResults([])
    } catch (error) {
      console.error('Error enviando recomendación:', error.message)
      alert('Error al enviar recomendación')
    } finally {
      setSending(false)
    }
  }

  // Vista de lista de conversaciones
  if (!friendId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <h2 className="text-3xl font-bold mb-8">💬 Mensajes</h2>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Cargando...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg">No tenés conversaciones</p>
            <p className="text-gray-500 mt-2">
              ¡Agregá amigos para empezar a chatear!
            </p>
            <button
              onClick={() => navigate('/friends')}
              className="btn btn-primary mt-4"
            >
              Buscar amigos
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <button
                key={conv.friendId}
                onClick={() => navigate(`/messages/${conv.friendId}`)}
                className="card w-full text-left hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    {conv.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{conv.username}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {conv.lastMessage.tmdb_title
                        ? `🎬 ${conv.lastMessage.tmdb_title}`
                        : conv.lastMessage.content
                      }
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(conv.lastMessage.created_at).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Vista de conversación individual
  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate('/messages')}
          className="text-gray-400 hover:text-white"
        >
          ← Volver
        </button>
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          👤
        </div>
        <div>
          <p className="font-bold text-white">{friend?.username || 'Cargando...'}</p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender_id === user.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {/* Si es una película compartida */}
              {msg.tmdb_title && (
                <div className="flex gap-3 mb-2">
                  {msg.tmdb_poster_url && (
                    <img
                      src={msg.tmdb_poster_url}
                      alt={msg.tmdb_title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-bold">{msg.tmdb_title}</p>
                    <p className="text-sm opacity-80">
                      {msg.tmdb_type === 'movie' ? '🎬 Película' : '📺 Serie'}
                    </p>
                  </div>
                </div>
              )}

              {/* Si es una recomendación existente */}
              {msg.recommendation && (
                <div className="flex gap-3 mb-2">
                  {msg.recommendation.poster_url && (
                    <img
                      src={msg.recommendation.poster_url}
                      alt={msg.recommendation.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-bold">{msg.recommendation.title}</p>
                    <p className="text-sm opacity-80">
                      {'⭐'.repeat(msg.recommendation.rating || 0)}
                    </p>
                  </div>
                </div>
              )}

              {/* Contenido del mensaje */}
              {msg.content && !msg.tmdb_title && (
                <p>{msg.content}</p>
              )}

              <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-primary-200' : 'text-gray-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Modal de búsqueda de películas */}
      {showMediaSearch && (
        <div className="absolute inset-0 bg-black/80 flex items-end z-50">
          <div className="bg-gray-800 w-full rounded-t-xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Compartir película/serie</h3>
              <button
                onClick={() => setShowMediaSearch(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMediaType('movie')}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  mediaType === 'movie' ? 'bg-primary-600' : 'bg-gray-700'
                }`}
              >
                🎬 Películas
              </button>
              <button
                onClick={() => setMediaType('series')}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  mediaType === 'series' ? 'bg-primary-600' : 'bg-gray-700'
                }`}
              >
                📺 Series
              </button>
            </div>

            <input
              type="text"
              value={mediaSearchQuery}
              onChange={(e) => setMediaSearchQuery(e.target.value)}
              className="input mb-4"
              placeholder="Buscar..."
              autoFocus
            />

            {searchingMedia && (
              <div className="text-center text-gray-400 py-4">Buscando...</div>
            )}

            <div className="space-y-2">
              {mediaSearchResults.map((media) => (
                <button
                  key={media.id}
                  onClick={() => sendMediaRecommendation(media)}
                  disabled={sending}
                  className="w-full flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left"
                >
                  {media.posterUrl ? (
                    <img
                      src={media.posterUrl}
                      alt={media.title}
                      className="w-12 h-18 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-18 bg-gray-600 rounded flex items-center justify-center">
                      {mediaType === 'movie' ? '🎬' : '📺'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{media.title}</p>
                    <p className="text-sm text-gray-400">{media.year}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input de mensaje */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          {tmdbEnabled && (
            <button
              type="button"
              onClick={() => setShowMediaSearch(true)}
              className="btn btn-secondary"
              title="Compartir película"
            >
              🎬
            </button>
          )}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input flex-1"
            placeholder="Escribí un mensaje..."
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="btn btn-primary disabled:opacity-50"
          >
            {sending ? '...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  )
}
