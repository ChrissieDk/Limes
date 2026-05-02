import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('logger', () => {
  const originalEnv = import.meta.env.DEV

  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // @ts-expect-error - resetting env
    import.meta.env.DEV = originalEnv
  })

  it('logs to console in dev', () => {
    // @ts-expect-error - forcing dev mode
    import.meta.env.DEV = true
    logger.debug('test')
    expect(console.debug).toHaveBeenCalledWith('[Limes]', 'test')
  })

  it('silences debug/info/warn in production', () => {
    // @ts-expect-error - forcing prod mode
    import.meta.env.DEV = false
    logger.debug('test')
    logger.info('test')
    logger.warn('test')
    expect(console.debug).not.toHaveBeenCalled()
    expect(console.info).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
  })
})
