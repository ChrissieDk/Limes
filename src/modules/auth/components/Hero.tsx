import Button from './Button'

export default function Hero() {
  return (
    <section id="hero" className="mx-auto max-w-6xl px-6 pt-10 pb-10 min-h-[calc(100vh-120px)] grid lg:grid-cols-[1.25fr_0.75fr] gap-10 items-stretch scroll-mt-24">
      <div className="max-w-3xl w-full self-center">
        <div className="flex items-center gap-6 text-sm text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-indigo-400" />
            <span>More airtime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-400" />
            <span>More data</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-yellow-400" />
            <span>More value</span>
          </div>
        </div>

        <h1 className="mt-6 font-grotesque font-bold leading-[0.95] tracking-tight text-white" style={{fontWeight:700}}>
          <span className="block text-[44px] sm:text-[56px] md:text-[74px] lg:text-[88px]">We keep you</span>
          <span className="block text-[44px] sm:text-[56px] md:text-[74px] lg:text-[88px]">connected.<br/> Simple as that.</span>
        </h1>

        <p className="mt-6 max-w-xl text-neutral-400 text-base md:text-lg">
          Fresh Limes, fresh start. Get the zest out of your digital life 🍋
        </p>

        <div className="mt-8 flex items-center gap-4">
          <div className="w-44">
            <Button variant="primary">Explore Packages</Button>
          </div>
          <div className="w-48">
            <Button variant="secondary">Why Choose Limes?</Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex h-full items-center">
        <div className="relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden border border-neutral-700/60">
          <img src={`${import.meta.env.BASE_URL}images/hero image.png`} alt="Limes preview" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </section>
  )
}


