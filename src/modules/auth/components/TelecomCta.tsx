import { Link } from 'react-router-dom'

export default function TelecomCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="rounded-[26px] bg-white text-neutral-900 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] px-6 sm:px-8 py-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <h3 className="font-grotesque font-bold text-[30px] sm:text-[34px] md:text-[40px] leading-[1.05] tracking-tight">
              Turn Telecom into a Profit Centre,
              <br />
              without becoming an MVNO.
            </h3>
            <p className="mt-3 text-neutral-700 text-base md:text-lg font-manrope">
              Let’s help you find the right communication solution for your needs.
            </p>

            <div className="mt-5">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-white text-neutral-900 text-sm font-semibold border border-black/40 hover:bg-neutral-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-end gap-8">
            <img
              src={`${import.meta.env.BASE_URL}images/telecom1.png`}
              alt=""
              className="h-24 w-auto select-none"
            />
            <img
              src={`${import.meta.env.BASE_URL}images/telecom 2 .png`}
              alt=""
              className="h-24 w-auto select-none"
            />
            <img
              src={`${import.meta.env.BASE_URL}images/telecom3.png`}
              alt=""
              className="h-24 w-auto select-none"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

