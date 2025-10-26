import Button from './Button'

export default function WhyChoose() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="flex items-center justify-center">
        <h2 className="font-grotesque font-bold text-white text-[34px] sm:text-[44px] md:text-[52px] text-center leading-[1.05]">
          For <img src={`${import.meta.env.BASE_URL}images/people.png`} alt="people" className="inline-block align-middle h-10 sm:h-12 md:h-14 mx-2 -rotate-2" /> who want more from their mobile.
        </h2>
      </div>

      <div className="mt-10 flex items-center justify-center text-sm text-neutral-400">
        <span className="size-1.5 rounded-full bg-purple-400 mr-2" /> Why Choose Limes?
      </div>

      <h3 className="mt-8 font-grotesque font-bold text-white text-3xl md:text-5xl text-center leading-tight scroll-mt-24">
        For individuals who want more
        <br className="hidden md:block" /> from their mobile plan
      </h3>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_0.72fr_1fr_1fr] gap-2 items-stretch">
        <div className="rounded-2xl bg-yellow-300 text-black p-6 md:col-span-1 flex flex-col justify-between shadow-[6px_6px_0_0_rgba(0,0,0,0.7)] border-2 border-black/60">
          <div>
            <img src={`${import.meta.env.BASE_URL}images/sms.png`} alt="icon" className="h-7 w-7 mb-4 transition-transform duration-200 hover:animate-jiggle" />
            <h4 className="font-semibold text-lg">Get cash back every
              <br /> time you top up.</h4>
            <p className="mt-3 text-sm text-black/70 font-manrope">
              Earn real money with every airtime or data purchase. It lands straight in your
              digital bank account — ready to spend, save, or send.
            </p>
          </div>
          <button className="mt-6 text-sm inline-flex items-center gap-2 underline">See cash back in action</button>
        </div>

        <div className="h-full rounded-2xl overflow-hidden shadow-[6px_6px_0_0_rgba(0,0,0,0.7)]">
          <img src={`${import.meta.env.BASE_URL}images/man_block.png`} alt="Pointing man" className="h-full w-full object-cover" />
        </div>

        <div className="rounded-2xl bg-pink-300 text-black p-6 flex flex-col justify-between shadow-[6px_6px_0_0_rgba(0,0,0,0.7)] border-2 border-black/60">
          <div>
            <img src={`${import.meta.env.BASE_URL}images/data.png`} alt="plan icon" className="h-7 w-7 mb-4 transition-transform duration-200 hover:animate-jiggle" />
            <h4 className="font-semibold text-lg">Build your plan. Only pay
              <br /> for what you need.</h4>
            <p className="mt-3 text-sm text-black/70 font-manrope">
              No rigid bundles. No wasted data. Just flexible plans that fit your budget —
              down to the last MB.
            </p>
          </div>
          <button className="mt-6 text-sm inline-flex items-center gap-2 underline">Build your plan</button>
        </div>

        <div className="rounded-2xl bg-purple-300 text-black p-6 flex flex-col justify-between shadow-[6px_6px_0_0_rgba(0,0,0,0.7)] border-2 border-black/60">
          <div>
            <img src={`${import.meta.env.BASE_URL}images/bundle_3.png`} alt="wallet icon" className="h-7 w-7 mb-4 transition-transform duration-200 hover:animate-jiggle" />
            <h4 className="font-semibold text-lg">Data, banking, and
              <br /> remittances — all in one.</h4>
            <p className="mt-3 text-sm text-black/70 font-manrope">
              Your SIM unlocks more than data. Send money, pay bills, and manage it all from
              your digital, always-on wallet.
            </p>
          </div>
          <button className="mt-6 text-sm inline-flex items-center gap-2 underline">Build your plan</button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="w-40"><Button variant="primary" className="!bg-[#CDA7FC] hover:!bg-[#CDA7FC]/90 active:!bg-[#CDA7FC] focus-visible:!ring-[#CDA7FC]">View Packages</Button></div>
        <div className="w-36"><Button variant="secondary">Contact Us</Button></div>
      </div>
    </section>
  )
}


