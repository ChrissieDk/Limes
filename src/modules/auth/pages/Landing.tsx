import { useLayoutEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrustBar from "../components/TrustBar";
import WhyChoose from "../components/WhyChoose";
import HowToJoin from "../components/HowToJoin";
import Packages from "../components/Packages";
import TelecomCta from "../components/TelecomCta";
import ReviewsMarquee from "../components/ReviewsMarquee";
import Footer from "../components/Footer";
import MobileLanding from "../components/MobileLanding";
import { useLocation } from "react-router-dom";

function scrollToHash(hash: string) {
  if (!hash || hash === "#") return;
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

export default function Landing() {
  const { hash } = useLocation();

  useLayoutEffect(() => {
    const run = () => scrollToHash(window.location.hash);

    run();
    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(run);
    });

    const onHashChange = () => run();
    window.addEventListener("hashchange", onHashChange);

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [hash]);

  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      {/* Desktop: full marketing landing page */}
      <div className="hidden lg:block">
        <Navbar />
        <div>
          <Hero />
          <TrustBar />
          <WhyChoose />
          <Packages />
          <HowToJoin />
          <TelecomCta />
          <ReviewsMarquee />
          <Footer />
        </div>
      </div>

      {/* Mobile: app-like compact landing */}
      <div className="lg:hidden">
        <MobileLanding />
      </div>
    </div>
  );
}
