import { Router, Request, Response } from 'express';
import { trackException } from '../config/appinsights';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'clickup-api',
    version: '1.0.0'
  });
});

// ⚠️ TEST ENDPOINTS - Remove after testing alerts
// These endpoints are for testing Azure Alerts only

// Test endpoint for 5xx errors alert
healthRouter.get('/test-error', (req: Request, res: Response) => {
  const error = new Error('Test error for alert testing');
  trackException(error, {
    endpoint: '/health/test-error',
    purpose: 'alert_testing',
  });
  res.status(500).json({
    error: 'Test error for alert',
    message: 'This is a test endpoint for alert testing. Remove after testing.',
  });
});

// Test endpoint for high response time alert
healthRouter.get('/test-slow', async (req: Request, res: Response) => {
  // Simulate slow response (3 seconds)
  await new Promise(resolve => setTimeout(resolve, 3000));
  res.json({
    message: 'Slow response test',
    duration: '3 seconds',
    note: 'This is a test endpoint for alert testing. Remove after testing.',
  });
});

