const fs = require('fs');
const path = require('path');

const files = {
  'src/utils.js': `export const STATUS_LABEL = {
  PENDING: '待审批',
  APPROVED: '已同意',
  REJECTED: '已拒绝'
}

export const ACTION_LABEL = {
  APPROVE: '同意',
  REJECT: '拒绝'
}

export function getStatusClass(status) {
  switch (status) {
    case 'PENDING': return 'badge-warning';
    case 'APPROVED': return 'badge-success';
    case 'REJECTED': return 'badge-danger';
    default: return 'badge-default';
  }
}

export function formatTime(iso) {
  if (!iso) return '未知时间';
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) {
    return iso
  }
  return value.toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

export function buildErrorMessage(payload, fallback) {
  if (!payload || typeof payload !== 'object') {
    return fallback
  }
  const { message } = payload
  if (Array.isArray(message)) {
    return message.join('; ')
  }
  if (typeof message === 'string' && message.trim()) {
    return message
  }
  return fallback
}`,

  'src/styles.css': `:root {
  --color-primary: #2d6cdf;
  --color-primary-hover: #1e56be;
  --color-success: #1f9d55;
  --color-danger: #d64545;
  --color-warning: #e57d14;
  
  --bg-main: #f4f6fb;
  --bg-card: #ffffff;
  
  --text-main: #1d2433;
  --text-secondary: #566076;
  --text-muted: #8a94a6;
  
  --border-color: #e4e8f0;
  
  font-family: "Microsoft YaHei", "Noto Sans SC", "PingFang SC", sans-serif;
  color: var(--text-main);
  background-color: var(--bg-main);
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--bg-main); }

.app {
  min-height: 100vh;
  background: var(--bg-main);
  display: flex;
  justify-content: center;
}

.content {
  width: 100%;
  max-width: 520px;
  background-color: #fafbfc;
  min-height: 100vh;
  padding: 20px 16px 96px;
  box-shadow: 0 0 40px rgba(0,0,0,0.05);
  position: relative;
}

.page { display: flex; flex-direction: column; gap: 20px; }

.page-head { display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-main); }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-main); margin-top: 4px; }

.hero {
  padding: 28px 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #4f8bff 100%);
  color: #fff;
  box-shadow: 0 12px 24px rgba(44, 98, 219, 0.2);
}
.hero-title { font-size: 24px; font-weight: 700; }
.hero-subtitle { margin-top: 8px; font-size: 14px; opacity: 0.9; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; }
.card {
  padding: 16px; border-radius: 16px; background: var(--bg-card);
  box-shadow: 0 4px 16px rgba(29, 36, 51, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-link { color: inherit; text-decoration: none; cursor: pointer; display: block;}
.card-link:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(29, 36, 51, 0.08); }
.card-title { font-size: 16px; font-weight: 600; }
.card-desc { margin-top: 6px; font-size: 13px; color: var(--text-muted); }

.list { display: flex; flex-direction: column; gap: 12px; }
.list-item {
  padding: 16px; border-radius: 14px; background: var(--bg-card);
  box-shadow: 0 4px 12px rgba(29, 36, 51, 0.03);
  position: relative;
}
.list-item-link { color: inherit; text-decoration: none; display: block; transition: background 0.2s; }
.list-item-link:active { background: #f9f9f9; }
.list-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.list-title { font-size: 15px; font-weight: 600; color: var(--text-main); line-height: 1.4;}
.list-meta { margin-top: 4px; font-size: 13px; color: var(--text-secondary); display: flex; justify-content: space-between; }

.badge { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.badge-warning { background: #fff3e0; color: var(--color-warning); }
.badge-success { background: #e8f5e9; color: var(--color-success); }
.badge-danger { background: #ffebee; color: var(--color-danger); }
.badge-default { background: #f0f2f5; color: var(--text-secondary); }

.text-link { color: var(--color-primary); text-decoration: none; font-size: 14px; font-weight: 600; }
.text-link:hover { text-decoration: underline; }

.scope-switch { display: flex; background: #eaedf4; border-radius: 12px; padding: 4px; }
.scope-switch-btn {
  flex: 1; border: none; background: transparent; color: var(--text-secondary);
  border-radius: 8px; font-size: 14px; font-weight: 500; padding: 10px 0; cursor: pointer;
  transition: all 0.2s ease;
}
.scope-switch-btn-active { background: var(--bg-card); color: var(--text-main); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

.status-box { padding: 16px; border-radius: 12px; text-align: center; font-size: 14px; color: var(--text-secondary); background: var(--bg-card); }
.status-box.error { background: #ffebee; color: var(--color-danger); text-align: left;}

.dev-tool-bar {
  background: #fff8e1; border: 1px dashed #ffc107; padding: 10px; border-radius: 8px;
  display: flex; align-items: center; gap: 8px; font-size: 13px; color: #795548;
}

.form-panel {
  padding: 20px 16px; border-radius: 16px; background: var(--bg-card);
  box-shadow: 0 4px 16px rgba(29, 36, 51, 0.04); display: flex; flex-direction: column; gap: 16px;
}
.field { display: flex; flex-direction: column; gap: 8px; }
.field-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.field-input, .field-textarea {
  border: 1px solid var(--border-color); border-radius: 10px; padding: 12px;
  font-size: 15px; font-family: inherit; background: #fafbfc; transition: border-color 0.2s, background 0.2s;
}
.field-input:focus, .field-textarea:focus { outline: none; border-color: var(--color-primary); background: #fff; box-shadow: 0 0 0 3px rgba(45, 108, 223, 0.1); }
.field-input::placeholder, .field-textarea::placeholder { color: #b0b8c4; }

.field-readonly { display: flex; flex-direction: column; gap: 4px; padding-bottom: 12px; border-bottom: 1px dashed var(--border-color); }
.field-readonly:last-child { border-bottom: none; padding-bottom: 0; }
.field-value { font-size: 15px; color: var(--text-main); word-break: break-word; line-height: 1.5; }

.btn-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 8px;}
.btn {
  border: 0; border-radius: 12px; padding: 14px 12px; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: opacity 0.2s, transform 0.1s; text-align: center;
}
.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--color-primary); color: #ffffff; }
.btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn-success { background: var(--color-success); color: #ffffff; }
.btn-danger { background: var(--color-danger); color: #ffffff; }

.metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.metric-card { padding: 16px 8px; border-radius: 16px; background: var(--bg-card); text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.metric-value { font-size: 24px; font-weight: 700; color: var(--color-primary); }
.metric-label { margin-top: 8px; font-size: 13px; color: var(--text-secondary); }

.profile { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 16px 0;}
.profile-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 8px;}
.profile-name { font-size: 20px; font-weight: 700; }

.tabbar {
  position: fixed; left: 50%; bottom: 0; transform: translateX(-50%);
  width: 100%; max-width: 520px; height: 64px;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: space-around; z-index: 10;
}
.tabbar-link {
  flex: 1; text-align: center; text-decoration: none; color: var(--text-muted);
  font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; height: 100%;
  position: relative; transition: color 0.2s;
}
.tabbar-link-active { color: var(--color-primary); font-weight: 700; }
.tabbar-link-active::after {
  content: ''; position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  width: 20px; height: 3px; border-radius: 2px; background: var(--color-primary);
}

@media (max-width: 420px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }`,

  'src/App.jsx': `import { Routes, Route, Navigate } from 'react-router-dom'
import TabBar from './components/TabBar.jsx'
import Start from './pages/Start.jsx'
import Todo from './pages/Todo.jsx'
import Reports from './pages/Reports.jsx'
import Me from './pages/Me.jsx'
import FormCreate from './pages/FormCreate.jsx'
import FormDetail from './pages/FormDetail.jsx'

export default function App() {
  return (
    <div className="app">
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/start" replace />} />
          <Route path="/start" element={<Start />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/forms/new" element={<FormCreate />} />
          <Route path="/forms/:id" element={<FormDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/me" element={<Me />} />
        </Routes>
      </div>
      <TabBar />
    </div>
  )
}`,

  'src/components/TabBar.jsx': `import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/todo', label: '审批' },
  { to: '/start', label: '工作台' },
  { to: '/reports', label: '报表' },
  { to: '/me', label: '我的' }
]

export default function TabBar() {
  return (
    <nav className="tabbar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            isActive ? 'tabbar-link tabbar-link-active' : 'tabbar-link'
          }
        >
          <span className="tabbar-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}`,

  'src/pages/Todo.jsx': `import { useEffect, useState } from 'react'
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
    fetch(\`/api/forms?scope=\${scope}\`, { headers })
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
            className={\`scope-switch-btn \${scope === item.key ? 'scope-switch-btn-active' : ''}\`}
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
            to={\`/forms/\${form.id}\${isManager ? '?role=manager' : ''}\`}
          >
            <div className="list-header">
              <div className="list-title">{form.title}</div>
              <span className={\`badge \${getStatusClass(form.status)}\`}>
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
}`,

  'src/pages/FormCreate.jsx': `import { useState } from 'react'
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
      navigate(\`/forms/\${data.id}\`, { replace: true })
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
}`,

  'src/pages/FormDetail.jsx': `import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { STATUS_LABEL, ACTION_LABEL, formatTime, buildErrorMessage, getStatusClass } from '../utils'

export default function FormDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [isManager, setIsManager] = useState(searchParams.get('role') === 'manager')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDetail = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(\`/api/forms/\${id}\`)
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(buildErrorMessage(payload, '表单数据加载失败'))
      }
      const payload = await res.json()
      setData(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadDetail() }, [loadDetail])

  const handleApproveAction = async (action) => {
    const actionText = ACTION_LABEL[action]
    if (!window.confirm(\`确认要【\${actionText}】该审批单吗？\`)) return;

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(\`/api/forms/\${id}/approve\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isManager ? { 'x-user-role': 'manager' } : {})
        },
        body: JSON.stringify({
          action,
          ...(comment.trim() ? { comment: comment.trim() } : {})
        })
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(buildErrorMessage(payload, '审批操作失败'))
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
        <div className="page-title">审批详情</div>
        <Link className="text-link" to="/todo">返回列表</Link>
      </div>

      <label className="dev-tool-bar">
        <input type="checkbox" checked={isManager} onChange={(e) => setIsManager(e.target.checked)} />
        <span>开发者工具：模拟经理角色</span>
      </label>

      {error && <div className="status-box error">⚠️ {error}</div>}
      {!error && loading && <div className="status-box">加载数据中...</div>}

      {form && (
        <div className="form-panel">
          <div className="field-readonly">
            <div className="field-label">审批标题</div>
            <div className="field-value" style={{ fontWeight: 600 }}>{form.title}</div>
          </div>
          <div className="field-readonly">
            <div className="field-label">详细内容</div>
            <div className="field-value">{form.content}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field-readonly">
              <div className="field-label">当前状态</div>
              <div className="field-value">
                <span className={\`badge \${getStatusClass(form.status)}\`}>
                  {STATUS_LABEL[form.status] ?? form.status}
                </span>
              </div>
            </div>
            <div className="field-readonly">
              <div className="field-label">发起人ID</div>
              <div className="field-value">{form.creatorId}</div>
            </div>
            <div className="field-readonly">
              <div className="field-label">创建时间</div>
              <div className="field-value" style={{ fontSize: '13px' }}>{formatTime(form.createdAt)}</div>
            </div>
             <div className="field-readonly">
              <div className="field-label">审批单号</div>
              <div className="field-value" style={{ fontSize: '13px' }}>{form.id}</div>
            </div>
          </div>
        </div>
      )}

      {form?.status === 'PENDING' && (
        <div className="form-panel" style={{ border: '1px solid var(--color-primary)' }}>
          <div className="section-title">审批决策</div>
          {!isManager && (
            <div className="status-box error" style={{ padding: '8px 12px' }}>
              限制：当前为普通员工身份，无审批权限。请通过上方工具切换经理角色体验。
            </div>
          )}
          <label className="field">
            <span className="field-label">审批意见（选填）</span>
            <textarea
              className="field-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="请输入同意或拒绝的理由..."
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
              {submitting ? '处理中...' : '同意申请'}
            </button>
            <button
              className="btn btn-danger"
              type="button"
              disabled={!isManager || submitting}
              onClick={() => handleApproveAction('REJECT')}
            >
              {submitting ? '处理中...' : '驳回申请'}
            </button>
          </div>
        </div>
      )}

      <div className="section-title">审批动态与流转记录</div>
      {approvals.length === 0 && <div className="status-box">暂无流转记录</div>}
      <div className="list">
        {approvals.map((item) => (
          <div className="list-item" key={item.id}>
            <div className="list-header">
              <div className="list-title">节点操作：{ACTION_LABEL[item.action] ?? item.action}</div>
              <span className="list-meta">{formatTime(item.createdAt)}</span>
            </div>
            <div className="list-meta">审批人员：{item.approverId}</div>
            {item.comment && (
               <div className="list-meta" style={{ marginTop: '8px', padding: '8px', background: '#f8f9fa', borderRadius: '6px', color: '#1d2433' }}>
                 " {item.comment} "
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}`,

  'src/pages/Start.jsx': `import { Link } from 'react-router-dom'

export default function Start() {
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-title">您好，欢迎使用</div>
        <div className="hero-subtitle">今天也要高效推进协作流转</div>
      </div>

      <div className="section-title">快捷办理入口</div>
      <div className="card-grid">
        <Link to="/forms/new" className="card card-link">
          <div className="card-title">📝 提交申请</div>
          <div className="card-desc">发起新的审批表单</div>
        </Link>
        <Link to="/todo" className="card card-link">
          <div className="card-title">✅ 审批中心</div>
          <div className="card-desc">处理待办或查看进度</div>
        </Link>
        <div className="card" style={{ opacity: 0.6 }}>
          <div className="card-title">🏢 会议室</div>
          <div className="card-desc">功能开发中...</div>
        </div>
      </div>
    </div>
  )
}`,

  'src/pages/Me.jsx': `import { useEffect, useState } from 'react'

export default function Me() {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) throw new Error('个人信息获取失败')
        return res.json()
      })
      .then((data) => {
        if (alive) setProfile(data)
      })
      .catch((err) => {
        if (alive) setError(err.message)
      })

    return () => { alive = false }
  }, [])

  return (
    <div className="page">
      <div className="page-title">个人中心</div>
      
      <div className="card">
        {error && <div className="status-box error">⚠️ {error}</div>}
        {!error && !profile && <div className="status-box">资料加载中...</div>}
        
        {profile && (
          <div className="profile">
            <div className="profile-avatar">{profile.name?.[0] || 'U'}</div>
            <div className="profile-name">{profile.name}</div>
            <div className="list-meta" style={{ marginTop: '12px' }}>工号：{profile.id}</div>
            <div className="list-meta">部门：{profile.department?.name || '未分配'}</div>
            <div className="list-meta">
              角色：{profile.roles?.map((role) => role.name).join(' / ') || '普通员工'}
            </div>
          </div>
        )}
      </div>

      <div className="section-title">通用服务</div>
      <div className="list">
        <div className="list-item">
          <div className="list-title">账号与安全</div>
          <div className="list-meta">密码修改、设备管理等</div>
        </div>
        <div className="list-item">
          <div className="list-title">消息设置</div>
          <div className="list-meta">审批流转通知提醒配置</div>
        </div>
      </div>
    </div>
  )
}`,

  'src/pages/Reports.jsx': `const metrics = [
  { label: '本周审批', value: '38' },
  { label: '待处理项', value: '6' },
  { label: '已完结单', value: '120' }
]

const reportList = [
  { id: 1, title: '📈 采购预算趋势', desc: '本月硬件采购总金额下降 12%' },
  { id: 2, title: '🎯 项目交付达标', desc: 'S级重点项目按期交付率 96%' },
  { id: 3, title: '👥 人力资源投入', desc: '研发中心新增 2 个需求小组' }
]

export default function Reports() {
  return (
    <div className="page">
      <div className="page-title">数据看板</div>
      
      <div className="metrics">
        {metrics.map((item) => (
          <div key={item.label} className="metric-card">
            <div className="metric-value">{item.value}</div>
            <div className="metric-label">{item.label}</div>
          </div>
        ))}
      </div>
      
      <div className="section-title" style={{ marginTop: '10px' }}>重点业务摘要</div>
      <div className="list">
        {reportList.map((item) => (
          <div key={item.id} className="list-item">
            <div className="list-title">{item.title}</div>
            <div className="list-meta" style={{ marginTop: '6px' }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}`
};

console.log('🔄 开始自动替换前端文件...');

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.resolve(__dirname, filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf-8');
  console.log(`✅ 已更新/创建: ${filePath}`);
});

console.log('\n🎉 所有代码替换完毕！');
console.log('👉 现在你可以直接在终端运行: npm run dev 查看优化效果啦！');