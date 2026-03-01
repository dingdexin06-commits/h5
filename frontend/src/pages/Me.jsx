import { useEffect, useState } from 'react'

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
}
