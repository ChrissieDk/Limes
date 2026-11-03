const base = import.meta.env.BASE_URL

const steps = [
  {
    step: '01',
    icon: `${base}images/plan_phone.svg`,
    iconBg: 'bg-[#FDDA36]',
    body: 'Choose how much airtime you want monthly.',
  },
  {
    step: '02',
    icon: `${base}images/sms_icon_small.svg`,
    iconBg: 'bg-pink-300',
    body: 'Keep it as airtime or allocate it into bundles.',
  },
  {
    step: '03',
    icon: `${base}images/data_icon.svg`,
    iconBg: 'bg-[#629BFC]',
    body: 'Convert or top up whenever you need.',
  },
  {
    step: '04',
    icon: `${base}images/arrow_icon.svg`,
    iconBg: 'bg-[#CDA7FC]',
    body: 'Change your setup when your needs change.',
  },
]

export default function HowLimesWorks() {
  return (
    <section id="how-limes-works" className="scroll-mt-24 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-2 font-manrope text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-[#FDDA36]" />
          How Limes works
        </div>

        <h2 className="font-manrope mt-4 text-center text-[28px] font-bold! leading-[1.15] tracking-normal text-white sm:text-[32px] md:text-[36px]">
          Everything you need.
          <br />
          The way you need it.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <article
              key={item.step}
              className="flex flex-col items-center rounded-lg px-5 py-6 text-center"
              style={{ backgroundColor: '#302F35' }}
            >
              <div className={`grid size-10 place-items-center overflow-hidden rounded-md ${item.iconBg}`}>
                <img src={item.icon} alt="" className="h-8 w-8 object-contain" />
              </div>
              <h3 className="font-manrope mt-4 text-2xl font-bold! text-white">Step {item.step}</h3>
              <p className="font-manrope mt-2 text-base leading-snug text-neutral-300">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
