export interface GameSession {
  id: string
  difficulty: string
  family_budget: number
  family_members: FamilyMember[]
  game_phase: string
  current_player_index: number
  game_scenario: any
  created_date: string
  last_updated: string
}

export interface FamilyMember {
  name: string
  role: 'son' | 'daughter' | 'grandfather' | 'grandmother'
  position: number
  points: number
  cash: number
  ezlink_balance: number
}

export interface Market {
  id: string
  name: string
  type: 'supermarket' | 'wet_market' | 'online'
  availability: number
  pricing_multiplier: number
  queue_length: number
  special_conditions: string[]
}

export interface TikTokTrend {
  id: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  min_earnings: number
  max_earnings: number
  description: string
}