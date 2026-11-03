import { Link } from 'react-router'
import { useAuthLandingCtaPath } from '../hooks/useAuthLandingCtaPath'

const featureIcon = `${import.meta.env.BASE_URL}images/plan_pink.png`

type Plan = {
  id: string
  name: string
  badge: string
  badgeTone: 'lime' | 'pink'
  features: { label: string; duration: string }[]
  price: string
}

// TODO: replace mock plans with API data
const plans: Plan[] = [
  { id: 'limes35', name: 'Limes35', badge: '20% MORE AIRTIME • 20%', badgeTone: 'lime', features: [{ label: 'R35 airtime', duration: '30 days' }], price: 'R29' },
  { id: 'limes130', name: 'Limes130', badge: '30% MORE AIRTIME • 30%', badgeTone: 'lime', features: [{ label: 'R130 airtime', duration: '30 days' }], price: 'R99' },
  { id: 'limes130-b', name: 'Limes130', badge: '30% MORE AIRTIME • 30%', badgeTone: 'lime', features: [{ label: 'R130 airtime', duration: '30 days' }], price: 'R99' },
  { id: 'limes200', name: 'Limes200', badge: '20% MORE AIRTIME • 20%', badgeTone: 'lime', features: [{ label: 'R200 airtime', duration: '30 days' }], price: 'R169' },
  { id: 'limes230', name: 'Limes230', badge: '30% MORE AIRTIME • 30%', badgeTone: 'lime', features: [{ label: 'R230 airtime', duration: '30 days' }], price: 'R199' },
  {
    id: 'unlimited',
    name: 'LimesUnlimited',
    badge: '% BEST VALUE',
    badgeTone: 'pink',
    features: [
      { label: 'Unlimited voice', duration: '30 days' },
      { label: '10GB data', duration: '30 days' },
    ],
    price: 'R399',
  },
]

export default function SubscriptionPlans() {
  const buyPath = useAuthLandingCtaPath('/signup')

  return (
    <section id="packages" className="px-6 pt-6 pb-12 md:pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-2 font-manrope text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-[#ABFF63]" />
          Subscriptions
        </div>
        <h1 className="font-manrope mt-4 text-center text-[28px] font-bold! leading-[1.15] text-white sm:text-[32px] md:text-[36px]">
          Subscriptions that fit your life
        </h1>
        <p className="font-manrope mt-3 text-center text-sm text-white md:text-base">
          Choose from our monthly subscription options with better value built in. Cancel anytime.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className="flex flex-col rounded-2xl bg-[#302F35] p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-manrope text-2xl leading-none font-bold! text-white">{plan.name}</h2>
                <span
                  className={`inline-flex shrink-0 items-center rounded-md px-2.5 py-1 font-manrope text-[10px] font-semibold tracking-wide text-neutral-900 uppercase ${
                    plan.badgeTone === 'lime' ? 'bg-[#ABFF63]' : 'bg-pink-300'
                  }`}
                >
                  {plan.badge}
                </span>
              </div>
              <div className="mt-5 flex flex-1 flex-col gap-2">
                {plan.features.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <img src={featureIcon} alt="" className="h-3.5 w-4 shrink-0 object-contain" />
                      <span className="font-manrope text-base font-medium text-white">{f.label}</span>
                    </div>
                    <span className="font-manrope shrink-0 text-sm text-neutral-300">{f.duration}</span>
                  </div>
                ))}
              </div>
              <Link
                to={buyPath}
                className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-white font-manrope text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                Buy for {plan.price}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
