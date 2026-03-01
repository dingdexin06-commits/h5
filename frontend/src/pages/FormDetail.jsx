import { useCallback, useEffect, useState } from 'react'
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
      const res = await fetch(`/api/forms/${id}`)
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
    if (!window.confirm(`确认要【${actionText}】该审批单吗？`)) return;

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/forms/${id}/approve`, {
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
                <span className={`badge ${getStatusClass(form.status)}`}>
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
}
