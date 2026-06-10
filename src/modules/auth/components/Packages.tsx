import { Link } from 'react-router-dom'
import { useAuthLandingCtaPath } from '../hooks/useAuthLandingCtaPath'

export default function Packages() {
  const buyPath = useAuthLandingCtaPath('/signup')
  const bulletSrc = `${import.meta.env.BASE_URL}images/plan_icon_small.svg`
  const bulletSrcYellow = `${import.meta.env.BASE_URL}images/plan_icon_yellow_small.svg`

  type Card = {
    key: string
    title: string
    bgClass: string
    textClass: string
    bullets: string[]
    colSpanClass: string
    minHeightClass: string
  }

  const cards: Card[] = [
    {
      key: 'limes99',
      title: 'Limes99',
      bgClass: 'bg-yellow-300',
      textClass: 'text-neutral-900',
      bullets: ['R99 airtime + R31 FREE', 'Unlimited WhatsApp text'],
      colSpanClass: 'lg:col-span-3',
      minHeightClass: 'lg:min-h-[180px]',
    },
    {
      key: 'limes29',
      title: 'Limes29',
      bgClass: 'bg-[#5BA0FF]',
      textClass: 'text-neutral-900',
      bullets: ['R29 airtime + R6 FREE'],
      colSpanClass: 'lg:col-span-3',
      minHeightClass: 'lg:min-h-[180px]',
    },
    {
      key: 'limes69',
      title: 'Limes69',
      bgClass: 'bg-[#CDA7FC]',
      textClass: 'text-neutral-900',
      bullets: ['R69 airtime + R21 FREE', 'Unlimited WhatsApp text'],
      colSpanClass: 'lg:col-span-2',
      minHeightClass: 'lg:min-h-[150px]',
    },
    {
      key: 'limes169',
      title: 'Limes169',
      bgClass: 'bg-pink-300',
      textClass: 'text-neutral-900',
      bullets: ['R169 airtime + R31 FREE', 'Unlimited WhatsApp text'],
      colSpanClass: 'lg:col-span-2',
      minHeightClass: 'lg:min-h-[150px]',
    },
    {
      key: 'limes199',
      title: 'Limes199',
      bgClass: 'bg-lime-300',
      textClass: 'text-neutral-900',
      bullets: ['R199 airtime + R31 FREE', 'Unlimited WhatsApp text'],
      colSpanClass: 'lg:col-span-2',
      minHeightClass: 'lg:min-h-[150px]',
    },
    {
      key: 'limes-unlimited',
      title: 'Limes Unlimited',
      bgClass: 'bg-white',
      textClass: 'text-neutral-900',
      bullets: ['Unlimited voice minutes + 10GB data', '10GB data', 'Unlimited WhatsApp text'],
      colSpanClass: 'lg:col-span-3',
      minHeightClass: 'lg:min-h-[170px]',
    },
    {
      key: 'limes-one',
      title: 'LimesOne',
      bgClass: 'bg-white',
      textClass: 'text-neutral-900',
      bullets: ['1GB data', '1GB WhatsApp data', 'R100 Airtime'],
      colSpanClass: 'lg:col-span-3',
      minHeightClass: 'lg:min-h-[170px]',
    },
  ]

  return (
    <section id="packages" className="relative bg-neutral-900">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-24">
        <div className="flex items-center justify-center font-grotesque font-semibold text-neutral-400 text-[24px] sm:text-[30px] md:text-[36px] leading-[1.05]">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-300 mr-3 translate-y-[1px]" /> Our Subscriptions
        </div>

        <h2 className="mt-4 text-center font-grotesque font-bold text-white text-[34px] sm:text-[44px] md:text-[56px] leading-[1.05]">
          Flexible subscriptions that suit how you
          <br />
          connect
        </h2>
        <p className="font-manrope mt-4 text-center text-neutral-400 text-base md:text-lg">
          Choose prepaid or subscription options with better value built in.
        </p>

        <div className="mt-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 lg:gap-2">
            {cards.map((card) => (
              <div
                key={card.key}
                className={[
                  'rounded-[26px] border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] p-5 flex flex-col',
                  card.bgClass,
                  card.textClass,
                  card.colSpanClass,
                  card.minHeightClass,
                ].join(' ')}
              >
                <div className="font-grotesque font-bold text-[28px] leading-[1.0] tracking-tight">
                  {card.title}
                </div>

                <ul className="mt-2.5 space-y-2 text-[14px] leading-snug font-manrope">
                  {card.bullets.map((b) => {
                    const iconSrc = card.key === 'limes-unlimited' || card.key === 'limes-one' ? bulletSrcYellow : bulletSrc
                    return (
                      <li key={b} className="flex items-start gap-2">
                        <img src={iconSrc} alt="" className="h-4 w-5 mt-[2px] object-contain" />
                        <span>{b}</span>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-auto pt-4">
                  <Link
                    to={buyPath}
                    className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-white text-neutral-900 text-xs font-semibold border border-black/60"
                  >
                    Buy now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


