import { forwardRef, type InputHTMLAttributes, type ReactNode, useState } from 'react'
import clsx from 'classnames'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  prefix?: ReactNode
  error?: string
}

const TextField = forwardRef<HTMLInputElement, Props>(
  ({ label, prefix, type = 'text', error, className, ...rest }, ref) => {
    const [isPasswordVisible, setPasswordVisible] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type

    return (
      <label className="grid gap-2">
        {label && <span className="text-sm text-neutral-700">{label}</span>}
        <div
          className={clsx(
            'flex items-center h-12 rounded-xl bg-white ring-1 ring-neutral-300 focus-within:ring-neutral-500 text-black',
            error && 'ring-red-500',
          )}
        >
          {prefix && (
            <span className="px-3 text-neutral-400 text-sm select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            type={inputType}
            className={clsx('flex-1 bg-transparent outline-none px-3 text-sm placeholder:text-neutral-500', className)}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              onClick={() => setPasswordVisible((v) => !v)}
              className="px-3 text-neutral-400 hover:text-neutral-200"
            >
              {/* Simple eye icon substitute */}
              {isPasswordVisible ? '🙈' : '👁️'}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </label>
    )
  },
)

export default TextField


