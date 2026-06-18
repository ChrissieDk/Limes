import { memo } from "react";

const reviews = [
  {
    quote:
      "Switching to Limes was the easiest telecom decision I've made. The subscription builder let me allocate exactly what my team needs — no bloated subscriptions, no nonsense.",
    name: "Hayley",
    role: "Business Owner / Creative",
    accent: "bg-yellow-300",
    initial: "H",
  },
  {
    quote:
      "The dashboard is clean, the API integration was straightforward, and any time I had a question the support team came back within minutes. Proper dev-friendly service.",
    name: "Ryan",
    role: "Developer",
    accent: "bg-[#5BA0FF]",
    initial: "R",
  },
  {
    quote:
      "I've worked with three different networks over the years. Limes is the first one where I actually understand my bill. Month-to-month flexibility and transparent pricing — that's rare in this industry.",
    name: "Wayne",
    role: "CEO & Business Specialist",
    accent: "bg-pink-300",
    initial: "W",
  },
  {
    quote:
      "Porting our entire team's numbers over took less than 48 hours. The step-by-step updates were a nice touch — no one was left guessing when their line would go live.",
    name: "Imtiyaaz",
    role: "Team Lead",
    accent: "bg-[#CDA7FC]",
    initial: "I",
  },
  {
    quote:
      "Great service, quick turnaround, and the cashback is a genuinely nice perk. I built my own subscription in about two minutes and haven't thought about my mobile bill since.",
    name: "Christiaan",
    role: "Developer / Creative",
    accent: "bg-[#ABFF63]",
    initial: "C",
  },
];

const ReviewsMarquee = memo(function ReviewsMarquee() {
  // Duplicate enough times for a seamless CSS loop
  const track = [...reviews, ...reviews, ...reviews, ...reviews];

  return (
    <section className="relative overflow-hidden py-10 mb-10">
      {/* Top divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Section heading */}
      <div className="mx-auto max-w-6xl px-6 mb-8">
        <div className="flex items-center justify-center font-grotesque font-semibold text-neutral-400 text-[24px] sm:text-[30px] md:text-[36px] leading-[1.05]">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400 mr-3 translate-y-[1px]" />
          <span>What people say</span>
        </div>
        <p className="mt-3 text-center text-neutral-400 text-base md:text-lg font-manrope max-w-xl mx-auto">
          Real feedback from real customers who made the switch.
        </p>
      </div>

      {/* Row 1 — left to right */}
      <div className="flex overflow-hidden">
        <div
          className="flex shrink-0 items-stretch gap-5 pr-5 animate-marquee-left will-change-transform"
          style={{ animationDuration: "70s" }}
        >
          {track.map((r, idx) => (
            <ReviewCard key={`a-${idx}`} {...r} />
          ))}
        </div>
        <div
          className="flex shrink-0 items-stretch gap-5 pr-5 animate-marquee-left will-change-transform"
          style={{ animationDuration: "70s" }}
          aria-hidden="true"
        >
          {track.map((r, idx) => (
            <ReviewCard key={`b-${idx}`} {...r} />
          ))}
        </div>
      </div>

      {/* Row 2 — right to left, offset */}
      <div className="flex overflow-hidden mt-5 opacity-50">
        <div
          className="flex shrink-0 items-stretch gap-5 pr-5 animate-marquee-right will-change-transform"
          style={{ animationDuration: "90s" }}
        >
          {[...track].reverse().map((r, idx) => (
            <ReviewCard key={`c-${idx}`} {...r} />
          ))}
        </div>
        <div
          className="flex shrink-0 items-stretch gap-5 pr-5 animate-marquee-right will-change-transform"
          style={{ animationDuration: "90s" }}
          aria-hidden="true"
        >
          {[...track].reverse().map((r, idx) => (
            <ReviewCard key={`d-${idx}`} {...r} />
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
});

export default ReviewsMarquee;

function ReviewCard({
  quote,
  name,
  role,
  accent,
  initial,
}: {
  quote: string;
  name: string;
  role: string;
  accent: string;
  initial: string;
}) {
  return (
    <div className="shrink-0 select-none w-[340px] sm:w-[420px] rounded-[26px] bg-[#26252C] ring-1 ring-white/10 p-6 flex flex-col justify-between">
      <p className="text-white/90 text-[15px] font-manrope leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div
          className={`grid place-items-center rounded-full ${accent} shrink-0`}
          style={{ width: 40, height: 40 }}
        >
          <span className="font-grotesque font-bold text-neutral-900 text-lg leading-none">
            {initial}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-white text-sm font-manrope font-semibold leading-tight">
            {name}
          </span>
          <span className="text-neutral-400 text-xs font-manrope leading-tight">
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}
