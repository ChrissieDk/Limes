import { Link } from 'react-router-dom'
import type { CatalogCategoryNode } from '../../../../types'

export type PackageFlowBreadcrumbInput = {
  packageType: 'contract' | 'prepaid' | null
  contractFlowType: 'dynamic' | 'combo' | null
  simStatus: 'has-sim' | 'needs-sim' | null
  iccidConfirmed: boolean
  bundleCategories: CatalogCategoryNode[]
  selectedBundleCategory: string | null
  showPackages: boolean
  showPlanBuilder: boolean
  planAllocation: unknown | null
  comboBundleCount: number
}

type BreadcrumbItem = { label: string }

function getPackageFlowBreadcrumbItems(input: PackageFlowBreadcrumbInput): BreadcrumbItem[] {
  const {
    packageType,
    contractFlowType,
    simStatus,
    iccidConfirmed,
    bundleCategories,
    selectedBundleCategory,
    showPackages,
    showPlanBuilder,
    planAllocation,
    comboBundleCount,
  } = input

  const items: BreadcrumbItem[] = [{ label: 'Subscriptions' }]

  if (!packageType) {
    return items
  }

  items.push({ label: packageType === 'contract' ? 'Subscription' : 'Prepaid' })

  if (packageType === 'contract' && !contractFlowType) {
    items.push({ label: 'Subscription type' })
    return items
  }

  if (packageType === 'contract' && contractFlowType) {
    items.push({
      label: contractFlowType === 'dynamic' ? 'Build your own' : 'Combo subscriptions',
    })
  }

  const onSimPickScreen =
    (packageType === 'prepaid' && !simStatus) ||
    (packageType === 'contract' && Boolean(contractFlowType) && !simStatus)

  if (onSimPickScreen) {
    items.push({ label: 'SIM' })
    return items
  }

  if (simStatus === 'has-sim') {
    items.push({ label: 'Have SIM' })
    if (!iccidConfirmed) {
      items.push({ label: 'ICCID' })
      return items
    }
  } else if (simStatus === 'needs-sim') {
    items.push({ label: 'Need SIM' })
  }

  const prepaidReadyForBundles =
    packageType === 'prepaid' && simStatus && (simStatus === 'needs-sim' || iccidConfirmed)

  if (prepaidReadyForBundles) {
    if (bundleCategories.length > 0 && !selectedBundleCategory && !showPackages) {
      items.push({ label: 'Subscription types' })
      return items
    }
    if (showPackages && selectedBundleCategory) {
      const cat = bundleCategories.find((c) => c.id === selectedBundleCategory)
      items.push({ label: cat?.name?.trim() || 'Subscriptions' })
      items.push({ label: 'Subscriptions' })
      return items
    }
    return items
  }

  if (packageType === 'contract' && contractFlowType === 'dynamic' && showPlanBuilder && !planAllocation) {
    items.push({ label: 'Customise subscription' })
    return items
  }

  if (packageType === 'contract' && contractFlowType === 'combo' && comboBundleCount > 0) {
    items.push({ label: 'Choose combo' })
    return items
  }

  return items
}

type PackageFlowBreadcrumbsProps = {
  state: PackageFlowBreadcrumbInput
}

export default function PackageFlowBreadcrumbs({ state }: PackageFlowBreadcrumbsProps) {
  const items = getPackageFlowBreadcrumbItems(state)

  const grayLogoSrc = `${import.meta.env.BASE_URL}images/limes-mobile_horizontal.svg`

  return (
    <nav aria-label="Breadcrumb" className="w-full mb-6 sm:mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-manrope text-neutral-400">
        <li className="flex items-center gap-2 min-w-0">
          <Link
            to="/dashboard"
            className="shrink-0 inline-flex items-center leading-none opacity-95 hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ABFF63]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded-sm"
          >
            <img src={grayLogoSrc} alt="Limes home" className="h-3 w-auto sm:h-3.5" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2 min-w-0">
              <span className="text-neutral-500 shrink-0 select-none" aria-hidden>
                &gt;
              </span>
              {isLast ? (
                <span className="truncate font-medium text-neutral-400" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <span className="truncate">{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
