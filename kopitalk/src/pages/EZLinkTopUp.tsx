import React, { useState, useEffect } from 'react'
import { ArrowLeft, CreditCard, DollarSign, History, Smartphone, MapPin, Bus, Train, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Transaction {
  id: string
  type: 'top_up' | 'deduction' | 'transfer'
  amount: number
  description: string
  location: string
  datetime: string
  balance_after: number
}

interface EZLinkCard {
  card_number: string
  balance: number
  card_type: 'Adult' | 'Student' | 'Senior'
  expiry_date: string
  last_used: string
  status: 'Active' | 'Blocked' | 'Expired'
}

const EZLinkTopUp: React.FC = () => {
  const navigate = useNavigate()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'topup' | 'history' | 'balance'>('balance')
  const [isProcessing, setIsProcessing] = useState(false)

  const ezlinkCard: EZLinkCard = {
    card_number: '1234 5678 9012 3456',
    balance: 12.45,
    card_type: 'Adult',
    expiry_date: '2027-12-31',
    last_used: '2024-01-15 14:30:00',
    status: 'Active'
  }

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'deduction',
      amount: -2.20,
      description: 'Bus Service 7',
      location: 'Raffles Hotel',
      datetime: '2024-01-15 14:30',
      balance_after: 12.45
    },
    {
      id: '2',
      type: 'deduction',
      amount: -1.50,
      description: 'MRT Journey',
      location: 'City Hall MRT',
      datetime: '2024-01-15 09:15',
      balance_after: 14.65
    },
    {
      id: '3',
      type: 'top_up',
      amount: 20.00,
      description: 'Top-up via Mobile App',
      location: 'Online',
      datetime: '2024-01-14 16:00',
      balance_after: 16.15
    },
    {
      id: '4',
      type: 'deduction',
      amount: -1.80,
      description: 'Bus Service 133',
      location: 'Marina Bay Sands',
      datetime: '2024-01-14 12:45',
      balance_after: -3.85
    },
    {
      id: '5',
      type: 'top_up',
      amount: 50.00,
      description: 'Top-up at MRT Station',
      location: 'Orchard MRT',
      datetime: '2024-01-13 18:20',
      balance_after: -2.05
    }
  ]

  const topUpAmounts = [5, 10, 20, 30, 50, 100]

  const handleTopUp = async () => {
    const amount = selectedAmount || parseFloat(customAmount)
    if (!amount || amount < 1 || amount > 500) {
      alert('Please select or enter a valid amount between $1 and $500')
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setShowSuccess(true)
      setSelectedAmount(null)
      setCustomAmount('')
      
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 2000)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'top_up': return <DollarSign className="w-4 h-4 text-green-600" />
      case 'deduction': return <CreditCard className="w-4 h-4 text-red-600" />
      case 'transfer': return <ArrowLeft className="w-4 h-4 text-blue-600" />
      default: return <CreditCard className="w-4 h-4 text-gray-600" />
    }
  }

  const getBalanceColor = (balance: number) => {
    if (balance < 5) return 'text-red-600'
    if (balance < 15) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
            <h1 className="text-2xl font-bold text-gray-900">EZ-Link Card</h1>
            <p className="text-gray-600">Manage your Singapore transport card</p>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Top-up Successful!</h3>
                <p className="text-gray-600 mb-4">
                  Your EZ-Link card has been topped up successfully.
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Card Information */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">EZ-Link Card</h3>
                  <p className="text-blue-100">{ezlinkCard.card_type}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-200" />
              </div>
              
              <div className="mb-6">
                <p className="text-blue-100 text-sm mb-1">Card Number</p>
                <p className="font-mono text-lg">{ezlinkCard.card_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-100">Expires</p>
                  <p className="font-semibold">12/27</p>
                </div>
                <div>
                  <p className="text-blue-100">Status</p>
                  <p className="font-semibold">{ezlinkCard.status}</p>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Current Balance</p>
                <p className={`text-3xl font-bold mb-4 ${getBalanceColor(ezlinkCard.balance)}`}>
                  ${ezlinkCard.balance.toFixed(2)}
                </p>
                
                {ezlinkCard.balance < 5 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-800 text-sm font-medium">Low Balance</span>
                    </div>
                    <p className="text-red-700 text-xs mt-1">
                      Consider topping up your card to avoid inconvenience
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Last used: {new Date(ezlinkCard.last_used).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('balance')}
                  className={`flex-1 px-4 py-3 font-medium text-sm ${
                    activeTab === 'balance'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Balance & Info
                </button>
                <button
                  onClick={() => setActiveTab('topup')}
                  className={`flex-1 px-4 py-3 font-medium text-sm ${
                    activeTab === 'topup'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Top Up
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-4 py-3 font-medium text-sm ${
                    activeTab === 'history'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Transaction History
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'balance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        What can you do with EZ-Link?
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3 mb-2">
                            <Bus className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">Public Buses</span>
                          </div>
                          <p className="text-blue-800 text-sm">
                            Pay for bus rides across Singapore with automatic fare deduction
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3 mb-2">
                            <Train className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-900">MRT & LRT</span>
                          </div>
                          <p className="text-green-800 text-sm">
                            Seamless travel on Singapore's rail network with distance-based pricing
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-purple-900">Retail Payments</span>
                          </div>
                          <p className="text-purple-800 text-sm">
                            Pay at participating merchants, food courts, and vending machines
                          </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-5 h-5 text-orange-600" />
                            <span className="font-medium text-orange-900">Parking</span>
                          </div>
                          <p className="text-orange-800 text-sm">
                            Pay for parking at HDB car parks and selected shopping centers
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Family Learning</h4>
                      <p className="text-green-800 text-sm">
                        Teaching children about electronic payments and budgeting through EZ-Link cards 
                        helps them understand financial responsibility and modern payment systems in Singapore.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'topup' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Up Amount</h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                        {topUpAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => {
                              setSelectedAmount(amount)
                              setCustomAmount('')
                            }}
                            className={`p-3 rounded-lg border-2 font-semibold transition-colors ${
                              selectedAmount === amount
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Or enter custom amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            min="1"
                            max="500"
                            step="0.01"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value)
                              setSelectedAmount(null)
                            }}
                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum: $1.00, Maximum: $500.00
                        </p>
                      </div>

                      <button
                        onClick={handleTopUp}
                        disabled={isProcessing || (!selectedAmount && !customAmount)}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-5 h-5" />
                            Top Up ${selectedAmount || customAmount || '0.00'}
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Payment Methods</h4>
                      <ul className="text-yellow-800 text-sm space-y-1">
                        <li>• Credit/Debit Cards (Visa, Mastercard, AMEX)</li>
                        <li>• Internet Banking (DBS, OCBC, UOB)</li>
                        <li>• PayNow</li>
                        <li>• GrabPay, PayLah!, FavePay</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                      <History className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getTransactionIcon(transaction.type)}
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {transaction.description}
                                </h4>
                                <p className="text-sm text-gray-600">{transaction.location}</p>
                                <p className="text-xs text-gray-500">{transaction.datetime}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Balance: ${transaction.balance_after.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EZLinkTopUp
