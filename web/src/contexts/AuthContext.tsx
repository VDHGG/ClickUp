import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { trackLogin, trackLogout } from '../config/ga4'

interface User {
  sub: string
  name?: string
  email?: string
  preferred_username?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status from backend session
  const checkAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Important: include cookies for session
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setUserState(data.data)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          setUserState(null)
        }
      } else {
        setIsAuthenticated(false)
        setUserState(null)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setIsAuthenticated(false)
      setUserState(null)
    } finally {
      setLoading(false)
    }
  }

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Handle error from URL (after redirect from callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    
    if (error) {
      console.error('Authentication error:', error)
      alert('Authentication failed: ' + decodeURIComponent(error))
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      checkAuth() // Re-check auth status
    }
  }, [])

  const login = () => {
    // Track login initiation
    trackLogin('MindX ID')
    // Redirect to backend auth login endpoint
    window.location.href = `${API_BASE_URL}/auth/login`
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      trackLogout() // Track logout event
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setIsAuthenticated(false)
      setUserState(null)
      // Refresh page to clear any cached state
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

