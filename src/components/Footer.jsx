// Footer con atribución de TMDB y links legales
export default function Footer() {
  return (
    <footer className="bg-surface-200 border-t border-border py-8 mt-auto">
      <div className="max-w-4xl mx-auto px-4">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          {/* Logo y descripción */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-xl font-bold text-brand">🎬 CineCircle</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              La red social para compartir y descubrir películas y series con tus amigos.
            </p>
          </div>

          {/* TMDB Attribution */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500">Datos proporcionados por</span>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDB"
                className="h-5"
              />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-6">
          <a href="#" className="hover:text-brand transition-colors">Términos de uso</a>
          <span className="text-gray-700">•</span>
          <a href="#" className="hover:text-brand transition-colors">Política de privacidad</a>
          <span className="text-gray-700">•</span>
          <a href="#" className="hover:text-brand transition-colors">Contacto</a>
          <span className="text-gray-700">•</span>
          <a
            href="https://www.themoviedb.org/terms-of-use"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand transition-colors"
          >
            Términos de TMDB
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-6">
          {/* Copyright y disclaimer */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} CineCircle. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-600">
              Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
            </p>
            <p className="text-xs text-gray-600">
              Las imágenes y datos de películas/series son propiedad de sus respectivos dueños.
            </p>
          </div>

          {/* Made with love */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Hecho con ❤️ en Argentina
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
