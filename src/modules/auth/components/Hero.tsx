import { Link } from 'react-router-dom'
import Button from './Button'

export default function Hero() {
  const scrollToWhy = () => {
    const whySection = document.getElementById('why')
    if (whySection) {
      whySection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="hero"
      className="mx-auto max-w-6xl px-6 pt-10 pb-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start lg:items-stretch lg:min-h-[calc(100vh-120px)] scroll-mt-24"
    >
      <div className="max-w-3xl lg:max-w-none w-full self-center">
        <h1 className="font-grotesque font-bold leading-[0.88] tracking-tight text-white" style={{ fontWeight: 700 }}>
          <span className="block text-[40px] sm:text-[52px] md:text-[68px] lg:text-[80px]">
            Meet Limes Mobile,
          </span>
          <span className="block text-[40px] sm:text-[52px] md:text-[68px] lg:text-[80px]">
            <span className="md:whitespace-nowrap">
              the{' '}
              <img
                src={`${import.meta.env.BASE_URL}images/smarter.png`}
                alt="smarter"
                className="inline-block align-middle h-11 sm:h-12 md:h-[64px] lg:h-[72px] mx-1 -rotate-1"
              />
              {' '}network
            </span>
          </span>
          <span className="block text-[40px] sm:text-[52px] md:text-[68px] lg:text-[80px]">
            that gives you
          </span>
          <span className="block text-[40px] sm:text-[52px] md:text-[68px] lg:text-[80px]">
            more.
          </span>
        </h1>

        <p className="mt-8 max-w-xl text-neutral-400 text-base md:text-lg">
          Get a Limes SIM or keep your current number.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-neutral-400">
          <span>Prepaid or contract</span>
          <span className="size-1.5 rounded-full bg-yellow-400" />
          <span>Flexible plans</span>
          <span className="size-1.5 rounded-full bg-green-400" />
          <span>Simple switching</span>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="w-full sm:w-44">
            <Link to="/signin">
              <Button variant="primary">View packages</Button>
            </Link>
          </div>
          <div className="w-full sm:w-44">
            <Link to="/signin">
              <Button variant="secondary">Switch to Limes</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex h-full items-center">
        <div className="relative w-full h-full min-h-[520px] rounded-3xl overflow-hidden">
          <img src={`${import.meta.env.BASE_URL}images/hero_new.png`} alt="Limes preview" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </section>
  )
}


