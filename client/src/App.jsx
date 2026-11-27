import { useCallback, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'
import Login from './Login'
import GameList from './GameList'
import Checklist from './Checklist'
import Triforce from './Triforce'
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

  if (checkingLogin) {
    return (
      <main className="app center">
        <Triforce size={48} className="pulse" />
      </main>
    )
  }

  if (!user) return <main className="app"><Login onLoggedIn={handleLoggedIn} /></main>

  return (
    <main className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setSelectedGameId(null)}>
          <Triforce size={26} />
          <span>Zelda Item Tracker</span>
        </button>
        <div className="user">
          <span className="user-pill">{user.username}</span>
          <button className="link" onClick={logOut}>Log out</button>
        </div>
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
