import type { ReactNode } from 'react'
import Button from './Button'

type PartnerCard = {
  key: string
  title: string
  description: string
  icon: ReactNode
}

const ICON = (name: string) => (
  <img src={`${import.meta.env.BASE_URL}images/${name}`} alt="" className="h-10 w-10" />
)

const cards: PartnerCard[] = [
  {
    key: 'revenue',
    title: 'Grow your revenue with every connection',
    description:
      'Access competitive wholesale pricing that helps you create more attractive mobile offerings, improve margins, and deliver greater value to your customers.',
    icon: ICON('arrow_icon.svg'),
  },
  {
    key: 'complexity',
    title: 'Launch without the complexity',
    description:
      'Bring mobile services to your customers without building or managing your own telecom infrastructure.',
    icon: ICON('blocker_icon.svg'),
  },
  {
    key: 'branding',
    title: 'Offer mobile, your way',
    description:
      'Launch under your own brand, co-brand with Limes, or add mobile as a value-added service. You choose the approach that best suits your customers.',
    icon: ICON('flexable_icon.svg'),
  },
  {
    key: 'scale',
    title: 'Scale as your customers grow',
    description:
      'Integrate seamlessly with our platform to activate customers, manage billing, and monitor usage through a scalable solution built to grow with your business.',
    icon: ICON('scalable_icon.svg'),
  },
  {
    key: 'subscriptions',
    title: 'Subscriptions built around your customers',
    description:
      'Create flexible mobile subscriptions tailored to how your customers connect, giving them more choice while helping your business stand out.',
    icon: ICON('wings_icon.svg'),
  },
  {
    key: 'support',
    title: 'Support your customers without the overhead',
    description:
      'From customer service and compliance to network operations, we manage the backend so you can deliver a seamless experience with confidence.',
    icon: ICON('ticket_icon.svg'),
  },
]

export default function Partners() {
  return (
    <section id="partners" className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-24">
      <div className="font-manrope flex items-center justify-center text-xs text-neutral-400">
        <span className="w-2 h-2 rounded-full bg-blue-400 mr-2" /> For Businesses Powered by Simpal
      </div>

      <h2 className="mt-4 font-grotesque font-bold text-white text-[34px] sm:text-[44px] md:text-[56px] text-center leading-[1.05]">
        Ready to offer more?
      </h2>

      <p className="font-manrope mt-4 text-center text-neutral-300 text-base md:text-lg max-w-4xl mx-auto">
        Whether you&apos;re looking to strengthen customer loyalty, create a new revenue stream or enhance your
        existing offering, we&apos;ll help you deliver mobile services that work for your customers.
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.key} className="rounded-xl bg-neutral-800 text-white p-4">
            <div>{c.icon}</div>
            <div className="mt-3 font-grotesque font-semibold text-[22px] md:text-[24px] leading-[1.1]">
              {c.title}
            </div>
            <p className="mt-2 text-base text-neutral-300 font-manrope leading-snug">{c.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-center">
        <a href="https://simpal.com" target="_blank" rel="noreferrer">
          <Button variant="primary" fullWidth={false} className="h-10 rounded-lg border-0 shadow-none">
            Explore Simpal for Business
          </Button>
        </a>
      </div>
    </section>
  )
}
