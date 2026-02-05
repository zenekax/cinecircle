import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Icons } from './Icons'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingFriends, setPendingFriends] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()

      const subscription = supabase
        .channel('navbar-notifications')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          () => loadNotifications()
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'friendships' },
          () => loadNotifications()
        )
        .subscribe()

      return () => subscription.unsubscribe()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .is('read_at', null)

      setUnreadCount(msgCount || 0)

      const { count: friendCount } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('addressee_id', user.id)
        .eq('status', 'pending')

      setPendingFriends(friendCount || 0)
    } catch (error) {
      console.error('Error cargando notificaciones:', error.message)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navItems = [
    { path: '/feed', label: 'Feed', icon: Icons.Home, shortLabel: 'Feed' },
    { path: '/recommendations', label: 'Nuevo', icon: Icons.PlusCircle, shortLabel: 'Nuevo' },
    { path: '/friends', label: 'Amigos', icon: Icons.Users, shortLabel: 'Amigos', badge: pendingFriends },
    { path: '/messages', label: 'Chat', icon: Icons.MessageCircle, shortLabel: 'Chat', badge: unreadCount },
    { path: '/watchlist', label: 'Mi Lista', icon: Icons.Bookmark, shortLabel: 'Lista' },
    { path: '/profile', label: 'Perfil', icon: Icons.User, shortLabel: 'Perfil' },
  ]

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-dark-400/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate('/feed')}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                  <Icons.Clapperboard className="w-5 h-5 text-brand" />
                </div>
                <span className="text-lg font-bold text-white group-hover:text-brand transition-colors tracking-tight">
                  CineCircle
                </span>
              </button>

              {/* Desktop Nav Items */}
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map(item => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-surface-100 text-brand'
                          : 'text-gray-400 hover:text-white hover:bg-surface-100/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{item.label}</span>
                      </span>
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-brand text-dark-500 rounded-full text-xs font-bold flex items-center justify-center px-1">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              {/* Search button */}
              <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-100 transition-all"
                title="Buscar"
              >
                <Icons.Search className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-100/50">
                <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
                  <span className="text-brand text-xs font-semibold">
                    {(user?.user_metadata?.username || user?.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-300">
                  {user?.user_metadata?.username || user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="btn btn-ghost text-sm flex items-center gap-2"
              >
                <Icons.LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-400/95 backdrop-blur-md border-t border-border z-50">
        <div className="grid grid-cols-6 gap-0.5 px-1 py-2">
          {navItems.map(item => {
            const IconComponent = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center py-1 px-1 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-brand'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="relative">
                  <IconComponent className={`w-5 h-5 ${isActive(item.path) ? 'stroke-[2.5]' : ''}`} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-brand text-dark-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] mt-1 ${isActive(item.path) ? 'font-semibold' : 'font-medium'}`}>
                  {item.shortLabel}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
