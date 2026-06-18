import { memo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";

type PartnerCard = {
  key: string;
  title: string;
  description: string;
  bgClass: string;
  textClass: string;
  icon: ReactNode;
};

const Partners = memo(function Partners() {
  const cards: PartnerCard[] = [
    {
      key: "wholesale",
      title: "Wholesale pricing advantage",
      description:
        "Access discounted rates on voice, data, and IoT services, allowing you to offer competitive subscriptions or boost margins.",
      bgClass: "bg-pink-300",
      textClass: "text-neutral-900",
      icon: (
        <img
          src={`${import.meta.env.BASE_URL}images/arrow_icon.svg`}
          alt=""
          className="h-10 w-10"
        />
      ),
    },
    {
      key: "mvno",
      title: "No MVNO complexity",
      description:
        "Skip the regulatory hurdles and network management—we handle the infrastructure while you focus on your customers.",
      bgClass: "bg-white",
      textClass: "text-neutral-900",
      icon: (
        <img
          src={`${import.meta.env.BASE_URL}images/blocker_icon.svg`}
          alt=""
          className="h-10 w-10"
        />
      ),
    },
    {
      key: "branding",
      title: "Flexible branding options",
      description:
        "Sell under your own brand, co-brand with us, or simply offer our services as an added benefit to your audience.",
      bgClass: "bg-[#5BA0FF]",
      textClass: "text-neutral-900",
      icon: (
        <img
          src={`${import.meta.env.BASE_URL}images/flexable_icon.svg`}
          alt=""
          className="h-10 w-10"
        />
      ),
    },
    {
      key: "integration",
      title: "Scalable & easy integration",
      description:
        "Plug into our platform via APIs for seamless activation, billing, and real-time usage tracking.",
      bgClass: "bg-lime-300",
      textClass: "text-neutral-900",
      icon: (
        <img
          src={`${import.meta.env.BASE_URL}images/scalable_icon.svg`}
          alt=""
          className="h-10 w-10"
        />
      ),
    },
    {
      key: "custom",
      title: "Customisable subscriptions",
      description:
        "Tailor prepaid, postpaid, or IoT subscriptions to fit your customers’ or employees’ needs.",
      bgClass: "bg-white",
      textClass: "text-neutral-900",
      icon: (
        <img
          src={`${import.meta.env.BASE_URL}images/wings_icon.svg`}
          alt=""
          className="h-10 w-10"
        />
      ),
    },
    {
      key: "support",
      title: "Full backend support",
      description:
        "We manage customer service, compliance, and network operations so you don’t have to.",
      bgClass: "bg-yellow-300",
      textClass: "text-neutral-900",
      icon: (
        <img
          src={`${import.meta.env.BASE_URL}images/ticket_icon.svg`}
          alt=""
          className="h-10 w-10"
        />
      ),
    },
  ];

  return (
    <section
      id="partners"
      className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-24"
    >
      <div className="flex items-center justify-center font-grotesque font-semibold text-neutral-400 text-[24px] sm:text-[30px] md:text-[36px] leading-[1.05]">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 mr-3 translate-y-[1px]" />{" "}
        Partner With Us
      </div>

      <div className="mt-4 flex items-center justify-center">
        <h2 className="font-grotesque font-bold text-white text-[34px] sm:text-[44px] md:text-[56px] text-center leading-[1.05]">
          <span>For </span>
          <img
            src={`${import.meta.env.BASE_URL}images/business.png`}
            alt="businesses"
            className="inline-block align-middle h-10 sm:h-12 md:h-14 mx-2 -rotate-2"
          />
          <span> ready to offer more</span>
        </h2>
      </div>

      <p className="font-manrope mt-4 text-center text-neutral-400 text-base md:text-lg max-w-3xl mx-auto">
        Partner with Limes to offer mobile connectivity without building your
        own network.
      </p>

      <h3 className="mt-14 text-center font-grotesque font-bold text-neutral-400 text-[32px] sm:text-[40px] md:text-[48px] leading-[1.05]">
        Flexible, rewarding, and hassle-free
      </h3>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-2">
        {cards.map((c) => (
          <div
            key={c.key}
            className={`rounded-[26px] ${c.bgClass} ${c.textClass} border-2 border-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] p-6`}
          >
            <div className="text-neutral-900">{c.icon}</div>
            <div className="mt-4 font-grotesque font-bold text-[22px] md:text-[24px] leading-[1.05]">
              {c.title}
            </div>
            <p className="mt-2.5 text-sm text-neutral-900/80 font-manrope leading-snug">
              {c.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <div className="w-44">
          <Link to="/contact">
            <Button variant="primary">Contact Us</Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

export default Partners;
