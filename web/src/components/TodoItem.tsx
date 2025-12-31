import { useState } from 'react'
import type { Todo } from '../types/todo'
import './TodoItem.css'

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string, completed: boolean) => Promise<void>
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TodoItem({
  todo,
  onToggleComplete,
  onUpdate,
  onDelete
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async () => {
    await onToggleComplete(todo.id, !todo.completed)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
  }

  const handleSave = async () => {
    if (!editTitle.trim()) {
      return
    }

    try {
      setIsUpdating(true)
      await onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating todo:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDelete(todo.id)
    }
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={isUpdating}
        />
      </div>
      <div className="todo-content">
        {isEditing ? (
          <div className="todo-edit">
            <input
              type="text"
              className="edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={isUpdating}
              autoFocus
            />
            <textarea
              className="edit-textarea"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={isUpdating}
              rows={2}
            />
            <div className="edit-actions">
              <button
                className="save-button"
                onClick={handleSave}
                disabled={isUpdating || !editTitle.trim()}
              >
                Save
              </button>
              <button
                className="cancel-button"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="todo-title" onClick={handleEdit}>
              {todo.title}
            </h3>
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}
            <div className="todo-actions">
              <button className="edit-button" onClick={handleEdit}>
                Edit
              </button>
              <button className="delete-button" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

