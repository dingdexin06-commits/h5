import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { STATUS_LABEL, formatTime, buildErrorMessage, getStatusClass } from '../utils'
import { apiFetch, getAuthUser, isManagerUser } from '../auth'

const SCOPE_OPTIONS = [
  { key: 'todo', label: 'Pending for Me' },
  { key: 'mine', label: 'Created by Me' }
]

export default function Todo() {
  const currentUser = useMemo(() => getAuthUser(), [])
  const managerMode = isManagerUser(currentUser)

  const [scope, setScope] = useState(managerMode ? 'todo' : 'mine')
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')

    apiFetch(`/api/forms?scope=${scope}`)
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(buildErrorMessage(payload, 'request failed'))
        }
        return res.json()
      })
      .then((data) => {
        if (alive) setForms(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (alive) setError(err.message || 'network or api error')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [scope])

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title">Approval Center</div>
        <Link className="text-link" to="/forms/new">+ New</Link>
      </div>

      <div className="scope-switch">
        {SCOPE_OPTIONS.map((item) => (
          <button
            key={item.key}
            className={`scope-switch-btn ${scope === item.key ? 'scope-switch-btn-active' : ''}`}
            type="button"
            onClick={() => setScope(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="list-meta">Role: {managerMode ? 'manager' : 'employee'}</div>

      {error && <div className="status-box error">{error}</div>}
      {!error && loading && <div className="status-box">Loading...</div>}
      {!error && !loading && forms.length === 0 && <div className="status-box">No records</div>}

      <div className="list">
        {forms.map((form) => (
          <Link key={form.id} className="list-item list-item-link" to={`/forms/${form.id}`}>
            <div className="list-header">
              <div className="list-title">{form.title}</div>
              <span className={`badge ${getStatusClass(form.status)}`}>
                {STATUS_LABEL[form.status] ?? form.status}
              </span>
            </div>
            <div className="list-meta">
              <span>ID: {form.id}</span>
              <span>Creator: {form.creatorId}</span>
            </div>
            <div className="list-meta">
              <span>{formatTime(form.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
