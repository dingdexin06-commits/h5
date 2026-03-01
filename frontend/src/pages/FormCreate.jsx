import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buildErrorMessage } from '../utils'

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
      setError('请完整填写标题和说明内容')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(buildErrorMessage(payload, '提交申请失败，请稍后重试'))
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
        <div className="page-title">发起审批</div>
        <Link className="text-link" to="/todo">取消</Link>
      </div>

      <form className="form-panel" onSubmit={onSubmit}>
        <label className="field">
          <span className="field-label">申请标题</span>
          <input
            className="field-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：采购笔记本电脑"
            maxLength={80}
            disabled={loading}
          />
        </label>

        <label className="field">
          <span className="field-label">详细说明</span>
          <textarea
            className="field-textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="请清晰描述申请的事项、金额及原因等细节..."
            rows={6}
            maxLength={500}
            disabled={loading}
          />
        </label>

        {error && <div className="status-box error">⚠️ {error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '提交同步中...' : '提交审批'}
        </button>
      </form>
    </div>
  )
}
