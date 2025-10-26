import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
}

export default function Checkbox({ label, className, ...rest }: Props) {
  return (
    <label className="flex items-start gap-3 text-sm text-neutral-300">
      <input
        type="checkbox"
        className="mt-1 size-4 rounded border-neutral-700 bg-neutral-800 text-lime-400 focus:ring-lime-400"
        {...rest}
      />
      <span className="leading-5">{label}</span>
    </label>
  )
}


