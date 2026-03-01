import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, clearAuthSession, getAuthUser } from '../auth'

export default function Me() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(getAuthUser())
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    apiFetch('/api/me')
      .then((res) => {
        if (!res.ok) throw new Error('failed to load profile')
        return res.json()
      })
      .then((data) => {
        if (alive) setProfile(data)
      })
      .catch((err) => {
        if (alive) setError(err.message)
      })

    return () => {
      alive = false
    }
  }, [])

  const onLogout = () => {
    clearAuthSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title">Profile</div>
        <button className="text-button" type="button" onClick={onLogout}>Logout</button>
      </div>

      <div className="card">
        {error && <div className="status-box error">{error}</div>}
        {!error && !profile && <div className="status-box">Loading profile...</div>}

        {profile && (
          <div className="profile">
            <div className="profile-avatar">{profile.name?.[0] || 'U'}</div>
            <div className="profile-name">{profile.name}</div>
            <div className="list-meta" style={{ marginTop: '12px' }}>ID: {profile.id}</div>
            <div className="list-meta">Department: {profile.department?.name || '-'}</div>
            <div className="list-meta">
              Roles: {profile.roles?.map((role) => role.name).join(' / ') || '-'}
            </div>
          </div>
        )}
      </div>

      <div className="section-title">General</div>
      <div className="list">
        <div className="list-item">
          <div className="list-title">Account & Security</div>
          <div className="list-meta">Password reset and device management</div>
        </div>
        <div className="list-item">
          <div className="list-title">Notifications</div>
          <div className="list-meta">Configure approval and workflow notifications</div>
        </div>
      </div>
    </div>
  )
}
