import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import UserAvatar from '../components/UserAvatar'

export default function Groups() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [user])

  const loadGroups = async () => {
    try {
      // Obtener grupos donde soy miembro
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      if (memberError) throw memberError

      if (!memberships || memberships.length === 0) {
        setGroups([])
        setLoading(false)
        return
      }

      const groupIds = memberships.map(m => m.group_id)

      // Obtener detalles de los grupos
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false })

      if (groupsError) throw groupsError

      // Obtener conteo de miembros y última actividad para cada grupo
      const groupsWithStats = await Promise.all(
        (groupsData || []).map(async (group) => {
          // Contar miembros
          const { count: memberCount } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)

          // Última recomendación
          const { data: lastRec } = await supabase
            .from('group_recommendations')
            .select('created_at, title')
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Último mensaje
          const { data: lastMsg } = await supabase
            .from('group_messages')
            .select('created_at')
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          const lastActivity = [lastRec?.created_at, lastMsg?.created_at]
            .filter(Boolean)
            .sort((a, b) => new Date(b) - new Date(a))[0]

          return {
            ...group,
            memberCount: memberCount || 0,
            lastActivity,
            lastRecTitle: lastRec?.title
          }
        })
      )

      setGroups(groupsWithStats)
    } catch (error) {
      console.error('Error cargando grupos:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async (e) => {
    e.preventDefault()
    if (!newGroupName.trim()) return

    setCreating(true)
    try {
      // Crear el grupo
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert([{
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          created_by: user.id
        }])
        .select()
        .single()

      if (groupError) throw groupError

      // Agregar al creador como admin
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: newGroup.id,
          user_id: user.id,
          role: 'admin'
        }])

      if (memberError) throw memberError

      // Navegar al grupo
      navigate(`/groups/${newGroup.id}`)
    } catch (error) {
      console.error('Error creando grupo:', error.message)
      alert('Error al crear el grupo')
    } finally {
      setCreating(false)
    }
  }

  const formatLastActivity = (date) => {
    if (!date) return 'Sin actividad'
    const now = new Date()
    const then = new Date(date)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Hace un momento'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return then.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Grupos</h1>
          <p className="text-gray-500 mt-1">Compartí recomendaciones con tus círculos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Icons.Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Crear grupo</span>
        </button>
      </div>

      {/* Lista de grupos */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-surface-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-surface-100 rounded w-32 mb-2" />
                  <div className="h-4 bg-surface-100 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card text-center py-16">
          <Icons.Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No tenés grupos todavía
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Creá un grupo para compartir películas y series con tus amigos de forma privada
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Crear mi primer grupo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              className="card w-full text-left hover:bg-surface-100 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Avatar del grupo */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand/30 to-purple-500/30 border border-brand/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Icons.Users className="w-7 h-7 text-brand" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-brand transition-colors">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Icons.User className="w-3.5 h-3.5" />
                      {group.memberCount} {group.memberCount === 1 ? 'miembro' : 'miembros'}
                    </span>
                    {group.lastRecTitle && (
                      <>
                        <span>•</span>
                        <span className="truncate">🎬 {group.lastRecTitle}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Última actividad */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">
                    {formatLastActivity(group.lastActivity)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal crear grupo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-200 rounded-xl w-full max-w-md border border-border">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-white">Crear nuevo grupo</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-surface-100 rounded-lg transition-colors"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={createGroup} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nombre del grupo *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="input"
                  placeholder="Ej: Cinéfilos del Barrio"
                  maxLength={50}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Descripción <span className="text-gray-600">(opcional)</span>
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="input min-h-[80px] resize-none"
                  placeholder="¿De qué trata este grupo?"
                  maxLength={200}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newGroupName.trim()}
                  className="flex-1 btn btn-primary disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
