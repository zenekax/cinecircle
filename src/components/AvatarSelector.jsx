import { useState } from 'react'

// Avatares predefinidos con emojis temáticos de cine
const AVATAR_OPTIONS = [
  { id: 'popcorn', emoji: '🍿', label: 'Popcorn' },
  { id: 'movie', emoji: '🎬', label: 'Claqueta' },
  { id: 'star', emoji: '⭐', label: 'Estrella' },
  { id: 'film', emoji: '🎞️', label: 'Película' },
  { id: 'ticket', emoji: '🎟️', label: 'Ticket' },
  { id: 'tv', emoji: '📺', label: 'TV' },
  { id: 'camera', emoji: '🎥', label: 'Cámara' },
  { id: 'director', emoji: '🎭', label: 'Teatro' },
  { id: 'alien', emoji: '👽', label: 'Alien' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'ghost', emoji: '👻', label: 'Fantasma' },
  { id: 'vampire', emoji: '🧛', label: 'Vampiro' },
  { id: 'wizard', emoji: '🧙', label: 'Mago' },
  { id: 'superhero', emoji: '🦸', label: 'Superhéroe' },
  { id: 'detective', emoji: '🕵️', label: 'Detective' },
  { id: 'astronaut', emoji: '👨‍🚀', label: 'Astronauta' },
  { id: 'zombie', emoji: '🧟', label: 'Zombie' },
  { id: 'ninja', emoji: '🥷', label: 'Ninja' },
  { id: 'pirate', emoji: '🏴‍☠️', label: 'Pirata' },
  { id: 'dragon', emoji: '🐉', label: 'Dragón' },
]

// Colores de fondo para los avatares
const AVATAR_COLORS = [
  { id: 'brand', color: 'bg-brand', label: 'Verde' },
  { id: 'blue', color: 'bg-blue-500', label: 'Azul' },
  { id: 'purple', color: 'bg-purple-500', label: 'Morado' },
  { id: 'pink', color: 'bg-pink-500', label: 'Rosa' },
  { id: 'red', color: 'bg-red-500', label: 'Rojo' },
  { id: 'orange', color: 'bg-orange-500', label: 'Naranja' },
  { id: 'yellow', color: 'bg-yellow-500', label: 'Amarillo' },
  { id: 'cyan', color: 'bg-cyan-500', label: 'Cyan' },
]

export { AVATAR_OPTIONS, AVATAR_COLORS }

export default function AvatarSelector({ currentAvatar, currentColor, onSelect, onClose }) {
  const [selectedEmoji, setSelectedEmoji] = useState(currentAvatar || 'popcorn')
  const [selectedColor, setSelectedColor] = useState(currentColor || 'brand')

  const handleSave = () => {
    onSelect({ avatar: selectedEmoji, color: selectedColor })
    onClose()
  }

  const getColorClass = (colorId) => {
    return AVATAR_COLORS.find(c => c.id === colorId)?.color || 'bg-brand'
  }

  const getEmoji = (avatarId) => {
    return AVATAR_OPTIONS.find(a => a.id === avatarId)?.emoji || '🍿'
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-300 rounded-xl max-w-md w-full p-6 border border-border">
        <h3 className="text-xl font-bold text-white mb-6 text-center">Elegí tu Avatar</h3>

        {/* Preview */}
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-24 rounded-full ${getColorClass(selectedColor)} flex items-center justify-center text-5xl shadow-lg`}>
            {getEmoji(selectedEmoji)}
          </div>
        </div>

        {/* Emoji Selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">Personaje</p>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedEmoji(avatar.id)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                  selectedEmoji === avatar.id
                    ? 'bg-brand/20 ring-2 ring-brand scale-110'
                    : 'bg-dark-400 hover:bg-dark-200'
                }`}
                title={avatar.label}
              >
                {avatar.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">Color de fondo</p>
          <div className="flex gap-2 justify-center">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className={`w-10 h-10 rounded-full ${color.color} transition-all ${
                  selectedColor === color.id
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-300 scale-110'
                    : 'hover:scale-105'
                }`}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn btn-primary"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
