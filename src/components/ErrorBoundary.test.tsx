import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

// Suppress React's error logging for intentional test errors
const consoleError = console.error
beforeAll(() => { console.error = () => {} })
afterAll(() => { console.error = consoleError })

function BrokenComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Test explosion')
  return <p>All systems operational</p>
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('All systems operational')).toBeInTheDocument()
  })

  it('shows default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText("We've hit an unexpected error. Try refreshing the page."),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh page' })).toBeInTheDocument()
  })

  it('shows custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error state</div>}>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom error state')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('renders the emoji indicator in the default fallback', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('💥')).toBeInTheDocument()
  })
})
