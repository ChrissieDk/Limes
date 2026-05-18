import { Link } from 'react-router-dom'
import { useAuthLandingCtaPath } from '../hooks/useAuthLandingCtaPath'

export default function HowToJoin() {
  const ctaPath = useAuthLandingCtaPath('/signin')

  return (
    <section id="join" className="mx-auto max-w-6xl px-6 pb-16 scroll-mt-24">
      <div className="flex items-center justify-center font-grotesque font-semibold text-neutral-400 text-[24px] sm:text-[30px] md:text-[36px] leading-[1.05]">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 mr-3 translate-y-[1px]" />
        <span>How you can join Limes</span>
      </div>

      <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
        Two ways in. Both take less time than a trip to the shops.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2 md:gap-x-3 md:gap-y-3">
        <div className="rounded-[28px] bg-yellow-300 text-neutral-900 p-5 md:p-6">
          <img
            src={`${import.meta.env.BASE_URL}images/zblock.svg`}
            alt=""
            className="h-10 w-10"
          />

          <h3 className="mt-2.5 font-grotesque font-bold text-[26px] md:text-[28px] leading-[1.05] tracking-tight">
            Get a new Limes SIM
          </h3>
          <p className="mt-2.5 text-[15px] md:text-base text-neutral-900/80 font-manrope max-w-[52ch]">
            Start fresh with a Limes number on prepaid or subscription. Choose a plan that suits you, order
            online, and we&apos;ll deliver to your door.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-neutral-900/70 font-manrope">
            <li className="flex items-start gap-2">
              <span className="text-neutral-900/50">→</span>
              <span>Delivered in 2–5 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900/50">→</span>
              <span>RICA online in 5 minutes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900/50">→</span>
              <span>Activate instantly from your dashboard</span>
            </li>
          </ul>

          <div className="mt-4">
            <Link
              to={ctaPath}
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:opacity-80 transition-opacity"
            >
              <span className="font-grotesque">Get a Limes SIM</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] bg-pink-300 text-neutral-900 p-5 md:p-6">
          <img
            src={`${import.meta.env.BASE_URL}images/house_small.svg`}
            alt=""
            className="h-10 w-10"
          />

          <h3 className="mt-2.5 font-grotesque font-bold text-[26px] md:text-[28px] leading-[1.05] tracking-tight">
            Keep your number, switch networks
          </h3>
          <p className="mt-2.5 text-[15px] md:text-base text-neutral-900/80 font-manrope max-w-[62ch]">
            Bring your existing number to Limes and enjoy better value on the same number you already
            use. We handle the breakup with your old network.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-neutral-900/70 font-manrope">
            <li className="flex items-start gap-2">
              <span className="text-neutral-900/50">→</span>
              <span>Port completes in 24–48 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900/50">→</span>
              <span>Your number stays exactly the same</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900/50">→</span>
              <span>We update you via SMS at every step</span>
            </li>
          </ul>
          <p className="mt-2.5 text-xs md:text-sm text-neutral-900/70 font-manrope max-w-[72ch]">
            During the handover you may experience limited connectivity for a few minutes.
            We recommend starting on a weekday morning.
          </p>

          <div className="mt-4">
            <Link
              to={ctaPath}
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:opacity-80 transition-opacity"
            >
              <span className="font-grotesque">Switch my number to Limes</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          to={ctaPath}
          className="inline-flex items-center justify-center rounded-xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-5 h-10 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] border-2 border-black/70 hover:bg-[#ABFF63]/90 transition-colors"
        >
          <span className="font-manrope">View packages</span>
        </Link>
        <Link
          to="/how-it-works"
          className="inline-flex items-center justify-center rounded-xl bg-neutral-800 text-white font-semibold text-sm px-5 h-10 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] hover:bg-neutral-700 transition-colors"
        >
          <span className="font-manrope">See how it works</span>
        </Link>
      </div>
    </section>
  )
}
