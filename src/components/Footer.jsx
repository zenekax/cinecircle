import { Link } from 'react-router-dom'
import { Icons } from './Icons'

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
              <Icons.Film className="w-6 h-6 text-brand" />
              <span className="text-xl font-bold text-brand">CineCircle</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              La red social para compartir y descubrir películas y series con tus amigos.
            </p>
          </div>

          {/* Apoyar con Cafecito */}
          <div className="flex flex-col items-center gap-2">
            <a
              href="https://cafecito.app/cinecircle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#6f4e37] hover:bg-[#5a3f2d] text-white rounded-lg transition-all hover:scale-105 shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21V19H20V21H2ZM20 8V5H22V8H20ZM20 8H18C18 6.9 18 5.5 18 5H4C4 5.5 4 6.9 4 8H2V5C2 3.9 2.9 3 4 3H18C19.1 3 20 3.9 20 5V8ZM18 8V16C18 17.1 17.1 18 16 18H6C4.9 18 4 17.1 4 16V8H18ZM8 10H6V16H8V10ZM12 10H10V16H12V10ZM16 10H14V16H16V10Z"/>
              </svg>
              <span className="font-medium">Invitame un cafecito</span>
            </a>
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
          <Link to="/terminos" className="hover:text-brand transition-colors">Términos de uso</Link>
          <span className="text-gray-700">•</span>
          <Link to="/privacidad" className="hover:text-brand transition-colors">Política de privacidad</Link>
          <span className="text-gray-700">•</span>
          <Link to="/contacto" className="hover:text-brand transition-colors">Contacto</Link>
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
            <p className="text-xs text-gray-600 inline-flex items-center gap-1 justify-center">
              Hecho con <Icons.HeartFilled className="w-3 h-3 text-red-500" /> en Argentina
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
