import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buildErrorMessage } from '../utils'
import { apiFetch } from '../auth'

export default function FormCreate() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!title.trim() || !content.trim()) {
      setError('Please fill title and content')
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(buildErrorMessage(payload, 'submit failed, please retry'))
      }

      const data = await res.json()
      navigate(`/forms/${data.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title">Create Approval</div>
        <Link className="text-link" to="/todo">Cancel</Link>
      </div>

      <form className="form-panel" onSubmit={onSubmit}>
        <label className="field">
          <span className="field-label">Title</span>
          <input
            className="field-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Purchase laptops"
            maxLength={80}
            disabled={loading}
          />
        </label>

        <label className="field">
          <span className="field-label">Content</span>
          <textarea
            className="field-textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Describe details and reasons"
            rows={6}
            maxLength={500}
            disabled={loading}
          />
        </label>

        {error && <div className="status-box error">{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
