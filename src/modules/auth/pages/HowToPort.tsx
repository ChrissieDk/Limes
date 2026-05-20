import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const steps = [
  {
    number: '01',
    title: 'Start from your dashboard',
    description:
      'Log in and find the SIM you want to port to. Click Port My Number and enter the cellphone number you want to bring over.',
    colour: 'bg-orange-300',
  },
  {
    number: '02',
    title: 'We handle the paperwork',
    description:
      'Once you confirm, we submit the port request to your old network. You don\'t need to call them or fill out any forms — we do it all.',
    colour: 'bg-yellow-300',
  },
  {
    number: '03',
    title: 'Stay connected',
    description:
      'Your old SIM keeps working until the port completes. We\'ll SMS and email you at every stage so you know exactly what\'s happening.',
    colour: 'bg-[#5BA0FF]',
  },
  {
    number: '04',
    title: 'Switch over',
    description:
      'When the port completes, pop your Limes SIM in and you\'re live. Your number, your contacts, your life — just better value.',
    colour: 'bg-[#ABFF63]',
  },
]

const notes = [
  {
    title: 'How long does porting take?',
    body: 'Most ports complete within 24 hours, but it can take up to 48 hours during busy periods. We\'ll SMS and email you updates as it progresses so you\'re never in the dark.',
  },
  {
    title: 'Will I lose service?',
    body: 'There\'s usually a brief handover window (a few minutes) where calls and texts may not work while the networks swap responsibility for your number. Data can also be intermittent during this time. The actual downtime is typically very short.',
  },
  {
    title: 'What do I need to port?',
    body: 'Your current SIM card, your ID, and the cellphone number you want to keep. That\'s it. We handle the rest with your old provider. Make sure your number is active on the old network — ports from cancelled or suspended lines will fail.',
  },
  {
    title: 'Can I port a number that\'s on contract?',
    body: 'Yes, but you may need to settle any outstanding contract fees with your old provider first. We recommend checking with them before initiating the port to avoid delays.',
  },
]

export default function HowToPort() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-orange-300 mr-2" /> How To&apos;s
        </div>
        <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]">
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">How to Port</span>
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">Your Number</span>
        </h1>
        <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
          Keep your number and switch to Limes. What to expect, timelines, and how we keep you updated every step of the way.
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            to="/how-to"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white font-manrope transition-colors"
          >
            <span aria-hidden="true">←</span> All How To&apos;s
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`rounded-[28px] ${step.colour} text-neutral-900 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] p-6 md:p-8`}
            >
              <div className="font-grotesque font-bold text-[48px] md:text-[64px] leading-none opacity-30">
                {step.number}
              </div>
              <h3 className="mt-2 font-grotesque font-bold text-[22px] md:text-[24px] leading-[1.05]">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] md:text-base text-neutral-900/80 font-manrope leading-relaxed max-w-[52ch]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-[28px] bg-[#26252C] border border-white/10 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-300" />
            <h2 className="font-grotesque font-bold text-[24px] md:text-[32px] leading-[1.05]">
              Porting FAQ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {notes.map((note) => (
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
              for the fastest turnaround. Ports are not processed over the weekend, and Friday afternoon requests may sit until Monday.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/how-to"
            className="inline-flex items-center justify-center rounded-xl bg-neutral-800 text-white font-semibold text-sm px-5 h-10 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] hover:bg-neutral-700 transition-colors"
          >
            <span className="font-manrope">← Back to How To&apos;s</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-5 h-10 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] border-2 border-black/70 hover:bg-[#ABFF63]/90 transition-colors"
          >
            <span className="font-manrope">Go to dashboard</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
