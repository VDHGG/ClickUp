import { useAuth } from '../contexts/AuthContext'
import './Header.css'

export function Header() {
  const { logout } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>ClickUp</h1>
          <p className="subtitle">Your Personal To-do List Manager</p>
        </div>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}
