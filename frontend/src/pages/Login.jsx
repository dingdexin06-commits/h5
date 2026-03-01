import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildErrorMessage } from '../utils'
import { saveAuthSession } from '../auth'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('employee')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('username and password are required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(buildErrorMessage(payload, 'login failed'))
      }

      const payload = await response.json()
      saveAuthSession({
        accessToken: payload.accessToken,
        tokenType: payload.tokenType,
        expiresInSeconds: payload.expiresInSeconds,
        user: payload.user
      })
      navigate('/start', { replace: true })
    } catch (err) {
      setError(err.message || 'login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="form-panel" onSubmit={onSubmit}>
        <div className="page-title">Sign In</div>
        <div className="list-meta">Demo accounts: employee / manager, password: 123456</div>

        <label className="field">
          <span className="field-label">Username</span>
          <input
            className="field-input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={loading}
            autoComplete="username"
          />
        </label>

        <label className="field">
          <span className="field-label">Password</span>
          <input
            className="field-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            autoComplete="current-password"
            type="password"
          />
        </label>

        {error && <div className="status-box error">{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
