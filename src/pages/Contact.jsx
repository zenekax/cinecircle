import { useNavigate } from 'react-router-dom'
import { Icons } from '../components/Icons'

export default function Contact() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <Icons.ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-white mb-2">Contacto</h1>
        <p className="text-gray-400 mb-8">¿Tenés preguntas, sugerencias o comentarios? ¡Contactanos!</p>

        <div className="space-y-6">
          {/* Creador */}
          <section className="bg-surface-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Creador</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center text-2xl">
                👨‍💻
              </div>
              <div>
                <p className="text-white font-medium text-lg">Ignacio Basso</p>
                <p className="text-gray-400 text-sm">Desarrollador de CineCircle</p>
              </div>
            </div>
          </section>

          {/* Redes de contacto */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Redes de Contacto</h2>
            <div className="space-y-3">
              {/* Email */}
              <a
                href="mailto:ignacio_Basso@hotmail.com"
                className="flex items-center gap-4 p-4 bg-surface-100 rounded-xl hover:bg-surface-200 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-brand transition-colors">Email</p>
                  <p className="text-gray-400 text-sm">ignacio_Basso@hotmail.com</p>
                </div>
                <svg className="w-5 h-5 text-gray-500 group-hover:text-brand transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/nachitobasso"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-surface-100 rounded-xl hover:bg-surface-200 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-brand transition-colors">Instagram</p>
                  <p className="text-gray-400 text-sm">@nachitobasso</p>
                </div>
                <svg className="w-5 h-5 text-gray-500 group-hover:text-brand transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </a>
            </div>
          </section>

          {/* Sobre CineCircle */}
          <section className="bg-surface-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Sobre CineCircle</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              CineCircle nació como un proyecto personal para compartir recomendaciones de
              películas y series entre amigos. La idea es simple: si te gustó algo que viste,
              compartilo con la gente que querés para que ellos también lo disfruten.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mt-3">
              ¿Tenés ideas para mejorar la app? ¿Encontraste un bug? ¿Querés colaborar?
              ¡No dudes en escribirme!
            </p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Preguntas Frecuentes</h2>
            <div className="space-y-3">
              <div className="bg-surface-100 rounded-xl p-4">
                <p className="text-white font-medium mb-2">¿CineCircle es gratis?</p>
                <p className="text-gray-400 text-sm">
                  Sí, CineCircle es completamente gratis y siempre lo será.
                </p>
              </div>
              <div className="bg-surface-100 rounded-xl p-4">
                <p className="text-white font-medium mb-2">¿Puedo eliminar mi cuenta?</p>
                <p className="text-gray-400 text-sm">
                  Sí, podés eliminar tu cuenta en cualquier momento desde tu perfil.
                  Todos tus datos serán eliminados permanentemente.
                </p>
              </div>
              <div className="bg-surface-100 rounded-xl p-4">
                <p className="text-white font-medium mb-2">¿De dónde salen los datos de las películas?</p>
                <p className="text-gray-400 text-sm">
                  Los datos de películas y series son proporcionados por TMDB (The Movie Database),
                  una base de datos comunitaria de contenido audiovisual.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
