import Navbar from '../components/Navbar'
import Button from '../components/Button'
import Footer from '../components/Footer'

export default function Contact() {
  return (
    <div className="min-h-screen text-white bg-[#0E0E12] bg-[radial-gradient(1000px_600px_at_15%_10%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_500px_at_85%_80%,rgba(255,255,255,0.04),transparent_60%)]">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-yellow-400 mr-2" /> Contact Us
        </div>
        <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]" style={{fontWeight:700}}>
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">Ready to partner or</span>
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">learn more? Let’s chat.</span>
        </h1>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-8 items-stretch">
          {/* Form */}
          <form className="grid gap-4 content-start lg:self-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Full name</label>
                <input
                  placeholder="Eg. Eric Brick"
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-white placeholder:text-neutral-500 outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Email</label>
                <input
                  placeholder="Eg. eric@mail.co.za"
                  type="email"
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-white placeholder:text-neutral-500 outline-none focus:border-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Contact Number</label>
                <input
                  placeholder="Eg. 012 3456 7890"
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-white placeholder:text-neutral-500 outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Company name</label>
                <input
                  placeholder="Enter your company name"
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-white placeholder:text-neutral-500 outline-none focus:border-white/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Select query type</label>
              <div className="relative">
                <select
                  defaultValue=""
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3 pr-10 text-white placeholder:text-neutral-500 outline-none focus:border-white/20 appearance-none"
                >
                  <option value="" disabled>
                    Select query type
                  </option>
                  <option value="partnership">Partnership</option>
                  <option value="support">Support</option>
                  <option value="sales">Sales</option>
                  <option value="other">Other</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Message</label>
              <textarea
                placeholder="Enter your message"
                rows={5}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-neutral-500 outline-none focus:border-white/20 resize-none"
              />
            </div>

            <div className="w-40">
              <Button variant="primary" className="h-9 rounded-lg border border-white/10 shadow-none text-xs">
                Send message
              </Button>
            </div>
          </form>

          {/* Side visual */}
          <div className="w-full h-full rounded-3xl overflow-hidden flex items-center justify-center self-stretch min-h-[360px] lg:min-h-0">
            <img
              src={`${import.meta.env.BASE_URL}images/contact_us_hero.svg`}
              alt="contact"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

