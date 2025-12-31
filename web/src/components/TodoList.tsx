import { TodoItem } from './TodoItem'
import type { Todo } from '../types/todo'
import './TodoList.css'

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  onToggleComplete: (id: string, completed: boolean) => Promise<void>
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TodoList({
  todos,
  loading,
  onToggleComplete,
  onUpdate,
  onDelete
}: TodoListProps) {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create your first task above!</p>
      </div>
    )
  }

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length

  return (
    <div className="todo-list">
      <div className="todo-stats">
        <span>
          {completedCount} of {totalCount} tasks completed
        </span>
      </div>
      <div className="todos">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleComplete={onToggleComplete}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

