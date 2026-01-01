import axios from 'axios'
import type { Todo } from '../types/todo'

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Important: include cookies for session
})

export const getTodos = async (baseUrl: string): Promise<Todo[]> => {
  const response = await api.get(`${baseUrl}/todos`)
  return response.data.data || []
}

export const getTodo = async (baseUrl: string, id: string): Promise<Todo> => {
  const response = await api.get(`${baseUrl}/todos/${id}`)
  return response.data.data
}

export const createTodo = async (
  baseUrl: string,
  title: string,
  description?: string
): Promise<Todo> => {
  const response = await api.post(`${baseUrl}/todos`, { title, description })
  return response.data.data
}

export const updateTodo = async (
  baseUrl: string,
  id: string,
  updates: Partial<Todo>
): Promise<Todo> => {
  const response = await api.put(`${baseUrl}/todos/${id}`, updates)
  return response.data.data
}

export const deleteTodo = async (baseUrl: string, id: string): Promise<void> => {
  await api.delete(`${baseUrl}/todos/${id}`)
}

