import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { STATUS_LABEL, ACTION_LABEL, formatTime, buildErrorMessage, getStatusClass } from '../utils'
import { apiFetch, getAuthUser, isManagerUser } from '../auth'

export default function FormDetail() {
  const { id } = useParams()
  const currentUser = useMemo(() => getAuthUser(), [])
  const isManager = isManagerUser(currentUser)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDetail = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch(`/api/forms/${id}`)
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(buildErrorMessage(payload, 'load form detail failed'))
      }
      const payload = await res.json()
      setData(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const handleApproveAction = async (action) => {
    const actionText = ACTION_LABEL[action]
    if (!window.confirm(`Confirm to ${actionText}?`)) return

    setSubmitting(true)
    setError('')
    try {
      const res = await apiFetch(`/api/forms/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          ...(comment.trim() ? { comment: comment.trim() } : {})
        })
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(buildErrorMessage(payload, 'approve action failed'))
      }

      setComment('')
      await loadDetail()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const form = data?.form
  const approvals = Array.isArray(data?.approvals) ? data.approvals : []

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title">Approval Detail</div>
        <Link className="text-link" to="/todo">Back</Link>
      </div>

      <div className="list-meta">Role: {isManager ? 'manager' : 'employee'}</div>

      {error && <div className="status-box error">{error}</div>}
      {!error && loading && <div className="status-box">Loading...</div>}

      {form && (
        <div className="form-panel">
          <div className="field-readonly">
            <div className="field-label">Title</div>
            <div className="field-value" style={{ fontWeight: 600 }}>{form.title}</div>
          </div>
          <div className="field-readonly">
            <div className="field-label">Content</div>
            <div className="field-value">{form.content}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field-readonly">
              <div className="field-label">Status</div>
              <div className="field-value">
                <span className={`badge ${getStatusClass(form.status)}`}>
                  {STATUS_LABEL[form.status] ?? form.status}
                </span>
              </div>
            </div>
            <div className="field-readonly">
              <div className="field-label">Creator ID</div>
              <div className="field-value">{form.creatorId}</div>
            </div>
            <div className="field-readonly">
              <div className="field-label">Created At</div>
              <div className="field-value" style={{ fontSize: '13px' }}>{formatTime(form.createdAt)}</div>
            </div>
            <div className="field-readonly">
              <div className="field-label">Form ID</div>
              <div className="field-value" style={{ fontSize: '13px' }}>{form.id}</div>
            </div>
          </div>
        </div>
      )}

      {form?.status === 'PENDING' && (
        <div className="form-panel" style={{ border: '1px solid var(--color-primary)' }}>
          <div className="section-title">Approval Decision</div>
          {!isManager && (
            <div className="status-box error" style={{ padding: '8px 12px' }}>
              Current user is employee and cannot approve this request.
            </div>
          )}
          <label className="field">
            <span className="field-label">Comment (optional)</span>
            <textarea
              className="field-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Input reason for approve/reject"
              rows={3}
              maxLength={200}
              disabled={submitting || !isManager}
            />
          </label>
          <div className="btn-row">
            <button
              className="btn btn-success"
              type="button"
              disabled={!isManager || submitting}
              onClick={() => handleApproveAction('APPROVE')}
            >
              {submitting ? 'Submitting...' : 'Approve'}
            </button>
            <button
              className="btn btn-danger"
              type="button"
              disabled={!isManager || submitting}
              onClick={() => handleApproveAction('REJECT')}
            >
              {submitting ? 'Submitting...' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      <div className="section-title">Approval Records</div>
      {approvals.length === 0 && <div className="status-box">No records</div>}
      <div className="list">
        {approvals.map((item) => (
          <div className="list-item" key={item.id}>
            <div className="list-header">
              <div className="list-title">Action: {ACTION_LABEL[item.action] ?? item.action}</div>
              <span className="list-meta">{formatTime(item.createdAt)}</span>
            </div>
            <div className="list-meta">Approver: {item.approverId}</div>
            {item.comment && (
              <div className="list-meta" style={{ marginTop: '8px', padding: '8px', background: '#f8f9fa', borderRadius: '6px', color: '#1d2433' }}>
                {item.comment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
