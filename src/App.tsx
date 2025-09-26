import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import gerFirstNames from './data/names/united_states/ger-last.json'
import gerLastNames from './data/names/united_states/ger-last.json'

interface Player {
  id: number
  firstName: string
  lastName: string
  skill: number
  wins: number
  losses: number
  country: string
  flag: string
}

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
  const [showBracket, setShowBracket] = useState(true)

  // Country flags and names
  const countries = [
    { name: 'USA', flag: '🇺🇸' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'France', flag: '🇫🇷' },
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'Brazil', flag: '🇧🇷' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'UK', flag: '🇬🇧' },
    { name: 'Italy', flag: '🇮🇹' },
    { name: 'Spain', flag: '🇪🇸' },
    { name: 'Russia', flag: '🇷🇺' },
    { name: 'China', flag: '🇨🇳' },
    { name: 'South Korea', flag: '🇰🇷' },
    { name: 'Mexico', flag: '🇲🇽' },
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'Netherlands', flag: '🇳🇱' },
    { name: 'Sweden', flag: '🇸🇪' },
    { name: 'Norway', flag: '🇳🇴' },
    { name: 'India', flag: '🇮🇳' },
    { name: 'Turkey', flag: '🇹🇷' }
  ]

  const getRandomCountry = () => {
    const randomIndex = Math.floor(Math.random() * countries.length)
    return countries[randomIndex]
  }

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
    const newPlayers: Player[] = []
    for (let i = 0; i < 64; i++) {
      const country = getRandomCountry()
      newPlayers.push({
        id: i,
        firstName: generateRandomName(true),
        lastName: generateRandomName(false),
        skill: Math.floor(Math.random() * 100) + 1,
        wins: 0,
        losses: 0,
        country: country.name,
        flag: country.flag
      })
    }
    setPlayers(newPlayers)
    setTournament([])
    setChampion(null)
  }

  const simulateMatch = (player1: Player, player2: Player): Player => {
    // Higher skill = better chance to win, but not guaranteed
    const player1Chance = player1.skill / (player1.skill + player2.skill)
    const randomValue = Math.random()
    
    const winner = randomValue < player1Chance ? player1 : player2
    const loser = winner === player1 ? player2 : player1
    
    winner.wins++
    loser.losses++
    
    return winner
  }

  const simulateTournament = () => {
    if (players.length !== 64) return

    setIsSimulating(true)
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

    setTournament(matches)
    setChampion(currentRound[0])
    setIsSimulating(false)
  }

  const progressSeason = () => {
    if (players.length === 0) {
      // If no players exist, generate a full new set
      generatePlayers()
    } else {
      // Sort players by skill level (highest to lowest)
      const sortedPlayers = [...players].sort((a, b) => b.skill - a.skill)
      
      // Keep top 48 players (eliminate bottom 16)
      const survivingPlayers = sortedPlayers.slice(0, 48)
      
      // Reset their tournament stats for the new season
      const resetPlayers = survivingPlayers.map(player => ({
        ...player,
        wins: 0,
        losses: 0
      }))
      
      // Generate 16 new players to fill the roster
      const newPlayers: Player[] = []
      for (let i = 0; i < 16; i++) {
        const country = getRandomCountry()
        newPlayers.push({
          id: Math.max(...players.map(p => p.id)) + i + 1, // Ensure unique IDs
          firstName: generateRandomName(true),
          lastName: generateRandomName(false),
          skill: Math.floor(Math.random() * 100) + 1,
          wins: 0,
          losses: 0,
          country: country.name,
          flag: country.flag
        })
      }
      
      // Combine surviving and new players
      const allPlayers = [...resetPlayers, ...newPlayers]
      setPlayers(allPlayers)
    }
    
    setTournament([])
    setChampion(null)
    setSeason(prev => prev + 1)
  }

  const startNewGame = () => {
    setSeason(1)
    generatePlayers()
    setTournament([])
    setChampion(null)
  }

  const getBracketStructure = () => {
    const bracketByRound = tournament.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = []
      acc[match.round].push(match)
      return acc
    }, {} as Record<string, Match[]>)

    return ["Round of 64", "Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Finals"]
      .map(roundName => ({
        roundName,
        matches: bracketByRound[roundName] || []
      }))
      .filter(round => round.matches.length > 0)
  }

  const renderBracket = () => {
    if (tournament.length === 0) return null

    const bracketStructure = getBracketStructure()

    return (
      <div style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: '20px', 
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        {bracketStructure.map((round, roundIndex) => (
          <div key={round.roundName} style={{ 
            minWidth: '220px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <h4 style={{ 
              textAlign: 'center', 
              margin: '0 0 10px 0',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {round.roundName}
            </h4>
            {round.matches.map((match, matchIndex) => (
              <div key={matchIndex} style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                padding: '8px',
                fontSize: '11px',
                minHeight: '70px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontWeight: match.winner.id === match.player1.id ? 'bold' : 'normal',
                    color: match.winner.id === match.player1.id ? '#2d5a27' : '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '14px' }}>{match.player1.flag}</span>
                    {match.player1.firstName} {match.player1.lastName}
                  </span>
                  <span style={{ fontSize: '10px' }}>({match.player1.skill})</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontWeight: match.winner.id === match.player2.id ? 'bold' : 'normal',
                    color: match.winner.id === match.player2.id ? '#2d5a27' : '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '14px' }}>{match.player2.flag}</span>
                    {match.player2.firstName} {match.player2.lastName}
                  </span>
                  <span style={{ fontSize: '10px' }}>({match.player2.skill})</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
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
          {tournament.length > 0 && (
            <button onClick={() => setShowBracket(!showBracket)} style={{ marginRight: '10px' }}>
              {showBracket ? 'Hide Bracket' : 'Show Bracket'}
            </button>
          )}
        </div>

        {champion && (
          <div style={{ backgroundColor: '#000000ff', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏆 Season {season - 1} Champion: {champion.flag} {champion.firstName} {champion.lastName}
            </h3>
            <p>Country: {champion.country} | Skill Level: {champion.skill} | Tournament Record: {champion.wins}W - {champion.losses}L</p>
          </div>
        )}

        {players.length > 0 && (
          <div>
            <h3>Players ({players.length})</h3>
            <div style={{ overflowY: 'auto', marginBottom: '20px', maxHeight: '200px' }}>
              {players?.map(player => (
                <div key={player.id} style={{ fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{player.flag}</span>
                  {player.firstName} {player.lastName} ({player.country}) - Skill: {player.skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {tournament.length > 0 && showBracket && (
          <div>
            <h3>Tournament Bracket</h3>
            {renderBracket()}
          </div>
        )}

        {tournament.length > 0 && !showBracket && (
          <div>
            <h3>Tournament Results</h3>
            <div style={{ overflowY: 'auto' }}>
              {Object.entries(
                tournament.reduce((acc, match) => {
                  if (!acc[match.round]) acc[match.round] = []
                  acc[match.round].push(match)
                  return acc
                }, {} as Record<string, Match[]>)
              ).map(([round, matches]) => (
                <div key={round}>
                  <h4>{round}</h4>
                  {matches.map((match, index) => (
                    <div key={index} style={{ fontSize: '12px', marginBottom: '3px' }}>
                      {match.player1.flag} {match.player1.firstName} {match.player1.lastName} vs {match.player2.flag} {match.player2.firstName} {match.player2.lastName} 
                      → <strong>{match.winner.flag} {match.winner.firstName} {match.winner.lastName}</strong>
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
