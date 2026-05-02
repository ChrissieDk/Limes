import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
}

export default function Checkbox({ label, className, ...rest }: Props) {
  return (
    <label className={`flex items-center gap-3 font-manrope text-sm text-neutral-400 cursor-pointer ${className || ''}`}>
      <input
        type="checkbox"
        className="size-4 rounded border-neutral-600 bg-[#1F1E24] text-[#ABFF63] focus:ring-[#ABFF63] focus:ring-2 cursor-pointer"
        {...rest}
      />
      <span className="leading-5">{label}</span>
    </label>
  )
}


