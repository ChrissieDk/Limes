import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";

type Props = {
  variant?: "default" | "dashboard";
  title: string;
  children: React.ReactNode;
  backTo?: string;
  rightAction?: React.ReactNode;
  /** For variant="dashboard" — shows first initial as avatar */
  customerName?: string;
  /** For variant="dashboard" — toggles search input */
  onSearch?: () => void;
};

/**
 * Mobile-native page wrapper.
 * Provides a fixed header with back button, large title, and edge-to-edge content.
 * Only visible on mobile (lg:hidden) — desktop keeps existing layouts.
 */
export default function MobilePage({
  variant = "default",
  title,
  children,
  backTo,
  rightAction,
  customerName,
  onSearch,
}: Props) {
  const navigate = useNavigate();

  const avatarInitial = customerName?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="lg:hidden min-h-screen bg-neutral-900 text-white flex flex-col">
      {/* Fixed header */}
      <div
        className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-xl border-b border-white/10"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {variant === "dashboard" ? (
          /* Dashboard: Avatar (left) | Logo (center) | Search (right) */
          <div className="flex items-center justify-between h-12 px-4">
            <button
              onClick={() => navigate("/dashboard/edit-details")}
              className="flex items-center justify-center size-8 rounded-full bg-[#ABFF63]/20 text-[#ABFF63] font-semibold text-sm hover:bg-[#ABFF63]/30 transition-colors"
              aria-label="Account"
            >
              {avatarInitial}
            </button>
            <img
              src={`${import.meta.env.BASE_URL}images/limes-mobile_horizontal.svg`}
              alt="Limes"
              className="h-5"
            />
            {onSearch ? (
              <button
                onClick={onSearch}
                className="flex items-center justify-center size-8 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Search SIMs"
              >
                <Search className="w-5 h-5 text-neutral-400" strokeWidth={2} />
              </button>
            ) : (
              <div className="size-8" aria-hidden />
            )}
          </div>
        ) : (
          /* Default: Back arrow (left) | Title centered | Right action (optional) */
          <div className="flex items-center justify-between h-12 px-4">
            <div className="flex items-center gap-2 min-w-0 w-[72px]">
              {backTo !== undefined && (
                <button
                  onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                  className="flex items-center justify-center size-8 -ml-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Back"
                >
                  <ChevronLeft
                    className="w-5 h-5 text-[#ABFF63]"
                    strokeWidth={2.5}
                  />
                </button>
              )}
            </div>
            <h1 className="font-grotesque font-bold text-lg truncate text-center flex-1">
              {title}
            </h1>
            <div className="w-[72px] flex items-center justify-end">
              {rightAction && <div className="shrink-0">{rightAction}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Edge-to-edge content with safe-area bottom padding */}
      <div
        className="flex-1"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
