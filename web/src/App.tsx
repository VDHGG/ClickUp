import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './components/Login'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TodoList } from './components/TodoList'
import { TodoForm } from './components/TodoForm'
import { Header } from './components/Header'
import { getTodos, createTodo, updateTodo, deleteTodo } from './services/api'
import { trackPageView, trackTodoCreated, trackTodoUpdated, trackTodoDeleted } from './config/ga4'
import type { Todo } from './types/todo'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadTodos()
    }
  }, [isAuthenticated])

  const loadTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTodos(API_BASE_URL)
      setTodos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos')
      console.error('Error loading todos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTodo = async (title: string, description?: string) => {
    try {
      const newTodo = await createTodo(API_BASE_URL, title, description)
      setTodos([...todos, newTodo])
      trackTodoCreated(newTodo.id) // Track GA4 event
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo')
      throw err
    }
  }

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await updateTodo(API_BASE_URL, id, updates)
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
      trackTodoUpdated(id, updatedTodo.completed) // Track GA4 event
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
      throw err
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(API_BASE_URL, id)
      setTodos(todos.filter(todo => todo.id !== id))
      trackTodoDeleted(id) // Track GA4 event
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
      throw err
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    await handleUpdateTodo(id, { completed })
  }

  return (
    <div className="app">
      <Header />
      <div className="container">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        <TodoForm onSubmit={handleCreateTodo} />
        <TodoList
          todos={todos}
          loading={loading}
          onToggleComplete={handleToggleComplete}
          onUpdate={handleUpdateTodo}
          onDelete={handleDeleteTodo}
        />
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated, loading } = useAuth()

  // Track page view on mount and route changes
  useEffect(() => {
    const path = window.location.pathname
    trackPageView(path)
  }, [isAuthenticated]) // Track when auth state changes

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="app">
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
          <h2>Loading...</h2>
          <p>Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {!isAuthenticated ? (
        <Login />
      ) : (
        <ProtectedRoute>
          <TodoApp />
        </ProtectedRoute>
      )}
    </>
  )
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}

export default AppWithAuth
