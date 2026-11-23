import { useEffect, useState } from 'react'
import { api } from './api'

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
      <h1>Choose a game</h1>
      <div className="game-grid">
        {games.map((game) => {
          const percent = game.total ? Math.round((game.collected / game.total) * 100) : 0
          return (
            <button key={game.id} className="game-card" onClick={() => onSelect(game.id)}>
              <span className="game-title">{game.title}</span>
              <span className="muted">{game.release_year} · {game.console}</span>
              <span className="bar"><span style={{ width: `${percent}%` }} /></span>
              <span className="small">{game.collected} / {game.total} items · {percent}%</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default GameList
