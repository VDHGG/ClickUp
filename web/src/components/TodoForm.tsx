import { useState } from 'react'
import './TodoForm.css'

interface TodoFormProps {
  onSubmit: (title: string, description?: string) => Promise<void>
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(title.trim(), description.trim() || undefined)
      setTitle('')
      setDescription('')
    } catch (error) {
      console.error('Error creating todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>
      <div className="form-group">
        <textarea
          className="form-textarea"
          placeholder="Add a description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          rows={3}
        />
      </div>
      <button
        type="submit"
        className="submit-button"
        disabled={isSubmitting || !title.trim()}
      >
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  )
}

