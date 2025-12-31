import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For now, just login (will be replaced with real auth later)
    login()
  }

  const handleMindXIDLogin = () => {
    // For now, just login (will be replaced with OpenID redirect later)
    // This will redirect to https://id-dev.mindx.edu.vn in Step 5
    login()
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-title">Account Login</h1>
        <p className="login-subtitle">Welcome to MindX Onboarding</p>

        <form onSubmit={handleSubmit} className="login-form-content">
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <a href="#register">Register</a>
        </p>

        <div className="separator">
          <span>OR CONTINUE WITH</span>
        </div>

        <button 
          className="mindx-id-button"
          onClick={handleMindXIDLogin}
        >
          <span className="mindx-icon">✕</span>
          <span>MindX ID</span>
        </button>
      </div>
    </div>
  )
}

