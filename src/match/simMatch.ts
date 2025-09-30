import { type Player } from '../player/createPlayer.ts'

export interface Match {
  player1: Player
  player2: Player
  winner: Player
  round: string
}

export const simulateMatch = (player1: Player, player2: Player): Player => {
    // Higher skill = better chance to win, but not guaranteed
    const player1Chance = player1.skill / (player1.skill + player2.skill)
    const randomValue = Math.random()
    
    const winner = randomValue < player1Chance ? player1 : player2
    const loser = winner === player1 ? player2 : player1
    
    winner.wins++
    loser.losses++
    
    return winner
}