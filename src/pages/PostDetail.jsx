import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Icons } from '../components/Icons'
import UserAvatar from '../components/UserAvatar'

export default function PostDetail() {
  const { postId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    if (postId) {
      loadPost()
      loadComments()
      loadLikes()
    }
  }, [postId])

  // Suscripción en tiempo real
  useEffect(() => {
    const subscription = supabase
      .channel(`post-${postId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `recommendation_id=eq.${postId}` },
        () => loadComments()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'likes', filter: `recommendation_id=eq.${postId}` },
        () => loadLikes()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [postId])

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          profiles (username, avatar, avatar_color)
        `)
        .eq('id', postId)
        .single()

      if (error) throw error
      setPost(data)
    } catch (error) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (username, avatar, avatar_color)
        `)
        .eq('recommendation_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  const loadLikes = async () => {
    try {
      const { data, count } = await supabase
        .from('likes')
        .select('user_id', { count: 'exact' })
        .eq('recommendation_id', postId)

      setLikesCount(count || 0)
      setLiked(data?.some(l => l.user_id === user?.id) || false)
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  const handleLike = async () => {
    // Optimistic update
    setLiked(!liked)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)

    try {
      if (liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('recommendation_id', postId)
      } else {
        await supabase
          .from('likes')
          .insert([{ user_id: user.id, recommendation_id: postId }])
      }
    } catch (error) {
      // Revert
      setLiked(liked)
      setLikesCount(prev => liked ? prev + 1 : prev - 1)
      console.error('Error:', error.message)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || sending) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          user_id: user.id,
          recommendation_id: postId,
          content: newComment.trim()
        }])

      if (error) throw error
      setNewComment('')
    } catch (error) {
      console.error('Error:', error.message)
      alert('Error al comentar')
    } finally {
      setSending(false)
    }
  }

  const deleteComment = async (commentId) => {
    if (!confirm('¿Eliminar este comentario?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icons.StarFilled
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-brand' : 'text-gray-700'}`}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">Publicación no encontrada</p>
          <button onClick={() => navigate('/feed')} className="btn btn-primary mt-4">
            Volver al Feed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <Icons.ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      {/* Post */}
      <div className="card mb-6">
        <div className="flex gap-4">
          {/* Poster */}
          {post.poster_url ? (
            <img
              src={post.poster_url}
              alt={post.title}
              className="w-32 h-48 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-32 h-48 bg-surface-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              {post.type === 'movie' ? (
                <Icons.Clapperboard className="w-10 h-10 text-gray-600" />
              ) : (
                <Icons.Tv className="w-10 h-10 text-gray-600" />
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{post.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">
                {post.type === 'movie' ? 'Película' : 'Serie'}
              </span>
              {post.genre && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-sm text-gray-500">{post.genre}</span>
                </>
              )}
            </div>

            <div className="mt-3">
              <StarRating rating={post.rating} />
            </div>

            {post.overview && (
              <p className="text-gray-500 text-sm mt-4 italic">{post.overview}</p>
            )}

            {post.comment && (
              <p className="text-gray-300 mt-4">"{post.comment}"</p>
            )}

            {/* User */}
            <button
              onClick={() => navigate(`/user/${post.user_id}`)}
              className="flex items-center gap-2 mt-4 hover:opacity-80 transition-opacity"
            >
              <UserAvatar
                avatar={post.profiles?.avatar}
                color={post.profiles?.avatar_color}
                username={post.profiles?.username}
                size="sm"
              />
              <span className="text-sm text-gray-400">
                {post.profiles?.username || 'Usuario'}
              </span>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs text-gray-600">
                {new Date(post.created_at).toLocaleDateString('es-AR')}
              </span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  liked
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
                }`}
              >
                {liked ? (
                  <Icons.HeartFilled className="w-5 h-5" />
                ) : (
                  <Icons.Heart className="w-5 h-5" />
                )}
                <span className="font-medium">{likesCount} Me gusta</span>
              </button>

              <div className="flex items-center gap-2 text-gray-500">
                <Icons.MessageSquare className="w-5 h-5" />
                <span>{comments.length} Comentarios</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment form */}
      <div className="card mb-6">
        <form onSubmit={handleComment} className="flex gap-3">
          <UserAvatar
            avatar={user?.user_metadata?.avatar}
            color={user?.user_metadata?.avatar_color}
            username={user?.user_metadata?.username || user?.email}
            size="md"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribí un comentario..."
              className="input min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-600">{newComment.length}/500</span>
              <button
                type="submit"
                disabled={!newComment.trim() || sending}
                className="btn btn-primary text-sm disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Comentar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No hay comentarios todavía. ¡Sé el primero!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="card">
              <div className="flex gap-3">
                <button onClick={() => navigate(`/user/${comment.user_id}`)}>
                  <UserAvatar
                    avatar={comment.profiles?.avatar}
                    color={comment.profiles?.avatar_color}
                    username={comment.profiles?.username}
                    size="md"
                  />
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/user/${comment.user_id}`)}
                      className="font-medium text-white hover:text-brand transition-colors"
                    >
                      {comment.profiles?.username || 'Usuario'}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">
                        {new Date(comment.created_at).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {comment.user_id === user?.id && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 mt-1">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
