// Footer con atribución de TMDB
export default function Footer() {
  return (
    <footer className="bg-surface-200 border-t border-border py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo y nombre */}
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-brand font-semibold">CineCircle</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm">Compartí lo que ves</span>
          </div>

          {/* TMDB Attribution */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Powered by</span>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDB"
                className="h-4"
              />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} CineCircle. Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
          </p>
        </div>
      </div>
    </footer>
  )
}
