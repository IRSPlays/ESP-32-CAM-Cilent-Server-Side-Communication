import React from 'react'

const DeliveryApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kopi-50 via-white to-talk-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">Delivery App (Placeholder)</h1>
        <p className="text-gray-600 mb-4">Plan deliveries, estimate ETAs and costs. Integration coming next.</p>
        <div className="grid gap-3">
          <div className="p-4 rounded-xl border">Route planner UI goes here</div>
          <div className="p-4 rounded-xl border">Order list / status</div>
          <div className="p-4 rounded-xl border">Map mock</div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryApp
