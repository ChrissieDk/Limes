import * as Sentry from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

Sentry.init({
  dsn: 'https://731e046d41281156c2fa304dfdb4101d@o4511324749824000.ingest.de.sentry.io/4511324754608208',
  environment: import.meta.env.MODE || 'development',
  sendDefaultPii: true,

  // Enable all observability features
  enableLogs: true,
  enableMetrics: true,
  // Release version — auto-detected from build or falls back to git hash / timestamp
  release: import.meta.env.VITE_SENTRY_RELEASE || undefined,

  integrations: [
    // Performance / tracing (page loads, web vitals, navigation)
    Sentry.browserTracingIntegration(),

    // Session Replay — free plan = 500 replays/month
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),

    // User Feedback — adds a floating "Report a Bug" button
    Sentry.feedbackIntegration({
      colorScheme: 'system',
    }),

    // Capture console.* calls as structured Sentry Logs.
    // Multiple arguments become searchable attributes automatically.
    Sentry.consoleLoggingIntegration({
      levels: ['log', 'info', 'warn', 'error', 'debug', 'assert'],
    }),
  ],

  // Performance: 100% sample rate for now so Sentry receives transactions quickly.
  // Free plan = 5k transactions/month. Drop this to 0.1 after you see it working.
  tracesSampleRate: 1.0,

  // Trace propagation for same-origin and your API
  tracePropagationTargets: [/^\//, /^https:\/\/limes-staging\.up\.railway\.app/],

  // Replay sample rates
  replaysSessionSampleRate: 0.1,   // 10% of sessions
  replaysOnErrorSampleRate: 1.0,   // 100% of sessions with an error

  // Strip sensitive fields from logs before sending
  beforeSendLog(log) {
    // Drop debug logs in production to save quota
    if (import.meta.env.PROD && log.level === 'debug') {
      return null
    }

    // Scrub sensitive attributes from any log
    const sensitive = ['password', 'token', 'authorization', 'secret', 'api_key', 'credit_card']
    if (log.attributes) {
      for (const key of Object.keys(log.attributes)) {
        if (sensitive.some((s) => key.toLowerCase().includes(s))) {
          delete log.attributes[key]
        }
      }
    }

    return log
  },

  // Strip sensitive data from error events too
  beforeSend(event) {
    // Drop localhost events so dev doesn't eat your quota
    if (
      import.meta.env.DEV &&
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      return null
    }

    // Scrub auth headers from request breadcrumbs
    if (event.breadcrumbs) {
      for (const crumb of event.breadcrumbs) {
        if (crumb.data?.url) {
          try {
            const url = new URL(crumb.data.url)
            url.search = ''
            crumb.data.url = url.toString()
          } catch {
            // ignore malformed URLs
          }
        }
        if (crumb.data?.headers?.Authorization) {
          delete crumb.data.headers.Authorization
        }
      }
    }

    return event
  },
})

// Set app-wide attributes on every log, error, and trace
Sentry.getGlobalScope().setAttributes({
  app_name: 'limes',
  platform: 'web',
})

// React 19 error hooks — sends ALL React errors to Sentry
const root = createRoot(document.getElementById('root')!, {
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn('Uncaught error', error, errorInfo.componentStack)
  }),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
})

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
