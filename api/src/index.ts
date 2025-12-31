import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { todoRouter } from './routes/todos';
import { healthRouter } from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/api/todos', todoRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'ClickUp API - To-do List Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      todos: '/api/todos'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ClickUp API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/todos`);
});

export default app;

