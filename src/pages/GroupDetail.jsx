import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { searchMedia, isTMDBConfigured } from '../services/tmdb'
import { Icons } from '../components/Icons'
import UserAvatar from '../components/UserAvatar'

export default function GroupDetail() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('feed') // 'feed', 'chat', 'members'

  // Estados para nuevo contenido
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showAddRec, setShowAddRec] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  // Estados para búsqueda de películas
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [mediaType, setMediaType] = useState('movie')
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [platform, setPlatform] = useState('')
  const [addingRec, setAddingRec] = useState(false)

  // Estados para invitar amigos
  const [friends, setFriends] = useState([])
  const [inviting, setInviting] = useState(null)

  const tmdbEnabled = isTMDBConfigured()

  const PLATFORMS = ['Netflix', 'Prime Video', 'Disney+', 'Max', 'Apple TV+', 'Paramount+', 'Star+', 'Otro']

  useEffect(() => {
    if (groupId) {
      loadGroup()
      loadMembers()
      loadRecommendations()
      loadMessages()
    }
  }, [groupId])

  // Suscripción en tiempo real
  useEffect(() => {
    const subscription = supabase
      .channel(`group-${groupId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        () => loadMessages()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_recommendations', filter: `group_id=eq.${groupId}` },
        () => loadRecommendations()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${groupId}` },
        () => loadMembers()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [groupId])

  // Scroll al final del chat
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab])

  // Búsqueda de películas con debounce
  useEffect(() => {
    if (!tmdbEnabled || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await searchMedia(searchQuery, mediaType)
      setSearchResults(results)
      setSearching(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery, mediaType, tmdbEnabled])

  const loadGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (error) throw error
      setGroup(data)
    } catch (error) {
      console.error('Error:', error.message)
      navigate('/groups')
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const { data: membersData, error } = await supabase
        .from('group_members')
        .select('user_id, role, joined_at')
        .eq('group_id', groupId)

      if (error) throw error

      // Obtener perfiles
      const userIds = membersData.map(m => m.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar, avatar_color')
        .in('id', userIds)

      const membersWithProfiles = membersData.map(m => ({
        ...m,
        profile: profiles?.find(p => p.id === m.user_id)
      }))

      setMembers(membersWithProfiles)
    } catch (error) {
      console.error('Error cargando miembros:', error.message)
    }
  }

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('group_recommendations')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Obtener perfiles de los usuarios
      const userIds = [...new Set(data?.map(r => r.user_id) || [])]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar, avatar_color')
        .in('id', userIds)

      const recsWithProfiles = (data || []).map(rec => ({
        ...rec,
        profile: profiles?.find(p => p.id === rec.user_id)
      }))

      setRecommendations(recsWithProfiles)
    } catch (error) {
      console.error('Error cargando recomendaciones:', error.message)
    }
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error

      // Obtener perfiles
      const userIds = [...new Set(data?.map(m => m.user_id) || [])]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar, avatar_color')
        .in('id', userIds)

      const msgsWithProfiles = (data || []).map(msg => ({
        ...msg,
        profile: profiles?.find(p => p.id === msg.user_id)
      }))

      setMessages(msgsWithProfiles)
    } catch (error) {
      console.error('Error cargando mensajes:', error.message)
    }
  }

  const loadFriends = async () => {
    try {
      // Obtener amigos
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (error) throw error

      const friendIds = friendships?.map(f =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      ) || []

      // Filtrar los que ya son miembros
      const memberIds = members.map(m => m.user_id)
      const nonMemberFriendIds = friendIds.filter(id => !memberIds.includes(id))

      if (nonMemberFriendIds.length === 0) {
        setFriends([])
        return
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar, avatar_color')
        .in('id', nonMemberFriendIds)

      setFriends(profiles || [])
    } catch (error) {
      console.error('Error cargando amigos:', error.message)
    }
  }

  const sendMessage = async (e) => {
    e?.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert([{
          group_id: groupId,
          user_id: user.id,
          content: newMessage.trim()
        }])

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setSending(false)
    }
  }

  const handleSelectMedia = (media) => {
    setSelectedMedia(media)
    setSearchQuery('')
    setSearchResults([])
  }

  const addRecommendation = async () => {
    if (!selectedMedia || addingRec) return

    setAddingRec(true)
    try {
      const { error } = await supabase
        .from('group_recommendations')
        .insert([{
          group_id: groupId,
          user_id: user.id,
          title: selectedMedia.title,
          type: mediaType === 'movie' ? 'movie' : 'tv',
          rating,
          comment: comment.trim() || null,
          poster_url: selectedMedia.posterUrl || null,
          tmdb_id: selectedMedia.id,
          platform: platform || null
        }])

      if (error) throw error

      // Resetear form
      setSelectedMedia(null)
      setRating(5)
      setComment('')
      setPlatform('')
      setShowAddRec(false)
    } catch (error) {
      console.error('Error:', error.message)
      alert('Error al agregar recomendación')
    } finally {
      setAddingRec(false)
    }
  }

  const inviteFriend = async (friendId) => {
    setInviting(friendId)
    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: friendId,
          role: 'member'
        }])

      if (error) throw error

      // Actualizar lista de amigos
      setFriends(friends.filter(f => f.id !== friendId))
    } catch (error) {
      console.error('Error:', error.message)
      alert('Error al invitar')
    } finally {
      setInviting(null)
    }
  }

  const leaveGroup = async () => {
    if (!confirm('¿Seguro que querés salir del grupo?')) return

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id)

      if (error) throw error
      navigate('/groups')
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Loader className="w-8 h-8 text-brand" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-dark-500">
      {/* Header */}
      <div className="bg-dark-400 border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/groups')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/30 to-purple-500/30 border border-brand/30 flex items-center justify-center">
            <Icons.Users className="w-5 h-5 text-brand" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-white truncate">{group?.name}</h1>
            <p className="text-xs text-gray-500">{members.length} miembros</p>
          </div>

          <button
            onClick={() => {
              setShowInvite(true)
              loadFriends()
            }}
            className="p-2 text-gray-400 hover:text-brand hover:bg-surface-100 rounded-lg transition-colors"
            title="Invitar amigos"
          >
            <Icons.UserPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 bg-surface-200 p-1 rounded-lg">
          {[
            { id: 'feed', label: 'Feed', icon: Icons.Film },
            { id: 'chat', label: 'Chat', icon: Icons.MessageCircle },
            { id: 'members', label: 'Miembros', icon: Icons.Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand text-dark-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Feed de recomendaciones */}
        {activeTab === 'feed' && (
          <div className="p-4 pb-24 space-y-4">
            {/* Botón agregar */}
            <button
              onClick={() => setShowAddRec(true)}
              className="w-full card border-dashed border-2 border-brand/30 hover:border-brand hover:bg-brand/5 transition-all py-6"
            >
              <div className="flex items-center justify-center gap-2 text-brand">
                <Icons.Plus className="w-5 h-5" />
                <span className="font-medium">Recomendar película o serie</span>
              </div>
            </button>

            {/* Lista de recomendaciones */}
            {recommendations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Icons.Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay recomendaciones todavía</p>
                <p className="text-sm">¡Sé el primero en compartir algo!</p>
              </div>
            ) : (
              recommendations.map(rec => (
                <div key={rec.id} className="card">
                  <div className="flex gap-4">
                    {rec.poster_url ? (
                      <img
                        src={rec.poster_url}
                        alt={rec.title}
                        className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-28 bg-surface-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Icons.Film className="w-8 h-8 text-gray-600" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{rec.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{rec.type === 'movie' ? 'Película' : 'Serie'}</span>
                        {rec.platform && (
                          <>
                            <span>•</span>
                            <span className="text-brand">{rec.platform}</span>
                          </>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Icons.StarFilled
                            key={star}
                            className={`w-4 h-4 ${star <= rec.rating ? 'text-brand' : 'text-gray-700'}`}
                          />
                        ))}
                      </div>

                      {rec.comment && (
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">"{rec.comment}"</p>
                      )}

                      {/* Usuario */}
                      <div className="flex items-center gap-2 mt-3">
                        <UserAvatar
                          avatar={rec.profile?.avatar}
                          color={rec.profile?.avatar_color}
                          username={rec.profile?.username}
                          size="sm"
                        />
                        <span className="text-xs text-gray-500">
                          {rec.profile?.username} • {new Date(rec.created_at).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Icons.MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay mensajes todavía</p>
                  <p className="text-sm">¡Empezá la conversación!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.user_id === user.id
                  const showAvatar = idx === 0 || messages[idx - 1]?.user_id !== msg.user_id

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && showAvatar && (
                        <UserAvatar
                          avatar={msg.profile?.avatar}
                          color={msg.profile?.avatar_color}
                          username={msg.profile?.username}
                          size="sm"
                        />
                      )}
                      {!isOwn && !showAvatar && <div className="w-8" />}

                      <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                        {!isOwn && showAvatar && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">{msg.profile?.username}</p>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            isOwn
                              ? 'bg-brand text-dark-500'
                              : 'bg-surface-100 text-gray-200'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-gray-600 mt-0.5 ${isOwn ? 'text-right' : 'ml-1'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="p-4 border-t border-border bg-dark-400">
              <form onSubmit={sendMessage} className="flex gap-2">
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
                  className="btn btn-primary disabled:opacity-50 px-4"
                >
                  <Icons.Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Miembros */}
        {activeTab === 'members' && (
          <div className="p-4 pb-24 space-y-3">
            {members.map(member => (
              <div key={member.user_id} className="card flex items-center gap-3">
                <UserAvatar
                  avatar={member.profile?.avatar}
                  color={member.profile?.avatar_color}
                  username={member.profile?.username}
                  size="md"
                />
                <div className="flex-1">
                  <p className="font-medium text-white">{member.profile?.username || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">
                    {member.role === 'admin' ? '👑 Admin' : 'Miembro'} • Se unió {new Date(member.joined_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                {member.user_id !== user.id && (
                  <button
                    onClick={() => navigate(`/user/${member.user_id}`)}
                    className="text-sm text-brand hover:underline"
                  >
                    Ver perfil
                  </button>
                )}
              </div>
            ))}

            {/* Botón salir */}
            <button
              onClick={leaveGroup}
              className="w-full mt-6 btn btn-danger flex items-center justify-center gap-2"
            >
              <Icons.LogOut className="w-4 h-4" />
              Salir del grupo
            </button>
          </div>
        )}
      </div>

      {/* Modal agregar recomendación */}
      {showAddRec && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
          <div className="bg-surface-200 w-full sm:max-w-lg sm:rounded-xl border-t sm:border border-border max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface-200 flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-white">Recomendar al grupo</h2>
              <button
                onClick={() => {
                  setShowAddRec(false)
                  setSelectedMedia(null)
                  setSearchQuery('')
                }}
                className="p-2 text-gray-400 hover:text-white rounded-lg"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Tipo */}
              <div className="flex gap-2 p-1 bg-surface-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMediaType('movie')
                    setSelectedMedia(null)
                  }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    mediaType === 'movie' ? 'bg-brand text-dark-500' : 'text-gray-400'
                  }`}
                >
                  🎬 Película
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaType('tv')
                    setSelectedMedia(null)
                  }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    mediaType === 'tv' ? 'bg-brand text-dark-500' : 'text-gray-400'
                  }`}
                >
                  📺 Serie
                </button>
              </div>

              {/* Búsqueda */}
              {!selectedMedia ? (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                    placeholder={`Buscar ${mediaType === 'movie' ? 'película' : 'serie'}...`}
                    autoFocus
                  />
                  <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                  {/* Resultados */}
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-surface-100 border border-border rounded-lg max-h-60 overflow-y-auto">
                      {searchResults.map(media => (
                        <button
                          key={media.id}
                          onClick={() => handleSelectMedia(media)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-surface-200 transition-colors text-left"
                        >
                          {media.posterUrl ? (
                            <img src={media.posterUrl} alt="" className="w-10 h-14 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-14 bg-surface-200 rounded flex items-center justify-center">
                              <Icons.Film className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{media.title}</p>
                            <p className="text-sm text-gray-500">{media.year}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searching && (
                    <p className="text-center text-gray-500 py-4">Buscando...</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Película seleccionada */}
                  <div className="flex gap-3 p-3 bg-surface-100 rounded-lg border border-brand/30">
                    {selectedMedia.posterUrl && (
                      <img src={selectedMedia.posterUrl} alt="" className="w-16 h-24 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white">{selectedMedia.title}</p>
                      <p className="text-sm text-gray-500">{selectedMedia.year}</p>
                      <button
                        onClick={() => setSelectedMedia(null)}
                        className="text-xs text-brand hover:underline mt-2"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>

                  {/* Plataforma */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">¿Dónde la viste?</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatform(platform === p ? '' : p)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            platform === p
                              ? 'bg-brand text-dark-500'
                              : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tu calificación</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl p-1 transition-all hover:scale-110 ${
                            star <= rating ? 'text-brand' : 'text-gray-600'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comentario */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Comentario (opcional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="input min-h-[80px] resize-none"
                      placeholder="¿Por qué la recomendás?"
                      maxLength={500}
                    />
                  </div>

                  {/* Botón agregar */}
                  <button
                    onClick={addRecommendation}
                    disabled={addingRec}
                    className="w-full btn btn-primary disabled:opacity-50"
                  >
                    {addingRec ? 'Agregando...' : 'Agregar recomendación'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal invitar amigos */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-200 w-full max-w-md rounded-xl border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-white">Invitar amigos</h2>
              <button
                onClick={() => setShowInvite(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              {friends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icons.Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tenés amigos para invitar</p>
                  <p className="text-xs mt-1">Todos tus amigos ya están en el grupo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map(friend => (
                    <div key={friend.id} className="flex items-center gap-3 p-3 bg-surface-100 rounded-lg">
                      <UserAvatar
                        avatar={friend.avatar}
                        color={friend.avatar_color}
                        username={friend.username}
                        size="md"
                      />
                      <span className="flex-1 font-medium text-white">{friend.username}</span>
                      <button
                        onClick={() => inviteFriend(friend.id)}
                        disabled={inviting === friend.id}
                        className="btn btn-primary text-sm py-1.5 disabled:opacity-50"
                      >
                        {inviting === friend.id ? '...' : 'Invitar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
