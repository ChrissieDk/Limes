import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Partners from "../components/Partners";
import ApiDocsTeaser from "../components/ApiDocsTeaser";
import Footer from "../components/Footer";
import Button from "../components/Button";
import MobilePage from "../../../components/MobilePage";

const partnerCards = [
  {
    title: "Wholesale pricing",
    desc: "Access discounted rates on voice, data, and IoT services.",
  },
  {
    title: "No MVNO complexity",
    desc: "Skip regulatory hurdles — we handle infrastructure.",
  },
  {
    title: "Flexible branding",
    desc: "Sell under your own brand, co-brand, or white-label.",
  },
  {
    title: "Scalable integration",
    desc: "Plug into our APIs for activation, billing, and tracking.",
  },
  {
    title: "Custom subscriptions",
    desc: "Tailor prepaid, postpaid, or IoT plans to your customers.",
  },
  {
    title: "Full backend support",
    desc: "We manage customer service, compliance, and network ops.",
  },
];

export default function PartnersPage() {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
          <Navbar />
          <div className="pt-24">
            <Partners />
            <ApiDocsTeaser />
          </div>
          <Footer />
        </div>
      </div>

      {/* Mobile */}
      <MobilePage title="Partners" backTo="/">
        <div className="px-4 pt-4 pb-8">
          <p className="font-manrope text-sm text-neutral-400 mb-6">
            Partner with Limes to bring better connectivity to more people.
          </p>

          {/* Partner benefit cards — edge-to-edge */}
          <div className="space-y-px bg-white/10 rounded-2xl overflow-hidden mb-8">
            {partnerCards.map((card) => (
              <div key={card.title} className="mobile-card mobile-list-row">
                <div className="flex-1 min-w-0">
                  <div className="font-grotesque font-semibold text-white text-sm">
                    {card.title}
                  </div>
                  <div className="font-manrope text-neutral-400 text-xs mt-0.5">
                    {card.desc}
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-neutral-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mb-8">
            <h2 className="font-grotesque font-bold text-white text-xl mb-2">
              Ready to partner?
            </h2>
            <p className="font-manrope text-neutral-400 text-sm mb-4">
              Reach out and we'll share our API docs and pricing.
            </p>
            <Link to="/contact">
              <Button variant="primary">Contact us</Button>
            </Link>
          </div>
        </div>
      </MobilePage>
    </>
  );
}
