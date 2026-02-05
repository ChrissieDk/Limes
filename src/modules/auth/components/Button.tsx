import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'classnames'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
}

export default function Button({
  children,
  className,
  variant = 'primary',
  disabled,
  fullWidth = true,
  ...rest
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center h-12 rounded-xl px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ABFF63] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)]'
  const variants: Record<string, string> = {
    primary:
      'bg-[#ABFF63] text-black hover:bg-[#ABFF63]/90 active:bg-[#ABFF63]',
    secondary:
      'bg-neutral-800 text-white hover:bg-neutral-700',
  }

  return (
    <button
      className={clsx(base, variants[variant], fullWidth && 'w-full', className)}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}


