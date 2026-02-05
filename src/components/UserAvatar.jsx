import { AVATAR_OPTIONS, AVATAR_COLORS } from './AvatarSelector'

const getColorClass = (colorId) => {
  return AVATAR_COLORS.find(c => c.id === colorId)?.color || 'bg-brand'
}

const getEmoji = (avatarId) => {
  return AVATAR_OPTIONS.find(a => a.id === avatarId)?.emoji || '🍿'
}

export default function UserAvatar({ avatar, color, username, size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-sm',
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
    xl: 'w-16 h-16 text-3xl',
    '2xl': 'w-24 h-24 text-5xl',
  }

  // Si tiene avatar personalizado
  if (avatar) {
    return (
      <div
        className={`${sizeClasses[size]} ${getColorClass(color)} rounded-full flex items-center justify-center ${className}`}
        title={username}
      >
        {getEmoji(avatar)}
      </div>
    )
  }

  // Avatar por defecto con inicial
  return (
    <div
      className={`${sizeClasses[size]} bg-brand/20 rounded-full flex items-center justify-center ${className}`}
      title={username}
    >
      <span className="text-brand font-semibold">
        {(username || 'U')[0].toUpperCase()}
      </span>
    </div>
  )
}
