import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameStorage } from '../utils/gameStorage'
import { GameSession } from '../types'
import FamilySetup from '../components/FamilySetup'
import GameplayInterface from '../components/GameplayInterface'

const BoardGame: React.FC = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [gameSession, setGameSession] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // Load existing game
      const game = gameStorage.getGame(sessionId)
      if (game) {
        setGameSession(game)
      } else {
        // Game not found, redirect to home
        navigate('/')
        return
      }
    } else {
      // Create new game - start with family setup
      setGameSession({
        id: `game_${Date.now()}`,
        difficulty: 'medium',
        family_budget: 100,
        family_members: [],
        game_phase: 'family_setup',
        current_player_index: 0,
        game_scenario: null,
        created_date: new Date().toISOString(),
        last_updated: new Date().toISOString()
      })
    }
    setLoading(false)
  }, [sessionId, navigate])

  const updateGameSession = (updates: Partial<GameSession>) => {
    if (!gameSession) return
    
    const updatedGame = {
      ...gameSession,
      ...updates,
      last_updated: new Date().toISOString()
    }
    
    setGameSession(updatedGame)
    gameStorage.saveGame(updatedGame)
    
    // Update URL if we just created a new game
    if (!sessionId && updatedGame.id) {
      navigate(`/game/${updatedGame.id}`, { replace: true })
    }
  }

  const handleFamilySetupComplete = (difficulty: string, players: any[]) => {
    const budgetMap: Record<string, number> = {
      easy: 150,
      medium: 100,
      hard: 75,
      expert: 50
    }

    updateGameSession({
      difficulty,
      family_budget: budgetMap[difficulty],
      family_members: players.map((player, index) => ({
        ...player,
        position: 0,
        points: 0,
        cash: 0,
        ezlink_balance: 0
      })),
      game_phase: 'gameplay',
      current_player_index: 0
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kopi-50 to-talk-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kopi-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kopi-50 to-talk-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Game not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-kopi-500 text-white px-6 py-2 rounded-lg hover:bg-kopi-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  // Render based on game phase
  switch (gameSession.game_phase) {
    case 'family_setup':
      return (
        <FamilySetup
          onSetupComplete={handleFamilySetupComplete}
        />
      )
    
    case 'gameplay':
      return (
        <GameplayInterface
          gameSession={gameSession}
          onUpdateGame={updateGameSession}
        />
      )
    
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-kopi-50 to-talk-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Unknown game phase: {gameSession.game_phase}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-kopi-500 text-white px-6 py-2 rounded-lg hover:bg-kopi-600 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      )
  }
}

export default BoardGame