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

  ArrowRight,
  ChefHat
} from 'lucide-react'
import AudioRecordingModal from './AudioRecordingModal'
import TikTokRecordingModal from './TikTokRecordingModal'
import { ConversationAnalysis, VideoAnalysis, RandomEvent, getRandomEvent } from '../utils/geminiApi'

interface Props {
  gameSession: GameSession
  onUpdateGame: (updates: Partial<GameSession>) => void
}

const GameplayInterface: React.FC<Props> = ({ gameSession, onUpdateGame }) => {
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [showTikTokModal, setShowTikTokModal] = useState(false)
  const [diceRoll, setDiceRoll] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

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
        
        // Trigger a random event after moving
        const event = getRandomEvent()
        setCurrentEvent(event)
        setShowEventModal(true)
      }
    }, 100)
  }

  const handleAudioAnalysis = (result: ConversationAnalysis) => {
    // Update ALL family members since it's a family conversation
    const updatedMembers = gameSession.family_members.map(member => ({
      ...member,
      position: Math.min(member.position + result.movement, 20),
      points: member.points + Math.floor(result.quality / 10), // Quality points distributed
    }))
    
    // Add to family budget (conversation doesn't earn individual cash)
    onUpdateGame({ 
      family_members: updatedMembers,
      family_budget: gameSession.family_budget + Math.floor(result.movement * 2)
    })
    
    setShowAudioModal(false)
    
    // Show success message
    alert(`${result.feedback}\nFamily moved: ${result.movement} spaces\nBonding Level: ${result.bonding_level}`)
  }

  const handleTikTokEarnings = (result: VideoAnalysis) => {
    // TikTok earnings go to current family member who created the video
    const updatedMembers = gameSession.family_members.map(member => ({
      ...member,
      cash: member.cash + Math.floor(result.earnings / gameSession.family_members.length), // Distribute earnings
      points: member.points + Math.floor(result.performance_score / 10)
    }))
    
    onUpdateGame({ 
      family_members: updatedMembers,
      family_budget: gameSession.family_budget + result.earnings
    })
    
    setShowTikTokModal(false)
    
    // Show success message
    alert(`${result.feedback}\nFamily earned: $${result.earnings}!\nCreativity: ${result.creativity_level}`)
  }

  const handleRandomEvent = (event: RandomEvent) => {
    setCurrentEvent(event)
    setShowEventModal(true)
    
    // Apply event effects to all family members
    if (event.effect) {
      const updatedMembers = gameSession.family_members.map(member => ({
        ...member,
        cash: member.cash + (event.effect?.money || 0),
        position: Math.min(member.position + (event.effect?.movement || 0), 20),
        points: member.points + (event.effect?.points || 0)
      }))
      
      onUpdateGame({ family_members: updatedMembers })
    }
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
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 fade-in-up glow-pulse">
          <div className="flex items-center justify-between">
            <div className="slide-in-left">
              <h1 className="text-2xl font-bold gradient-text flex items-center gap-2 bounce-in">
                <ChefHat className="w-6 h-6 animate-bounce" />
                Today's Family Challenge!
              </h1>
              <p className="text-gray-600 shimmer">Cook Grandma's Secret Laksa Recipe Together</p>
            </div>
            <div className="text-right slide-in-right">
              <p className="text-sm text-gray-500 fade-in-up">Family Budget</p>
              <p className="text-2xl font-bold text-green-600 scale-in turn-indicator">${gameSession.family_budget}</p>
            </div>
          </div>
        </div>

        {/* Family Bonding Indicator */}
        <div className="bg-gradient-to-r from-kopi-500 to-talk-500 rounded-2xl p-4 shadow-lg mb-6 text-white turn-indicator glow-pulse bounce-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 slide-in-left">
              <Heart className="w-8 h-8 animate-pulse" />
              <div>
                <h2 className="text-xl font-bold gradient-text">Family Bonding Time</h2>
                <p className="opacity-90 text-sm shimmer">Connect across generations through conversation & fun!</p>
              </div>
            </div>
            <div className="text-right slide-in-right">
              <p className="text-sm opacity-90">Active Players</p>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 animate-pulse" />
                <span className="font-medium">{gameSession.family_members.length} Members</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Players Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg fade-in-up glow-pulse">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 bounce-in">
                <Users className="w-5 h-5 animate-pulse" />
                Family Members
              </h2>
              
              <div className="space-y-4">
                {gameSession.family_members.map((member, index) => {
                  const Icon = getRoleIcon(member.role)
                  
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-kopi-300 transition-all duration-500 card-hover bg-gradient-to-r from-kopi-25 to-talk-25"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6 text-kopi-600 animate-pulse" />
                        <div className="fade-in-up">
                          <h3 className="font-semibold text-gray-800">{member.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                        </div>
                        <div className="ml-auto bg-gradient-to-r from-kopi-500 to-talk-500 text-white px-2 py-1 rounded-full text-xs font-medium glow-pulse">
                          ACTIVE
                        </div>
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
                  className="card-hover p-6 bg-gradient-to-br from-talk-500 to-talk-600 text-white rounded-xl slide-in-left glow-pulse"
                >
                  <Mic className="w-8 h-8 mb-3 animate-pulse" />
                  <h3 className="font-semibold mb-2 bounce-in">Record Conversation</h3>
                  <p className="text-sm opacity-90 fade-in-up">Have a family discussion and move 1-5 spaces</p>
                </button>

                {/* TikTok Recording */}
                  <button
                    onClick={() => setShowTikTokModal(true)}
                    className="card-hover p-6 bg-gradient-to-br from-kopi-500 to-kopi-600 text-white rounded-xl slide-in-right glow-pulse"
                  >
                    <Camera className="w-8 h-8 mb-3 animate-bounce" />
                    <h3 className="font-semibold mb-2 bounce-in">TikTok Trend Challenge</h3>
                    <p className="text-sm opacity-90 fade-in-up">Create viral content and earn $5-10</p>
                  </button>                {/* Dice Roll */}
                <button
                  onClick={rollDice}
                  disabled={isRolling}
                  className="card-hover p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl disabled:opacity-50 fade-in-up glow-pulse"
                >
                  {React.createElement(getDiceIcon(diceRoll), { className: `w-8 h-8 mb-3 transition-all duration-300 ${isRolling ? 'animate-spin' : 'animate-pulse'}` })}
                  <h3 className="font-semibold mb-2 bounce-in">
                    {isRolling ? 'Rolling...' : diceRoll ? `Rolled ${diceRoll}!` : 'Roll Dice'}
                  </h3>
                  <p className="text-sm opacity-90 shimmer">
                    {diceRoll ? 'Turn ending...' : 'Move forward and end turn'}
                  </p>
                </button>

                {/* Market Shopping */}
                <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl scale-in glow-pulse">
                  <ShoppingCart className="w-8 h-8 mb-3 animate-bounce" />
                  <h3 className="font-semibold mb-2 bounce-in">Visit Markets</h3>
                  <p className="text-sm opacity-90 mb-3 fade-in-up">Shop for ingredients at different locations</p>
                </div>
              </div>

              {/* Markets Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {markets.map((market, index) => (
                  <button
                    key={market.id}
                    onClick={() => handleMarketShopping(market.id)}
                    className="card-hover p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left transition-all duration-500 fade-in-up glow-pulse"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${market.color} animate-pulse`} />
                      <h4 className="font-semibold text-gray-800 text-sm bounce-in">{market.name}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-1 slide-in-left">{market.pricing}</p>
                    <p className="text-xs text-gray-500 slide-in-right">{market.queue} • {market.special}</p>
                    <div className="flex items-center gap-1 mt-2 scale-in">
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${market.availability > 80 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-bounce'}`} />
                      <span className="text-xs text-gray-500 shimmer">{market.availability}% available</span>
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

      {/* Random Event Modal */}
      {showEventModal && currentEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in-up">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md scale-in glow-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">{currentEvent.emoji}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 bounce-in">{currentEvent.title}</h2>
              <p className="text-gray-600 mb-6 fade-in-up">{currentEvent.description}</p>
              
              {currentEvent.effect && (
                <div className="bg-gradient-to-r from-kopi-50 to-talk-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-4 text-sm">
                    {currentEvent.effect.money && (
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span>+${currentEvent.effect.money}</span>
                      </div>
                    )}
                    {currentEvent.effect.movement && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <ArrowRight className="w-4 h-4" />
                        <span>+{currentEvent.effect.movement} spaces</span>
                      </div>
                    )}
                    {currentEvent.effect.points && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Sparkles className="w-4 h-4" />
                        <span>+{currentEvent.effect.points} points</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => { setShowEventModal(false); setTimeout(() => nextTurn(), 300) }}
                className="px-6 py-3 bg-gradient-to-r from-kopi-500 to-talk-500 text-white rounded-xl hover:from-kopi-600 hover:to-talk-600 transition-all duration-300 hover:scale-105 glow-pulse"
              >
                Continue Family Time!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameplayInterface