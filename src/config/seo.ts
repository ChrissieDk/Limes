export type SeoMeta = {
  title: string
  description: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
}

const DEFAULT_OG_IMAGE = '/images/hero_new.png'

export const SITE_NAME = 'Limes'

export function getSiteUrl(): string {
  const env = import.meta.env.VITE_SITE_URL as string | undefined
  return (env || 'https://limes.network').replace(/\/$/, '')
}

export const ROUTE_META: Record<string, SeoMeta> = {
  '/': {
    title: 'Limes — The Network Built Different',
    description:
      'Join Limes for flexible mobile data, voice, and airtime. Prepaid or subscription — you control how you connect.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/faqs': {
    title: 'FAQs — Limes',
    description:
      'Everything you need to know about joining, using, and getting the most out of Limes.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/how-it-works': {
    title: 'How It Works — Limes',
    description:
      'Pick your plan, order your SIM, and start connecting in minutes. See how easy it is to join Limes.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/partners': {
    title: 'Partners — Limes',
    description:
      'Partner with Limes and grow your business with our flexible telecom solutions.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/how-to': {
    title: 'How-To Guides — Limes',
    description:
      'Step-by-step guides for everything Limes. Pick a topic and get the full picture in plain English.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/how-to/join': {
    title: 'How to Join — Limes',
    description:
      'Ready to join Limes? Here is exactly what happens from sign-up to your first call.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/how-to/activate': {
    title: 'How to Activate Your SIM — Limes',
    description:
      'Get your Limes SIM up and running with this simple activation guide.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/how-to/top-up': {
    title: 'How to Top Up — Limes',
    description:
      'Add data, airtime, or voice to your Limes account in seconds.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/how-to/rica': {
    title: 'How to RICA — Limes',
    description:
      'Complete your RICA registration from your couch with this easy guide.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/how-to/delivery': {
    title: 'How Delivery Works — Limes',
    description:
      'From order to doorstep — here is how we deliver your Limes SIM and what to expect.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/how-to/port': {
    title: 'How to Port Your Number — Limes',
    description:
      'Keep your number and switch to Limes. What to expect, timelines, and how we keep you updated.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/register': {
    title: 'Sign Up — Limes',
    description: 'Create your Limes account and start connecting on your terms.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/signup': {
    title: 'Sign Up — Limes',
    description: 'Create your Limes account and start connecting on your terms.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/signin': {
    title: 'Sign In — Limes',
    description: 'Sign in to your Limes account to manage your plan and usage.',
    ogImage: DEFAULT_OG_IMAGE,
    noindex: true,
  },
  '/forgot-password': {
    title: 'Forgot Password — Limes',
    description: 'Reset your Limes account password quickly and securely.',
    ogImage: DEFAULT_OG_IMAGE,
    noindex: true,
  },
  '/auth/action': {
    title: 'Account Action — Limes',
    description: 'Verify or manage your Limes account action.',
    noindex: true,
  },
  '/auth/verify-email': {
    title: 'Verify Email — Limes',
    description: 'Verify your email address to complete your Limes registration.',
    noindex: true,
  },
  '/auth/reset-password': {
    title: 'Reset Password — Limes',
    description: 'Set a new password for your Limes account.',
    noindex: true,
  },
  '/contact': {
    title: 'Contact Us — Limes',
    description:
      'Get in touch with the Limes team for sales, support, or partnership enquiries.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/terms-and-conditions': {
    title: 'Terms and Conditions — Limes',
    description: 'Read the terms and conditions for using Limes services.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/terms': {
    title: 'Terms and Conditions — Limes',
    description: 'Read the terms and conditions for using Limes services.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/fair-usage-policy': {
    title: 'Fair Usage Policy — Limes',
    description: 'Understand our fair usage policy and how we keep the network great for everyone.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/dashboard': {
    title: 'Dashboard — Limes',
    description: 'Manage your Limes account, SIM cards, and usage.',
    noindex: true,
  },
  '/dashboard/packages': {
    title: 'Packages — Limes',
    description: 'Browse and choose the best Limes packages for your needs.',
    noindex: true,
  },
  '/dashboard/payment-methods': {
    title: 'Payment Methods — Limes',
    description: 'Manage your saved payment methods and billing preferences.',
    noindex: true,
  },
  '/dashboard/subscriptions': {
    title: 'Subscriptions — Limes',
    description: 'View and manage your Limes subscriptions.',
    noindex: true,
  },
  '/dashboard/delivery-tracking': {
    title: 'Delivery Tracking — Limes',
    description: 'Track your Limes SIM delivery in real time.',
    noindex: true,
  },
  '/dashboard/edit-details': {
    title: 'Account Details — Limes',
    description: 'Update your personal and account information.',
    noindex: true,
  },
}

export function getRouteMeta(pathname: string): SeoMeta {
  const exact = ROUTE_META[pathname]
  if (exact) return exact

  // Fallback for nested dynamic paths — try parent segments
  const segments = pathname.split('/').filter(Boolean)
  while (segments.length > 0) {
    segments.pop()
    const parentPath = '/' + segments.join('/')
    if (ROUTE_META[parentPath]) return ROUTE_META[parentPath]
  }

  return {
    title: 'Limes',
    description: 'The network built different.',
    ogImage: DEFAULT_OG_IMAGE,
  }
}
