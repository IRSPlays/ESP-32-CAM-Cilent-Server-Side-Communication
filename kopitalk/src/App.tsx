import React from 'react'
import { Routes, Route } from 'react-router-dom'
import GameHistory from './pages/GameHistory'
import BoardGame from './pages/BoardGame'
import DeliveryApp from './pages/DeliveryApp'
import CookingGame from './pages/CookingGame'
import BusTimings from './pages/BusTimings'
import EZLinkTopUp from './pages/EZLinkTopUp'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<GameHistory />} />
        <Route path="/game/:sessionId?" element={<BoardGame />} />
        <Route path="/delivery" element={<DeliveryApp />} />
        <Route path="/cooking" element={<CookingGame />} />
        <Route path="/bus" element={<BusTimings />} />
        <Route path="/ezlink" element={<EZLinkTopUp />} />
      </Routes>
    </div>
  )
}

export default App