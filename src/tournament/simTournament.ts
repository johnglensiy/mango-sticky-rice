import { type Player } from '../player/createPlayer.ts'
import { type Match, simulateMatch  } from '../match/simMatch.ts'

// Need a smarter algorithm to consider byes and irregular player pool size

export const simulateTournament = (players: Player[]) => {
    const matches: Match[] = []
    let currentRound = [...players]
    const roundNames = ["Round of 64", "Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Finals"]
    let roundIndex = 0

    while (currentRound.length > 1) {
        const nextRound: Player[] = []
        const roundName = roundNames[roundIndex] || `Round ${roundIndex + 1}`

        for (let i = 0; i < currentRound.length; i += 2) {
          const player1 = currentRound[i]
          const player2 = currentRound[i + 1]
          const winner = simulateMatch(player1, player2)
          
          matches.push({
            player1,
            player2,
            winner,
            round: roundName
          })
          
          nextRound.push(winner)
        }
        
        currentRound = nextRound
        roundIndex++
    }

    return matches
}