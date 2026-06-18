import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobilePage from "../../../components/MobilePage";

const base = import.meta.env.BASE_URL;

const howTos = [
  {
    id: "join",
    title: "How to Join",
    description:
      "Get a new Limes SIM or bring your existing number. Two ways in, both refreshingly simple.",
    colour: "bg-yellow-300",
    textColour: "text-neutral-900",
    iconSrc: `${base}images/zblock.svg`,
  },
  {
    id: "rica",
    title: "How to RICA",
    description:
      "Register your SIM from your couch in about 5 minutes. No store visits, no paperwork shuffle.",
    colour: "bg-[#5BA0FF]",
    textColour: "text-neutral-900",
    iconSrc: `${base}images/plan_icon_small.svg`,
  },
  {
    id: "activate",
    title: "How to Activate",
    description:
      "From ICCID scan to going live. Understand activation polling, delivery status, and the activate button.",
    colour: "bg-[#ABFF63]",
    textColour: "text-neutral-900",
    iconSrc: `${base}images/arrow_icon.svg`,
  },
  {
    id: "top-up",
    title: "How to Top Up",
    description:
      "Running low? Add data, airtime, voice, SMS or WhatsApp bundles in seconds from your dashboard.",
    colour: "bg-pink-300",
    textColour: "text-neutral-900",
    iconSrc: `${base}images/plan_lime.svg`,
  },
  {
    id: "delivery",
    title: "How Delivery Works",
    description:
      "Courier timelines, tracking your SIM, and what happens from order to doorstep.",
    colour: "bg-[#CDA7FC]",
    textColour: "text-neutral-900",
    iconSrc: `${base}images/house_small.svg`,
  },
  {
    id: "port",
    title: "How to Port Your Number",
    description:
      "Keep your number and switch to Limes. What to expect, timelines, and how we keep you updated.",
    colour: "bg-orange-300",
    textColour: "text-neutral-900",
    iconSrc: `${base}images/plan_phone.svg`,
  },
];

export default function HowToHub() {
  return (
    <>
      <div className="hidden lg:block">
        <div className="min-h-screen bg-neutral-900 text-white">
          <Navbar />

          {/* Hero */}
          <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
            <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
              <span className="size-1.5 rounded-full bg-lime-400 mr-2" /> How
              To&apos;s
            </div>
            <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]">
              <span className="block text-[36px] sm:text-[48px] md:text-[64px]">
                Never wonder about
              </span>
              <span className="block text-[36px] sm:text-[48px] md:text-[64px]">
                a process again
              </span>
            </h1>
            <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
              Step-by-step guides for everything Limes. Pick a topic and get the
              full picture in plain English.
            </p>
          </section>

          {/* Blocks */}
          <section className="mx-auto max-w-6xl px-6 pb-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {howTos.map((item) => (
                <Link
                  key={item.id}
                  to={`/how-to/${item.id}`}
                  className={`group rounded-[28px] ${item.colour} ${item.textColour} border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] p-6 md:p-8 flex flex-col hover:translate-y-[-2px] transition-transform`}
                >
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <img
                      src={item.iconSrc}
                      alt=""
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <h3 className="mt-4 font-grotesque font-bold text-[22px] md:text-[24px] leading-[1.05]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] md:text-base text-neutral-900/75 font-manrope leading-relaxed flex-1">
                    {item.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-900/80 group-hover:text-neutral-900 transition-colors">
                    <span className="font-grotesque">Read guide</span>
                    <span
                      aria-hidden="true"
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-5 h-10 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] border-2 border-black/70 hover:bg-[#ABFF63]/90 transition-colors"
              >
                <span className="font-manrope">Get started</span>
              </Link>
              <Link
                to="/faqs"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-800 text-white font-semibold text-sm px-5 h-10 border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] hover:bg-neutral-700 transition-colors"
              >
                <span className="font-manrope">Read FAQs</span>
              </Link>
            </div>
          </section>

          <Footer />
        </div>
      </div>

      <MobilePage title="How To's" backTo="/">
        <div className="divide-y divide-white/10">
          {howTos.map((item) => (
            <Link
              key={item.id}
              to={`/how-to/${item.id}`}
              className="flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-colors active:bg-white/10"
            >
              <div className="shrink-0 flex items-center justify-center size-10 rounded-xl bg-white/10">
                <img
                  src={item.iconSrc}
                  alt=""
                  className="h-5 w-5 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-grotesque font-bold text-sm text-white">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-xs text-neutral-400 font-manrope leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              <span aria-hidden="true" className="text-neutral-500 text-sm">
                →
              </span>
            </Link>
          ))}
        </div>

        <div className="px-4 py-6 flex flex-col gap-2">
          <Link
            to="/signup"
            className="flex items-center justify-center rounded-xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-5 h-10"
          >
            Get started
          </Link>
          <Link
            to="/faqs"
            className="flex items-center justify-center rounded-xl bg-neutral-800 text-white font-semibold text-sm px-5 h-10"
          >
            Read FAQs
          </Link>
        </div>
      </MobilePage>
    </>
  );
}
