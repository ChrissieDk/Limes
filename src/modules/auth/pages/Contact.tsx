import Navbar from '../components/Navbar'
import Button from '../components/Button'
import Footer from '../components/Footer'

export default function Contact() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <div className="flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-lime-400 mr-2" /> Contact Us
        </div>
        <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]" style={{fontWeight:700}}>
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">Ready to partner or</span>
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">learn more? Let’s chat.</span>
        </h1>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-8 items-start">
          {/* Form */}
          <form className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Full name</label>
                <input placeholder="Eg. Eric Brick" className="w-full h-11 rounded-xl bg-neutral-900 ring-1 ring-neutral-700/60 px-3 text-white placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Email</label>
                <input placeholder="Eg. eric@mail.co.za" type="email" className="w-full h-11 rounded-xl bg-neutral-900 ring-1 ring-neutral-700/60 px-3 text-white placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Company name</label>
                <input placeholder="Enter your preferred talent type" className="w-full h-11 rounded-xl bg-neutral-900 ring-1 ring-neutral-700/60 px-3 text-white placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Contact Number</label>
                <input placeholder="Eg. 012 3456 7890" className="w-full h-11 rounded-xl bg-neutral-900 ring-1 ring-neutral-700/60 px-3 text-white placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Message</label>
              <textarea placeholder="Enter your message" rows={5} className="w-full rounded-xl bg-neutral-900 ring-1 ring-neutral-700/60 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500" />
            </div>

            <div className="w-40">
              <Button variant="primary">Send Message</Button>
            </div>
          </form>

          {/* Side visual */}
          <div className="relative w-full rounded-3xl overflow-hidden border border-neutral-700/60 min-h-[360px]">
            <img src={`${import.meta.env.BASE_URL}images/signup.png`} alt="contact" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
//

