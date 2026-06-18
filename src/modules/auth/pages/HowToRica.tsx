import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobilePage from "../../../components/MobilePage";

const steps = [
  {
    number: "01",
    title: "Log into your profile",
    description:
      "Head to limesmobile.co.za and sign into your account. RICA is part of the onboarding flow, but you can also complete it later from your dashboard if you skipped it.",
    colour: "bg-[#5BA0FF]",
  },
  {
    number: "02",
    title: "Upload your documents",
    description:
      "Upload a clear photo of your ID or passport, plus a proof of address (bank statement, utility bill, or lease agreement).",
    colour: "bg-yellow-300",
  },
  {
    number: "03",
    title: "Selfie option",
    description:
      "No copy handy? Snap a quick selfie holding your open ID or passport — we're good with that. Just make sure your face and the document details are clearly visible.",
    colour: "bg-pink-300",
  },
  {
    number: "04",
    title: "Submit & wait",
    description:
      "Hit submit and we'll verify your documents with the relevant authorities. This usually takes a few minutes, but can take up to 24 hours in rare cases.",
    colour: "bg-[#ABFF63]",
  },
];

const notes = [
  {
    title: "What is RICA and why do I need it?",
    body: "RICA (Regulation of Interception of Communications and Provision of Communication-Related Information Act) is South African law that requires every SIM card to be registered to a real person with valid ID and proof of address. It's not optional — no network can legally activate a SIM without it.",
  },
  {
    title: "What counts as proof of address?",
    body: "Any official document with your name and address dated within the last 3 months: bank statement, utility bill, municipal account, lease agreement, or insurance document. A selfie with your ID is also accepted as a fallback.",
  },
  {
    title: "How long does RICA take?",
    body: "Most submissions are verified within minutes. If there's a delay with the authorities, it can take up to 24 hours. You'll see your RICA status in your dashboard, and we'll email you once it's complete.",
  },
  {
    title: "What if my RICA fails?",
    body: "If your documents are unclear or don't match, we'll let you know and you can re-upload. Make sure your photos are well-lit, in focus, and show all four corners of the document.",
  },
];

export default function HowToRica() {
  return (
    <>
      <div className="hidden lg:block">
        <div className="min-h-screen bg-neutral-900 text-white">
          <Navbar />

          {/* Hero */}
          <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
            <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
              <span className="size-1.5 rounded-full bg-[#5BA0FF] mr-2" /> How
              To&apos;s
            </div>
            <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]">
              <span className="block text-[36px] sm:text-[48px] md:text-[64px]">
                How to RICA
              </span>
            </h1>
            <p className="mt-4 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-2xl mx-auto">
              Register your SIM from your couch in about 5 minutes. No store
              visits, no paperwork shuffle.
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

          {/* Steps */}
          <section className="mx-auto max-w-6xl px-6 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {steps.map((step) => (
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
                <span className="w-2.5 h-2.5 rounded-full bg-[#5BA0FF]" />
                <h2 className="font-grotesque font-bold text-[24px] md:text-[32px] leading-[1.05]">
                  RICA FAQ
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {notes.map((note) => (
                  <div key={note.title}>
                    <h3 className="font-grotesque font-bold text-white text-lg">
                      {note.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-400 font-manrope leading-relaxed">
                      {note.body}
                    </p>
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
                  <span className="font-semibold">Pro tip:</span> Complete RICA
                  as soon as you order your SIM. Your SIM can&apos;t be
                  activated until RICA is verified, so doing it early saves you
                  a wait later.
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
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-5 h-10 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] border-2 border-black/70 hover:bg-[#ABFF63]/90 transition-colors"
              >
                <span className="font-manrope">Go to dashboard</span>
              </Link>
            </div>
          </section>

          <Footer />
        </div>
      </div>

      <MobilePage title="How to RICA" backTo="/how-to">
        <div className="px-4 pt-4 space-y-6">
          {/* Hero */}
          <div>
            <div className="font-manrope flex items-center text-sm text-neutral-400">
              <span className="size-1.5 rounded-full bg-[#5BA0FF] mr-2" /> How
              To&apos;s
            </div>
            <h1 className="mt-3 font-grotesque font-bold text-2xl leading-[1.1]">
              How to RICA
            </h1>
            <p className="mt-2 text-neutral-400 text-sm font-manrope leading-relaxed">
              Register your SIM from your couch in about 5 minutes. No store
              visits, no paperwork.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`rounded-2xl ${step.colour} text-neutral-900 border-2 border-black/60 shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] p-4 flex gap-3`}
              >
                <div className="font-grotesque font-bold text-3xl leading-none opacity-30 shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-grotesque font-bold text-base leading-[1.1]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-900/80 font-manrope leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="rounded-2xl bg-[#26252C] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#5BA0FF]" />
              <h2 className="font-grotesque font-bold text-xl">RICA FAQ</h2>
            </div>
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.title}>
                  <h3 className="font-grotesque font-bold text-white text-base">
                    {note.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-neutral-400 font-manrope leading-relaxed">
                    {note.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2">
              <img
                src={`${import.meta.env.BASE_URL}images/lime_icon_small.svg`}
                alt=""
                className="h-4 w-4 mt-0.5 shrink-0"
              />
              <p className="text-xs text-[#ABFF63] font-manrope">
                <span className="font-semibold">Pro tip:</span> Complete RICA
                early — your SIM can&apos;t activate without it.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-2 pb-4">
            <Link
              to="/how-to"
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-neutral-800 text-white font-semibold text-sm px-4 h-10 border-2 border-black/60 shadow-[3px_3px_0_0_rgba(0,0,0,0.6)]"
            >
              <span className="font-manrope">← Back</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-4 h-10 shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] border-2 border-black/60"
            >
              <span className="font-manrope">Dashboard</span>
            </Link>
          </div>
        </div>
      </MobilePage>
    </>
  );
}
