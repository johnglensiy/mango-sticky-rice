import gerFirstNames from '../data/names/united_states/ger-last.json'
import gerLastNames from '../data/names/united_states/ger-last.json'

import { type Player } from './types.ts'

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

const genRandomName = (isFirstName: boolean = true) => {
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

export const createPlayer = (id: number): Player => {
    const country = getRandomCountry()

    return {
        id,
        firstName: genRandomName(true),
        lastName: genRandomName(false),
        skill: Math.floor(Math.random() * 100) + 1,
        wins: 0,
        losses: 0,
        country: country.name,
        seed: 0,
        isSeeded: false
    }
}

export const generatePlayers = () => {
    const newPlayers: Player[] = []

    for (let i = 0; i < 64; i++) {
        newPlayers.push(createPlayer(i))       
    }

    return newPlayers
}