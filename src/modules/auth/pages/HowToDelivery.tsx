import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const timeline = [
  {
    number: '01',
    title: 'Order confirmed',
    description:
      'Once you\'ve selected your plan and completed checkout, your order is confirmed and sent to our warehouse. You\'ll receive an email confirmation with your order details.',
    colour: 'bg-yellow-300',
  },
  {
    number: '02',
    title: 'Packed & shipped',
    description:
      'Your SIM is packed securely and handed to our courier partner. You\'ll receive an SMS and email with your tracking number as soon as it leaves our facility.',
    colour: 'bg-[#CDA7FC]',
  },
  {
    number: '03',
    title: 'In transit',
    description:
      'Delivery takes 2–5 business days depending on your location. Major metros are usually on the faster end. You can track your parcel in real time using the tracking link.',
    colour: 'bg-[#5BA0FF]',
  },
  {
    number: '04',
    title: 'Delivered & activated',
    description:
      'The moment the courier marks delivery as complete, your SIM becomes active on the network. Head to your dashboard, click Activate, and you\'re ready to go.',
    colour: 'bg-[#ABFF63]',
  },
]

const notes = [
  {
    title: 'How long does delivery take?',
    body: 'SIM cards are delivered via courier within 2–5 business days depending on your location. Major metros (JHB, CPT, DBN) are typically 2–3 days. Outlying areas may take up to 5 days.',
  },
  {
    title: 'Can I collect instead?',
    body: 'At the moment we primarily offer courier delivery. If you need a SIM urgently, reach out via our contact form and we\'ll see what we can arrange.',
  },
  {
    title: 'What if I\'m not home?',
    body: 'The courier will attempt delivery to the address you provided. If you\'re not available, they may leave it with a neighbour or security, or attempt redelivery. You can also contact the courier directly using your tracking number to arrange a better time.',
  },
  {
    title: 'Where do I track my delivery?',
    body: 'Your tracking number is sent via SMS and email when your order ships. You can also view delivery status in your dashboard under Delivery Tracking. If you don\'t see tracking info within 24 hours of ordering, contact us.',
  },
]

export default function HowToDelivery() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-[#CDA7FC] mr-2" /> How To&apos;s
        </div>
        <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]">
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">How Delivery Works</span>
        </h1>
        <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
          From order confirmation to your doorstep. Here&apos;s exactly what happens and when.
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

      {/* Timeline */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {timeline.map((step) => (
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#CDA7FC]" />
            <h2 className="font-grotesque font-bold text-[24px] md:text-[32px] leading-[1.05]">
              Delivery FAQ
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
              <span className="font-semibold">Pro tip:</span> Double-check your delivery address at checkout.
              A small typo can cause big delays. If you need to change your address after ordering, contact us as soon as possible.
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
            to="/dashboard/delivery-tracking"
            className="inline-flex items-center justify-center rounded-xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-5 h-10 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] border-2 border-black/70 hover:bg-[#ABFF63]/90 transition-colors"
          >
            <span className="font-manrope">Track delivery</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
