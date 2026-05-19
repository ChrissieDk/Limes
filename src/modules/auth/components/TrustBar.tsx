const base = import.meta.env.BASE_URL

const items = [
  {
    icon: `${base}images/zblock.svg`,
    label: 'Month-to-month',
    sub: 'No lock-in subscriptions',
    bg: 'bg-yellow-300',
  },
  {
    icon: `${base}images/house_small.svg`,
    label: 'Keep your number',
    sub: 'Switch without the schlep',
    bg: 'bg-pink-300',
  },
  {
    icon: `${base}images/plan_icon_small.svg`,
    label: 'RICA from your couch',
    sub: 'No store visits needed',
    bg: 'bg-[#5BA0FF]',
  },
  {
    icon: `${base}images/arrow_icon.svg`,
    label: 'Activate in minutes',
    sub: 'Not days',
    bg: 'bg-[#CDA7FC]',
  },
  {
    icon: `${base}images/data_icon.svg`,
    label: 'Only pay for what you use',
    sub: 'Build your own plan',
    bg: 'bg-[#ABFF63]',
  },
  {
    icon: `${base}images/lime_icon_small.svg`,
    label: "Backed by SA's best networks",
    sub: 'Reliable coverage',
    bg: 'bg-lime-300',
  },
]

export default function TrustBar() {
  // Duplicate items 4x so the CSS loop is long enough to never show seams
  const track = [...items, ...items, ...items, ...items]

  return (
    <section className="relative overflow-hidden py-8 mb-20">
      {/* Subtle top and bottom borders to frame the strip */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* First marquee row — left to right */}
      <div className="flex overflow-hidden">
        <div
          className="flex shrink-0 items-center gap-5 pr-5 animate-marquee-left will-change-transform"
          style={{ animationDuration: '70s' }}
        >
          {track.map((item, idx) => (
            <TrustPill key={`a-${idx}`} {...item} />
          ))}
        </div>
        <div
          className="flex shrink-0 items-center gap-5 pr-5 animate-marquee-left will-change-transform"
          style={{ animationDuration: '70s' }}
          aria-hidden="true"
        >
          {track.map((item, idx) => (
            <TrustPill key={`b-${idx}`} {...item} />
          ))}
        </div>
      </div>

      {/* Second marquee row — right to left, slightly offset for visual depth */}
      <div className="flex overflow-hidden mt-4 opacity-60">
        <div
          className="flex shrink-0 items-center gap-5 pr-5 animate-marquee-right will-change-transform"
          style={{ animationDuration: '90s' }}
        >
          {[...track].reverse().map((item, idx) => (
            <TrustPill key={`c-${idx}`} {...item} />
          ))}
        </div>
        <div
          className="flex shrink-0 items-center gap-5 pr-5 animate-marquee-right will-change-transform"
          style={{ animationDuration: '90s' }}
          aria-hidden="true"
        >
          {[...track].reverse().map((item, idx) => (
            <TrustPill key={`d-${idx}`} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustPill({
  icon,
  label,
  sub,
  bg,
}: {
  icon: string
  label: string
  sub: string
  bg: string
}) {
  return (
    <div className="inline-flex items-center gap-3.5 rounded-2xl bg-[#26252C] ring-1 ring-white/10 px-4 py-3 shrink-0 select-none">
      <div
        className={`grid place-items-center rounded-xl ${bg} shrink-0`}
        style={{ width: 40, height: 40 }}
      >
        <img src={icon} alt="" className="w-5 h-5 object-contain" aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <span className="text-white text-sm font-manrope font-semibold leading-tight whitespace-nowrap">
          {label}
        </span>
        <span className="text-neutral-400 text-xs font-manrope leading-tight whitespace-nowrap">
          {sub}
        </span>
      </div>
    </div>
  )
}
