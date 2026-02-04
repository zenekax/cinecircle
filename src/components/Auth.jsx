import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, username)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-500">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-brand/5 via-transparent to-transparent" />

      <div className="relative max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 mb-4">
            <span className="text-4xl">🎬</span>
          </div>
          <h1 className="text-3xl font-bold text-white">CineCircle</h1>
          <p className="mt-2 text-gray-500">
            Compartí películas y series con tus amigos
          </p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface-200 rounded-lg mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-surface-100 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-surface-100 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="tunombre"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cargando...
                </span>
              ) : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-gray-500">
              {isLogin ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand hover:text-brand-300 font-medium transition-colors"
              >
                {isLogin ? 'Registrate' : 'Iniciá sesión'}
              </button>
            </p>
          </div>
        </div>

        {/* Powered by */}
        <p className="text-center text-xs text-gray-600">
          Hecho con 💚 usando Supabase
        </p>
      </div>
    </div>
  )
}
