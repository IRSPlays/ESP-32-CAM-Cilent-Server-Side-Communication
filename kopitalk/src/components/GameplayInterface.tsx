import React, { useState } from 'react'
import { GameSession, FamilyMember } from '../types'
import { 
  Users, 
  Mic, 
  Camera, 
  ShoppingCart, 
  Dice1, 
  Dice2, 
  Dice3, 
  Dice4, 
  Dice5, 
  Dice6, 
  Crown,
  Heart,
  Sparkles,
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
  ChefHat
} from 'lucide-react'
import AudioRecordingModal from './AudioRecordingModal'
import TikTokRecordingModal from './TikTokRecordingModal'

interface Props {
  gameSession: GameSession
  onUpdateGame: (updates: Partial<GameSession>) => void
}

const GameplayInterface: React.FC<Props> = ({ gameSession, onUpdateGame }) => {
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [showTikTokModal, setShowTikTokModal] = useState(false)
  const [diceRoll, setDiceRoll] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)

  // Markets data
  const markets = [
    {
      id: 'causeway',
      name: 'Causeway Point Supermarket',
      type: 'supermarket',
      availability: 85,
      pricing: 'Higher prices, but good selection',
      queue: 'Short queues',
      special: '10% discount on weekends',
      color: 'bg-blue-500'
    },
    {
      id: 'wet_market',
      name: 'Central Wet Market',
      type: 'wet_market', 
      availability: 95,
      pricing: 'Best prices for fresh goods',
      queue: 'Crowded mornings',
      special: 'Cash only, haggling allowed',
      color: 'bg-green-500'
    },
    {
      id: 'redmart',
      name: 'RedMart Online',
      type: 'online',
      availability: 70,
      pricing: 'Competitive online prices',
      queue: '2-hour delivery',
      special: '$8 delivery fee',
      color: 'bg-red-500'
    },
    {
      id: 'freshdirect',
      name: 'FreshDirect Online', 
      type: 'online',
      availability: 80,
      pricing: 'Premium quality, higher cost',
      queue: '1-hour delivery',
      special: '$6 delivery fee, premium quality',
      color: 'bg-purple-500'
    }
  ]

  const currentPlayer = gameSession.family_members[gameSession.current_player_index]
  const nextPlayerIndex = (gameSession.current_player_index + 1) % gameSession.family_members.length

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'grandfather': return Crown
      case 'grandmother': return Heart
      case 'son': return Users
      case 'daughter': return Sparkles
      default: return Users
    }
  }

  const updatePlayer = (playerId: number, updates: Partial<FamilyMember>) => {
    const updatedMembers = gameSession.family_members.map((member, index) => 
      index === playerId ? { ...member, ...updates } : member
    )
    onUpdateGame({ family_members: updatedMembers })
  }

  const nextTurn = () => {
    onUpdateGame({ 
      current_player_index: nextPlayerIndex,
      last_updated: new Date().toISOString()
    })
    setDiceRoll(null)
  }

  const rollDice = () => {
    setIsRolling(true)
    
    // Animate dice roll
    let count = 0
    const interval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1)
      count++
      
      if (count > 10) {
        clearInterval(interval)
        const finalRoll = Math.floor(Math.random() * 6) + 1
        setDiceRoll(finalRoll)
        setIsRolling(false)
        
        // Move current player
        const newPosition = Math.min(currentPlayer.position + finalRoll, 20)
        updatePlayer(gameSession.current_player_index, { position: newPosition })
        
        // Auto advance turn after 2 seconds
        setTimeout(() => {
          nextTurn()
        }, 2000)
      }
    }, 100)
  }

  const handleAudioAnalysis = (result: { quality: number; movement: number; earnings: number; feedback: string }) => {
    // Update current player with results
    updatePlayer(gameSession.current_player_index, {
      position: Math.min(currentPlayer.position + result.movement, 20),
      points: currentPlayer.points + result.quality,
      cash: currentPlayer.cash + result.earnings
    })
    
    setShowAudioModal(false)
    
    // Show success message
    alert(`${result.feedback}\nEarned: $${result.earnings}\nMoved: ${result.movement} spaces`)
    
    // Auto advance turn
    setTimeout(nextTurn, 1000)
  }

  const handleTikTokEarnings = (result: { earnings: number; feedback: string; performance_score: number }) => {
    // Update current player with earnings
    updatePlayer(gameSession.current_player_index, {
      cash: currentPlayer.cash + result.earnings,
      points: currentPlayer.points + result.performance_score
    })
    
    setShowTikTokModal(false)
    
    // Show success message
    alert(`${result.feedback}\nEarned: $${result.earnings}!`)
    
    // Auto advance turn
    setTimeout(nextTurn, 1000)
  }

  const handleMarketShopping = (marketId: string) => {
    const market = markets.find(m => m.id === marketId)
    if (!market) return
    
    // Simple shopping simulation
    const cost = Math.floor(Math.random() * 30) + 20 // $20-50
    const earnings = Math.floor(cost * 0.1) + 5 // Small profit
    
    if (currentPlayer.cash >= cost) {
      updatePlayer(gameSession.current_player_index, {
        cash: currentPlayer.cash - cost + earnings
      })
      alert(`Shopped at ${market.name}!\nSpent: $${cost}\nEarned from reselling: $${earnings}`)
    } else {
      alert(`Not enough cash! You need $${cost} but only have $${currentPlayer.cash}`)
    }
  }

  const getDiceIcon = (number: number | null) => {
    if (!number) return Dice1
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
    return icons[number - 1]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kopi-50 via-white to-talk-50">
      <div className="container mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                <ChefHat className="w-6 h-6" />
                Today's Family Challenge!
              </h1>
              <p className="text-gray-600">Cook Grandma's Secret Laksa Recipe Together</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Family Budget</p>
              <p className="text-2xl font-bold text-green-600">${gameSession.family_budget}</p>
            </div>
          </div>
        </div>

        {/* Current Turn Indicator */}
        <div className="bg-gradient-to-r from-kopi-500 to-talk-500 rounded-2xl p-4 shadow-lg mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {React.createElement(getRoleIcon(currentPlayer.role), { className: "w-8 h-8" })}
              <div>
                <h2 className="text-xl font-bold">{currentPlayer.name}'s Turn</h2>
                <p className="opacity-90 text-sm">Choose an action to take</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Next: {gameSession.family_members[nextPlayerIndex].name}</p>
              <div className="flex items-center gap-2 mt-1">
                <ArrowRight className="w-4 h-4" />
                <span className="font-medium">{gameSession.family_members[nextPlayerIndex].role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Players Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Family Members
              </h2>
              
              <div className="space-y-4">
                {gameSession.family_members.map((member, index) => {
                  const Icon = getRoleIcon(member.role)
                  const isCurrentPlayer = index === gameSession.current_player_index
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isCurrentPlayer 
                          ? 'border-kopi-500 bg-kopi-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-6 h-6 ${isCurrentPlayer ? 'text-kopi-600' : 'text-gray-600'}`} />
                        <div>
                          <h3 className="font-semibold text-gray-800">{member.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                        </div>
                        {isCurrentPlayer && (
                          <div className="ml-auto bg-kopi-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                            TURN
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Cash:</span>
                          <span className="font-medium text-green-600"> ${member.cash}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Position:</span>
                          <span className="font-medium"> {member.position}/20</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Points:</span>
                          <span className="font-medium text-blue-600"> {member.points}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">EZ-Link:</span>
                          <span className="font-medium"> ${member.ezlink_balance}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Available Actions</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                
                {/* Audio Recording */}
                <button
                  onClick={() => setShowAudioModal(true)}
                  className="card-hover p-6 bg-gradient-to-br from-talk-500 to-talk-600 text-white rounded-xl"
                >
                  <Mic className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">Record Conversation</h3>
                  <p className="text-sm opacity-90">Have a family discussion and earn points & movement</p>
                </button>

                {/* TikTok Recording */}
                <button
                  onClick={() => setShowTikTokModal(true)}
                  className="card-hover p-6 bg-gradient-to-br from-kopi-500 to-kopi-600 text-white rounded-xl"
                >
                  <Camera className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">TikTok Trend Challenge</h3>
                  <p className="text-sm opacity-90">Create viral content and earn $10-60</p>
                </button>

                {/* Dice Roll */}
                <button
                  onClick={rollDice}
                  disabled={isRolling}
                  className="card-hover p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl disabled:opacity-50"
                >
                  {React.createElement(getDiceIcon(diceRoll), { className: `w-8 h-8 mb-3 ${isRolling ? 'animate-bounce' : ''}` })}
                  <h3 className="font-semibold mb-2">
                    {isRolling ? 'Rolling...' : diceRoll ? `Rolled ${diceRoll}!` : 'Roll Dice'}
                  </h3>
                  <p className="text-sm opacity-90">
                    {diceRoll ? 'Turn ending...' : 'Move forward and end turn'}
                  </p>
                </button>

                {/* Market Shopping */}
                <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl">
                  <ShoppingCart className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">Visit Markets</h3>
                  <p className="text-sm opacity-90 mb-3">Shop for ingredients at different locations</p>
                </div>
              </div>

              {/* Markets Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {markets.map((market) => (
                  <button
                    key={market.id}
                    onClick={() => handleMarketShopping(market.id)}
                    className="card-hover p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${market.color}`} />
                      <h4 className="font-semibold text-gray-800 text-sm">{market.name}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{market.pricing}</p>
                    <p className="text-xs text-gray-500">{market.queue} • {market.special}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className={`w-2 h-2 rounded-full ${market.availability > 80 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                      <span className="text-xs text-gray-500">{market.availability}% available</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AudioRecordingModal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        onAnalysisComplete={handleAudioAnalysis}
      />

      <TikTokRecordingModal
        isOpen={showTikTokModal}
        onClose={() => setShowTikTokModal(false)}
        onEarningsComplete={handleTikTokEarnings}
      />
    </div>
  )
}

export default GameplayInterface