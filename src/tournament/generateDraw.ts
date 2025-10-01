import { type Player } from '../player/types'

// Assumes players are pre-sorted by skill descending

const generateDraw = (players: Player[]) => {
    if (players.length !== 64) {
        alert('Player count must be exactly 64 to generate draw.')
        return players
    }

    // Put 1 seed in top half, 2 seed in bottom half
    const sortedDraw = [players[0], players[1]]
    let rest = players.slice(2)

    for (let i = 0; i < 5; i++) {
        let numPlayersToPop = 2 ** (i + 1)
        const toShuffle = rest.slice(0, numPlayersToPop)

        // Shuffle the chunk
        for (let j = toShuffle.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1))
            ;[toShuffle[j], toShuffle[k]] = [toShuffle[k], toShuffle[j]]
        }

        console.log('Chunk:', toShuffle.map(p => p.seed))

        // Push the shuffled chunk to the draw by splicing
        for (let j = 0; j < numPlayersToPop; j++) {
            sortedDraw.splice(2*j + 1, 0, toShuffle[j])
        }

        rest = rest.slice(numPlayersToPop)
    }

    return [...sortedDraw, ...rest]
}

export default generateDraw