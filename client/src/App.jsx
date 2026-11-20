import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  // On page load, ask the API whether it (and the database) are working.
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError('Could not reach the API. Is the server running?'))
  }, [])

  return (
    <main className="app">
      <h1>Zelda Item Tracker</h1>
      <p>Frontend → API → Database check:</p>

      {error && <p className="status error">❌ {error}</p>}
      {!error && !health && <p className="status">Checking…</p>}
      {health?.status === 'ok' && (
        <p className="status ok">
          ✅ Connected! Database time: {new Date(health.databaseTime).toLocaleString()}
        </p>
      )}
      {health?.status === 'error' && <p className="status error">❌ {health.message}</p>}
    </main>
  )
}

export default App
