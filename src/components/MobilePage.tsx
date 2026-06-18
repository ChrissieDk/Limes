import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

type Props = {
  title: string
  children: React.ReactNode
  backTo?: string
  rightAction?: React.ReactNode
}

/**
 * Mobile-native page wrapper.
 * Provides a fixed header with back button, large title, and edge-to-edge content.
 * Only visible on mobile (lg:hidden) — desktop keeps existing layouts.
 */
export default function MobilePage({ title, children, backTo, rightAction }: Props) {
  const navigate = useNavigate()

  return (
    <div className="lg:hidden min-h-screen bg-neutral-900 text-white flex flex-col">
      {/* Fixed header */}
      <div
        className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-xl border-b border-white/10"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-2 min-w-0">
            {backTo !== undefined && (
              <button
                onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                className="flex items-center justify-center size-8 -ml-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5 text-[#ABFF63]" strokeWidth={2.5} />
              </button>
            )}
            <h1 className="font-grotesque font-bold text-lg truncate">{title}</h1>
          </div>
          {rightAction && <div className="shrink-0">{rightAction}</div>}
        </div>
      </div>

      {/* Edge-to-edge content */}
      <div className="flex-1 pb-20">{children}</div>
    </div>
  )
}
