import { Link } from 'react-router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const steps = [
  {
    number: '01',
    title: 'Open your dashboard',
    description:
      'Log in and head to your dashboard. You\'ll see all your SIM cards with current balances at a glance.',
    colour: 'bg-yellow-300',
  },
  {
    number: '02',
    title: 'Hit Top Up',
    description:
      'Click the Top Up button on the SIM card you want to load. You can choose any SIM linked to your account.',
    colour: 'bg-[#CDA7FC]',
  },
  {
    number: '03',
    title: 'Choose what you need',
    description:
      'Pick from data, airtime, voice minutes, SMS bundles, or WhatsApp packs. Mix and match however you like.',
    colour: 'bg-[#5BA0FF]',
  },
  {
    number: '04',
    title: 'Pay & go',
    description:
      'Complete payment securely. Your bundle loads instantly and your balance updates in real time.',
    colour: 'bg-pink-300',
  },
]

const tips = [
  {
    title: 'What can I top up?',
    body: 'Data, airtime (general credit), voice minutes, SMS bundles, and WhatsApp packs. You can buy once-off bundles or switch to a subscription that renews automatically every month.',
  },
  {
    title: 'How fast is it?',
    body: 'Instant. The moment payment is confirmed, your bundle is active and ready to use. You\'ll see the updated balance in your dashboard immediately.',
  },
  {
    title: 'Can I top up someone else\'s SIM?',
    body: 'You can only top up SIMs linked to your own account. If you manage multiple SIMs under one account (e.g. family or business lines), you can top up any of them from the same dashboard.',
  },
  {
    title: 'What if I run out mid-month?',
    body: 'Top up anytime — there are no restrictions. You can also change your entire monthly subscription if you find you\'re consistently running low. No penalties, no fuss.',
  },
]

export default function HowToTopUp() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-pink-300 mr-2" /> How To&apos;s
        </div>
        <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]">
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">How to Top Up</span>
        </h1>
        <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
          Running low? Add data, airtime, voice, SMS or WhatsApp bundles in seconds. Here&apos;s exactly how it works.
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

      {/* Tips */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-[28px] bg-[#26252C] border border-white/10 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-300" />
            <h2 className="font-grotesque font-bold text-[24px] md:text-[32px] leading-[1.05]">
              Top-up tips
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {tips.map((tip) => (
              <div key={tip.title}>
                <h3 className="font-grotesque font-bold text-white text-lg">{tip.title}</h3>
                <p className="mt-1 text-sm text-neutral-400 font-manrope leading-relaxed">{tip.body}</p>
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
              <span className="font-semibold">Pro tip:</span> If you consistently run low before month-end,
              consider switching to a subscription. It renews automatically and you can change or cancel anytime.
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
