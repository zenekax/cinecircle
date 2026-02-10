// Sistema de insignias de CineCircle
import { Icons } from './Icons'

// Definición de todas las insignias disponibles
export const BADGES = {
  // Insignias por cantidad de recomendaciones
  recommendations: [
    {
      id: 'newbie',
      name: 'Novato',
      description: 'Publicaste tu primera recomendación',
      icon: 'Seedling',
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      borderColor: 'border-green-400/50',
      requirement: 1,
      type: 'recommendations'
    },
    {
      id: 'enthusiast',
      name: 'Entusiasta',
      description: 'Publicaste 10 recomendaciones',
      icon: 'Fire',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20',
      borderColor: 'border-orange-400/50',
      requirement: 10,
      type: 'recommendations'
    },
    {
      id: 'cinephile',
      name: 'Cinéfilo',
      description: 'Publicaste 25 recomendaciones',
      icon: 'Film',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      borderColor: 'border-blue-400/50',
      requirement: 25,
      type: 'recommendations'
    },
    {
      id: 'critic',
      name: 'Crítico',
      description: 'Publicaste 50 recomendaciones',
      icon: 'Award',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
      borderColor: 'border-purple-400/50',
      requirement: 50,
      type: 'recommendations'
    },
    {
      id: 'director',
      name: 'Director',
      description: 'Publicaste 100 recomendaciones',
      icon: 'Crown',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
      borderColor: 'border-yellow-400/50',
      requirement: 100,
      type: 'recommendations'
    },
  ],

  // Insignias por likes recibidos
  likes: [
    {
      id: 'liked',
      name: 'Querido',
      description: 'Recibiste 10 likes',
      icon: 'Heart',
      color: 'text-red-400',
      bgColor: 'bg-red-400/20',
      borderColor: 'border-red-400/50',
      requirement: 10,
      type: 'likes'
    },
    {
      id: 'popular',
      name: 'Popular',
      description: 'Recibiste 50 likes',
      icon: 'HeartFilled',
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      requirement: 50,
      type: 'likes'
    },
    {
      id: 'influencer',
      name: 'Influencer',
      description: 'Recibiste 200 likes',
      icon: 'Sparkles',
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/20',
      borderColor: 'border-pink-400/50',
      requirement: 200,
      type: 'likes'
    },
  ],

  // Insignias por amigos
  friends: [
    {
      id: 'social',
      name: 'Social',
      description: 'Tenés 5 amigos',
      icon: 'Users',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/20',
      borderColor: 'border-cyan-400/50',
      requirement: 5,
      type: 'friends'
    },
    {
      id: 'connector',
      name: 'Conector',
      description: 'Tenés 20 amigos',
      icon: 'Network',
      color: 'text-teal-400',
      bgColor: 'bg-teal-400/20',
      borderColor: 'border-teal-400/50',
      requirement: 20,
      type: 'friends'
    },
  ],

  // Insignias por watchlist
  watchlist: [
    {
      id: 'collector',
      name: 'Coleccionista',
      description: 'Guardaste 20 títulos en tu lista',
      icon: 'Bookmark',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/20',
      borderColor: 'border-indigo-400/50',
      requirement: 20,
      type: 'watchlist'
    },
    {
      id: 'binger',
      name: 'Maratonista',
      description: 'Marcaste 30 títulos como vistos',
      icon: 'CheckCircle',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/20',
      borderColor: 'border-emerald-400/50',
      requirement: 30,
      type: 'watched'
    },
  ],

  // Insignias especiales
  special: [
    {
      id: 'founder',
      name: 'Fundador',
      description: 'Creador de CineCircle',
      icon: 'Founder',
      color: 'text-amber-400',
      bgColor: 'bg-gradient-to-br from-amber-400/30 to-yellow-500/30',
      borderColor: 'border-amber-400',
      requirement: null,
      type: 'founder'
    },
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'Te uniste en los primeros días',
      icon: 'Rocket',
      color: 'text-violet-400',
      bgColor: 'bg-violet-400/20',
      borderColor: 'border-violet-400/50',
      requirement: null,
      type: 'special'
    },
    {
      id: 'night_owl',
      name: 'Búho Nocturno',
      description: 'Publicaste después de medianoche',
      icon: 'Moon',
      color: 'text-slate-400',
      bgColor: 'bg-slate-400/20',
      borderColor: 'border-slate-400/50',
      requirement: null,
      type: 'special'
    },
  ],

  // Insignias de Cafecito (Supporters)
  cafecito: [
    {
      id: 'marilyn',
      name: 'Marilyn Monroe',
      description: 'Supporter de CineCircle ☕',
      icon: 'Star',
      color: 'text-pink-400',
      bgColor: 'bg-gradient-to-br from-pink-400/30 to-rose-500/30',
      borderColor: 'border-pink-400',
      requirement: null,
      type: 'cafecito'
    },
    {
      id: 'toretto',
      name: 'Toretto',
      description: 'Supporter de CineCircle 🏎️',
      icon: 'Flame',
      color: 'text-orange-500',
      bgColor: 'bg-gradient-to-br from-orange-500/30 to-red-500/30',
      borderColor: 'border-orange-500',
      requirement: null,
      type: 'cafecito'
    },
    {
      id: 'alpacino',
      name: 'Al Pacino',
      description: 'Supporter de CineCircle 🎭',
      icon: 'Drama',
      color: 'text-amber-500',
      bgColor: 'bg-gradient-to-br from-amber-500/30 to-yellow-600/30',
      borderColor: 'border-amber-500',
      requirement: null,
      type: 'cafecito'
    },
    {
      id: 'cineasta',
      name: 'Cineasta',
      description: 'Supporter VIP de CineCircle 🎬',
      icon: 'Clapperboard',
      color: 'text-yellow-400',
      bgColor: 'bg-gradient-to-br from-yellow-400/30 to-amber-500/30',
      borderColor: 'border-yellow-400',
      requirement: null,
      type: 'cafecito'
    },
  ]
}

