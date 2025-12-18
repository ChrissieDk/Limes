import { ExternalLink } from 'lucide-react';
import type { Bundle } from './dashboardTypes.ts';

interface BundleCardProps {
  bundle: Bundle;
}

export function BundleCard({ bundle }: BundleCardProps) {
  const isFlex = bundle.type === 'flex';
  const isLite = bundle.type === 'lite';
  const isThreeMonth = bundle.type === '3-month';

  const containerClasses = (() => {
    if (isFlex) return 'bg-yellow-400';
    if (isLite) return 'bg-blue-500';
    if (isThreeMonth) return 'bg-purple-400';
    return 'bg-gray-600';
  })();

  const titleIcon = (() => {
    if (isFlex) return `${import.meta.env.BASE_URL}images/star.png`;
    if (isLite) return `${import.meta.env.BASE_URL}images/plan_logo.png`;
    if (isThreeMonth) return `${import.meta.env.BASE_URL}images/bundle_3.png`;
    return `${import.meta.env.BASE_URL}images/plan-line.png`;
  })();

  return (
    <div
      className={`${containerClasses} relative rounded-2xl px-6 pt-6 pb-4 min-h-[220px] border-2 border-neutral-900 overflow-hidden flex flex-col`}
    >
      {/* Decorative plus cluster */}
      <div className="absolute top-3 right-4 text-neutral-900/70 select-none">
        <div className="leading-3">
          <span>+</span>
          <span className="ml-2">+</span>
          <span className="ml-2">+</span>
        </div>
        <div className="leading-3 mt-1">
          <span>+</span>
          <span className="ml-2">+</span>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center mb-4">
        <img src={titleIcon} alt="bundle icon" className="w-6 h-6 mr-2" />
        <h4 className="text-neutral-900 font-extrabold text-2xl">{bundle.name}</h4>
      </div>

      {/* Bullet list */}
      <div className="space-y-3 mb-4 max-w-[80%]">
        <div className="flex items-start">
          <img
            src={`${import.meta.env.BASE_URL}images/plan_line.png`}
            alt="bullet"
            className="w-7 h-5 mr-3 mt-0.5"
          />
          <span className="text-neutral-900 text-base leading-snug">{bundle.dayData}</span>
        </div>
        {bundle.cashback && (
          <div className="flex items-start">
            <img
              src={`${import.meta.env.BASE_URL}images/plan_line.png`}
              alt="bullet"
              className="w-7 h-5 mr-3 mt-0.5"
            />
            <span className="text-neutral-900 text-base leading-snug">{bundle.cashback}</span>
          </div>
        )}
        {bundle.nightData && !bundle.cashback && (
          <div className="flex items-start">
            <img
              src={`${import.meta.env.BASE_URL}images/plan_line.png`}
              alt="bullet"
              className="w-7 h-5 mr-3 mt-0.5"
            />
            <span className="text-neutral-900 text-base leading-snug">{bundle.nightData}</span>
          </div>
        )}
      </div>

      {/* Pointing man image */}
      {isFlex && (
        <img
          src={`${import.meta.env.BASE_URL}images/pointing_man.png`}
          alt="Pointing man"
          className="pointer-events-none select-none absolute -bottom-6 -right-4 h-44 object-contain"
        />
      )}

      {/* CTA with offset shadow */}
      <div className="relative inline-flex w-fit self-start mt-auto pt-2">
        <div className="absolute inset-0 translate-x-1.5 translate-y-2 rounded-2xl bg-neutral-900" />
        <button className="relative bg-white text-black border-2 border-neutral-900 rounded-2xl px-5 py-2.5 font-semibold inline-flex items-center justify-center hover:bg-neutral-800 hover:text-white transition-colors">
          <span>Get Bundle</span>
          <ExternalLink className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
