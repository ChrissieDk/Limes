import { useEffect, useState } from 'react'
import { Plus, MapPin, Package, ChevronRight } from 'lucide-react'
import TextField from './TextField'

interface Address {
  streetNo: string
  streetName: string
  suburb?: string
  city: string
  stateOrProvince: string
  postCode: string
  country: string
}

interface SelectedPackage {
  productId: string
  name: string
  price: number
  features: {
    mobileData?: string
    airtime?: string
    messaging?: string
    phone?: string
  }
}

interface ShippingModalProps {
  open: boolean
  onClose: () => void
  defaultAddress?: Address
  selectedPackage?: SelectedPackage
  onPay?: () => void
}

export default function ShippingModal({ 
  open, 
  onClose, 
  defaultAddress,
  selectedPackage,
  onPay
}: ShippingModalProps) {
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)
  
  // Address form states
  const [streetNo, setStreetNo] = useState('')
  const [streetName, setStreetName] = useState('')
  const [suburb, setSuburb] = useState('')
  const [city, setCity] = useState('')
  const [stateOrProvince, setStateOrProvince] = useState('')
  const [postCode, setPostCode] = useState('')
  const [country, setCountry] = useState('South Africa')

  // Addresses list (default + any new ones)
  const [addresses, setAddresses] = useState<Address[]>(
    defaultAddress ? [defaultAddress] : []
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleAddAddress = () => {
    if (!streetNo || !streetName || !city || !stateOrProvince || !postCode) {
      return
    }

    const newAddress: Address = {
      streetNo,
      streetName,
      suburb,
      city,
      stateOrProvince,
      postCode,
      country,
    }

    setAddresses([...addresses, newAddress])
    setSelectedAddressIndex(addresses.length)
    setShowAddAddress(false)
    
    // Reset form
    setStreetNo('')
    setStreetName('')
    setSuburb('')
    setCity('')
    setStateOrProvince('')
    setPostCode('')
    setCountry('South Africa')
  }

  const formatAddress = (addr: Address) => {
    const parts = [
      addr.streetNo,
      addr.streetName,
      addr.suburb,
      addr.city,
      addr.stateOrProvince,
      addr.postCode,
      addr.country,
    ].filter(Boolean)
    return parts.join(', ')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-0 sm:mx-4 rounded-2xl bg-white text-neutral-900 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[82vh] sm:max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-8 rounded-lg bg-neutral-900 text-white">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-lg">Confirm SIM Delivery</div>
              <div className="text-sm text-neutral-500">Review your package and shipping details</div>
            </div>
          </div>
          <button 
            aria-label="Close" 
            className="size-10 grid place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 text-2xl" 
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-5 space-y-5">
            
            {/* Selected Package Section */}
            {selectedPackage && (
              <div className="space-y-3">
                <h3 className="text-neutral-900 font-bold text-sm uppercase tracking-wide">Selected Package</h3>
                <div className="rounded-xl border-2 border-neutral-900 bg-lime-50 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-lime-400 grid place-items-center">
                        <img 
                          src={`${import.meta.env.BASE_URL}images/plan_logo.png`} 
                          alt="Package" 
                          className="w-6 h-6" 
                        />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-neutral-900">{selectedPackage.name}</div>
                        <div className="text-xs text-neutral-600">Product ID: {selectedPackage.productId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neutral-900">R{selectedPackage.price}</div>
                      <div className="text-xs text-neutral-600">per month</div>
                    </div>
                  </div>
                  
                  {/* Package Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPackage.features.mobileData && (
                      <div className="bg-white rounded-lg p-3 border border-neutral-200">
                        <div className="text-xs text-neutral-600 mb-1">Mobile Data</div>
                        <div className="font-semibold text-neutral-900">{selectedPackage.features.mobileData}</div>
                      </div>
                    )}
                    {selectedPackage.features.messaging && (
                      <div className="bg-white rounded-lg p-3 border border-neutral-200">
                        <div className="text-xs text-neutral-600 mb-1">Messaging</div>
                        <div className="font-semibold text-neutral-900">{selectedPackage.features.messaging}</div>
                      </div>
                    )}
                    {selectedPackage.features.phone && (
                      <div className="bg-white rounded-lg p-3 border border-neutral-200">
                        <div className="text-xs text-neutral-600 mb-1">Phone</div>
                        <div className="font-semibold text-neutral-900">{selectedPackage.features.phone}</div>
                      </div>
                    )}
                    {selectedPackage.features.airtime && (
                      <div className="bg-white rounded-lg p-3 border border-neutral-200">
                        <div className="text-xs text-neutral-600 mb-1">Airtime</div>
                        <div className="font-semibold text-neutral-900">{selectedPackage.features.airtime}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-neutral-900 font-bold text-sm uppercase tracking-wide">Shipping Address</h3>
                {!showAddAddress && (
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-lime-600 hover:text-lime-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Address
                  </button>
                )}
              </div>

              {/* Address List */}
              {!showAddAddress && addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddressIndex === idx
                          ? 'border-neutral-900 bg-lime-50'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      } p-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`size-8 rounded-lg grid place-items-center ${
                            selectedAddressIndex === idx ? 'bg-neutral-900' : 'bg-neutral-100'
                          }`}>
                            <MapPin className={`w-4 h-4 ${
                              selectedAddressIndex === idx ? 'text-white' : 'text-neutral-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-neutral-900 mb-1">
                              {idx === 0 ? 'Default Address' : `Address ${idx + 1}`}
                            </div>
                            <div className="text-sm text-neutral-600 leading-relaxed">
                              {formatAddress(addr)}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`size-5 rounded-full border-2 transition-all ${
                            selectedAddressIndex === idx
                              ? 'bg-neutral-900 border-neutral-900'
                              : 'bg-white border-neutral-300'
                          }`}
                        >
                          {selectedAddressIndex === idx && (
                            <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Form */}
              {showAddAddress && (
                <div className="rounded-xl border-2 border-neutral-900 bg-neutral-50 p-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-neutral-900">New Shipping Address</h4>
                    <button
                      onClick={() => setShowAddAddress(false)}
                      className="text-sm text-neutral-600 hover:text-neutral-900"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      label="Street Number"
                      value={streetNo}
                      onChange={(e) => setStreetNo(e.target.value)}
                    />
                    <TextField
                      label="Street Name"
                      value={streetName}
                      onChange={(e) => setStreetName(e.target.value)}
                    />
                    <TextField
                      label="Suburb (Optional)"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                    />
                    <TextField
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <TextField
                      label="State/Province"
                      value={stateOrProvince}
                      onChange={(e) => setStateOrProvince(e.target.value)}
                    />
                    <TextField
                      label="Post Code"
                      value={postCode}
                      onChange={(e) => setPostCode(e.target.value)}
                    />
                    <TextField
                      label="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleAddAddress}
                    disabled={!streetNo || !streetName || !city || !stateOrProvince || !postCode}
                    className="w-full bg-neutral-900 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Save Address
                  </button>
                </div>
              )}

              {!showAddAddress && addresses.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm">No addresses available. Please add one.</p>
                </div>
              )}
            </div>

            {/* Summary & Pay Button */}
            {!showAddAddress && addresses.length > 0 && selectedPackage && (
              <div className="space-y-4 pt-2">
                <div className="rounded-xl bg-neutral-100 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Package</span>
                    <span className="font-semibold text-neutral-900">R{selectedPackage.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-semibold text-lime-600">FREE</span>
                  </div>
                  <div className="border-t border-neutral-300 pt-2 flex items-center justify-between">
                    <span className="font-bold text-neutral-900">Total</span>
                    <span className="font-bold text-2xl text-neutral-900">R{selectedPackage.price}</span>
                  </div>
                </div>

                <button
                  onClick={onPay}
                  className="w-full bg-lime-400 text-neutral-900 py-3.5 px-4 rounded-xl font-bold hover:bg-lime-300 active:scale-[0.99] transition inline-flex items-center justify-center gap-2 text-lg"
                >
                  <span>Pay Now</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