// ID del fundador (Ignacio Basso)
const FOUNDER_USERNAME = 'nachito'

// Íconos personalizados para las insignias
const BadgeIcons = {
  Founder: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L9 5H5L7 9L4 12L7 15L5 19H9L12 22L15 19H19L17 15L20 12L17 9L19 5H15L12 2Z" />
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  Seedling: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
  ),
  Fire: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  Award: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Crown: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  ),
  Sparkles: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  ),
  Network: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <circle cx="5" cy="19" r="3" />
      <circle cx="19" cy="19" r="3" />
      <path d="M12 8v4" />
      <path d="m8 16 4-4 4 4" />
    </svg>
  ),
  Rocket: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  Moon: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  Star: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Flame: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-3.65 0-7-2.76-7-7.5 0-3.17 1.86-5.49 3.41-7.26.78-.89 1.59-1.67 2.09-2.48.25-.4.45-.77.54-1.16.06-.27.09-.57-.04-.99-.09-.3-.27-.63-.5-1.02-.14-.24-.31-.5-.49-.78l-.39-.6c-.32-.51-.64-1.06-.85-1.69L8.5 1h.18c.34.06.67.17.97.33.42.22.8.51 1.15.85.68.66 1.27 1.52 1.82 2.42.6 1 1.15 2.08 1.66 3.08.26.51.5.99.75 1.43.42.73.82 1.36 1.33 1.86.4.4.89.74 1.53.97.48.18.93.27 1.37.31.3.03.6.04.92.04h.02l.27.01-.08.26c-.23.79-.65 1.45-1.16 2.02-.63.7-1.4 1.25-2.17 1.75-.56.36-1.13.69-1.65 1.02-1.78 1.13-3.18 2.39-3.18 4.65 0 1.87 1.35 3.5 3.5 3.5 1.5 0 2.5-.75 3-1.5.5.75 1 1.5 1 2.5 0 2.5-2.5 4.5-5 4.5z"/>
    </svg>
  ),
  Drama: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Clapperboard: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Z" />
      <path d="m4 11-.88-2.87a2 2 0 0 1 1.33-2.5l11.48-3.5a2 2 0 0 1 2.5 1.32l.87 2.87L4 11.12Z" />
      <path d="m6.6 4.99 3.38 4.2" />
      <path d="m11.86 3.38 3.38 4.2" />
    </svg>
  ),
}

// Función para obtener el ícono de una insignia
const getBadgeIcon = (iconName, className) => {
  // Primero buscar en BadgeIcons personalizados
  if (BadgeIcons[iconName]) {
    const IconComponent = BadgeIcons[iconName]
    return <IconComponent className={className} />
  }
  // Si no, buscar en Icons generales
  if (Icons[iconName]) {
    const IconComponent = Icons[iconName]
    return <IconComponent className={className} />
  }
  // Fallback
  return <Icons.StarFilled className={className} />
}

