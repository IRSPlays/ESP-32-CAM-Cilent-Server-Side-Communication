import React from 'react'

const CookingGame: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kopi-50 via-white to-talk-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">Cooking Mini-Game (Placeholder)</h1>
        <p className="text-gray-600 mb-4">Step-by-step cooking flow with timers and scoring will be added.</p>
        <div className="grid gap-3">
          <div className="p-4 rounded-xl border">Ingredients UI</div>
          <div className="p-4 rounded-xl border">Steps & timer</div>
          <div className="p-4 rounded-xl border">Scoring</div>
        </div>
      </div>
    </div>
  )
}

export default CookingGame
