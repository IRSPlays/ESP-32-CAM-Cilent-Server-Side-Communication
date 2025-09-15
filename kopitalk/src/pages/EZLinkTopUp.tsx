import React from 'react'

const EZLinkTopUp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kopi-50 via-white to-talk-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">EZ-Link Top Up (Placeholder)</h1>
        <p className="text-gray-600 mb-4">Simulate card balance and top-up flows here.</p>
        <div className="grid gap-3">
          <div className="p-4 rounded-xl border">Card selector</div>
          <div className="p-4 rounded-xl border">Balance and top-up amount</div>
          <div className="p-4 rounded-xl border">Transaction history</div>
        </div>
      </div>
    </div>
  )
}

export default EZLinkTopUp
