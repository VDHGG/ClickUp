import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { initializeAppInsights } from './config/appinsights';
import { todoRouter } from './routes/todos';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';

dotenv.config();

// 🔥 Initialize Azure Application Insights FIRST (before any other code)
// This ensures all telemetry is captured from the start
initializeAppInsights();

const app = express();

// 🔥 CRITICAL: Trust proxy for NGINX Ingress on AKS
// This allows Express to recognize HTTPS requests from NGINX
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io',
  credentials: true,
}));
app.use(express.json());

// Session middleware (for authentication)
// 🔥 CRITICAL: sameSite: 'none' + secure: true is REQUIRED for cross-site OpenID redirects
// This allows cookies to be sent when redirecting from external IdP (MindX) back to our callback
app.use(session({
  secret: process.env.SESSION_SECRET || 'clickup-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true, // Create session immediately for login flow
  cookie: {
    secure: true, // 🔥 MUST be true when sameSite: 'none' (HTTPS required)
    httpOnly: true,
    sameSite: 'none', // 🔥 REQUIRED for cross-site redirects from OpenID provider
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    // Don't set domain - let browser handle it automatically
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

