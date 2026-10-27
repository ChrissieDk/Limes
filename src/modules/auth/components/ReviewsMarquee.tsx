const reviews = [
  {
    quote: 'Switching was way easier than I expected. I kept my number and everything just worked.',
    name: 'Shane P.',
  },
  {
    quote: 'Finally a mobile plan that makes sense. I only pay for what I actually need.',
    name: 'Ryan F.',
  },
  {
    quote: 'I signed up from home and was connected in minutes.',
    name: 'Imtiyaaz S.',
  },
]

export default function ReviewsMarquee() {
  return (
    <section className="scroll-mt-24 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-2 font-manrope text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-[#CDA7FC]" />
          Don&apos;t just take our word for it
        </div>

        <h2 className="font-manrope mt-4 text-center text-[28px] font-bold! leading-[1.15] tracking-normal text-white sm:text-[32px] md:text-[36px]">
          This is what our customers have to say
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          {reviews.map((review) => (
            <blockquote
              key={review.name}
              className="flex h-full flex-col justify-between rounded-2xl bg-[#302F35] px-5 py-5"
            >
              <p className="font-manrope text-sm leading-relaxed text-white/85 md:text-[15px]">
                &ldquo;{review.quote}&rdquo;
              </p>
              <footer className="font-manrope mt-4 text-sm text-white/70">— {review.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
