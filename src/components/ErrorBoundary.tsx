import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Catches React render errors and prevents the entire app from crashing.
 * Logs to console in development; in production you'd send to Sentry/etc.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, replace this with Sentry, LogRocket, etc.
    console.error('[ErrorBoundary] React error caught:', error)
    console.error('[ErrorBoundary] Component stack:', info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="text-5xl">💥</div>
            <h1 className="font-grotesque text-white text-xl font-bold">Something went wrong</h1>
            <p className="font-manrope text-neutral-400 text-sm">
              We&apos;ve hit an unexpected error. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#ABFF63] text-neutral-900 rounded-lg font-semibold hover:brightness-95 transition-all"
            >
              Refresh page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs text-red-400 bg-red-900/20 rounded-lg p-3 overflow-auto max-h-48">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
