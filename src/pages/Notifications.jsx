import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import UserAvatar from '../components/UserAvatar'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadNotifications()
    markAllAsRead()

    // Suscripción en tiempo real
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => loadNotifications()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Obtener perfiles de los usuarios que generaron las notificaciones
      const fromUserIds = [...new Set(data?.map(n => n.from_user_id).filter(Boolean))]

      if (fromUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar, avatar_color')
          .in('id', fromUserIds)

        const profilesMap = {}
        profiles?.forEach(p => profilesMap[p.id] = p)

        const notificationsWithProfiles = data.map(n => ({
          ...n,
          from_profile: profilesMap[n.from_user_id] || null
        }))

        setNotifications(notificationsWithProfiles)
      } else {
        setNotifications(data || [])
      }
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
    } catch (error) {
      loadNotifications()
      console.error('Error:', error.message)
    }
  }

  const clearAll = async () => {
    if (!confirm('¿Eliminar todas las notificaciones?')) return

    setNotifications([])

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
    } catch (error) {
      loadNotifications()
      console.error('Error:', error.message)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Icons.HeartFilled className="w-5 h-5 text-red-500" />
      case 'comment':
        return <Icons.MessageSquare className="w-5 h-5 text-blue-500" />
      case 'friend_request':
        return <Icons.UserPlus className="w-5 h-5 text-brand" />
      case 'friend_accepted':
        return <Icons.Users className="w-5 h-5 text-brand" />
      case 'message':
        return <Icons.MessageCircle className="w-5 h-5 text-purple-500" />
      default:
        return <Icons.Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationText = (notification) => {
    const username = notification.from_profile?.username || 'Alguien'

    switch (notification.type) {
      case 'like':
        return <><strong>{username}</strong> le dio like a tu recomendación de <strong>{notification.message}</strong></>
      case 'comment':
        return <><strong>{username}</strong> comentó en tu recomendación de <strong>{notification.message}</strong></>
      case 'friend_request':
        return <><strong>{username}</strong> quiere ser tu amigo</>
      case 'friend_accepted':
        return <><strong>{username}</strong> aceptó tu solicitud de amistad</>
      case 'message':
        return <><strong>{username}</strong> te envió un mensaje</>
      default:
        return notification.message || 'Nueva notificación'
    }
  }

  const handleNotificationClick = (notification) => {
    if (notification.recommendation_id) {
      navigate(`/post/${notification.recommendation_id}`)
    } else if (notification.from_user_id) {
      navigate(`/user/${notification.from_user_id}`)
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return notifDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-surface-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-100 rounded w-3/4" />
                  <div className="h-3 bg-surface-100 rounded w-1/4" />
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Icons.Bell className="w-7 h-7 text-brand" />
            Notificaciones
          </h1>
          <p className="text-gray-500 mt-1">Mantente al día con tu actividad</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Borrar todo
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Icons.Bell className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No tenés notificaciones
          </h3>
          <p className="text-gray-500">
            Cuando alguien interactúe con tus recomendaciones, te avisaremos acá
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card cursor-pointer hover:bg-surface-200 transition-colors ${
                !notification.read ? 'border-l-2 border-l-brand' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar o icono */}
                <div className="relative">
                  {notification.from_profile ? (
                    <UserAvatar
                      avatar={notification.from_profile.avatar}
                      color={notification.from_profile.avatar_color}
                      username={notification.from_profile.username}
                      size="md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                  {/* Badge de tipo */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-dark-400 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatTime(notification.created_at)}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                  className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
