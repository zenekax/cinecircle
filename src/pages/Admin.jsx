import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Icons } from '../components/Icons'
import { getAllCafecitoBadges, Badge } from '../components/Badges'

// Solo el fundador puede acceder
const ADMIN_USERNAME = 'nachito'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userBadges, setUserBadges] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const cafecitoBadges = getAllCafecitoBadges()

  useEffect(() => {
    checkAdmin()
  }, [user])

  const checkAdmin = async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profile?.username === ADMIN_USERNAME) {
        setIsAdmin(true)
        loadUsers()
      } else {
        navigate('/feed')
      }
    } catch (error) {
      console.error('Error:', error.message)
      navigate('/feed')
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar, avatar_color, cafecito_badges, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error cargando usuarios:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (selectedUser) => {
    setSelectedUser(selectedUser)
    setUserBadges(selectedUser.cafecito_badges || [])
    setMessage('')
  }

  const toggleBadge = (badgeId) => {
    if (userBadges.includes(badgeId)) {
      setUserBadges(userBadges.filter(id => id !== badgeId))
    } else {
      setUserBadges([...userBadges, badgeId])
    }
  }

  const saveBadges = async () => {
    if (!selectedUser) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ cafecito_badges: userBadges })
        .eq('id', selectedUser.id)

      if (error) throw error

      setMessage('✅ Insignias guardadas correctamente')

      // Actualizar lista local
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, cafecito_badges: userBadges }
          : u
      ))
      setSelectedUser({ ...selectedUser, cafecito_badges: userBadges })
    } catch (error) {
      console.error('Error guardando:', error.message)
      setMessage('❌ Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Loader className="w-8 h-8 text-brand" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Icons.Settings className="w-6 h-6 text-brand" />
          Panel de Administración
        </h1>
        <p className="text-gray-500 mt-1">Gestionar insignias de Cafecito</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lista de usuarios */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Usuarios</h2>

          {/* Buscador */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
              placeholder="Buscar usuario..."
            />
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* Lista */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No hay usuarios</div>
            ) : (
              filteredUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                    selectedUser?.id === u.id
                      ? 'bg-brand/20 border border-brand'
                      : 'bg-surface-200 hover:bg-surface-100 border border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-brand font-bold">
                    {u.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{u.username || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-500">
                      {u.cafecito_badges?.length > 0
                        ? `${u.cafecito_badges.length} insignia(s)`
                        : 'Sin insignias'}
                    </p>
                  </div>
                  {u.cafecito_badges?.length > 0 && (
                    <div className="flex -space-x-1">
                      {u.cafecito_badges.slice(0, 3).map(badgeId => {
                        const badge = cafecitoBadges.find(b => b.id === badgeId)
                        return badge ? (
                          <div key={badgeId} className={`w-6 h-6 rounded-full ${badge.bgColor} border ${badge.borderColor} flex items-center justify-center`}>
                            <span className="text-xs">☕</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Panel de insignias */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Asignar Insignias</h2>

          {!selectedUser ? (
            <div className="text-center py-12 text-gray-400">
              <Icons.User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Seleccioná un usuario para gestionar sus insignias</p>
            </div>
          ) : (
            <>
              {/* Usuario seleccionado */}
              <div className="bg-surface-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400">Usuario seleccionado:</p>
                <p className="text-xl font-bold text-white">{selectedUser.username}</p>
              </div>

              {/* Insignias de Cafecito */}
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-400 font-medium">Insignias de Cafecito:</p>
                {cafecitoBadges.map(badge => (
                  <button
                    key={badge.id}
                    onClick={() => toggleBadge(badge.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      userBadges.includes(badge.id)
                        ? `${badge.bgColor} ${badge.borderColor}`
                        : 'bg-surface-200 border-border hover:border-gray-600'
                    }`}
                  >
                    <Badge badge={badge} size="sm" showTooltip={false} />
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${userBadges.includes(badge.id) ? badge.color : 'text-gray-300'}`}>
                        {badge.name}
                      </p>
                      <p className="text-xs text-gray-500">{badge.description}</p>
                    </div>
                    {userBadges.includes(badge.id) && (
                      <Icons.CheckCircle className="w-5 h-5 text-brand" />
                    )}
                  </button>
                ))}
              </div>

              {/* Mensaje */}
              {message && (
                <div className="mb-4 p-3 bg-surface-200 rounded-lg text-sm">
                  {message}
                </div>
              )}

              {/* Botón guardar */}
              <button
                onClick={saveBadges}
                disabled={saving}
                className="w-full btn btn-primary disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Insignias'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Link a Cafecito */}
      <div className="mt-8 text-center">
        <a
          href="https://cafecito.app/cinecircle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-brand transition-colors"
        >
          Ver pagos en Cafecito →
        </a>
      </div>
    </div>
  )
}
