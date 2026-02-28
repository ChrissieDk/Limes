import { Search } from 'lucide-react';

interface SimSearchControlsProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  displayPosition: number;
  displayTotal: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function SimSearchControls({
  searchTerm,
  onSearchTermChange,
  displayPosition,
  displayTotal,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: SimSearchControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative block">
        <span className="sr-only">Search SIMs</span>
        <div className="flex h-9 w-[200px] items-center rounded-full border border-white/30 bg-transparent pl-3 pr-1.5">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search..."
            className="h-full flex-1 bg-transparent text-sm text-white placeholder:text-neutral-400 focus:outline-none"
          />
          <Search className="pointer-events-none h-3.5 w-3.5 text-neutral-400 mr-1" />
        </div>
      </label>

      <div className="flex items-center gap-0.5 text-neutral-300">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="p-0.5 text-neutral-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous SIM"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M12.5 4.5L7 10l5.5 5.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="min-w-[44px] text-center text-sm font-medium text-neutral-400">
          {displayPosition} of {displayTotal}
        </span>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="p-0.5 text-neutral-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next SIM"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M7.5 4.5L13 10l-5.5 5.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
