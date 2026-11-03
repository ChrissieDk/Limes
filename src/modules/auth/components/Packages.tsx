import { Link } from 'react-router'
import { useAuthLandingCtaPath } from '../hooks/useAuthLandingCtaPath'

const base = import.meta.env.BASE_URL
const featureIcon = `${base}images/plan_pink.png`

type Feature = {
  label: string
  duration: string
}

type Plan = {
  name: string
  badge: string
  badgeTone: 'lime' | 'pink'
  features: Feature[]
  price: string
}

const plans: Plan[] = [
  {
    name: 'Limes35',
    badge: '20% MORE AIRTIME • 20%',
    badgeTone: 'lime',
    features: [{ label: 'R35 airtime', duration: '30 days' }],
    price: 'R29',
  },
  {
    name: 'Limes130',
    badge: '30% MORE AIRTIME • 30%',
    badgeTone: 'lime',
    features: [{ label: 'R130 airtime', duration: '30 days' }],
    price: 'R99',
  },
  {
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

function Badge({ label, tone }: { label: string; tone: 'lime' | 'pink' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-3 py-1.5 font-manrope text-[11px] font-semibold tracking-wide text-neutral-900 uppercase ${
        tone === 'lime' ? 'bg-[#ABFF63]' : 'bg-pink-300'
      }`}
    >
      {label}
    </span>
  )
}

export default function Packages() {
  const buyPath = useAuthLandingCtaPath('/signup')

  return (
    <section id="packages" className="scroll-mt-24 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-2 font-manrope text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-[#ABFF63]" />
          Subscriptions
        </div>

        <h2 className="font-manrope mt-4 text-center text-[28px] font-bold! leading-[1.15] tracking-normal text-white sm:text-[32px] md:text-[36px]">
          Flexible subscriptions that suit how you connect
        </h2>
        <p className="font-manrope mt-3 text-center text-sm text-neutral-400 md:text-base">
          Choose from our monthly subscription options with better value built in. Cancel anytime.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="flex flex-col rounded-2xl p-5"
              style={{ backgroundColor: '#302F35' }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-manrope text-[28px] leading-none font-bold! tracking-tight text-white">
                  {plan.name}
                </h3>
                <Badge label={plan.badge} tone={plan.badgeTone} />
              </div>

              <div className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <div key={feature.label} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <img src={featureIcon} alt="" className="h-4 w-5 shrink-0 object-contain" />
                      <span className="font-manrope text-lg font-medium text-white">{feature.label}</span>
                    </div>
                    <span className="font-manrope shrink-0 text-base text-neutral-400">{feature.duration}</span>
                  </div>
                ))}
              </div>

              <Link
                to={buyPath}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white font-manrope text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                Buy for {plan.price}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to={buyPath}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#ABFF63] px-6 font-manrope text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#99FF4D]"
          >
            See all our subscriptions
          </Link>
        </div>
      </div>
    </section>
  )
}
