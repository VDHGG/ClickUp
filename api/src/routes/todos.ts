import { Router, Response } from 'express';
import { authenticateSession, AuthenticatedRequest } from '../middleware/auth';

export const todoRouter = Router();

// Apply authentication middleware to all todo routes
todoRouter.use(authenticateSession);


interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

let todos: Todo[] = [
  {
    id: '1',
    title: 'Welcome to ClickUp!',
    description: 'This is your first task. You can edit or delete it.',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/todos - Get all todos
todoRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: todos,
    count: todos.length
  });
});

// GET /api/todos/:id - Get a single todo
todoRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const todo = todos.find(t => t.id === req.params.id);
  
  if (!todo) {
    return res.status(404).json({
      success: false,
      message: 'Todo not found'
    });
  }
  
  res.json({
    success: true,
    data: todo
  });
});

// POST /api/todos - Create a new todo
todoRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  const { title, description } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }
  
  const newTodo: Todo = {
    id: Date.now().toString(),
    title: title.trim(),
    description: description?.trim() || '',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  
  res.status(201).json({
    success: true,
    data: newTodo
  });
});

// PUT /api/todos/:id - Update a todo
todoRouter.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const todoIndex = todos.findIndex(t => t.id === req.params.id);
  
  if (todoIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Todo not found'
    });
  }
  
  const { title, description, completed } = req.body;
  const existingTodo = todos[todoIndex];
  
  todos[todoIndex] = {
    ...existingTodo,
    title: title !== undefined ? title.trim() : existingTodo.title,
    description: description !== undefined ? description.trim() : existingTodo.description,
    completed: completed !== undefined ? Boolean(completed) : existingTodo.completed,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: todos[todoIndex]
  });
});

// DELETE /api/todos/:id - Delete a todo
todoRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const todoIndex = todos.findIndex(t => t.id === req.params.id);
  
  if (todoIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Todo not found'
    });
  }
  
  const deletedTodo = todos.splice(todoIndex, 1)[0];
  
  res.json({
    success: true,
    message: 'Todo deleted successfully',
    data: deletedTodo
  });
});

