import type { ButtonHTMLAttributes } from 'react'

type Provider = 'google' | 'facebook'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  provider: Provider
  /** Verb shown before the provider name, e.g. "Register" or "Log in". */
  action?: string
}

const NAMES: Record<Provider, string> = { google: 'Google', facebook: 'Facebook' }

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M13.4 19v-6.2h2.1l.4-2.6h-2.5V8.7c0-.7.3-1.3 1.4-1.3H16V5.1C15.8 5.1 14.9 5 14 5c-2 0-3.4 1.2-3.4 3.4v1.8H8.4v2.6h2.2V19h2.8z" />
    </svg>
  )
}

export default function SocialAuthButton({ provider, action = 'Register', className, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 font-manrope text-sm font-semibold text-black transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ABFF63] disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ''}`}
      {...rest}
    >
      {provider === 'google' ? <GoogleIcon /> : <FacebookIcon />}
      {action} with {NAMES[provider]}
    </button>
  )
}
