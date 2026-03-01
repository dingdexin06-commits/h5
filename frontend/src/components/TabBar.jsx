import { NavLink } from 'react-router-dom'

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
}
