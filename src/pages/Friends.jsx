import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Friends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState('friends')

  useEffect(() => {
    if (user) {
      loadFriends()
      loadRequests()
    }
  }, [user])

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    const subscription = supabase
      .channel('friendships')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'friendships' },
        () => {
          loadFriends()
          loadRequests()
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  const loadFriends = async () => {
    try {
      const { data, error } = await supabase.rpc('get_friends', {
        user_uuid: user.id
      })

      if (error) throw error
      setFriends(data || [])
    } catch (error) {
      console.error('Error cargando amigos:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadRequests = async () => {
    try {
      // Solicitudes recibidas pendientes
      const { data: pending } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:profiles!friendships_requester_id_fkey(username, avatar_url)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending')

      setPendingRequests(pending || [])

      // Solicitudes enviadas pendientes
      const { data: sent } = await supabase
        .from('friendships')
        .select(`
          *,
          addressee:profiles!friendships_addressee_id_fkey(username, avatar_url)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending')

      setSentRequests(sent || [])
    } catch (error) {
      console.error('Error cargando solicitudes:', error.message)
    }
  }

  const searchUsers = async () => {
    if (searchQuery.length < 2) return

    setSearching(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user.id)
        .limit(10)

      if (error) throw error

      // Filtrar usuarios que ya son amigos o tienen solicitud pendiente
      const friendIds = friends.map(f => f.friend_id)
      const pendingIds = [...pendingRequests.map(r => r.requester_id), ...sentRequests.map(r => r.addressee_id)]

      const filtered = data.filter(u =>
        !friendIds.includes(u.id) && !pendingIds.includes(u.id)
      )

      setSearchResults(filtered)
    } catch (error) {
      console.error('Error buscando usuarios:', error.message)
    } finally {
      setSearching(false)
    }
  }

  const sendFriendRequest = async (addresseeId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert([{
          requester_id: user.id,
          addressee_id: addresseeId
        }])

      if (error) throw error

      setSearchResults(prev => prev.filter(u => u.id !== addresseeId))
      loadRequests()
    } catch (error) {
      console.error('Error enviando solicitud:', error.message)
      alert('Error al enviar solicitud')
    }
  }

  const respondToRequest = async (friendshipId, accept) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({
          status: accept ? 'accepted' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', friendshipId)

      if (error) throw error

      loadFriends()
      loadRequests()
    } catch (error) {
      console.error('Error respondiendo solicitud:', error.message)
    }
  }

  const removeFriend = async (friendshipId) => {
    if (!confirm('¿Eliminar a este amigo?')) return

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error
      loadFriends()
    } catch (error) {
      console.error('Error eliminando amigo:', error.message)
    }
  }

  const cancelRequest = async (friendshipId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error
      loadRequests()
    } catch (error) {
      console.error('Error cancelando solicitud:', error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <h2 className="text-3xl font-bold mb-8">👥 Amigos</h2>

      {/* Buscador de usuarios */}
      <div className="card mb-8">
        <h3 className="text-xl font-bold mb-4">Buscar Usuarios</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            className="input flex-1"
            placeholder="Buscar por nombre de usuario..."
          />
          <button
            onClick={searchUsers}
            disabled={searching || searchQuery.length < 2}
            className="btn btn-primary"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <span className="font-medium">{result.username}</span>
                </div>
                <button
                  onClick={() => sendFriendRequest(result.id)}
                  className="btn btn-primary text-sm"
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'friends'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          Amigos ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          Solicitudes
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Lista de amigos */}
      {activeTab === 'friends' && (
        <div>
          {friends.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-lg">No tenés amigos todavía</p>
              <p className="text-gray-500 mt-2">¡Buscá usuarios para agregar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.friendship_id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-xl">
                        👤
                      </div>
                      <div>
                        <p className="font-bold text-white">{friend.username}</p>
                        <p className="text-sm text-gray-400">
                          Amigos desde {new Date(friend.since).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/messages/${friend.friend_id}`}
                        className="btn btn-primary text-sm"
                      >
                        💬 Mensaje
                      </a>
                      <button
                        onClick={() => removeFriend(friend.friendship_id)}
                        className="btn btn-secondary text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Solicitudes pendientes */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {/* Recibidas */}
          <div>
            <h3 className="text-xl font-bold mb-4">Solicitudes Recibidas</h3>
            {pendingRequests.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">
                No tenés solicitudes pendientes
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl">
                          👤
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {request.requester?.username || 'Usuario'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Quiere ser tu amigo
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToRequest(request.id, true)}
                          className="btn btn-primary text-sm"
                        >
                          ✓ Aceptar
                        </button>
                        <button
                          onClick={() => respondToRequest(request.id, false)}
                          className="btn btn-secondary text-sm"
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enviadas */}
          <div>
            <h3 className="text-xl font-bold mb-4">Solicitudes Enviadas</h3>
            {sentRequests.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">
                No tenés solicitudes enviadas
              </div>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((request) => (
                  <div key={request.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xl">
                          👤
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {request.addressee?.username || 'Usuario'}
                          </p>
                          <p className="text-sm text-yellow-400">
                            ⏳ Pendiente
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => cancelRequest(request.id)}
                        className="btn btn-secondary text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
