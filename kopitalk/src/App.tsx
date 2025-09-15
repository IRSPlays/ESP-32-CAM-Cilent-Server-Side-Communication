import React from 'react'
import { Routes, Route } from 'react-router-dom'
import GameHistory from './pages/GameHistory'
import BoardGame from './pages/BoardGame'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<GameHistory />} />
        <Route path="/game/:sessionId?" element={<BoardGame />} />
      </Routes>
    </div>
  )
}

export default App