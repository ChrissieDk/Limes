import { useState, type ReactNode } from 'react'
import Navbar from '../components/Navbar'

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
              href="https://www.limesmobile.co.za"
              target="_blank"
              rel="noreferrer"
            >
              www.limesmobile.co.za
            </a>
            .
          </li>
          <li>Log into your profile.</li>
          <li>
            Upload your <span className="font-medium text-white">ID or passport</span> and a{' '}
            <span className="font-medium text-white">proof of address</span>. No copy handy? Snap a quick
            selfie holding your open ID or passport — we’re good with that.
          </li>
        </ol>
      ),
    },
    {
      title: 'How long is my contract?',
      content: (
        <p className="text-sm text-neutral-300">
          Limes is month‑to‑month. No long-term lock in and you can cancel anytime.
        </p>
      ),
    },
    {
      title: 'When can I change my plan?',
      content: (
        <p className="text-sm text-neutral-300">
          You can upgrade or downgrade your plan at any time. Changes apply from your next billing cycle.
        </p>
      ),
    },
    {
      title: 'Can I keep my number?',
      content: (
        <p className="text-sm text-neutral-300">
          Yes. Port your existing number to Limes during signup or from your dashboard in a few steps.
        </p>
      ),
    },
    {
      title: 'How will I be billed?',
      content: (
        <p className="text-sm text-neutral-300">
          Billing happens monthly on your selected payment method. You’ll get an email invoice and
          can view it anytime in your dashboard.
        </p>
      ),
    },
    {
      title: 'Do my unused minutes or data roll over?',
      content: (
        <p className="text-sm text-neutral-300">
          Unused bundles don’t roll over by default. You can top up anytime and only pay for what you need.
        </p>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <div className="flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-purple-400 mr-2" /> Frequently Asked Questions
        </div>
        <h1
          className="mt-4 font-grotesque font-bold text-center leading-[1.05]"
          style={{ fontWeight: 700 }}
        >
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">We’ve got the answers</span>
        </h1>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-8 items-start">
          {/* FAQ list */}
          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <Accordion key={idx} title={f.title}>
                {f.content}
              </Accordion>
            ))}
          </div>

          {/* Side visual */}
          <div className="relative w-full rounded-3xl overflow-hidden border border-neutral-700/60 min-h-[360px]">
            <img
              src={`${import.meta.env.BASE_URL}images/faqs.png`}
              alt="FAQs"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <img src={`${import.meta.env.BASE_URL}images/Logo.png`} alt="Limes" className="h-9" />
            <p className="mt-4 text-sm text-neutral-400">Stay connected. Earn cash back. Own your money.</p>
          </div>
          <div>
            <div className="text-sm text-neutral-400 font-semibold mb-2">Quick Links</div>
            <ul className="text-sm text-neutral-300 space-y-1">
              <li>
                <a href={`${import.meta.env.BASE_URL}#hero`} className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href={`${import.meta.env.BASE_URL}#why`} className="hover:underline">
                  Why Choose Limes
                </a>
              </li>
              <li>
                <a href={`${import.meta.env.BASE_URL}#packages`} className="hover:underline">
                  Packages
                </a>
              </li>
              <li>
                <a href={`${import.meta.env.BASE_URL}#partners`} className="hover:underline">
                  Why Partner With Us
                </a>
              </li>
              <li>
                <a href={`${import.meta.env.BASE_URL}faqs`} className="hover:underline">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm text-neutral-400 font-semibold mb-2">Stay Connected</div>
            <div className="flex items-center gap-3 text-neutral-400">
              <span className="size-6 rounded bg-neutral-800 grid place-items-center">in</span>
              <span className="size-6 rounded bg-neutral-800 grid place-items-center">f</span>
              <span className="size-6 rounded bg-neutral-800 grid place-items-center">ig</span>
            </div>
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-neutral-800" />
        <div className="mt-4 text-neutral-500 text-xs flex items-center justify-between">
          <span>Copyright © 2025 Limes. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

function Accordion(props: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl bg-neutral-900 ring-1 ring-neutral-700/60">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm md:text-base font-medium text-neutral-200">{props.title}</span>
        <span
          className={`inline-flex size-6 items-center justify-center rounded-full ring-1 ring-neutral-700/60 text-neutral-300 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          ↑
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-80' : 'max-h-0'}`}
      >
        <div className="px-4 pb-4">{props.children}</div>
      </div>
    </div>
  )
}


