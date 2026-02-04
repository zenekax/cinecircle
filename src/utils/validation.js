/**
 * Valida si una URL es segura para mostrar como imagen
 * @param {string} url - La URL a validar
 * @returns {boolean} - True si la URL es válida y segura
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false

  try {
    const parsed = new URL(url)

    // Solo permitir HTTPS (y HTTP en desarrollo)
    const allowedProtocols = ['https:']
    if (import.meta.env.DEV) {
      allowedProtocols.push('http:')
    }

    if (!allowedProtocols.includes(parsed.protocol)) {
      return false
    }

    // Verificar extensión de imagen común
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']
    const pathname = parsed.pathname.toLowerCase()
    const hasImageExtension = imageExtensions.some(ext => pathname.includes(ext))

    // Permitir URLs de servicios conocidos de imágenes/posters
    const trustedDomains = [
      'image.tmdb.org',
      'themoviedb.org',
      'imdb.com',
      'ia.media-imdb.com',
      'm.media-amazon.com',
      'imgur.com',
      'i.imgur.com',
      'cloudinary.com',
      'res.cloudinary.com',
      'images.unsplash.com',
      'picsum.photos',
    ]

    const isTrustedDomain = trustedDomains.some(domain =>
      parsed.hostname.includes(domain)
    )

    return hasImageExtension || isTrustedDomain
  } catch {
    return false
  }
}

/**
 * Sanitiza una URL de imagen, devuelve null si no es válida
 * @param {string} url - La URL a sanitizar
 * @returns {string|null} - La URL sanitizada o null
 */
export function sanitizeImageUrl(url) {
  if (!isValidImageUrl(url)) return null
  return url
}
