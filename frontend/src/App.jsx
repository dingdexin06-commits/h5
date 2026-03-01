import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TabBar from './components/TabBar.jsx'
import Start from './pages/Start.jsx'
import Todo from './pages/Todo.jsx'
import Reports from './pages/Reports.jsx'
import Me from './pages/Me.jsx'
import FormCreate from './pages/FormCreate.jsx'
import FormDetail from './pages/FormDetail.jsx'
import Login from './pages/Login.jsx'
import { getAuthToken } from './auth'

export default function App() {
  const [token, setToken] = useState(() => getAuthToken())

  useEffect(() => {
    const onAuthChanged = () => {
      setToken(getAuthToken())
    }

    window.addEventListener('auth:changed', onAuthChanged)
    return () => window.removeEventListener('auth:changed', onAuthChanged)
  }, [])

  if (!token) {
    return (
      <div className="app">
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/start" replace />} />
          <Route path="/login" element={<Navigate to="/start" replace />} />
          <Route path="/start" element={<Start />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/forms/new" element={<FormCreate />} />
          <Route path="/forms/:id" element={<FormDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/me" element={<Me />} />
          <Route path="*" element={<Navigate to="/start" replace />} />
        </Routes>
      </div>
      <TabBar />
    </div>
  )
}
