// TMDB API Service
// Documentación: https://developer.themoviedb.org/docs

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

/**
 * Busca películas o series en TMDB
 * @param {string} query - Término de búsqueda
 * @param {string} type - 'movie' o 'tv' (series)
 * @returns {Promise<Array>} - Lista de resultados
 */
export async function searchMedia(query, type = 'movie') {
  if (!query || query.trim().length < 2) return []

  try {
    const endpoint = type === 'series' ? 'tv' : 'movie'
    const response = await fetch(
      `${TMDB_BASE_URL}/search/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES&page=1`
    )

    if (!response.ok) throw new Error('Error en la búsqueda')

    const data = await response.json()

    return data.results.slice(0, 10).map(item => ({
      id: item.id,
      title: item.title || item.name,
      originalTitle: item.original_title || item.original_name,
      year: (item.release_date || item.first_air_date || '').split('-')[0],
      overview: item.overview,
      posterUrl: item.poster_path
        ? `${TMDB_IMAGE_BASE}/w342${item.poster_path}`
        : null,
      backdropUrl: item.backdrop_path
        ? `${TMDB_IMAGE_BASE}/w780${item.backdrop_path}`
        : null,
      rating: item.vote_average ? Math.round(item.vote_average / 2) : null,
      type: type === 'series' ? 'series' : 'movie'
    }))
  } catch (error) {
    console.error('TMDB Error:', error)
    return []
  }
}

/**
 * Obtiene detalles de una película o serie
 * @param {number} id - ID de TMDB
 * @param {string} type - 'movie' o 'series'
 * @returns {Promise<Object|null>}
 */
export async function getMediaDetails(id, type = 'movie') {
  try {
    const endpoint = type === 'series' ? 'tv' : 'movie'
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}/${id}?api_key=${TMDB_API_KEY}&language=es-ES`
    )

    if (!response.ok) throw new Error('Error obteniendo detalles')

    const item = await response.json()

    return {
      id: item.id,
      title: item.title || item.name,
      originalTitle: item.original_title || item.original_name,
      year: (item.release_date || item.first_air_date || '').split('-')[0],
      overview: item.overview,
      posterUrl: item.poster_path
        ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}`
        : null,
      backdropUrl: item.backdrop_path
        ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}`
        : null,
      rating: item.vote_average ? Math.round(item.vote_average / 2) : null,
      genres: item.genres?.map(g => g.name) || [],
      runtime: item.runtime || item.episode_run_time?.[0],
      type: type === 'series' ? 'series' : 'movie'
    }
  } catch (error) {
    console.error('TMDB Error:', error)
    return null
  }
}

/**
 * Obtiene películas/series populares
 * @param {string} type - 'movie' o 'series'
 * @returns {Promise<Array>}
 */
export async function getPopular(type = 'movie') {
  try {
    const endpoint = type === 'series' ? 'tv' : 'movie'
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=1`
    )

    if (!response.ok) throw new Error('Error obteniendo populares')

    const data = await response.json()

    return data.results.slice(0, 10).map(item => ({
      id: item.id,
      title: item.title || item.name,
      year: (item.release_date || item.first_air_date || '').split('-')[0],
      posterUrl: item.poster_path
        ? `${TMDB_IMAGE_BASE}/w342${item.poster_path}`
        : null,
      rating: item.vote_average ? Math.round(item.vote_average / 2) : null,
      type: type === 'series' ? 'series' : 'movie'
    }))
  } catch (error) {
    console.error('TMDB Error:', error)
    return []
  }
}

/**
 * Verifica si la API está configurada
 * @returns {boolean}
 */
export function isTMDBConfigured() {
  return Boolean(TMDB_API_KEY && TMDB_API_KEY !== 'TU_TMDB_API_KEY')
}
