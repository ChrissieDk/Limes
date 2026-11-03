import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'

type Props = {
  /** Small label beside the green dot, e.g. "Register" or "Log in". */
  eyebrow: string
  heading: ReactNode
  subheading?: ReactNode
  children?: ReactNode
  footer?: ReactNode
}

/** Centered, frameless frame used by the register and log in journeys. */
export default function AuthShell({ eyebrow, heading, subheading, children, footer }: Props) {
  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-10 pb-24">
        <div className="font-manrope flex items-center justify-center text-xs text-neutral-400">
          <span className="size-2 rounded-full bg-[#ABFF63] mr-2" /> {eyebrow}
        </div>
        <h1 className="mt-3 font-grotesque font-bold text-white text-center leading-[1.1] text-[32px] sm:text-[40px]">
          {heading}
        </h1>
        {subheading && (
          <p className="mt-3 text-center text-neutral-200 text-base md:text-lg font-manrope max-w-2xl mx-auto">
            {subheading}
          </p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </main>
      {footer}
    </div>
  )
}
