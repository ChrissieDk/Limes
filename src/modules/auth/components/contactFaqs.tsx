import { Link } from 'react-router'
import type { FaqItem } from './FaqAccordion'

export const CONTACT_FAQS: FaqItem[] = [
  {
    question: 'How do I RICA from my couch?',
    answer: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          Head to{' '}
          <a className="underline hover:text-white" href="https://www.limesmobile.co.za" target="_blank" rel="noreferrer">
            www.limesmobile.co.za
          </a>
          .
        </li>
        <li>Log into your profile.</li>
        <li>
          Upload your ID or passport and a proof of address. No copy handy? Snap a quick selfie holding your open ID
          or passport — we&apos;re good with that.
        </li>
      </ol>
    ),
  },
  {
    question: 'How do I port my number?',
    answer: (
      <>
        <p>
          Port your existing number to Limes during signup or from your dashboard in a few steps. Most ports complete
          within 24 hours, but it can take up to 48 hours.
        </p>
        <p>
          <Link to="/how-to/port" className="underline hover:text-white">
            See how porting works
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    question: 'How long is my subscription?',
    answer: <p>Limes is month‑to‑month. No long-term lock in and you can cancel anytime.</p>,
  },
  {
    question: 'When can I change my plan?',
    answer: (
      <p>You can upgrade or downgrade your subscription at any time. Changes apply from your next billing cycle.</p>
    ),
  },
  {
    question: 'Can I keep my number?',
    answer: (
      <p>
        Yes. Port your existing number to Limes during signup or from your dashboard. During the handover you may
        experience a short window of limited connectivity.
      </p>
    ),
  },
  {
    question: 'How will I be billed?',
    answer: (
      <p>
        Billing happens monthly on your selected payment method. You&apos;ll get an email invoice and can view it anytime
        in your dashboard.
      </p>
    ),
  },
  {
    question: 'Do my unused minutes or data roll over?',
    answer: (
      <p>
        Unused subscriptions don&apos;t roll over by default. You can top up anytime and only pay for what you need.
      </p>
    ),
  },
]
