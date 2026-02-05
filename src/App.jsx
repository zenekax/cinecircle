import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Auth from './components/Auth'
import Navbar from './components/Navbar'
import Feed from './pages/Feed'
import Recommendations from './pages/Recommendations'
import Goals from './pages/Goals'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import PostDetail from './pages/PostDetail'
import Friends from './pages/Friends'
import Messages from './pages/Messages'
import './index.css'

function AppContent() {
  const location = useLocation()
  // Ocultar navbar en la vista de chat individual
  const hideNavbar = location.pathname.startsWith('/messages/') && location.pathname !== '/messages'

  return (
    <div className="min-h-screen bg-dark-500">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:friendId" element={<Messages />} />
      </Routes>
    </div>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
