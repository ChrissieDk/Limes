import { forwardRef, type InputHTMLAttributes, type ReactNode, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import clsx from 'classnames'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  prefix?: ReactNode
  error?: string
  variant?: 'light' | 'dark'
}

const TextField = forwardRef<HTMLInputElement, Props>(
  ({ label, prefix, type = 'text', error, className, variant = 'light', ...rest }, ref) => {
    const [isPasswordVisible, setPasswordVisible] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type
    const isDark = variant === 'dark'

    return (
      <label className="grid gap-2">
        {label && (
          <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`}>
            {label}
          </span>
        )}
        <div
          className={clsx(
            'flex items-center',
            isDark
              ? 'h-10 sm:h-11 rounded-lg bg-white/5 border border-white/10 text-white focus-within:border-white/20'
              : 'h-12 rounded-xl bg-white ring-1 ring-neutral-300 focus-within:ring-neutral-500 text-black',
            error && 'ring-red-500',
          )}
        >
          {prefix && (
            <>
              <span className={`px-3 text-sm select-none ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`}>
                {prefix}
              </span>
              {isDark && <span className="h-6 w-px bg-white/10" />}
            </>
          )}
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              'flex-1 bg-transparent outline-none px-3 text-sm',
              isDark ? 'text-white placeholder:text-neutral-500' : 'text-black placeholder:text-neutral-500',
              className
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              onClick={() => setPasswordVisible((v) => !v)}
              className={`px-3 ${isDark ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              {isPasswordVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </label>
    )
  },
)

export default TextField


