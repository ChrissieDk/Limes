import { Link } from 'react-router'

export default function TelecomCta() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[26px] bg-[#302F35] px-6 py-7 text-white sm:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="font-grotesque text-[30px] font-bold leading-[1.05] tracking-tight text-white sm:text-[34px] md:text-[40px]">
              Turn Telecom into a Profit Centre,
              <br />
              without becoming an MVNO.
            </h3>
            <p className="font-manrope mt-3 text-base text-white md:text-lg">
              Let’s help you find the right communication solution for your needs.
            </p>

            <div className="mt-5">
              <Link
                to="/contact"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                <span className="font-manrope">Contact Us</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end gap-4 sm:gap-6 lg:gap-8 mt-6 lg:mt-0 pb-2">
            <img
              src={`${import.meta.env.BASE_URL}images/cta_1.svg`}
              alt=""
              className="h-16 sm:h-20 lg:h-24 w-auto select-none"
            />
            <img
              src={`${import.meta.env.BASE_URL}images/cta_2.svg`}
              alt=""
              className="h-16 sm:h-20 lg:h-24 w-auto select-none"
            />
            <img
              src={`${import.meta.env.BASE_URL}images/cta_3.svg`}
              alt=""
              className="h-16 sm:h-20 lg:h-24 w-auto select-none"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

