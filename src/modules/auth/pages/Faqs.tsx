import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

type FaqItem = {
  title: string
  content: ReactNode
}

export default function Faqs() {
  const faqs: FaqItem[] = [
    {
      title: 'How do I RICA from my couch?',
      content: (
        <ol className="list-decimal pl-5 space-y-1 text-sm text-neutral-300">
          <li>
            Head to{' '}
            <a
              className="underline hover:text-white"
              href="https://www.limes.network"
              target="_blank"
              rel="noreferrer"
            >
              www.limes.network
            </a>
            .
          </li>
          <li>Log into your profile.</li>
          <li>
            Upload your <span className="font-medium text-white">ID or passport</span> and a{' '}
            <span className="font-medium text-white">proof of address</span>. No copy handy? Snap a quick
            selfie holding your open ID or passport — we&apos;re good with that.
          </li>
        </ol>
      ),
    },
    {
      title: 'What is RICA and why do I need it?',
      content: (
        <div className="space-y-2 text-sm text-neutral-300 font-manrope">
          <p>
            RICA (Regulation of Interception of Communications and Provision of Communication-Related Information Act)
            is South African law that requires every SIM card to be registered to a real person with valid ID and proof
            of address.
          </p>
          <p>
            It&apos;s not optional — no network can legally activate a SIM without it. The good news? We&apos;ve made it
            entirely digital so you can do it from your couch in about 5 minutes.
          </p>
        </div>
      ),
    },
    {
      title: 'How long is my subscription?',
      content: (
        <p className="font-manrope text-sm text-neutral-300">
          Limes is month‑to‑month. No long-term lock in and you can cancel anytime.
        </p>
      ),
    },
    {
      title: 'What is the difference between prepaid and subscription?',
      content: (
        <div className="space-y-2 text-sm text-neutral-300 font-manrope">
          <p>
            <span className="font-medium text-white">Prepaid</span> means you pay upfront for your bundle and use it
            until it runs out or expires. Top up anytime. Great if you want total control and no monthly commitment.
          </p>
          <p>
            <span className="font-medium text-white">Subscription</span> means your chosen bundle renews automatically every
            month and you&apos;re billed on a set date. Same month-to-month flexibility — you can change or cancel
            anytime — but it&apos;s set-and-forget.
          </p>
        </div>
      ),
    },
    {
      title: 'When can I change my plan?',
      content: (
        <p className="font-manrope text-sm text-neutral-300">
          You can upgrade or downgrade your plan at any time. Changes apply from your next billing cycle.
        </p>
      ),
    },
    {
      title: 'Can I keep my number?',
      content: (
        <div className="space-y-2 text-sm text-neutral-300 font-manrope">
          <p>
            Yes. Port your existing number to Limes during signup or from your dashboard in a few steps. Most ports
            complete within 24 hours, but it can take up to 48 hours.
          </p>
          <p>
            During the handover you may experience a short window of limited connectivity. We recommend starting your
            port on a weekday morning for the fastest turnaround.{' '}
            <Link to="/how-it-works" className="underline hover:text-white">
              See how porting works
            </Link>
            .
          </p>
        </div>
      ),
    },
    {
      title: 'What happens during porting? Will I lose service?',
      content: (
        <div className="space-y-2 text-sm text-neutral-300 font-manrope">
          <p>
            Porting moves your number from your old network to Limes. There&apos;s usually a brief handover window
            (a few minutes) where calls and texts may not work while the networks swap responsibility for your number.
          </p>
          <p>
            Data can also be intermittent during this time. The actual downtime is typically very short, and we&apos;ll
            SMS and email you updates as your port progresses so you know exactly what&apos;s happening.
          </p>
        </div>
      ),
    },
    {
      title: 'How will I be billed?',
      content: (
        <p className="font-manrope text-sm text-neutral-300">
          Billing happens monthly on your selected payment method. You&apos;ll get an email invoice and
          can view it anytime in your dashboard.
        </p>
      ),
    },
    {
      title: 'Do my unused minutes or data roll over?',
      content: (
        <p className="font-manrope text-sm text-neutral-300">
          Unused bundles don&apos;t roll over by default. You can top up anytime and only pay for what you need.
        </p>
      ),
    },
    {
      title: 'How do I top up if I run out of data or airtime?',
      content: (
        <div className="space-y-2 text-sm text-neutral-300 font-manrope">
          <p>
            Log into your dashboard, hit the <span className="font-medium text-white">Top Up</span> button on your SIM
            card, choose what you need (data, airtime, voice, SMS or WhatsApp), and pay. It&apos;s instant.
          </p>
          <p>
            You can also change your entire monthly plan if you find you&apos;re consistently running low — no
            penalties, no fuss.
          </p>
        </div>
      ),
    },
    {
      title: 'How long does delivery take?',
      content: (
        <p className="font-manrope text-sm text-neutral-300">
          SIM cards are delivered via courier within 2–5 business days depending on your location. You&apos;ll receive
          a tracking number once your order ships. If you need a SIM urgently, reach out and we&apos;ll see what we
          can do.
        </p>
      ),
    },
    {
      title: 'How does the cashback program work?',
      content: (
        <div className="space-y-2 text-sm text-neutral-300 font-manrope">
          <p>
            Limes rewards you for staying connected. Depending on your plan and usage, you can earn cashback that
            gets credited to your account. The more you engage with Limes, the more you get back.
          </p>
          <p>
            Specific cashback rates and qualifying actions are shown in your dashboard under the rewards section.
            If you don&apos;t see it yet, don&apos;t worry — we&apos;re rolling it out to all users.
          </p>
        </div>
      ),
    },
    {
      title: 'Can I use my Limes SIM in a router or modem?',
      content: (
        <p className="font-manrope text-sm text-neutral-300">
          Yes, your Limes SIM will work in any unlocked device that supports the standard South African network
          bands — including routers, modems, tablets and mobile hotspots. Just pop it in and configure your APN
          settings if needed. Fair usage policies apply for tethering and hotspot usage.
        </p>
      ),
    },
    {
      title: 'What happens if I lose my SIM?',
      content: (
        <div className="space-y-2 text-sm text-neutral-300 font-manrope">
          <p>
            Contact us as soon as possible so we can block the lost SIM and protect your account. We&apos;ll issue
            a replacement SIM with the same number.
          </p>
          <p>
            There may be a small replacement fee depending on your plan. Reach out via the contact form or call
            us on <span className="font-medium text-white">080 039 0009</span>.
          </p>
        </div>
      ),
    },
    {
      title: 'How do I cancel my account?',
      content: (
        <p className="font-manrope text-sm text-neutral-300">
          Because we&apos;re month-to-month, there&apos;s no cancellation penalty. Simply stop renewing your plan
          or contact us and we&apos;ll close your account. If you have an active subscription, cancellation
          takes effect at the end of your current billing cycle.
        </p>
      ),
    },
    {
      title: 'What is Fair Usage and does it affect me?',
      content: (
        <div className="space-y-2 text-sm text-neutral-300 font-manrope">
          <p>
            Fair Usage is a policy that keeps our network fast and reliable for everyone. It applies to unlimited
            or high-usage services to prevent abuse. For the vast majority of users, it never comes into play.
          </p>
          <p>
            You can read the full policy{' '}
            <Link to="/fair-usage-policy" className="underline hover:text-white">
              here
            </Link>
            . If you ever hit a fair usage threshold, we&apos;ll let you know before anything changes.
          </p>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-purple-400 mr-2" /> Frequently Asked Questions
        </div>
        <h1
          className="mt-4 font-grotesque font-bold text-center leading-[1.05]"
        >
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">We&apos;ve got the answers</span>
        </h1>
        <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
          Everything you need to know about joining, using, and getting the most out of Limes.
          Can&apos;t find what you&apos;re looking for?{' '}
          <Link to="/contact" className="underline hover:text-white">
            Contact us
          </Link>
          .
        </p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-8 items-start">
          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <Accordion key={idx} title={f.title}>
                {f.content}
              </Accordion>
            ))}
          </div>

          <div className="relative w-full rounded-3xl overflow-hidden border border-neutral-700/60 min-h-[360px]">
            <img
              src={`${import.meta.env.BASE_URL}images/faqs.png`}
              alt="FAQs"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function Accordion(props: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl bg-neutral-900 ring-1 ring-neutral-700/60">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-manrope text-sm md:text-base font-medium text-neutral-200">{props.title}</span>
        <span
          className={`inline-flex size-6 items-center justify-center rounded-full ring-1 ring-neutral-700/60 text-neutral-300 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          ↑
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="px-4 pb-4">{props.children}</div>
      </div>
    </div>
  )
}
