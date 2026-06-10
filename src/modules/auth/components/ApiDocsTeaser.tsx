export default function ApiDocsTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="flex items-center justify-center font-grotesque font-semibold text-neutral-400 text-[24px] sm:text-[30px] md:text-[36px] leading-[1.05]">
        <span className="w-2.5 h-2.5 rounded-full bg-lime-400 mr-3 translate-y-[1px]" />
        <span>Built for developers</span>
      </div>

      <h2 className="mt-4 font-grotesque font-bold text-white text-[34px] sm:text-[44px] md:text-[56px] text-center leading-[1.05]">
        Ready-to-go API documentation
      </h2>

      <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
        Everything you need to integrate — B2B workflows, subscription management,
        RICA, ordering, and more. Clean docs, real endpoints, no guesswork.
      </p>

      <a
        href="https://limes.readme.io/docs/step-1"
        target="_blank"
        rel="noreferrer"
        className="block mt-10 group"
      >
        <div className="rounded-[26px] border-2 border-white/10 bg-neutral-800/50 p-3 sm:p-4 transition-all duration-300 group-hover:border-white/20 group-hover:bg-neutral-800/70">
          <div className="rounded-[18px] overflow-hidden border border-white/10">
            <img
              src={`${import.meta.env.BASE_URL}images/api-teaser.png`}
              alt="Limes API Documentation preview"
              className="w-full h-auto block"
            />
          </div>
        </div>
      </a>

      <div className="mt-6 flex items-center justify-center">
        <a
          href="https://limes.readme.io/docs/step-1"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-white transition-colors font-manrope"
        >
          <span>Explore the API docs</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}
