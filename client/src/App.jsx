import { useCallback, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'
import Login from './Login'
import GameList from './GameList'
import Checklist from './Checklist'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [checkingLogin, setCheckingLogin] = useState(Boolean(getToken()))
  const [selectedGameId, setSelectedGameId] = useState(null) // null = show the game list

  // If a token was saved from last time, ask the server who it belongs to.
  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setCheckingLogin(false))
  }, [])

  function handleLoggedIn(token, loggedInUser) {
    setToken(token)
    setUser(loggedInUser)
  }

  const logOut = useCallback(() => {
    setToken(null)
    setUser(null)
    setSelectedGameId(null)
  }, [])

  if (checkingLogin) return <main className="app"><p className="muted">Loading…</p></main>

  if (!user) return <main className="app"><Login onLoggedIn={handleLoggedIn} /></main>

  return (
    <main className="app">
      <header className="topbar">
        <span className="brand">🗡️ Zelda Item Tracker</span>
        <span>
          <span className="muted">{user.username}</span>
          <button className="link" onClick={logOut}>Log out</button>
        </span>
      </header>

      {selectedGameId === null ? (
        <GameList onSelect={setSelectedGameId} onAuthError={logOut} />
      ) : (
        <Checklist gameId={selectedGameId} onBack={() => setSelectedGameId(null)} onAuthError={logOut} />
      )}
    </main>
  )
}

export default App
