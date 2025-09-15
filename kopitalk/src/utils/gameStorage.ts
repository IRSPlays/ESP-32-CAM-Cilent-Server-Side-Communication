import { GameSession } from '../types'

const STORAGE_KEY = 'kopitalk_games'

export const gameStorage = {
  // Get all games
  getGames(): GameSession[] {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  },

  // Get a specific game
  getGame(sessionId: string): GameSession | null {
    const games = this.getGames()
    return games.find(game => game.id === sessionId) || null
  },

  // Save a game
  saveGame(game: GameSession): void {
    const games = this.getGames()
    const existingIndex = games.findIndex(g => g.id === game.id)
    
    if (existingIndex >= 0) {
      games[existingIndex] = game
    } else {
      games.push(game)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
  },

  // Create new game
  createGame(difficulty: string, players: any[]): GameSession {
    const budgetMap: Record<string, number> = {
      easy: 150,
      medium: 100,
      hard: 75,
      expert: 50
    }

    const game: GameSession = {
      id: `game_${Date.now()}`,
      difficulty,
      family_budget: budgetMap[difficulty],
      family_members: players.map(player => ({
        ...player,
        position: 0,
        points: 0,
        cash: 0,
        ezlink_balance: 0
      })),
      game_phase: 'family_setup',
      current_player_index: 0,
      game_scenario: null,
      created_date: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }

    this.saveGame(game)
    return game
  }
}