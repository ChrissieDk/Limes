import type { CatalogCategoryNode } from '../../../types'

const CATEGORY_STYLES: Record<string, { bg: string; icon: string }> = {
  data: { bg: 'bg-[#ABFF63]', icon: 'plan_data.svg' },
  voice: { bg: 'bg-pink-300', icon: 'plan_phone.svg' },
  sms: { bg: 'bg-[#629BFC]', icon: 'plan_sms.svg' },
  whatsapp: { bg: 'bg-[#FF9F66]', icon: 'whatsapp_icon_small.svg' },
}

interface BundleCategoryGridProps {
  categories: CatalogCategoryNode[]
  onSelect: (categoryId: string) => void
}

export default function BundleCategoryGrid({ categories, onSelect }: BundleCategoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {categories.map((category) => {
        const style = CATEGORY_STYLES[category.id] || { bg: 'bg-neutral-200', icon: 'plan_data.svg' }
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`rounded-2xl ${style.bg} p-4 text-left transition-all hover:brightness-95 active:scale-[0.98] flex items-center gap-4`}
          >
            <img src={`${import.meta.env.BASE_URL}images/${style.icon}`} alt="" className="w-10 h-10 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-neutral-900 text-lg">{category.name}</div>
              <div className="font-manrope text-sm text-neutral-700 font-medium">
                {category.productCount} {category.productCount === 1 ? 'option' : 'options'}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
