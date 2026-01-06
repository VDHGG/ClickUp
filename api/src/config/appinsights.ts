import * as appInsights from 'applicationinsights';
import dotenv from 'dotenv';

dotenv.config();

// Azure Application Insights Configuration
const CONNECTION_STRING = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || '';

let isInitialized = false;

/**
 * Initialize Azure Application Insights
 * Should be called before any other code that might generate telemetry
 */
export function initializeAppInsights(): void {
  // Skip if already initialized
  if (isInitialized) {
    return;
  }

  // Skip if connection string is not provided
  if (!CONNECTION_STRING || CONNECTION_STRING.trim() === '') {
    console.warn('[AppInsights] Connection string not provided. Application Insights will not be enabled.');
    console.warn('[AppInsights] Set APPLICATIONINSIGHTS_CONNECTION_STRING environment variable to enable.');
    return;
  }

  try {
    // Set connection string
    appInsights.setup(CONNECTION_STRING)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, false) // Disable console logging to avoid duplicate logs
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();

    // Set default properties for all telemetry
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'clickup-api';
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = process.env.HOSTNAME || 'unknown';

    isInitialized = true;
    console.log('[AppInsights] ✅ Application Insights initialized successfully');
  } catch (error) {
    console.error('[AppInsights] ❌ Failed to initialize Application Insights:', error);
  }
}

/**
 * Get the Application Insights client
 * Returns null if not initialized
 */
export function getAppInsightsClient(): appInsights.TelemetryClient | null {
  if (!isInitialized) {
    return null;
  }
  return appInsights.defaultClient;
}

/**
 * Track a custom event
 */
export function trackEvent(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }): void {
  const client = getAppInsightsClient();
  if (client) {
    client.trackEvent({
      name,
      properties,
      measurements,
    });
  }
}

/**
 * Track a custom metric
 */
export function trackMetric(name: string, value: number, count?: number, min?: number, max?: number): void {
  const client = getAppInsightsClient();
  if (client) {
    client.trackMetric({
      name,
      value,
      count,
      min,
      max,
    });
  }
}

/**
 * Track an exception
 */
export function trackException(exception: Error, properties?: { [key: string]: string }): void {
  const client = getAppInsightsClient();
  if (client) {
    client.trackException({
      exception,
      properties,
    });
  }
}

/**
 * Track a trace (log message)
 */
export function trackTrace(message: string, severity?: appInsights.Contracts.SeverityLevel, properties?: { [key: string]: string }): void {
  const client = getAppInsightsClient();
  if (client) {
    client.trackTrace({
      message,
      severity: severity || appInsights.Contracts.SeverityLevel.Information,
      properties,
    });
  }
}

export { appInsights };

