// Componentes de Skeleton para estados de carga

export const Skeleton = ({ className = '' }) => (
  <div className={`bg-surface-100 animate-pulse rounded ${className}`} />
)

// Skeleton para una card de recomendación en el Feed
export const FeedCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex gap-4">
      {/* Poster */}
      <div className="w-24 h-36 bg-surface-100 rounded-lg flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 space-y-3">
        {/* Title */}
        <div className="h-6 bg-surface-100 rounded w-2/3" />

        {/* Type and genre */}
        <div className="flex gap-2">
          <div className="h-4 bg-surface-100 rounded w-16" />
          <div className="h-4 bg-surface-100 rounded w-20" />
        </div>

        {/* Rating */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-4 h-4 bg-surface-100 rounded" />
          ))}
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <div className="h-4 bg-surface-100 rounded w-full" />
          <div className="h-4 bg-surface-100 rounded w-4/5" />
        </div>

        {/* User and actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-surface-100 rounded-full" />
            <div className="h-4 bg-surface-100 rounded w-24" />
          </div>
          <div className="flex gap-3">
            <div className="h-6 bg-surface-100 rounded w-12" />
            <div className="h-6 bg-surface-100 rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Skeleton para la sección de Recomendación de la Semana
export const WeeklyPickSkeleton = () => (
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-5 bg-surface-100 rounded animate-pulse" />
      <div className="h-6 bg-surface-100 rounded w-56 animate-pulse" />
    </div>
    <div className="relative overflow-hidden rounded-xl bg-surface-100/50 animate-pulse">
      <div className="p-5 flex gap-5">
        <div className="w-28 h-40 bg-surface-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 flex flex-col justify-center space-y-3">
          <div className="h-5 bg-surface-200 rounded w-24" />
          <div className="h-7 bg-surface-200 rounded w-3/4" />
          <div className="h-4 bg-surface-200 rounded w-20" />
          <div className="h-4 bg-surface-200 rounded w-full" />
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-surface-200 rounded-full" />
            <div className="h-4 bg-surface-200 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Skeleton para perfil de usuario
export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
    <div className="card mb-6 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 bg-surface-100 rounded-full" />

        <div className="text-center sm:text-left flex-1 space-y-3">
          <div className="h-8 bg-surface-100 rounded w-40 mx-auto sm:mx-0" />
          <div className="h-4 bg-surface-100 rounded w-48 mx-auto sm:mx-0" />
          <div className="h-10 bg-surface-100 rounded w-32 mx-auto sm:mx-0 mt-4" />
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="card text-center py-4 animate-pulse">
          <div className="h-8 bg-surface-100 rounded w-12 mx-auto mb-2" />
          <div className="h-4 bg-surface-100 rounded w-20 mx-auto" />
        </div>
      ))}
    </div>

    {/* Recommendations */}
    <div className="card animate-pulse">
      <div className="h-7 bg-surface-100 rounded w-48 mb-4" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 pb-4 border-b border-border last:border-0">
            <div className="w-16 h-24 bg-surface-100 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-surface-100 rounded w-3/4" />
              <div className="h-4 bg-surface-100 rounded w-1/2" />
              <div className="h-4 bg-surface-100 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Skeleton para detalle de post
export const PostDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
    {/* Back button */}
    <div className="h-6 bg-surface-100 rounded w-20 mb-6 animate-pulse" />

    {/* Post card */}
    <div className="card mb-6 animate-pulse">
      <div className="flex gap-4">
        <div className="w-32 h-48 bg-surface-100 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-surface-100 rounded w-3/4" />
          <div className="flex gap-2">
            <div className="h-5 bg-surface-100 rounded w-16" />
            <div className="h-5 bg-surface-100 rounded w-20" />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-4 h-4 bg-surface-100 rounded" />
            ))}
          </div>
          <div className="h-4 bg-surface-100 rounded w-full" />
          <div className="h-4 bg-surface-100 rounded w-4/5" />
          <div className="flex items-center gap-2 pt-2">
            <div className="w-8 h-8 bg-surface-100 rounded-full" />
            <div className="h-4 bg-surface-100 rounded w-24" />
          </div>
          <div className="flex gap-4 pt-4 border-t border-border">
            <div className="h-10 bg-surface-100 rounded w-28" />
            <div className="h-10 bg-surface-100 rounded w-32" />
          </div>
        </div>
      </div>
    </div>

    {/* Comment form */}
    <div className="card mb-6 animate-pulse">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-surface-100 rounded-full" />
        <div className="flex-1">
          <div className="h-20 bg-surface-100 rounded" />
        </div>
      </div>
    </div>
  </div>
)

// Skeleton para tarjeta de watchlist
export const WatchlistCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex gap-3">
      <div className="w-16 h-24 bg-surface-100 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-surface-100 rounded w-3/4" />
        <div className="h-4 bg-surface-100 rounded w-1/2" />
        <div className="h-4 bg-surface-100 rounded w-2/3" />
      </div>
    </div>
  </div>
)

export default Skeleton
