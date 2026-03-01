import { Link } from 'react-router-dom'

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
}
