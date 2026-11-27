import { useEffect, useState } from 'react'
import { api } from './api'
import ProgressRing from './ProgressRing'

function GameList({ onSelect, onAuthError }) {
  const [games, setGames] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/games')
      .then(setGames)
      .catch((err) => (err.status === 401 ? onAuthError() : setError(err.message)))
  }, [onAuthError])

  if (error) return <p className="error">{error}</p>
  if (!games) return <p className="muted">Loading games…</p>

  return (
    <section>
      <p className="eyebrow">Your adventures</p>
      <h1 className="page-title">Choose a game</h1>
      <div className="game-grid">
        {games.map((game) => (
          <button key={game.id} className="panel game-card" onClick={() => onSelect(game.id)}>
            <span className="game-info">
              <span className="console-tag">{game.console} · {game.release_year}</span>
              <span className="game-title">{game.title}</span>
              <span className="muted small">{game.collected} of {game.total} items collected</span>
            </span>
            <ProgressRing value={game.collected} total={game.total} size={72} />
          </button>
        ))}
      </div>
    </section>
  )
}

export default GameList
