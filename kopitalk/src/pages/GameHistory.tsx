import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameStorage } from '../utils/gameStorage'
import { GameSession } from '../types'
import { Coffee, MessageCircle, Sparkles, Users, Clock, Trophy } from 'lucide-react'

const GameHistory: React.FC = () => {
  const [games, setGames] = useState<GameSession[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setGames(gameStorage.getGames())
  }, [])

  const startNewGame = () => {
    navigate('/game')
  }

  const continueGame = (sessionId: string) => {
    navigate(`/game/${sessionId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kopi-50 via-white to-talk-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-kopi-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-talk-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <Coffee className="w-8 h-8 text-kopi-500" />
            <h1 className="text-6xl font-bold gradient-text">KopiTalk</h1>
            <MessageCircle className="w-8 h-8 text-talk-500" />
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Bridge generations through meaningful conversations and fun challenges. 
            A digital companion for real-life family bonding.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            {/* Kopi (Traditional) Card */}
            <div className="card-hover bg-gradient-to-br from-kopi-500 to-kopi-600 p-8 rounded-2xl text-white shadow-lg">
              <Coffee className="w-12 h-12 mb-4 mx-auto opacity-90" />
              <h3 className="text-2xl font-bold mb-3">Kopi</h3>
              <p className="opacity-90 mb-4">Traditional connections through storytelling, wisdom sharing, and cultural heritage.</p>
              <div className="flex items-center justify-center gap-2 text-kopi-100">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Cultural Storytelling</span>
              </div>
            </div>

            {/* Talk (Modern) Card */}
            <div className="card-hover bg-gradient-to-br from-talk-500 to-talk-600 p-8 rounded-2xl text-white shadow-lg">
              <MessageCircle className="w-12 h-12 mb-4 mx-auto opacity-90" />
              <h3 className="text-2xl font-bold mb-3">Talk</h3>
              <p className="opacity-90 mb-4">Modern conversations with AI-powered topics, TikTok trends, and digital challenges.</p>
              <div className="flex items-center justify-center gap-2 text-talk-100">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">AI-Powered Analysis</span>
              </div>
            </div>
          </div>

          {/* Start New Game Button */}
          <button
            onClick={startNewGame}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-kopi-500 via-purple-500 to-talk-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Users className="w-6 h-6" />
            Start New Family Adventure
            <Sparkles className="w-6 h-6" />
          </button>
        </div>

        {/* Game History */}
        {games.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Continue Previous Adventures
            </h2>
            
            <div className="grid gap-4">
              {games.map((game) => (
                <div
                  key={game.id}
                  onClick={() => continueGame(game.id)}
                  className="card-hover bg-white p-6 rounded-xl shadow-md border border-gray-100 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-kopi-500 to-talk-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {game.family_members.map(m => m.name).join(', ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)} • 
                          ${game.family_budget} budget • 
                          {game.family_members.length} players
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatDate(game.last_updated)}</p>
                      <p className="text-xs text-gray-400 capitalize">{game.game_phase.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameHistory