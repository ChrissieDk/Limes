import { useState } from 'react'
import { ChevronUp } from 'lucide-react'

export type PartnerFaq = { question: string; answer: string }

export const PARTNER_FAQS: PartnerFaq[] = [
  {
    question: 'How do I become a partner?',
    answer:
      "Getting started is simple. Contact our team to discuss your business, your customers and your goals. We'll recommend the best partnership model and guide you through the onboarding process from start to launch.",
  },
  {
    question: 'How long does it take to launch?',
    answer:
      "Every partnership is different, but we'll work with you to get your mobile offering up and running as efficiently as possible. Our team will guide you through each step and provide a clear implementation plan.",
  },
  {
    question: 'What types of businesses can partner with Limes?',
    answer:
      "Limes is designed to work with a wide range of businesses. From retailers and financial services providers to employers, loyalty programmes, community organisations and brands looking to add mobile connectivity to their offering. If you have a customer base, there's a good chance we can build a solution around it.",
  },
  {
    question: 'Is there a minimum customer base required?',
    answer:
      "Whether you're serving a handful of customers or thousands of customers, we'd love to explore what's possible. Get in touch with our team and we'll recommend the partnership model that's best suited to your business.",
  },
]

type Props = {
  items?: PartnerFaq[]
  /** Index of the item open on first render; all others start collapsed. */
  defaultOpen?: number | null
}

export default function PartnerFaqs({ items = PARTNER_FAQS, defaultOpen = 0 }: Props) {
  const [open, setOpen] = useState<number | null>(defaultOpen)

  return (
    <div>
      <h2 className="font-grotesque font-semibold text-white text-[28px] md:text-[32px] leading-[1.1]">
        Partnership FAQs
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
                <p className="mt-4 font-manrope text-sm text-neutral-300 leading-snug">{item.answer}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
