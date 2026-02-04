import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [newGoal, setNewGoal] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadGoals()

    const subscription = supabase
      .channel('goals')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        () => {
          loadGoals()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          profiles (username)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            description: newGoal,
            deadline: deadline || null,
            completed: false,
          }
        ])

      if (error) throw error

      setNewGoal('')
      setDeadline('')
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  const toggleGoal = async (goalId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed: !currentStatus })
        .eq('id', goalId)

      if (error) throw error
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  const deleteGoal = async (goalId) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  const myGoals = goals.filter(g => g.user_id === user.id)
  const friendsGoals = goals.filter(g => g.user_id !== user.id)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-surface-100 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-surface-100 rounded w-3/4" />
                  <div className="h-4 bg-surface-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
            <Icons.Target className="w-5 h-5 text-brand" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Objetivos Semanales</h1>
        </div>
        <p className="text-gray-500">Establecé metas y seguí tu progreso</p>
      </div>

      {/* Crear nuevo objetivo */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icons.PlusCircle className="w-5 h-5 text-brand" />
          Nuevo Objetivo
        </h3>
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="input"
              placeholder="Ej: Ver 3 películas esta semana"
              required
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Icons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Icons.Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </form>
      </div>

      {/* Mis objetivos */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Mis Objetivos</h3>
        {myGoals.length === 0 ? (
          <div className="card text-center py-12">
            <Icons.Target className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No tenés objetivos todavía</p>
            <p className="text-gray-600 text-sm mt-1">Creá uno arriba para empezar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myGoals.map((goal) => (
              <div
                key={goal.id}
                className={`card card-hover transition-all ${
                  goal.completed ? 'border-brand/30 bg-brand/5' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleGoal(goal.id, goal.completed)}
                    className={`mt-0.5 transition-colors ${
                      goal.completed ? 'text-brand' : 'text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {goal.completed ? (
                      <Icons.SquareCheck className="w-6 h-6" />
                    ) : (
                      <Icons.Square className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base ${goal.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                      {goal.description}
                    </p>
                    {goal.deadline && (
                      <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                        <Icons.Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(goal.deadline).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short'
                        })}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Objetivos de amigos */}
      {friendsGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <Icons.Users className="w-5 h-5 text-gray-500" />
            Objetivos de Amigos
          </h3>
          <div className="space-y-3">
            {friendsGoals.map((goal) => (
              <div
                key={goal.id}
                className={`card ${goal.completed ? 'border-brand/30 bg-brand/5' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 ${goal.completed ? 'text-brand' : 'text-gray-600'}`}>
                    {goal.completed ? (
                      <Icons.SquareCheck className="w-6 h-6" />
                    ) : (
                      <Icons.Square className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base ${goal.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                      {goal.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Icons.User className="w-3.5 h-3.5" />
                        <span>{goal.profiles?.username || 'Usuario'}</span>
                      </div>
                      {goal.deadline && (
                        <div className="flex items-center gap-1.5">
                          <Icons.Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(goal.deadline).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short'
                          })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
