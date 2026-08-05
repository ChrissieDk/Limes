import * as Sentry from '@sentry/react'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

//sentry initialization
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
    Sentry.reactRouterBrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),

    // Session Replay — free plan = 500 replays/month
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),

    // User Feedback — styled to match Limes UI exactly
    // Docs: https://docs.sentry.io/platforms/javascript/user-feedback/configuration/
    Sentry.feedbackIntegration({
      colorScheme: 'dark',
      showBranding: false,

      // Logo shown at the top of the feedback form
      formLogo: '/images/limes-mobile_horizontal.svg',

      // Button text
      buttonLabel: 'Report an Issue',
      submitButtonLabel: 'Send Report',
      cancelButtonLabel: 'Cancel',
      formTitle: 'Report an Issue',

      // Placeholders
      namePlaceholder: 'Your name',
      emailPlaceholder: 'your.email@example.com',
      messagePlaceholder: 'What went wrong? Describe the issue...',

      // Fields visibility / requirements
      showName: true,
      showEmail: true,
      isNameRequired: false,
      isEmailRequired: false,

      // Shared Limes theme (app is dark-only)
      // Use camelCase keys (not CSS variable names) for JS config
      themeLight: {
        background: '#0E0E12',
        foreground: '#ffffff',
        accentBackground: '#ABFF63',
        accentForeground: '#0E0E12',
        outline: 'rgba(255, 255, 255, 0.20)',
        boxShadow: 'none',
        successColor: '#2da98c',
        errorColor: '#f55459',
      },

      // Dark theme — identical to light since Limes is dark-only
      themeDark: {
        background: '#0E0E12',
        foreground: '#ffffff',
        accentBackground: '#ABFF63',
        accentForeground: '#0E0E12',
        outline: 'rgba(255, 255, 255, 0.20)',
        boxShadow: 'none',
        successColor: '#2da98c',
        errorColor: '#f55459',
      },
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

if (typeof window !== 'undefined') {
  const injectFeedbackStyles = () => {
    const host = document.getElementById('sentry-feedback')
    if (!host || !host.shadowRoot) return false

    const style = document.createElement('style')
    style.textContent = `
      /* Form inputs — match Limes TextField dark variant */
      textarea,
      input[type="text"],
      input[type="email"] {
        background: #1F1E24 !important;
        border: 1px solid rgba(255, 255, 255, 0.20) !important;
        color: #ffffff !important;
        border-radius: 8px !important;
        font-family: 'Manrope', ui-sans-serif, system-ui, -apple-system, sans-serif !important;
      }
      textarea::placeholder,
      input::placeholder {
        color: rgba(255, 255, 255, 0.40) !important;
      }
      textarea:focus,
      input:focus {
        border-color: rgba(171, 255, 99, 0.50) !important;
        outline: none !important;
        box-shadow: 0 0 0 2px rgba(171, 255, 99, 0.15) !important;
      }
    `
    host.shadowRoot.appendChild(style)
    return true
  }

  // Try immediately (widget may already be mounted)
  if (!injectFeedbackStyles()) {
    const observer = new MutationObserver(() => {
      if (injectFeedbackStyles()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }
}

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
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
