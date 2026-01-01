import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { todoRouter } from './routes/todos';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io',
  credentials: true,
}));
app.use(express.json());

// Session middleware (for authentication)
app.use(session({
  secret: process.env.SESSION_SECRET || 'clickup-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    sameSite: 'lax', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  name: 'clickup.sid', // Custom session name
}));

// Routes
app.use('/health', healthRouter);
app.use('/api/health', healthRouter); // Also support /api/health for ingress
app.use('/api/auth', authRouter);
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
  console.log(` ClickUp API server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` API endpoint: http://localhost:${PORT}/api/todos`);
});

export default app;

