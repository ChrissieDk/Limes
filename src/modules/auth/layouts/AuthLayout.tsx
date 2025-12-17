import { useEffect, useRef, useState, type ReactNode } from 'react'
import Navbar from '../components/Navbar'

type Props = {
  heading: ReactNode
  subheading?: ReactNode
  children: ReactNode
  side?: ReactNode
}

export default function AuthLayout({ heading, subheading, children, side }: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!cardRef.current) return
    const el = cardRef.current
    const ro = new ResizeObserver(() => setCardHeight(el.offsetHeight))
    ro.observe(el)
    setCardHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start justify-center">
        <div className="w-full flex justify-center">
          <div className="max-w-xl w-full">
            <div ref={cardRef} className="rounded-2xl bg-white text-black ring-1 ring-neutral-200 shadow-sm">
              <div className="px-6 pt-6">
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                  <span className="size-2 rounded-full bg-lime-400" />
                  <span className="font-semibold text-md">Sign Up</span>
                </div>
                <div className="mt-4">
                  <h1 className="text-2xl md:text-4xl font-bold leading-tight text-neutral-900 text-center">
                    {heading}
                  </h1>
                  {subheading && (
                    <p className="mt-3 text-neutral-500 max-w-md text-sm text-center mx-auto">
                      {subheading}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-8 pt-4 md:p-16 md:pt-4">
                {children}
              </div>
            </div>
            <footer className="mt-6 text-xs text-neutral-500">© 2025 Limes</footer>
          </div>
        </div>

        <div className="hidden lg:block w-full" style={{ height: cardHeight }}>
          {side}
        </div>
      </div>
    </div>
  )
}


