import { useState, type ReactNode } from 'react'
import { ChevronUp } from 'lucide-react'

export type FaqItem = { question: string; answer: ReactNode }

type Props = {
  title: string
  items: FaqItem[]
  /** Index of the item open on first render; all others start collapsed. */
  defaultOpen?: number | null
}

export default function FaqAccordion({ title, items, defaultOpen = 0 }: Props) {
  const [open, setOpen] = useState<number | null>(defaultOpen)

  return (
    <div>
      <h2 className="font-grotesque font-semibold text-white text-[28px] md:text-[32px] leading-[1.1]">
        {title}
      </h2>
      <div className="mt-5 grid gap-3">
        {items.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.question} className="rounded-xl bg-neutral-800 p-4">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-start justify-between gap-4 text-left"
              >
                <span className="font-grotesque font-semibold text-white text-[22px] leading-[1.1]">
                  {item.question}
                </span>
                <ChevronUp
                  className={`w-5 h-5 mt-1 shrink-0 text-white transition-transform ${isOpen ? '' : 'rotate-180'}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div className="mt-4 font-manrope text-sm text-neutral-300 leading-snug space-y-2">{item.answer}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
