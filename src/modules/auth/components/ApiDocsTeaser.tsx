import { Link } from 'react-router'
import Button from './Button'

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
        Interested? Reach out and we’ll share access with you.
      </p>

      <div className="mt-10">
        <div className="rounded-[26px] border-2 border-white/10 bg-neutral-800/50 p-3 sm:p-4">
          <div className="rounded-[18px] overflow-hidden border border-white/10">
            <video
              src={`${import.meta.env.BASE_URL}images/api-video.mov`}
              className="w-full h-auto block"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <Link to="/contact">
          <Button variant="primary">Request API Access</Button>
        </Link>
      </div>
    </section>
  )
}
