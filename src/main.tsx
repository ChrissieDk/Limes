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

  // Release version — auto-detected from build or falls back to git hash / timestamp
  // Set SENTRY_RELEASE env var during build to override
  release: import.meta.env.VITE_SENTRY_RELEASE || undefined,

  // Performance monitoring: 10% of transactions in production
  // Free plan = 5k transactions/month. Tune this down if you get close to the limit.
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 0.0,

  // Session Replay (uncomment if you want it — free plan = 500 replays/month)
  // replaysSessionSampleRate: 0.01,       // 1% of sessions
  // replaysOnErrorSampleRate: 0.1,        // 10% of sessions with errors
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,     // hides text content
      blockAllMedia: true,   // hides images/video
    }),
  ],

  // Optional: drop localhost errors so dev doesn't eat your quota
  beforeSend(event) {
    if (
      import.meta.env.DEV &&
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      return null
    }
    return event
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
