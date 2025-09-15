import React, { useState } from 'react'
import { Users, Sparkles, Crown, Heart } from 'lucide-react'

interface Player {
  name: string
  role: 'son' | 'daughter' | 'grandfather' | 'grandmother'
}

interface Props {
  onSetupComplete: (difficulty: string, players: Player[]) => void
}

const FamilySetup: React.FC<Props> = ({ onSetupComplete }) => {
  const [difficulty, setDifficulty] = useState('medium')
  const [players, setPlayers] = useState<Player[]>([
    { name: '', role: 'grandfather' },
    { name: '', role: 'son' }
  ])

  const difficulties = [
    { id: 'easy', label: 'Easy', budget: 150, color: 'bg-green-500', description: 'Perfect for first-time players' },
    { id: 'medium', label: 'Medium', budget: 100, color: 'bg-yellow-500', description: 'Balanced challenge for most families' },
    { id: 'hard', label: 'Hard', budget: 75, color: 'bg-orange-500', description: 'Requires strategic thinking' },
    { id: 'expert', label: 'Expert', budget: 50, color: 'bg-red-500', description: 'For experienced players only' }
  ]

  const roles = [
    { id: 'grandfather', label: 'Grandfather', icon: Crown, type: 'senior' },
    { id: 'grandmother', label: 'Grandmother', icon: Heart, type: 'senior' },
    { id: 'son', label: 'Son', icon: Users, type: 'young' },
    { id: 'daughter', label: 'Daughter', icon: Sparkles, type: 'young' }
  ]

  const updatePlayer = (index: number, field: keyof Player, value: string) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setPlayers(newPlayers)
  }

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, { name: '', role: 'son' }])
    }
  }

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index))
    }
  }

  const canStart = () => {
    const allNamed = players.every(p => p.name.trim().length > 0)
    const hasYoung = players.some(p => ['son', 'daughter'].includes(p.role))
    const hasSenior = players.some(p => ['grandfather', 'grandmother'].includes(p.role))
    return allNamed && hasYoung && hasSenior
  }

  const handleStart = () => {
    if (canStart()) {
      onSetupComplete(difficulty, players)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kopi-50 via-white to-talk-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">Family Setup</h1>
            <p className="text-gray-600">Configure your family for the KopiTalk adventure</p>
          </div>

          {/* Difficulty Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Difficulty</h2>
            <div className="grid grid-cols-2 gap-4">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    difficulty === diff.id
                      ? 'border-kopi-500 bg-kopi-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${diff.color}`} />
                    <span className="font-medium text-gray-800">{diff.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">${diff.budget} starting budget</p>
                  <p className="text-xs text-gray-500">{diff.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Player Setup */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Family Members</h2>
              {players.length < 4 && (
                <button
                  onClick={addPlayer}
                  className="text-kopi-500 hover:text-kopi-600 text-sm font-medium"
                >
                  + Add Player
                </button>
              )}
            </div>

            <div className="space-y-4">
              {players.map((player, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={player.name}
                      onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopi-500"
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      value={player.role}
                      onChange={(e) => updatePlayer(index, 'role', e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kopi-500"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {players.length > 2 && (
                    <button
                      onClick={() => removePlayer(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Validation Message */}
            {!canStart() && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Please ensure all players have names and you have at least one young member (Son/Daughter) and one senior member (Grandfather/Grandmother).
                </p>
              </div>
            )}
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!canStart()}
            className={`w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all ${
              canStart()
                ? 'bg-gradient-to-r from-kopi-500 to-talk-500 hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Start Family Adventure
          </button>
        </div>
      </div>
    </div>
  )
}

export default FamilySetup