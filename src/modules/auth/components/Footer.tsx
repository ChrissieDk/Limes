export default function Footer() {
  const base = import.meta.env.BASE_URL

  const links = [
    { label: 'Home', href: `${base}#hero` },
    { label: 'Why Choose Limes', href: `${base}#why` },
    { label: 'Packages', href: `${base}#packages` },
    { label: 'Partner With Us', href: `${base}#partners` },
  ]

  const socials = [
    { label: 'Social 1', src: `${base}images/social1.png`, href: '#' },
    { label: 'Social 2', src: `${base}images/social2.png`, href: '#' },
    { label: 'Social 3', src: `${base}images/social3.png`, href: '#' },
    { label: 'Social 4', src: `${base}images/social4.png`, href: '#' },
  ] as const

  return (
    <footer className="mx-auto max-w-6xl px-6 pt-16 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        <div>
          <img src={`${base}images/Logo.png`} alt="Limes" className="h-10" />
          <p className="mt-5 text-sm text-neutral-300 max-w-[28ch]">
            Stay connected. Earn cash
            <br />
            back. Own your money.
          </p>
        </div>

        <div className="md:justify-self-center">
          <div className="text-sm text-neutral-400 font-semibold">Quick Links</div>
          <nav className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-300">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="md:justify-self-end">
          <div className="text-sm text-neutral-400 font-semibold">Stay Connected</div>
          <div className="mt-6 flex items-center gap-5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <img src={s.src} alt="" className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 h-px w-full bg-white/20" />
      <div className="mt-6 text-sm text-neutral-300">
        Copyright © 2026 Limes. All rights reserved.
      </div>
    </footer>
  )
}

