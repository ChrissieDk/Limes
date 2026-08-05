import { Link } from 'react-router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const steps = [
  {
    number: '01',
    title: 'Pick your subscription',
    description:
      'Choose a prepaid or subscription option that fits how you connect. Want full control? Use our subscription builder to allocate your budget across data, airtime, voice, SMS and WhatsApp.',
    colour: 'bg-yellow-300',
    textColour: 'text-neutral-900',
  },
  {
    number: '02',
    title: 'Order your SIM',
    description:
      'Tell us whether you need a new Limes SIM or you\'re bringing your existing number. We\'ll deliver to your door or you can collect — your call.',
    colour: 'bg-[#CDA7FC]',
    textColour: 'text-neutral-900',
  },
  {
    number: '03',
    title: 'RICA from your couch',
    description:
      'Upload your ID or passport plus proof of address right here on the site. No queueing at a store. No paperwork shuffle. Takes about 5 minutes.',
    colour: 'bg-[#5BA0FF]',
    textColour: 'text-neutral-900',
  },
  {
    number: '04',
    title: 'Activate & go',
    description:
      'Pop the SIM in, hit activate in your dashboard, and you\'re live. If you ported your number, it\'ll switch over within 24–48 hours and we\'ll keep you posted every step of the way.',
    colour: 'bg-pink-300',
    textColour: 'text-neutral-900',
  },
]

const portingNotes = [
  {
    title: 'What is porting?',
    body: 'Porting means moving your existing phone number from your current network to Limes. You keep the exact same number — we just change who provides the service behind it.',
  },
  {
    title: 'How long does it take?',
    body: 'Most ports complete within 24 hours, but it can take up to 48 hours during busy periods. You\'ll get SMS and email updates as it progresses.',
  },
  {
    title: 'Will I lose service?',
    body: 'There may be a short window (usually a few minutes) where calls and texts don\'t work while the switch happens. Data might be intermittent during this handover. We recommend doing it when you don\'t need your phone urgently.',
  },
  {
    title: 'What do I need?',
    body: 'Your current SIM card, your ID, and the cellphone number you want to keep. That\'s it. We handle the paperwork with your old provider.',
  },
]

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-lime-400 mr-2" /> How It Works
        </div>
        <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]">
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">Joining Limes is</span>
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">refreshingly simple</span>
        </h1>
        <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
          No store visits. No paperwork marathons. No locked-in subscriptions. Just four steps
          between you and a subscription that actually fits.
        </p>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`rounded-[28px] ${step.colour} ${step.textColour} border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] p-6 md:p-8`}
            >
              <div className="font-grotesque font-bold text-[48px] md:text-[64px] leading-none opacity-30">
                {step.number}
              </div>
              <h3 className="mt-2 font-grotesque font-bold text-[24px] md:text-[28px] leading-[1.05]">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] md:text-base text-neutral-900/80 font-manrope leading-relaxed max-w-[52ch]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-5 h-10 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] border-2 border-black/70 hover:bg-[#ABFF63]/90 transition-colors"
          >
            <span className="font-manrope">Get started</span>
          </Link>
          <Link
            to="/faqs"
            className="inline-flex items-center justify-center rounded-xl bg-neutral-800 text-white font-semibold text-sm px-5 h-10 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] hover:bg-neutral-700 transition-colors"
          >
            <span className="font-manrope">Read FAQs</span>
          </Link>
          <Link
            to="/how-to"
            className="inline-flex items-center justify-center rounded-xl bg-[#26252C] text-white font-semibold text-sm px-5 h-10 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] hover:bg-neutral-700 transition-colors"
          >
            <span className="font-manrope">All How To&apos;s</span>
          </Link>
        </div>
      </section>

      {/* Porting deep-dive */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-[28px] bg-[#26252C] border border-white/10 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-300" />
            <h2 className="font-grotesque font-bold text-[24px] md:text-[32px] leading-[1.05]">
              Switching your number? Here&apos;s the full picture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {portingNotes.map((note) => (
              <div key={note.title}>
                <h3 className="font-grotesque font-bold text-white text-lg">{note.title}</h3>
                <p className="mt-1 text-sm text-neutral-400 font-manrope leading-relaxed">{note.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-3">
            <div className="flex items-center justify-center h-5 shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}images/lime_icon_small.svg`}
                alt=""
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm text-[#ABFF63] font-manrope">
              <span className="font-semibold">Pro tip:</span> Start your port on a weekday morning
              for the fastest turnaround. Ports are not processed over the weekend.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
