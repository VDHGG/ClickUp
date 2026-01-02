import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export function Login() {
  const { login } = useAuth()

  const handleLogin = () => {
    // Redirect to backend auth login endpoint which will redirect to MindX ID
    login()
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-title">Account Login</h1>
        <p className="login-subtitle">Welcome to MindX Onboarding</p>

        <div className="login-form-content">
          <button 
            className="mindx-id-button"
            onClick={handleLogin}
            style={{ width: '100%', marginTop: '2rem' }}
          >
            <span className="mindx-icon">✕</span>
            <span>Login with MindX ID</span>
          </button>
        </div>

        <p className="register-link">
          Don't have an account? <a href="#register">Register</a>
        </p>
      </div>
    </div>
  )
}

