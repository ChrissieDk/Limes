import { Link } from 'react-router'
import { useAuthLandingCtaPath } from '../hooks/useAuthLandingCtaPath'

export default function Hero() {
  const viewSubscriptionsPath = useAuthLandingCtaPath('/signup')
  const buildYourOwnPath = useAuthLandingCtaPath('/signup')

  return (
    <section id="hero" className="relative -mt-[84px] min-h-[100svh] scroll-mt-0">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-new.jpg`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[48%_50%]"
        />
      </div>

      <div className="relative mx-auto grid min-h-[100svh] max-w-[90rem] items-center gap-10 px-6 pb-16 pt-32 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6 lg:px-10 lg:pt-28 lg:pb-12 xl:px-12">
        <div className="min-w-0">
          <h1 className="font-manrope text-[40px] font-bold! leading-[1.1] tracking-normal text-white sm:text-[52px] md:text-[64px] lg:text-[74px]">
            <span className="block">Your airtime should</span>
            <span className="block">
              work{' '}
              <span className="relative inline-block rotate-3 rounded-md bg-[#ABFF63] px-2.5 py-0.5 text-black sm:px-3.5 sm:py-1">
                harder
              </span>{' '}
              for you
            </span>
          </h1>

          <p className="font-manrope mt-6 max-w-2xl text-base leading-relaxed text-white md:max-w-3xl md:text-lg">
            Build a mobile plan that fits your life, your budget and the way you actually use your phone.
          </p>

          <p className="font-manrope mt-5 text-sm text-white">
            Flexible subscriptions <span className="mx-1.5">•</span> Simple porting
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              to={viewSubscriptionsPath}
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#ABFF63] px-6 font-manrope text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#99FF4D]"
            >
              View subscriptions
            </Link>
            <Link
              to={buildYourOwnPath}
              className="inline-flex h-11 items-center justify-center rounded-md bg-neutral-950 px-6 font-manrope text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Build your own
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-device.svg`}
            alt="Limes Mobile app showing airtime, data, SMS and voice balances"
            width={281}
            height={570}
            className="h-auto w-[240px] drop-shadow-[0_32px_80px_rgba(0,0,0,0.45)] sm:w-[260px] lg:w-[300px]"
          />
        </div>
      </div>
    </section>
  )
}
