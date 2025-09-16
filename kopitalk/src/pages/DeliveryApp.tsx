import React, { useState } from 'react'
import { ArrowLeft, Package, Clock, MapPin, Truck, Star, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Order {
  id: string
  restaurant: string
  items: string[]
  address: string
  distance: string
  estimatedTime: string
  price: number
  rating: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
}

const DeliveryApp: React.FC = () => {
  const navigate = useNavigate()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const mockOrders: Order[] = [
    {
      id: '1',
      restaurant: 'Old Chang Kee',
      items: ['Curry Puff', 'Ice Cream Puff', 'Sardine Puff'],
      address: 'Causeway Point, Woodlands',
      distance: '2.3 km',
      estimatedTime: '25-35 min',
      price: 8.50,
      rating: 4.5,
      status: 'preparing'
    },
    {
      id: '2', 
      restaurant: 'Ya Kun Kaya Toast',
      items: ['Kaya Toast Set', 'Kopi O', 'Half-boiled Eggs'],
      address: 'Junction 8, Bishan',
      distance: '4.1 km',
      estimatedTime: '30-40 min', 
      price: 12.80,
      rating: 4.7,
      status: 'ready'
    },
    {
      id: '3',
      restaurant: 'Hawker Centre',
      items: ['Chicken Rice', 'Laksa', 'Ice Kachang'],
      address: 'Toa Payoh Central',
      distance: '3.8 km',
      estimatedTime: '35-45 min',
      price: 15.20,
      rating: 4.3,
      status: 'pending'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'preparing': return Package
      case 'ready': return Truck
      case 'delivered': return Home
      default: return Clock
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Singapore Delivery</h1>
            <p className="text-gray-600">Track your family's food orders</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Orders</h2>
            
            {mockOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status)
              
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.restaurant}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{order.rating}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600">{order.distance}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Items:</p>
                    <p className="text-sm text-gray-800">{order.items.join(', ')}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {order.address}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{order.estimatedTime}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {selectedOrder ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedOrder.restaurant}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{selectedOrder.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{selectedOrder.distance} away</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Items Ordered</h4>
                    <div className="space-y-1">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">${(selectedOrder.price * 0.9).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-gray-900">${(selectedOrder.price * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span>${selectedOrder.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Estimated Delivery</span>
                    </div>
                    <p className="text-blue-800">{selectedOrder.estimatedTime}</p>
                    <p className="text-sm text-blue-600 mt-1">To: {selectedOrder.address}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order</h3>
                <p className="text-gray-500">Click on an order from the left to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Singapore Family Favorites</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Chicken Rice', time: '20-30 min', price: '$4.50' },
              { name: 'Laksa', time: '25-35 min', price: '$6.80' },
              { name: 'Char Kway Teow', time: '22-32 min', price: '$5.50' },
              { name: 'Bak Kut Teh', time: '30-40 min', price: '$8.90' }
            ].map((dish, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                <h4 className="font-medium text-gray-900 text-sm">{dish.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{dish.time}</p>
                <p className="text-sm font-semibold text-blue-600 mt-1">{dish.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryApp
