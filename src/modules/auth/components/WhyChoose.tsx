import Button from './Button'

export default function WhyChoose() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="flex items-center justify-center text-sm text-neutral-400">
        <span className="size-1.5 rounded-full bg-purple-400 mr-2" /> Why Choose Limes?
      </div>

      <div className="mt-4 flex items-center justify-center">
        <h2 className="font-grotesque font-bold text-white text-[34px] sm:text-[44px] md:text-[56px] text-center leading-[1.05]">
          <span>For </span>
          <img src={`${import.meta.env.BASE_URL}images/people.png`} alt="people" className="inline-block align-middle h-10 sm:h-12 md:h-14 mx-2 -rotate-2" />
          <span> who want more </span>
          <span className="inline-block align-middle h-1 w-40 md:w-72 bg-white/70 rounded"></span>
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[0.28fr_0.36fr_0.36fr] gap-4 lg:gap-0 items-stretch">
        {/* Left image */}
        <div className="relative overflow-hidden h-[190px] md:h-[210px] rounded-2xl">
          <img src={`${import.meta.env.BASE_URL}images/man_block.png`} alt="Pointing man" className="h-full w-full object-contain" />
        </div>

        {/* Yellow card */}
        <div className="relative rounded-2xl bg-yellow-300 text-black p-4 md:p-5 flex flex-col justify-between shadow-[6px_6px_0_0_rgba(0,0,0,0.7)] border-2 border-black/60 h-[190px] md:h-[210px] overflow-hidden lg:-ml-[1px]">
          <img src={`${import.meta.env.BASE_URL}images/plan_logo.png`} alt="Limes icon" className="h-5 w-5 mb-1.5" />
          <div className="leading-tight">
            <h4 className="font-semibold text-base md:text-[17px] leading-snug">
              Sam bought 99 Limes. Limes said, “you deserve 130.”
            </h4>
            <p className="mt-1.5 text-[11px] md:text-xs text-black/70 font-manrope">
              Get more every time you buy airtime. Ja, you read right. Buy R99 airtime and get R130.
            </p>
          </div>
          <button className="mt-3 text-[11px] inline-flex items-center gap-2 underline">
            Get started <span>→</span>
          </button>
          <span className="absolute right-6 top-6 text-black/60 text-xl select-none">＋</span>
          <span className="absolute right-10 top-16 text-black/60 select-none">＋</span>
          <span className="absolute right-16 top-10 text-black/60 select-none">＋</span>
        </div>

        {/* Pink card */}
        <div className="relative rounded-2xl bg-pink-300 text-black p-4 md:p-5 flex flex-col justify-between shadow-[6px_6px_0_0_rgba(0,0,0,0.7)] border-2 border-black/60 h-[190px] md:h-[210px] overflow-hidden lg:-ml-[1px]">
          <div className="leading-tight">
            <img src={`${import.meta.env.BASE_URL}images/bundle_3.png`} alt="bundle icon" className="h-5 w-5 mb-1.5" />
            <h4 className="font-semibold text-base md:text-[17px] leading-snug">
              When life gives you Limes, squeeze them your way.
            </h4>
            <p className="mt-1.5 text-[11px] md:text-xs text-black/70 font-manrope">
              Convert your airtime to data, voice, SMS or WhatsApp. Giving you the freedom to connect your way.
            </p>
          </div>
          <button className="mt-3 text-[11px] inline-flex items-center gap-2 underline">
            Let’s squeeze ’em <span>→</span>
          </button>
          <span className="absolute right-4 top-4 text-black/60 text-xl select-none">＋</span>
          <span className="absolute right-10 top-10 text-black/60 select-none">＋</span>
          <span className="absolute right-20 top-20 text-black/60 select-none">＋</span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="w-40"><Button variant="primary" className="!bg-[#CDA7FC] hover:!bg-[#CDA7FC]/90 active:!bg-[#CDA7FC] focus-visible:!ring-[#CDA7FC]">View Packages</Button></div>
        <div className="w-36"><Button variant="secondary">Contact Us</Button></div>
      </div>
    </section>
  )
}