// Función para calcular las insignias desbloqueadas
export function calculateBadges(stats, purchasedBadges = []) {
  const unlockedBadges = []

  // Insignia de Fundador (siempre primero si aplica)
  if (stats.username === FOUNDER_USERNAME) {
    unlockedBadges.push(BADGES.special[0]) // Fundador
  }

  // Insignias de Cafecito compradas (van primero después de Fundador)
  if (purchasedBadges && purchasedBadges.length > 0) {
    purchasedBadges.forEach(badgeId => {
      const cafecitoBadge = BADGES.cafecito.find(b => b.id === badgeId)
      if (cafecitoBadge) {
        unlockedBadges.push(cafecitoBadge)
      }
    })
  }

  // Verificar insignias de recomendaciones
  BADGES.recommendations.forEach(badge => {
    if (stats.totalRecommendations >= badge.requirement) {
      unlockedBadges.push(badge)
    }
  })

  // Verificar insignias de likes
  BADGES.likes.forEach(badge => {
    if (stats.totalLikesReceived >= badge.requirement) {
      unlockedBadges.push(badge)
    }
  })

  // Verificar insignias de amigos
  BADGES.friends.forEach(badge => {
    if (stats.totalFriends >= badge.requirement) {
      unlockedBadges.push(badge)
    }
  })

  // Verificar insignias de watchlist
  BADGES.watchlist.forEach(badge => {
    if (badge.type === 'watchlist' && stats.watchlistCount >= badge.requirement) {
      unlockedBadges.push(badge)
    }
    if (badge.type === 'watched' && stats.watchedCount >= badge.requirement) {
      unlockedBadges.push(badge)
    }
  })

  // Early adopter (si se registró antes de cierta fecha)
  const earlyAdopterDate = new Date('2025-03-01') // Ajustar según necesites
  if (stats.createdAt && new Date(stats.createdAt) < earlyAdopterDate) {
    unlockedBadges.push(BADGES.special[1]) // Early Adopter (índice 1 ahora)
  }

  return unlockedBadges
}

// Función para obtener una insignia de cafecito por ID
export function getCafecitoBadge(badgeId) {
  return BADGES.cafecito.find(b => b.id === badgeId)
}

// Lista de todas las insignias de cafecito disponibles
export function getAllCafecitoBadges() {
  return BADGES.cafecito
}

// Componente de insignia individual
export function Badge({ badge, size = 'md', showTooltip = true }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className="relative group">
      <div
        className={`${sizes[size]} rounded-full ${badge.bgColor} border-2 ${badge.borderColor} flex items-center justify-center transition-transform hover:scale-110`}
      >
        {getBadgeIcon(badge.icon, `${iconSizes[size]} ${badge.color}`)}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-100 border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
          <p className={`font-semibold ${badge.color}`}>{badge.name}</p>
          <p className="text-xs text-gray-400">{badge.description}</p>
        </div>
      )}
    </div>
  )
}

// Componente para mostrar todas las insignias de un usuario
export function BadgeList({ badges, maxDisplay = 5, size = 'md' }) {
  const displayBadges = badges.slice(0, maxDisplay)
  const remainingCount = badges.length - maxDisplay

  if (badges.length === 0) {
    return (
      <p className="text-sm text-gray-500">Sin insignias todavía</p>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayBadges.map((badge) => (
        <Badge key={badge.id} badge={badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <div className={`${size === 'sm' ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-sm'} rounded-full bg-surface-100 border border-border flex items-center justify-center text-gray-400`}>
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

// Componente para mostrar progreso hacia la siguiente insignia
export function BadgeProgress({ stats }) {
  // Encontrar la siguiente insignia a desbloquear
  const nextBadges = []

  // Siguiente insignia de recomendaciones
  const nextRecBadge = BADGES.recommendations.find(b => stats.totalRecommendations < b.requirement)
  if (nextRecBadge) {
    nextBadges.push({
      ...nextRecBadge,
      current: stats.totalRecommendations,
      label: 'recomendaciones'
    })
  }

  // Siguiente insignia de likes
  const nextLikesBadge = BADGES.likes.find(b => stats.totalLikesReceived < b.requirement)
  if (nextLikesBadge) {
    nextBadges.push({
      ...nextLikesBadge,
      current: stats.totalLikesReceived,
      label: 'likes'
    })
  }

  if (nextBadges.length === 0) {
    return (
      <div className="text-center py-4">
        <Icons.Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-sm text-gray-400">¡Desbloqueaste todas las insignias!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {nextBadges.slice(0, 2).map((badge) => {
        const progress = (badge.current / badge.requirement) * 100
        return (
          <div key={badge.id} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${badge.bgColor} border ${badge.borderColor} flex items-center justify-center opacity-50`}>
              {getBadgeIcon(badge.icon, `w-5 h-5 ${badge.color}`)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-300">{badge.name}</span>
                <span className="text-xs text-gray-500">{badge.current}/{badge.requirement} {badge.label}</span>
              </div>
              <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${badge.bgColor.replace('/20', '')} transition-all`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default { BADGES, Badge, BadgeList, BadgeProgress, calculateBadges }
