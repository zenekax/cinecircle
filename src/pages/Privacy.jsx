import { useNavigate } from 'react-router-dom'
import { Icons } from '../components/Icons'

export default function Privacy() {
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
        <h1 className="text-2xl font-bold text-white mb-6">Política de Privacidad</h1>
        <p className="text-gray-400 text-sm mb-6">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Información que Recopilamos</h2>
            <p className="mb-2">Recopilamos la siguiente información:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Información de cuenta:</strong> Email, nombre de usuario y avatar</li>
              <li><strong className="text-gray-300">Contenido:</strong> Recomendaciones, comentarios y likes que publiques</li>
              <li><strong className="text-gray-300">Conexiones:</strong> Lista de amigos y solicitudes de amistad</li>
              <li><strong className="text-gray-300">Mensajes:</strong> Conversaciones con otros usuarios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Cómo Usamos tu Información</h2>
            <p className="mb-2">Utilizamos tu información para:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Proporcionar y mantener el servicio</li>
              <li>Permitir la interacción con otros usuarios</li>
              <li>Personalizar tu experiencia (recomendaciones, feed)</li>
              <li>Enviar notificaciones sobre actividad relevante</li>
              <li>Mejorar y desarrollar nuevas funcionalidades</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Compartir Información</h2>
            <p className="mb-2">Tu información puede ser visible para:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Otros usuarios:</strong> Tu perfil público, recomendaciones y comentarios</li>
              <li><strong className="text-gray-300">Amigos:</strong> Tu actividad en el feed</li>
            </ul>
            <p className="mt-2">
              <strong>No vendemos ni compartimos tu información personal con terceros</strong> para fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Almacenamiento y Seguridad</h2>
            <p>
              Tus datos se almacenan de forma segura en servidores de Supabase. Utilizamos
              encriptación y otras medidas de seguridad para proteger tu información.
              Las contraseñas se almacenan de forma hasheada y nunca en texto plano.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Servicios de Terceros</h2>
            <p className="mb-2">Utilizamos los siguientes servicios externos:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Supabase:</strong> Almacenamiento de datos y autenticación</li>
              <li><strong className="text-gray-300">TMDB:</strong> Información de películas y series (no compartimos tus datos con ellos)</li>
              <li><strong className="text-gray-300">Vercel:</strong> Hosting de la aplicación</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Tus Derechos</h2>
            <p className="mb-2">Tenés derecho a:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Acceder a tus datos personales</li>
              <li>Corregir información incorrecta</li>
              <li>Eliminar tu cuenta y datos asociados</li>
              <li>Exportar tus datos</li>
            </ul>
            <p className="mt-2">
              Para ejercer estos derechos, contactanos a través de la página de Contacto.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Cookies</h2>
            <p>
              Utilizamos cookies y almacenamiento local para mantener tu sesión iniciada
              y recordar tus preferencias. No utilizamos cookies de seguimiento publicitario.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Menores de Edad</h2>
            <p>
              CineCircle no está dirigido a menores de 13 años. Si sos padre/madre o tutor
              y creés que tu hijo nos ha proporcionado información personal, contactanos
              para eliminarla.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente.
              Te notificaremos sobre cambios significativos publicando la nueva política
              en esta página.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contacto</h2>
            <p>
              Si tenés preguntas sobre esta política de privacidad, podés contactarnos a través
              de la página de <a href="/contacto" className="text-brand hover:underline">Contacto</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
