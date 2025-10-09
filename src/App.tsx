import { useState } from 'react'

import './App.css'

import gerFirstNames from './data/names/united_states/ger-last.json'
import gerLastNames from './data/names/united_states/ger-last.json'
import { simulateMatch } from './match/simMatch'
import { type Player } from './player/types.ts'

import realPlayers from './data/names/realPlayers.json'


import generateDraw from './tournament/generateDraw.ts'

interface Match {
  player1: Player
  player2: Player
  winner: Player
  round: string
}

const App = () => {
  const [season, setSeason] = useState(1)
  const [players, setPlayers] = useState<Player[]>([])
  const [tournament, setTournament] = useState<Match[]>([])
  const [champion, setChampion] = useState<Player | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const generateRandomName = (isFirstName: boolean = true) => {
    const randomValue = Math.random()
    const nameData = isFirstName ? gerFirstNames : gerLastNames

    // Binary search for freq bin
    let left = 0
    let right = nameData.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const cumFreq = nameData[mid].CumFreq
      
      if (cumFreq >= randomValue) {
        if (mid === 0 || nameData[mid - 1].CumFreq < randomValue) {
          return nameData[mid].Surname
        }
        right = mid - 1
      } else {
        left = mid + 1
      }
    }
    return "Unknown"
  }

  const generatePlayers = () => {
    // Map the real players data to match your Player interface
    const mappedPlayers: Player[] = realPlayers.players.map((player, index) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      country: player.country,
      skill: player.skill,
      wins: 0,        // Initialize for tournament tracking
      losses: 0,      // Initialize for tournament tracking
      seed: 0,        // Will be assigned after sorting
      isSeeded: false // Will be assigned after sorting
    }));

    // Sort players by skill descending before setting state
    mappedPlayers.sort((a, b) => b.skill - a.skill);

    // Assign seeds based on skill ranking
    for (let i = 0; i < mappedPlayers.length; i++) {
      mappedPlayers[i].seed = i + 1;
      mappedPlayers[i].isSeeded = i < 32; // Top 32 are seeded
    }

    setPlayers(mappedPlayers);
    setTournament([])
    setChampion(null)
  }

  const simulateTournament = () => {
    if (players.length !== 64) return

    // Generate draw once
    const draw = generateDraw(players)

    setIsSimulating(true)
    const matches: Match[] = []

    // Players in current round
    let currentRound = [...draw]
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

    setTournament(matches)
    setChampion(currentRound[0])
    setIsSimulating(false)
  }

  const progressSeason = () => {
    generatePlayers()
    setSeason(prev => prev + 1)
  }

  const startNewGame = () => {
    setSeason(1)
    generatePlayers()
    setTournament([])
    setChampion(null)
  }

  return (
    <div>
      <div className="card">
        <h2>Season {season}</h2>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={startNewGame} style={{ marginRight: '10px' }}>
            Start New Game
          </button>
          <button onClick={progressSeason} style={{ marginRight: '10px' }}>
            Progress Season
          </button>
          <button 
            onClick={simulateTournament} 
            disabled={players.length !== 64 || isSimulating}
            style={{ marginRight: '10px' }}
          >
            {isSimulating ? 'Simulating...' : 'Simulate Tournament'}
          </button>
        </div>

        {champion && (
          <div style={{ backgroundColor: '#f0f8ff', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
            <h3>🏆 Season {season - 1} Champion: {champion.firstName} {champion.lastName}</h3>
            <p>Skill Level: {champion.skill} | Tournament Record: {champion.wins}W - {champion.losses}L</p>
          </div>
        )}

        {players.length > 0 && (
          <div>
            <h3>Players ({players.length})</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
              {players.map(player => (
                <div key={player.id} style={{ fontSize: '14px', marginBottom: '5px' }}>
                  {player.isSeeded && `(${player.seed}) `} {player.firstName} {player.lastName} (Skill: {player.skill})
                </div>
              ))}
              {players.length > 10 && <div>... and {players.length - 10} more players</div>}
            </div>
          </div>
        )}

        {tournament.length > 0 && (
          <div>
            <h3>Tournament Results</h3>
            <div style={{
              display: 'flex', 
              flexDirection: 'row', 
              overflowY: 'auto',
              width: '100%'
              }}>
              {Object.entries(
                tournament.reduce((acc, match) => {
                  if (!acc[match.round]) acc[match.round] = []
                  acc[match.round].push(match)
                  return acc
                }, {} as Record<string, Match[]>)
              ).map(([round, matches]) => (
                <div key={round} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-around',
                  minWidth: '200px',
                  padding: '10px'
                }}>
                  {/* <h4>{round}</h4> */}
                  {matches.map((match, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      outline: '1px solid black', 
                      fontSize: '12px', 
                      marginBottom: '3px',
                      padding: '4px',
                    }}>
                      <div style={{
                        fontWeight: match.winner.id === match.player1.id ? 'bold' : 'normal',
                        backgroundColor: match.winner.id === match.player1.id ? '#2d5a27' : 'transparent',
                        display: 'flex',
                        justifyContent: 'left'
                      }}>
                        {match.player1.isSeeded && match.player1.seed <= 32 && `(${match.player1.seed}) `}
                        {match.player1.firstName} {match.player1.lastName}
                      </div>
                      <div style={{
                        fontWeight: match.winner.id === match.player2.id ? 'bold' : 'normal',
                        backgroundColor: match.winner.id === match.player2.id ? '#2d5a27' : 'transparent',
                        display: 'flex',
                        justifyContent: 'left'
                      }}>
                        {match.player2.isSeeded && match.player2.seed <= 32 && `(${match.player2.seed}) `}
                        {match.player2.firstName} {match.player2.lastName}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
