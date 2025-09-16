import React, { useState, useEffect } from 'react'
import { ArrowLeft, Bus, Clock, MapPin, RefreshCw, Navigation, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BusService {
  service_no: string
  operator: string
  route: string
  next_bus: string
  subsequent_bus: string
  status: 'Operating' | 'Not Operating'
}

interface BusStop {
  id: string
  name: string
  road: string
  services: BusService[]
  is_favorite: boolean
}

const BusTimings: React.FC = () => {
  const navigate = useNavigate()
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [favoriteStops, setFavoriteStops] = useState<string[]>(['01012', '01013'])

  const busStops: BusStop[] = [
    {
      id: '01012',
      name: 'Opp Raffles Hotel',
      road: 'Beach Rd',
      is_favorite: true,
      services: [
        { service_no: '7', operator: 'SBST', route: 'Marina Centre ⟷ Changi Airport', next_bus: '3 min', subsequent_bus: '12 min', status: 'Operating' },
        { service_no: '36', operator: 'SBST', route: 'Orchard ⟷ Changi Airport', next_bus: '8 min', subsequent_bus: '18 min', status: 'Operating' },
        { service_no: '56', operator: 'SBST', route: 'Orchard ⟷ Changi Airport', next_bus: '15 min', subsequent_bus: '25 min', status: 'Operating' },
        { service_no: '75', operator: 'SBST', route: 'Bishan Int ⟷ Changi Airport', next_bus: '6 min', subsequent_bus: '16 min', status: 'Operating' }
      ]
    },
    {
      id: '01013',
      name: 'Raffles Hotel',
      road: 'Beach Rd',
      is_favorite: true,
      services: [
        { service_no: '7', operator: 'SBST', route: 'Marina Centre ⟷ Changi Airport', next_bus: '5 min', subsequent_bus: '14 min', status: 'Operating' },
        { service_no: '36', operator: 'SBST', route: 'Orchard ⟷ Changi Airport', next_bus: '10 min', subsequent_bus: '20 min', status: 'Operating' },
        { service_no: '56', operator: 'SBST', route: 'Orchard ⟷ Changi Airport', next_bus: '17 min', subsequent_bus: '27 min', status: 'Operating' },
        { service_no: '75', operator: 'SBST', route: 'Bishan Int ⟷ Changi Airport', next_bus: '2 min', subsequent_bus: '12 min', status: 'Operating' }
      ]
    },
    {
      id: '04168',
      name: 'Marina Bay Sands',
      road: 'Bayfront Ave',
      is_favorite: false,
      services: [
        { service_no: '97', operator: 'SBST', route: 'Toa Payoh Int ⟷ Marina Bay', next_bus: '4 min', subsequent_bus: '12 min', status: 'Operating' },
        { service_no: '106', operator: 'SBST', route: 'Shenton Way ⟷ Marina Bay', next_bus: '7 min', subsequent_bus: '15 min', status: 'Operating' },
        { service_no: '133', operator: 'SBST', route: 'Ang Mo Kio ⟷ Marina Bay', next_bus: '9 min', subsequent_bus: '19 min', status: 'Operating' }
      ]
    },
    {
      id: '02031',
      name: 'Orchard Towers',
      road: 'Orchard Rd',
      is_favorite: false,
      services: [
        { service_no: '14', operator: 'SBST', route: 'Bedok Int ⟷ Orchard', next_bus: '6 min', subsequent_bus: '16 min', status: 'Operating' },
        { service_no: '16', operator: 'SBST', route: 'Bedok North Depot ⟷ Orchard', next_bus: '11 min', subsequent_bus: '21 min', status: 'Operating' },
        { service_no: '65', operator: 'SBST', route: 'Tampines Int ⟷ Orchard', next_bus: '3 min', subsequent_bus: '13 min', status: 'Operating' },
        { service_no: '111', operator: 'SBST', route: 'Ghim Moh Depot ⟷ Orchard', next_bus: '8 min', subsequent_bus: '18 min', status: 'Operating' }
      ]
    },
    {
      id: '50009',
      name: 'Chinatown Point',
      road: 'New Bridge Rd',
      is_favorite: false,
      services: [
        { service_no: '61', operator: 'SBST', route: 'Eunos Int ⟷ Chinatown', next_bus: '5 min', subsequent_bus: '15 min', status: 'Operating' },
        { service_no: '124', operator: 'SBST', route: 'Punggol Temp Int ⟷ Chinatown', next_bus: '12 min', subsequent_bus: '22 min', status: 'Operating' },
        { service_no: '143', operator: 'SBST', route: 'Upper East Coast ⟷ Chinatown', next_bus: '7 min', subsequent_bus: '17 min', status: 'Operating' }
      ]
    },
    {
      id: '28009',
      name: 'Bugis Junction',
      road: 'Victoria St',
      is_favorite: false,
      services: [
        { service_no: '2', operator: 'SBST', route: 'Changi Village ⟷ Genting Lane', next_bus: '4 min', subsequent_bus: '14 min', status: 'Operating' },
        { service_no: '12', operator: 'SBST', route: 'Jurong East Int ⟷ Bugis', next_bus: '9 min', subsequent_bus: '19 min', status: 'Operating' },
        { service_no: '51', operator: 'SBST', route: 'Tampines Int ⟷ Bugis', next_bus: '6 min', subsequent_bus: '16 min', status: 'Operating' },
        { service_no: '63', operator: 'SBST', route: 'Eunos Int ⟷ Bugis', next_bus: '11 min', subsequent_bus: '21 min', status: 'Operating' }
      ]
    }
  ]

  const filteredStops = busStops.filter(stop => 
    stop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stop.road.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stop.services.some(service => service.service_no.includes(searchQuery))
  )

  const refreshTimings = async () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  const toggleFavorite = (stopId: string) => {
    setFavoriteStops(prev => 
      prev.includes(stopId) 
        ? prev.filter(id => id !== stopId)
        : [...prev, stopId]
    )
  }

  const getTimingColor = (timing: string) => {
    if (timing.includes('Arr') || timing === 'Arriving') return 'text-green-600'
    const minutes = parseInt(timing)
    if (minutes <= 3) return 'text-orange-600'
    if (minutes <= 8) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getOperatorColor = (operator: string) => {
    switch (operator) {
      case 'SBST': return 'bg-blue-100 text-blue-800'
      case 'SMRT': return 'bg-red-100 text-red-800'
      case 'Tower Transit': return 'bg-green-100 text-green-800'
      case 'Go-Ahead': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    // Update bus stop favorite status
    busStops.forEach(stop => {
      stop.is_favorite = favoriteStops.includes(stop.id)
    })
  }, [favoriteStops])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bus Timings</h1>
                <p className="text-gray-600">Real-time bus arrival information</p>
              </div>
              <button
                onClick={refreshTimings}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bus Stop List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search bus stops or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Bus className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {favoriteStops.length > 0 && 'Favorite Stops'}
                </h3>
                
                {filteredStops
                  .filter(stop => favoriteStops.includes(stop.id))
                  .map((stop) => (
                    <div
                      key={stop.id}
                      onClick={() => setSelectedStop(stop)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStop?.id === stop.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{stop.name}</h4>
                            {favoriteStops.includes(stop.id) && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{stop.road}</p>
                          <p className="text-xs text-gray-500">Stop ID: {stop.id}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(stop.id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Star className={`w-4 h-4 ${
                            favoriteStops.includes(stop.id) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`} />
                        </button>
                      </div>
                    </div>
                  ))
                }

                <h3 className="font-semibold text-gray-900 mb-3 mt-6">All Stops</h3>
                {filteredStops
                  .filter(stop => !favoriteStops.includes(stop.id))
                  .map((stop) => (
                    <div
                      key={stop.id}
                      onClick={() => setSelectedStop(stop)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStop?.id === stop.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{stop.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{stop.road}</p>
                          <p className="text-xs text-gray-500">Stop ID: {stop.id}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(stop.id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Star className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Bus Service Details */}
          <div className="lg:col-span-2">
            {selectedStop ? (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {selectedStop.name}
                      </h2>
                      <p className="text-gray-600">{selectedStop.road}</p>
                      <p className="text-sm text-gray-500">Bus Stop {selectedStop.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {selectedStop.services.map((service) => (
                      <div
                        key={service.service_no}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="bg-white px-3 py-1 rounded-full border-2 border-gray-200">
                              <span className="font-bold text-gray-900 text-lg">{service.service_no}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOperatorColor(service.operator)}`}>
                              {service.operator}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.status === 'Operating' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {service.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{service.route}</p>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Bus className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-medium text-gray-600">Next Bus</span>
                            </div>
                            <div className={`font-bold text-lg ${getTimingColor(service.next_bus)}`}>
                              {service.next_bus}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-xs font-medium text-gray-600">Following</span>
                            </div>
                            <div className={`font-bold text-lg ${getTimingColor(service.subsequent_bus)}`}>
                              {service.subsequent_bus}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Bus Stop</h3>
                <p className="text-gray-600">
                  Choose a bus stop from the list to view real-time arrival information
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Family Info Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <Navigation className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Teaching Navigation Skills
              </h3>
              <p className="text-blue-800 mb-3">
                This bus timing feature helps families plan their journeys together and teaches children about public transportation in Singapore.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <strong className="text-blue-900">Family Tip:</strong> Let children help identify which bus to take and estimate journey times
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <strong className="text-blue-900">Learning Goal:</strong> Understanding public transport builds independence and confidence
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusTimings
