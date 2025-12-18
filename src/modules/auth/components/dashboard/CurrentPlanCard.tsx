import { ChevronRight, Phone } from 'lucide-react';
import type { Plan } from './dashboardTypes.ts';

interface CurrentPlanProps {
  plan: Plan;
  className?: string;
}

export function CurrentPlan({ plan, className }: CurrentPlanProps) {
  return (
    <div className={`bg-neutral-800 rounded-2xl p-6 h-full border border-neutral-700 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-white font-semibold text-lg">Current Plan</h3>
          <span className="bg-white text-neutral-900 text-xs px-2.5 py-1 rounded-full">SIM1</span>
        </div>
        <div className="inline-flex items-center space-x-2 bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-lime-400" />
          <span className="text-white text-xs font-medium">Subscription</span>
        </div>
      </div>

      {/* Plan title */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-12 h-12 bg-transparent rounded-xl flex items-center justify-center">
          <img
            src={`${import.meta.env.BASE_URL}images/plan_logo.png`}
            alt="Plan"
            className="w-7 h-7"
          />
        </div>
        <h4 className="text-white font-bold text-xl">{plan.name}</h4>
      </div>

      {/* Feature tiles */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-lime-400 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-neutral-900 text-sm mb-1.5">
            <img
              src={`${import.meta.env.BASE_URL}images/data.png`}
              alt="Mobile data"
              className="w-5 h-5"
            />
            <span>Mobile data</span>
          </div>
          <div className="text-neutral-900 font-semibold text-xl">{plan.mobileData}</div>
        </div>
        <div className="bg-blue-500 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-neutral-900 text-sm mb-1.5">
            <img
              src={`${import.meta.env.BASE_URL}images/sms.png`}
              alt="Messaging"
              className="w-5 h-5"
            />
            <span>Messaging</span>
          </div>
          <div className="text-neutral-900 font-semibold text-xl">{plan.messaging}</div>
        </div>
        <div className="bg-pink-400 rounded-2xl p-4 col-span-2">
          <div className="flex items-center space-x-2 text-neutral-900 text-sm mb-1.5">
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </div>
          <div className="text-neutral-900 font-semibold text-xl">{plan.phone}</div>
        </div>
      </div>

      {/* Actions and pricing */}
      <div className="flex items-end justify-between">
        {/* Button block with offset shadow frame */}
        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-neutral-900" />
          <div className="relative bg-white rounded-2xl p-2 flex items-center space-x-3">
            <button className="bg-lime-400 text-neutral-900 py-2 px-4 rounded-xl font-medium hover:bg-lime-300 transition-colors inline-flex items-center">
              <span>Edit</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
            <button className="bg-white text-neutral-900 py-2 px-4 rounded-xl font-medium border-2 border-neutral-900 hover:bg-neutral-100 transition-colors">
              View Billing
            </button>
          </div>
        </div>

        <div className="text-right">
          <div className="text-neutral-400 text-sm mb-1">Plan pricing</div>
          <div className="text-white font-bold text-3xl">R{plan.price}</div>
        </div>
      </div>
    </div>
  );
}
