import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuthLandingCtaPath } from '../hooks/useAuthLandingCtaPath'

const steps = [
  {
    number: '01',
    title: 'Pick your plan',
    description:
      'Choose a prepaid or subscription bundle that fits how you connect. Want full control? Use our plan builder to allocate your budget across data, airtime, voice, SMS and WhatsApp.',
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

export default function HowToJoinPage() {
  const ctaPath = useAuthLandingCtaPath('/signin')

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-yellow-300 mr-2" /> How To&apos;s
        </div>
        <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]">
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">How to Join Limes</span>
        </h1>
        <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
          Two ways in. Both take less time than a trip to the shops.
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

      {/* Pathways */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-[28px] bg-yellow-300 text-neutral-900 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] p-6 md:p-8">
            <img
              src={`${import.meta.env.BASE_URL}images/zblock.svg`}
              alt=""
              className="h-10 w-10"
            />
            <h3 className="mt-4 font-grotesque font-bold text-[24px] md:text-[28px] leading-[1.05]">
              Get a new Limes SIM
            </h3>
            <p className="mt-3 text-[15px] md:text-base text-neutral-900/80 font-manrope leading-relaxed max-w-[52ch]">
              Start fresh with a Limes number on prepaid or subscription. Choose a plan that suits you, order
              online, and we&apos;ll deliver to your door.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-900/70 font-manrope">
              <li className="flex items-start gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_icon_small.svg`} alt="" className="h-4 w-5 mt-[2px] object-contain shrink-0" />
                <span>Delivered in 2–5 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_icon_small.svg`} alt="" className="h-4 w-5 mt-[2px] object-contain shrink-0" />
                <span>RICA online in 5 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_icon_small.svg`} alt="" className="h-4 w-5 mt-[2px] object-contain shrink-0" />
                <span>Activate instantly from your dashboard</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                to={ctaPath}
                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:opacity-80 transition-opacity"
              >
                <span className="font-grotesque">Get a Limes SIM</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] bg-pink-300 text-neutral-900 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] p-6 md:p-8">
            <img
              src={`${import.meta.env.BASE_URL}images/house_small.svg`}
              alt=""
              className="h-10 w-10"
            />
            <h3 className="mt-4 font-grotesque font-bold text-[24px] md:text-[28px] leading-[1.05]">
              Keep your number, switch networks
            </h3>
            <p className="mt-3 text-[15px] md:text-base text-neutral-900/80 font-manrope leading-relaxed max-w-[62ch]">
              Bring your existing number to Limes and enjoy better value on the same number you already
              use. We handle the breakup with your old network.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-900/70 font-manrope">
              <li className="flex items-start gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_icon_small.svg`} alt="" className="h-4 w-5 mt-[2px] object-contain shrink-0" />
                <span>Port completes in 24–48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_icon_small.svg`} alt="" className="h-4 w-5 mt-[2px] object-contain shrink-0" />
                <span>Your number stays exactly the same</span>
              </li>
              <li className="flex items-start gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_icon_small.svg`} alt="" className="h-4 w-5 mt-[2px] object-contain shrink-0" />
                <span>We update you via SMS at every step</span>
              </li>
            </ul>
            <p className="mt-3 text-xs md:text-sm text-neutral-900/70 font-manrope max-w-[72ch]">
              During the handover you may experience limited connectivity for a few minutes.
              We recommend starting on a weekday morning.
            </p>
            <div className="mt-6">
              <Link
                to={ctaPath}
                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:opacity-80 transition-opacity"
              >
                <span className="font-grotesque">Switch my number to Limes</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ABFF63]" />
          <h2 className="font-grotesque font-bold text-[24px] md:text-[32px] leading-[1.05]">
            The full journey
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`rounded-[28px] ${step.colour} ${step.textColour} border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] p-6 md:p-8`}
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
