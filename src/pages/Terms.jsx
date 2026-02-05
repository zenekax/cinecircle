import { useNavigate } from 'react-router-dom'
import { Icons } from '../components/Icons'

export default function Terms() {
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
        <h1 className="text-2xl font-bold text-white mb-6">Términos de Uso</h1>
        <p className="text-gray-400 text-sm mb-6">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar CineCircle, aceptás estos términos de uso en su totalidad.
              Si no estás de acuerdo con alguna parte de estos términos, no debés usar la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Descripción del Servicio</h2>
            <p>
              CineCircle es una red social gratuita que permite a los usuarios compartir recomendaciones
              de películas y series con sus amigos. Los datos de películas y series son proporcionados
              por The Movie Database (TMDB).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Registro de Cuenta</h2>
            <p className="mb-2">Para usar CineCircle, debés:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Tener al menos 13 años de edad</li>
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la seguridad de tu cuenta y contraseña</li>
              <li>Ser responsable de toda la actividad en tu cuenta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Uso Aceptable</h2>
            <p className="mb-2">Al usar CineCircle, te comprometés a no:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Publicar contenido ofensivo, ilegal o que viole derechos de terceros</li>
              <li>Acosar, intimidar o amenazar a otros usuarios</li>
              <li>Usar la plataforma para spam o publicidad no autorizada</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Interferir con el funcionamiento normal de la plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Contenido del Usuario</h2>
            <p>
              Sos responsable del contenido que publicás en CineCircle. Al publicar contenido,
              nos otorgás una licencia no exclusiva para mostrar dicho contenido en la plataforma.
              Nos reservamos el derecho de eliminar contenido que viole estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Propiedad Intelectual</h2>
            <p>
              Las imágenes, títulos y datos de películas/series son propiedad de sus respectivos dueños
              y son proporcionados por TMDB. El diseño y código de CineCircle son propiedad de sus creadores.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Limitación de Responsabilidad</h2>
            <p>
              CineCircle se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables
              por daños directos, indirectos o consecuentes derivados del uso de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios entrarán en vigor inmediatamente después de su publicación.
              El uso continuado de la plataforma constituye la aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Terminación</h2>
            <p>
              Podemos suspender o terminar tu acceso a CineCircle en cualquier momento,
              con o sin causa, con o sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contacto</h2>
            <p>
              Si tenés preguntas sobre estos términos, podés contactarnos a través de la
              página de <a href="/contacto" className="text-brand hover:underline">Contacto</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
