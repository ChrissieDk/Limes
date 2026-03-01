import { useEffect, useRef, useState, type ReactNode } from 'react'
import Navbar from '../components/Navbar'

type Props = {
  heading: ReactNode
  subheading?: ReactNode
  children: ReactNode
  side?: ReactNode
  variant?: 'signin' | 'signup' | 'policy'
  belowCard?: ReactNode
  footer?: ReactNode
  tone?: 'dark' | 'light'
}

export default function AuthLayout({
  heading,
  subheading,
  children,
  side,
  variant = 'signup',
  belowCard,
  footer,
  tone,
}: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined)
  const isDark = (tone ?? (variant === 'signin' ? 'dark' : 'light')) === 'dark'
  const hasSide = Boolean(side)

  useEffect(() => {
    if (!cardRef.current) return
    const el = cardRef.current
    const ro = new ResizeObserver(() => setCardHeight(el.offsetHeight))
    ro.observe(el)
    setCardHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className={
        isDark
          ? 'min-h-screen text-white bg-[#0E0E12] bg-[radial-gradient(1000px_600px_at_15%_10%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_500px_at_85%_80%,rgba(255,255,255,0.04),transparent_60%)]'
          : 'min-h-screen bg-neutral-900 text-white'
      }
    >
      <Navbar />
      <div
        className={
          isDark
            ? hasSide
              ? 'mx-auto max-w-6xl px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center justify-center'
              : 'mx-auto max-w-6xl px-6 py-12 lg:py-16'
            : hasSide
              ? 'mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start justify-center'
              : 'mx-auto max-w-6xl px-6 py-10'
        }
      >
        <div className="w-full flex justify-center">
          <div className={isDark ? (hasSide ? 'max-w-[520px] w-full' : 'w-full') : (hasSide ? 'max-w-xl w-full' : 'w-full')}>
            <div
              ref={cardRef}
              className={
                isDark
                  ? 'rounded-[28px] bg-transparent border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-[2px]'
                  : 'rounded-2xl bg-white text-black ring-1 ring-neutral-200 shadow-sm'
              }
            >
              <div className={isDark ? 'px-10 pt-8' : 'px-6 pt-6'}>
                <div
                  className={
                    isDark
                      ? 'flex items-center justify-center gap-2 text-sm text-neutral-400'
                      : 'flex items-center justify-center gap-2 text-sm text-neutral-500'
                  }
                >
                  <span className={variant === 'signin' ? 'size-2 rounded-full bg-[#ABFF63]' : 'size-2 rounded-full bg-lime-400'} />
                  <span className={variant === 'signin' ? 'font-medium' : 'font-semibold text-md'}>
                    {variant === 'signin' ? 'Sign in' : variant === 'policy' ? 'Policies' : 'Sign Up'}
                  </span>
                </div>
                <div className={isDark ? 'mt-6' : 'mt-4'}>
                  <h1
                    className={
                      isDark
                        ? 'font-grotesque font-bold text-white text-center leading-[1.05] text-[40px] sm:text-[44px] md:text-[52px]'
                        : 'text-2xl md:text-4xl font-bold leading-tight text-neutral-900 text-center'
                    }
                  >
                    {heading}
                  </h1>
                  {subheading && (
                    <p
                      className={
                        isDark
                          ? 'mt-3 text-center text-[12px] sm:text-sm text-neutral-500 max-w-[44ch] mx-auto font-manrope leading-relaxed'
                          : 'mt-3 text-neutral-500 max-w-md text-sm text-center mx-auto'
                      }
                    >
                      {subheading}
                    </p>
                  )}
                </div>
              </div>
              <div className={isDark ? 'px-10 pb-10 pt-6' : 'p-8 pt-4 md:p-16 md:pt-4'}>
                {children}
              </div>
            </div>
            {variant === 'signin' && isDark ? (
              belowCard ? (
                <div className="mt-6">{belowCard}</div>
              ) : null
            ) : (
              <footer className="mt-6 text-xs text-neutral-500">© 2025 Limes</footer>
            )}
          </div>
        </div>

        {hasSide && (
          <div className="hidden lg:block w-full" style={{ height: cardHeight }}>
            {side}
          </div>
        )}
      </div>
      {footer}
    </div>
  )
}


