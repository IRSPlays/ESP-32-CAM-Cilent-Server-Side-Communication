import React from 'react'

const BusTimings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kopi-50 via-white to-talk-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">Bus Timings (Placeholder)</h1>
        <p className="text-gray-600 mb-4">Show nearby bus arrivals; mock data first, API later.</p>
        <div className="grid gap-3">
          <div className="p-4 rounded-xl border">Bus stop selector</div>
          <div className="p-4 rounded-xl border">Bus arrivals list</div>
        </div>
      </div>
    </div>
  )
}

export default BusTimings
