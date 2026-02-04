import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    completedGoals: 0,
    totalGoals: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      // Cargar estadísticas
      const [recsResponse, goalsResponse] = await Promise.all([
        supabase
          .from('recommendations')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
      ])

      const completedGoals = goalsResponse.data?.filter(g => g.completed).length || 0
      const totalGoals = goalsResponse.data?.length || 0

      setStats({
        totalRecommendations: recsResponse.count || 0,
        completedGoals,
        totalGoals,
      })

      // Cargar actividad reciente
      const { data: activity } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentActivity(activity || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Mi Perfil</h2>

      {/* Info del usuario */}
      <div className="card mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h3 className="text-2xl font-bold">
              {user?.user_metadata?.username || 'Usuario'}
            </h3>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-4xl font-bold text-primary-500">
            {stats.totalRecommendations}
          </div>
          <div className="text-gray-400 mt-2">Recomendaciones</div>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl font-bold text-green-500">
            {stats.completedGoals}
          </div>
          <div className="text-gray-400 mt-2">Objetivos Completados</div>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl font-bold text-blue-500">
            {stats.totalGoals}
          </div>
          <div className="text-gray-400 mt-2">Objetivos Totales</div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Actividad Reciente</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No hay actividad reciente
          </p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-700 last:border-0">
                <div className="text-2xl">
                  {item.type === 'movie' ? '🎬' : '📺'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-400">
                    {'⭐'.repeat(item.rating)} • {new Date(item.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
