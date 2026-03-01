import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { STATUS_LABEL, formatTime, buildErrorMessage, getStatusClass } from '../utils'

const SCOPE_OPTIONS = [
  { key: 'todo', label: '待我审批' },
  { key: 'mine', label: '我发起的' }
]

export default function Todo() {
  const [scope, setScope] = useState('todo')
  const [isManager, setIsManager] = useState(true)
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')

    const headers = isManager ? { 'x-user-role': 'manager' } : {}
    fetch(`/api/forms?scope=${scope}`, { headers })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(buildErrorMessage(payload, '请求失败'))
        }
        return res.json()
      })
      .then((data) => {
        if (alive) setForms(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (alive) setError(err.message || '网络或接口请求异常')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => { alive = false }
  }, [scope, isManager])

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title">审批中心</div>
        <Link className="text-link" to="/forms/new">+ 新建申请</Link>
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

      <label className="dev-tool-bar">
        <input type="checkbox" checked={isManager} onChange={(e) => setIsManager(e.target.checked)} />
        <span>开发者工具：模拟经理角色 (Manager Role)</span>
      </label>

      {error && <div className="status-box error">⚠️ {error}</div>}
      {!error && loading && <div className="status-box">加载中...</div>}
      {!error && !loading && forms.length === 0 && <div className="status-box">🎉 暂无相关审批单</div>}

      <div className="list">
        {forms.map((form) => (
          <Link
            key={form.id}
            className="list-item list-item-link"
            to={`/forms/${form.id}${isManager ? '?role=manager' : ''}`}
          >
            <div className="list-header">
              <div className="list-title">{form.title}</div>
              <span className={`badge ${getStatusClass(form.status)}`}>
                {STATUS_LABEL[form.status] ?? form.status}
              </span>
            </div>
            <div className="list-meta">
              <span>单号: {form.id}</span>
              <span>发起人: {form.creatorId}</span>
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
