import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const scenarios = [
  {
    title: 'ICCID Activation (Instant)',
    steps: [
      'After ordering, your SIM is linked to your account via its ICCID number.',
      'We automatically poll the network every 45 seconds to check your SIM\'s activation status.',
      'Once the network reports an "active" status, an Activate button appears in your dashboard.',
      'Click Activate to process any pending orders and services tied to your SIM.',
      'You\'re live! Start topping up, calling, and using your Limes SIM right away.',
    ],
    colour: 'bg-[#ABFF63]',
  },
  {
    title: 'Delivery Activation (Courier)',
    steps: [
      'If your SIM needs to be delivered, it will show as Awaiting Activation in your dashboard until the courier delivers it.',
      'The moment the courier marks the delivery as complete, the SIM becomes active on the network.',
      'Your dashboard will update automatically — no need to refresh the page.',
      'Once active, click the Activate button to finalise setup and start using your SIM.',
      'After activation you can top up, make calls, and use data immediately.',
    ],
    colour: 'bg-yellow-300',
  },
]

const notes = [
  {
    title: 'Why do I need to click Activate?',
    body: 'The Activate button processes pending orders and dynamic services that are queued for your SIM. Even if the network shows the SIM as active, this step ensures your bundles and subscription features are fully provisioned.',
  },
  {
    title: 'How long does activation take?',
    body: 'ICCID activations are usually instant once the network confirms active status. The Activate button itself takes up to 30 seconds to complete. For delivered SIMs, activation happens the moment the courier confirms delivery.',
  },
  {
    title: 'What if I don\'t see an Activate button?',
    body: 'If your SIM is still awaiting network activation, the button won\'t appear yet. For ICCID activations, this is usually within minutes. For courier deliveries, it happens at delivery. If you\'ve waited longer than expected, check your delivery tracking or contact support.',
  },
  {
    title: 'Can I use my SIM before activating?',
    body: 'No — you need to complete the activation step before you can top up or use services. The SIM may be live on the network, but your account bundles won\'t be provisioned until you click Activate.',
  },
]

export default function HowToActivate() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-[#ABFF63] mr-2" /> How To&apos;s
        </div>
        <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]">
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">How to Activate</span>
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">Your SIM</span>
        </h1>
        <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
          From order to going live. Understand how activation works, what happens behind the scenes, and what you need to do.
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

      {/* Scenarios */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className={`rounded-[28px] ${s.colour} text-neutral-900 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] p-6 md:p-8`}
            >
              <h3 className="font-grotesque font-bold text-[22px] md:text-[24px] leading-[1.05]">
                {s.title}
              </h3>
              <ul className="mt-4 space-y-3 text-[15px] md:text-base text-neutral-900/80 font-manrope leading-relaxed">
                {s.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <img src={`${import.meta.env.BASE_URL}images/plan_icon_small.svg`} alt="" className="h-4 w-5 mt-[2px] object-contain shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-[28px] bg-[#26252C] border border-white/10 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5BA0FF]" />
            <h2 className="font-grotesque font-bold text-[24px] md:text-[32px] leading-[1.05]">
              Activation FAQ
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
              <span className="font-semibold">Heads up:</span> Keep your dashboard open during activation.
              The status updates automatically and the Activate button will appear as soon as your SIM is ready.
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
