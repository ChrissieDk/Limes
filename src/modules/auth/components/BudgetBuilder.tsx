import Button from './Button'

export default function BudgetBuilder() {
  return (
    <section id="budget" className="mx-auto max-w-6xl px-6 pb-28 scroll-mt-24">
      <h3 className="text-center font-grotesque font-bold text-white text-2xl md:text-3xl">What is your budget?</h3>

      <div className="mt-6 flex items-center justify-center gap-5 md:gap-8">
        <img src="/images/squigle.png" alt="squiggle" className="h-6 sm:h-8" />
        <img src="/images/heading_left.png" alt="heading left" className="h-10 sm:h-12" />
        <div className="bg-neutral-800 text-white rounded-2xl px-8 py-4 text-2xl md:text-3xl font-semibold tracking-wide">
          R115
        </div>
        <img src="/images/heading_right.png" alt="heading right" className="h-10 sm:h-12" />
        <img src="/images/squigle_green.png" alt="green squiggle" className="h-6 sm:h-8" />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-3xl bg-white text-black p-6 md:p-8 shadow-sm ring-1 ring-neutral-200 h-full">
          <div className="space-y-7">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center size-8 rounded-xl bg-lime-300">📶</span>
                <span className="font-semibold">Data</span>
              </div>
              <input defaultValue="R 60.00" className="mt-3 w-full h-12 rounded-xl border border-neutral-900/20 px-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center size-8 rounded-xl bg-pink-300">📞</span>
                <span className="font-semibold">Voice</span>
              </div>
              <input defaultValue="R 50.00" className="mt-3 w-full h-12 rounded-xl border border-neutral-900/20 px-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center size-8 rounded-xl bg-blue-300">💬</span>
                <span className="font-semibold">SMS</span>
              </div>
              <input defaultValue="R 5.00" className="mt-3 w-full h-12 rounded-xl border border-neutral-900/20 px-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-neutral-900 p-6 md:p-8 ring-1 ring-neutral-700/60 h-full">
          <div className="flex justify-between items-start">
            <div className="text-white font-grotesque font-bold text-xl md:text-2xl">This is your connect plan</div>
            <div className="text-neutral-500 text-xl select-none">+ +</div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center size-8 rounded-xl bg-lime-300">📶</span>
              <span className="font-semibold">1024 MB</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="grid place-items-center size-8 rounded-xl bg-pink-300">📞</span>
              <span className="font-semibold">102 Min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="grid place-items-center size-8 rounded-xl bg-blue-300">💬</span>
              <span className="font-semibold">20 SMS</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-[140px_1fr] gap-6 items-center">
            <div className="h-[120px] w-[140px] rounded-2xl overflow-hidden">
              <img src="/images/signin.png" alt="preview" className="h-full w-full object-cover" />
            </div>
            <div className="text-white">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full grid place-items-center bg-lime-700/40 ring-1 ring-lime-500/40">
                  <img src="/images/plan_logo.png" alt="lime" className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-neutral-300">This package will earn you</div>
                  <div className="mt-1 text-lime-400 font-semibold">R11.50 <span className="ml-2 inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-white">Limes</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="w-40">
              <Button variant="primary">Get This Plan</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


