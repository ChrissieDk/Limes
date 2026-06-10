import { type ReactNode } from 'react'
import DashboardNavbar from '../components/DashboardNavbar'
import Footer from '../components/Footer'
import PlanBuilder from '../components/PlanBuilder'

import { BundleCategorySkeleton, PackageCardSkeleton } from '../components/dashboard/PackageSkeletonLoaders.tsx'
import PackageFlowBreadcrumbs from '../components/dashboard/PackageFlowBreadcrumbs'
import ComboBundleCard from '../components/dashboard/ComboBundleCard'
import { usePackageSelection } from './usePackageSelection'

const CATEGORY_COLORS = [
  { bg: 'bg-[#CDA7FC]' },
  { bg: 'bg-[#ABFF64]' },
  { bg: 'bg-[#F8A1D9]' },
]

const getCategoryStyle = (categoryId: string) => {
  const styles: Record<string, { bg: string; hover: string; icon: ReactNode }> = {
    data: {
      bg: 'bg-[#ABFF63]',
      hover: 'hover:brightness-95',
      icon: <img src={`${import.meta.env.BASE_URL}images/plan_data.svg`} alt="" className="w-14 h-14" />,
    },
    voice: {
      bg: 'bg-pink-300',
      hover: 'hover:brightness-95',
      icon: <img src={`${import.meta.env.BASE_URL}images/plan_phone.svg`} alt="" className="w-14 h-14" />,
    },
    sms: {
      bg: 'bg-[#629BFC]',
      hover: 'hover:brightness-95',
      icon: <img src={`${import.meta.env.BASE_URL}images/plan_sms.svg`} alt="" className="w-14 h-14" />,
    },
    whatsapp: {
      bg: 'bg-[#5BFFD8]',
      hover: 'hover:brightness-95',
      icon: <img src={`${import.meta.env.BASE_URL}images/whatsapp_icon_small.svg`} alt="" className="w-14 h-14" />,
    },
    airtime: {
      bg: 'bg-[#CDA7FC]',
      hover: 'hover:brightness-95',
      icon: <img src={`${import.meta.env.BASE_URL}images/plan_lime.svg`} alt="" className="w-14 h-14" />,
    },
    data_fwa: {
      bg: 'bg-[#4A90E2]',
      hover: 'hover:bg-[#3A80D2]',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
    },
  }

  return (
    styles[categoryId] || {
      bg: 'bg-[#7B9FF5]',
      hover: 'hover:bg-[#6B8FE5]',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    }
  )
}

function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="mb-6 px-4 py-2 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )
}

function PageHeader({
  packageType,
  contractFlowType,
  simStatus,
  iccidConfirmed,
  selectedBundleCategory,
  comboBundleCount,
}: {
  packageType: string | null
  contractFlowType: string | null
  simStatus: string | null
  iccidConfirmed: boolean
  selectedBundleCategory: string | null
  comboBundleCount: number
}) {
  const title = !packageType
    ? 'Choose your subscription type'
    : packageType === 'contract' && !contractFlowType
      ? 'Choose your subscription type'
      : packageType === 'prepaid' && !simStatus
        ? 'Do you have a SIM?'
        : packageType === 'contract' && contractFlowType && !simStatus
          ? 'Do you have a SIM?'
          : simStatus && !selectedBundleCategory && packageType === 'prepaid'
              ? 'Choose your subscription type'
              : comboBundleCount > 0
                ? 'Choose your combo subscription'
                : 'Your subscriptions'

  const subtitle = !packageType
    ? 'Select between subscription or prepaid options'
    : packageType === 'contract' && !contractFlowType
      ? 'Build your own subscription or choose a combo subscription'
      : packageType === 'prepaid' && !simStatus
        ? 'Let us know if you already have a SIM card'
        : packageType === 'contract' && contractFlowType && !simStatus
          ? 'Let us know if you already have a SIM card'
          : simStatus === 'has-sim' && !iccidConfirmed
            ? 'Found on the back of your SIM card'
            : simStatus && !selectedBundleCategory && packageType === 'prepaid'
              ? 'Select the type of subscription you need'
              : comboBundleCount > 0
                ? `${comboBundleCount} combo subscriptions available`
                : `Showing ${selectedBundleCategory || packageType} subscriptions`

  return (
    <>
      <h2 className="mt-3 text-center font-grotesque font-extrabold text-white text-4xl sm:text-[40px] md:text-[48px] leading-[1.05]">
        {title}
      </h2>
      <p className="font-manrope mt-2 text-center text-neutral-400">{subtitle}</p>
    </>
  )
}

