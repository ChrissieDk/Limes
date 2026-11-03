import type { InputHTMLAttributes, ReactNode } from 'react'
import { Check } from 'lucide-react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
  error?: string
}

export default function Checkbox({ label, error, className, ...rest }: Props) {
  return (
    <div className={className}>
      <label className="flex items-center gap-3 font-manrope text-sm text-white cursor-pointer">
        <input type="checkbox" className="peer sr-only" aria-invalid={error ? true : undefined} {...rest} />
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-md border bg-transparent text-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#ABFF63] peer-checked:[&>svg]:opacity-100 ${
            error ? 'border-red-400' : 'border-white/60'
          }`}
        >
          <Check className="size-4 opacity-0" aria-hidden="true" />
        </span>
        <span className="leading-5">{label}</span>
      </label>
      {error && (
        <span role="alert" className="mt-2 block font-manrope text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  )
}
