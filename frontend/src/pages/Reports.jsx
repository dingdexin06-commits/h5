const metrics = [
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
}
