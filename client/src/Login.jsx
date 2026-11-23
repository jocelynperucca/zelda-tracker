import { useState } from 'react'
import { api } from './api'

// One form that switches between "Log in" and "Create account".
function Login({ onLoggedIn }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page
    setError(null)
    setBusy(true)
    try {
      const data = isRegister
        ? await api('/auth/register', { method: 'POST', body: { username, email, password } })
        : await api('/auth/login', { method: 'POST', body: { username, password } })
      onLoggedIn(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Zelda Item Tracker</h1>
      <p className="muted">Track every Heart Piece, song and item across the Zelda games.</p>

      <form onSubmit={handleSubmit}>
        <label>
          {isRegister ? 'Username' : 'Username or email'}
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>

        {isRegister && (
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
        )}

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? 8 : undefined}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
        </button>
      </form>

      <button className="link" onClick={() => { setMode(isRegister ? 'login' : 'register'); setError(null) }}>
        {isRegister ? 'Already have an account? Log in' : 'New here? Create an account'}
      </button>
    </div>
  )
}

export default Login