export default function DashboardPackages() {
  const {
    products,
    loading,
    error,
    packageType,
    simStatus,
    bundleCategories,
    selectedBundleCategory,
    showPackages,
    showPlanBuilder,
    planAllocation,
    contractFlowType,
    comboBundles,
    iccid,
    iccidConfirmed,
    iccidSubmitLoading,
    iccidError,
    handlePackageTypeSelect,
    handleSimStatusSelect,
    handleIccidSubmit,
    handleBundleCategorySelect,
    handleBackFromBundleCategories,
    handleBackFromPackages,
    handleBackFromPlanBuilder,
    handleBackFromIccidInput,
    handlePlanContinue,
    handleReset,
    handleContractFlowTypeSelect,
    handleBackFromContractFlowChoice,
    handleBackFromComboBundles,
    handleComboBundleSelect,
    handleBuyNow,
    setIccid,
    setIccidError,
  } = usePackageSelection()

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />
      <main className="px-4 sm:px-6 pb-6 max-w-6xl mx-auto">
        <section className="relative bg-neutral-900">
          <div className="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8 pt-6 sm:pt-10">
            <div className="max-w-4xl mx-auto w-full">
              <PackageFlowBreadcrumbs
                state={{
                  packageType,
                  contractFlowType,
                  simStatus,
                  iccidConfirmed,
                  bundleCategories,
                  selectedBundleCategory,
                  showPackages,
                  showPlanBuilder,
                  planAllocation,
                  comboBundleCount: comboBundles.length,
                }}
              />
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-2 sm:px-6 pt-4 sm:pt-6">
            <div className="font-manrope flex items-center justify-center text-sm text-neutral-400">
              <span className="size-1.5 rounded-full bg-purple-400 mr-2" /> Subscriptions
            </div>
            <PageHeader
              packageType={packageType}
              contractFlowType={contractFlowType}
              simStatus={simStatus}
              iccidConfirmed={iccidConfirmed}
              selectedBundleCategory={selectedBundleCategory}
              comboBundleCount={comboBundles.length}
            />
          </div>

          <div className="mt-6">
            <div className="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8 py-6 sm:py-10">
              {/* Step 1: Package Type */}
              {!packageType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
                  <button
                    onClick={() => handlePackageTypeSelect('contract')}
                    className="group rounded-[28px] bg-[#FDDA36] shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                  >
                    <div className="mb-4">
                      <img src={`${import.meta.env.BASE_URL}images/house.png`} alt="" aria-hidden="true" className="h-11 w-11 select-none" />
                    </div>
                    <h3 className="font-grotesque text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">Subscription</h3>
                    <p className="font-manrope mt-1.5 text-neutral-900/80 text-base md:text-lg">Long-term subscriptions with SIM delivery.</p>
                    <div className="mt-3 text-neutral-900 font-semibold inline-flex items-center gap-2">
                      <span>I want a Subscription</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePackageTypeSelect('prepaid')}
                    className="group rounded-[28px] bg-[#ABFF63] shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                  >
                    <div className="mb-4">
                      <img src={`${import.meta.env.BASE_URL}images/zblock.png`} alt="" aria-hidden="true" className="h-11 w-11 select-none" />
                    </div>
                    <h3 className="font-grotesque text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">Prepaid</h3>
                    <p className="font-manrope mt-1.5 text-neutral-900/80 text-base md:text-lg">Pay-as-you-go options.</p>
                    <div className="mt-3 text-neutral-900 font-semibold inline-flex items-center gap-2">
                      <span>I want Prepaid</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 1.5: Contract Flow Type */}
              {packageType === 'contract' && !contractFlowType && (
                <div className="max-w-4xl mx-auto">
                  <BackButton onClick={handleBackFromContractFlowChoice} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <button
                      onClick={() => handleContractFlowTypeSelect('dynamic')}
                      className="group rounded-[28px] bg-[#F8A1D9] hover:brightness-95 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                    >
                      <div className="mb-4">
                        <img src={`${import.meta.env.BASE_URL}images/house.png`} alt="" aria-hidden="true" className="h-11 w-11 select-none" />
                      </div>
                      <h3 className="font-grotesque text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">Build your own</h3>
                      <p className="font-manrope mt-1.5 text-neutral-900 text-base md:text-lg inline-flex items-center gap-2">
                        <span>Customise your perfect subscription</span>
                        <span aria-hidden="true">→</span>
                      </p>
                    </button>

                    <button
                      onClick={() => handleContractFlowTypeSelect('combo')}
                      className="group rounded-[28px] bg-[#629CFC] hover:brightness-95 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                    >
                      <div className="mb-4">
                        <img src={`${import.meta.env.BASE_URL}images/zblock.png`} alt="" aria-hidden="true" className="h-11 w-11 select-none" />
                      </div>
                      <h3 className="font-grotesque text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">Combo subscriptions</h3>
                      <p className="font-manrope mt-1.5 text-neutral-900 text-base md:text-lg inline-flex items-center gap-2">
                        <span>Choose from our subscriptions</span>
                        <span aria-hidden="true">→</span>
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: SIM Status */}
              {((packageType === 'prepaid' && !simStatus) ||
                (packageType === 'contract' && contractFlowType && !simStatus)) &&
                !selectedBundleCategory && (
                  <div className="max-w-4xl mx-auto">
                    <BackButton onClick={handleReset} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <button
                        onClick={() => handleSimStatusSelect('has-sim')}
                        className="group rounded-[28px] bg-[#D8B0FF] hover:brightness-95 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                      >
                        <div className="mb-4">
                          <img src={`${import.meta.env.BASE_URL}images/checkmark.png`} alt="" aria-hidden="true" className="h-11 w-11 select-none" />
                        </div>
                        <h3 className="font-grotesque text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">I have a SIM</h3>
                        <p className="font-manrope mt-1.5 text-neutral-900/80 text-base md:text-lg">SIM card already in hand</p>
                        <div className="mt-3 text-neutral-900 font-semibold inline-flex items-center gap-2">
                          <span>Continue</span>
                          <span aria-hidden="true">→</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSimStatusSelect('needs-sim')}
                        className="group rounded-[28px] bg-pink-300 hover:brightness-95 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                      >
                        <div className="mb-4">
                          <img src={`${import.meta.env.BASE_URL}images/plan_logo.png`} alt="" aria-hidden="true" className="h-11 w-11 select-none" />
                        </div>
                        <h3 className="font-grotesque text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">I need a SIM</h3>
                        <p className="font-manrope mt-1.5 text-neutral-900/80 text-base md:text-lg">SIM will be delivered to you</p>
                        <div className="mt-3 text-neutral-900 font-semibold inline-flex items-center gap-2">
                          <span>Continue</span>
                          <span aria-hidden="true">→</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

              {/* Step 2.5: ICCID Input */}
              {simStatus === 'has-sim' && !iccidConfirmed && (
                <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
                  <BackButton onClick={handleBackFromIccidInput} />
                  <div className="rounded-[28px] p-7 md:p-10 bg-[#629BFC] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center justify-center mb-4">
                      <img src={`${import.meta.env.BASE_URL}images/star.png`} alt="" className="h-10 w-10 select-none" />
                    </div>
                    <h3 className="font-grotesque text-neutral-900 font-semibold text-[34px] md:text-[40px] mb-2 text-center leading-[1.05]">
                      Enter your ICCID
                    </h3>
                    <p className="font-manrope text-neutral-900/80 text-base md:text-lg mb-7 text-center">
                      Your ICCID is printed on the back of your SIM card
                    </p>
                    <div className="bg-white/25 rounded-2xl p-5 md:p-6 mb-7">
                      <label htmlFor="iccid" className="block text-neutral-900 font-semibold mb-2">
                        ICCID Number
                      </label>
                      <input
                        id="iccid"
                        type="text"
                        value={iccid}
                        onChange={(e) => { setIccid(e.target.value); setIccidError(null) }}
                        placeholder="e.g., 8927078220008762165"
                        className={`w-full px-4 py-3 rounded-xl bg-white text-neutral-900 font-mono text-lg border focus:outline-none focus:ring-2 ${iccidError ? 'border-red-500 focus:ring-red-400' : 'border-black/30 focus:ring-black/30'}`}
                        maxLength={22}
                      />
                      {iccidError ? (
                        <p className="text-red-700 font-semibold text-sm mt-2">{iccidError}</p>
                      ) : (
                        <p className="font-manrope text-neutral-900/70 text-sm mt-2">Usually 19-20 digits long</p>
                      )}
                    </div>
                    <button
                      onClick={handleIccidSubmit}
                      disabled={iccid.trim().length < 15 || iccidSubmitLoading}
                      className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_18px_55px_rgba(0,0,0,0.25)]"
                    >
                      {iccidSubmitLoading ? 'Checking…' : 'Continue'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Bundle Categories (PREPAID) */}
              {packageType === 'prepaid' && !selectedBundleCategory && !showPackages && (loading || bundleCategories.length > 0) && (
                <div className="max-w-7xl mx-auto">
                  <BackButton onClick={handleBackFromBundleCategories} />
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <BundleCategorySkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                      {bundleCategories.map((category) => {
                        const style = getCategoryStyle(category.id)
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleBundleCategorySelect(category.id)}
                            className={`group rounded-[24px] px-8 py-8 ${style.bg} ${style.hover} transition-all min-h-[200px] flex flex-col items-center justify-center text-center`}
                          >
                            <div className="mb-4 text-neutral-900">{style.icon}</div>
                            <h3 className="font-grotesque text-neutral-900 font-bold text-[28px] md:text-[30px] leading-[1.05]">
                              {category.name}
                            </h3>
                            <div className="font-manrope mt-3 inline-flex items-center justify-center rounded-full bg-black/35 text-white px-4 py-1.5 text-sm font-semibold">
                              {category.productCount} {category.productCount === 1 ? 'option' : 'options'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Packages (PREPAID) */}
              {packageType === 'prepaid' && showPackages && selectedBundleCategory && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <BackButton onClick={handleBackFromPackages} label="Back to subscriptions" />
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-xl bg-neutral-700 text-white font-semibold hover:bg-neutral-600 transition-colors"
                    >
                      Start over
                    </button>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <PackageCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-400 text-lg mb-4">{error}</p>
                      <button
                        onClick={handleBackFromPackages}
                        className="px-6 py-3 bg-lime-400 text-neutral-900 rounded-xl font-semibold hover:bg-lime-300 transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      {products.map((pkg, idx) => {
                        const colorScheme = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                        return (
                          <div
                            key={pkg.id}
                            className={`rounded-[28px] p-8 ${colorScheme.bg} shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all group relative overflow-hidden min-h-[230px] flex flex-col`}
                          >
                            <div className="font-grotesque text-neutral-900 font-bold text-[32px] md:text-[34px] leading-[1.05] tracking-tight">
                              {pkg.name}
                            </div>
                            <div className="mt-4 h-[2px] w-full bg-neutral-900/30" />
                            <div className="font-grotesque mt-6 text-neutral-900 font-bold text-[44px] md:text-[48px] leading-none tracking-tight">
                              R{pkg.price.toFixed(2)}
                            </div>
                            <div className="mt-6">
                              <button
                                onClick={() => handleBuyNow(pkg)}
                                className="inline-flex items-center justify-center h-10 px-6 rounded-[12px] bg-white text-neutral-900 text-sm font-semibold border border-neutral-900/50 hover:bg-neutral-50 transition-colors"
                              >
                                Buy now
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-400">
                      <p className="font-manrope text-lg">No subscriptions available in this category.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Plan Builder (CONTRACT dynamic) */}
              {packageType === 'contract' && showPlanBuilder && !planAllocation && (
                <PlanBuilder onContinue={handlePlanContinue} onBack={handleBackFromPlanBuilder} />
              )}

              {/* Step 3: Combo Bundles (CONTRACT combo) */}
              {packageType === 'contract' && contractFlowType === 'combo' && (loading || comboBundles.length > 0) && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <BackButton onClick={handleBackFromComboBundles} />
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-xl bg-neutral-700 text-white font-semibold hover:bg-neutral-600 transition-colors"
                    >
                      Start over
                    </button>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <PackageCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-400 text-lg mb-4">{error}</p>
                      <button
                        onClick={handleBackFromComboBundles}
                        className="px-6 py-3 bg-lime-400 text-neutral-900 rounded-xl font-semibold hover:bg-lime-300 transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      {comboBundles.map((bundle, idx) => {
                        const colorScheme = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                        return (
                          <ComboBundleCard
                            key={bundle.id}
                            bundle={bundle}
                            colorClass={colorScheme.bg}
                            onSelect={handleComboBundleSelect}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
