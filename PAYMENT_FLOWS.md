# Payment Initialization Flows

This document explains the three different payment initialization flows in the Limes application.

---

## 🔄 Flow Summary

| Flow | Used For | Endpoint | Amount Source | MSISDN Timing |
|------|----------|----------|---------------|---------------|
| **Normal** | Regular prepaid packages | `/payment/paystack/initialize` | Backend (from MVNX catalog) | After payment |
| **Dynamic** | Contract dynamic plans | `/payment/dynamic-services/initialize` | Frontend (user allocation) | Before payment |
| **Combo** | Contract combo bundles (m2m_combo) | `/payment/paystack/initialize-combo` | Frontend (RANDS) | After payment |

---

## 1️⃣ Normal Initialize - Regular Prepaid Packages

### Use Case
Regular prepaid packages where the product price is available in the MVNX catalog.

### Flow
```
1. Payment → 2. MSISDN Allocation → 3. Order Creation
```

### Frontend Request
```typescript
await paymentService.initializeTransaction({
  productId: "7029225",  // Regular product ID
  msisdn: null           // Allocated AFTER payment
})
```

### Backend Endpoint
```
POST /api/payment/paystack/initialize
```

### Request Payload
```json
{
  "productId": "7029225",
  "msisdn": null
}
```

### Backend Logic
1. Fetch product price from MVNX catalog
2. Create Paystack transaction with catalog price
3. Return `access_code` and `reference`

### Notes
- Backend controls the amount (security)
- Frontend only provides product ID
- MSISDN allocated after successful payment

---

## 2️⃣ Dynamic Initialize - Contract Dynamic Plans

### Use Case
Contract plans where the user customizes their service allocation (data, voice, SMS, WhatsApp).

### Flow
```
1. MSISDN Allocation → 2. Payment → 3. Service Creation
```

### Frontend Request
```typescript
await paymentService.initializeDynamicServicesPayment({
  msisdn: "27823456789",  // Allocated BEFORE payment
  services: [
    {
      value: 5120,              // MB (converted from R50 allocation)
      definitionCode: "DATA",
      expiryDate: "2026-02-28T23:59:59Z",
      priceInCents: 5000        // R50 in cents
    },
    {
      value: 30,                // Rands for voice
      definitionCode: "GPA_CREDIT",
      expiryDate: "2026-02-28T23:59:59Z",
      priceInCents: 3000        // R30 in cents
    }
  ]
})
```

### Backend Endpoint
```
POST /api/payment/dynamic-services/initialize
```

### Request Payload
```json
{
  "msisdn": "27823456789",
  "services": [
    {
      "value": 5120,
      "definitionCode": "DATA",
      "expiryDate": "2026-02-28T23:59:59Z",
      "priceInCents": 5000
    },
    {
      "value": 30,
      "definitionCode": "GPA_CREDIT",
      "expiryDate": "2026-02-28T23:59:59Z",
      "priceInCents": 3000
    }
  ]
}
```

### Backend Logic
1. Calculate total amount from services array (sum of `priceInCents`)
2. Create Paystack transaction with calculated amount
3. Store service details in metadata
4. Return `access_code` and `reference`

### Notes
- MSISDN must be allocated BEFORE payment (contract flow)
- Frontend controls service allocation
- Services are created after successful payment

---

## 3️⃣ Combo Initialize - Contract Combo Bundles (m2m_combo)

### Use Case
Contract combo bundles where the MVNX catalog shows `price: 0` but the frontend knows the actual price from the mapping configuration.

### Flow
```
1. Payment → 2. MSISDN Allocation → 3. Order Creation
```

### Frontend Request
```typescript
await paymentService.initializeComboPayment({
  productId: "COMBO_BUNDLE_001",
  amount: 199.99,         // In RANDS (not cents!)
  msisdn: null            // Allocated AFTER payment
})
```

### Backend Endpoint
```
POST /api/payment/paystack/initialize-combo
```

### Request Payload
```json
{
  "productId": "COMBO_BUNDLE_001",
  "amount": 199.99,
  "msisdn": null
}
```

### Backend Logic
1. Receive amount in RANDS from frontend
2. Convert RANDS to cents (multiply by 100)
3. Create Paystack transaction with converted amount
4. Return `access_code` and `reference`

### Notes
- **CRITICAL**: Amount is sent in **RANDS**, not cents
- Backend converts RANDS → cents for Paystack
- MSISDN allocated after successful payment (payment-first flow)
- Used because MVNX catalog has `price: 0` for combo bundles

---

## 🔍 Key Differences

### Amount Control

| Flow | Who Controls Amount | Format | Source |
|------|---------------------|--------|--------|
| Normal | Backend | Cents | MVNX Catalog |
| Dynamic | Frontend | Cents | User Allocation |
| Combo | Frontend | **RANDS** | Frontend Mapping |

### MSISDN Timing

| Flow | MSISDN Allocation | Reason |
|------|------------------|--------|
| Normal | After payment | Prepaid flow |
| Dynamic | Before payment | Contract flow - lock MSISDN first |
| Combo | After payment | Payment-first flow |

---

## 📊 Implementation in ShippingModal.tsx

```typescript
// Line 174-257: CONTRACT DYNAMIC PLANS
if (selectedPackage.packageType === 'contract' && selectedPackage.isDynamicPlan) {
  // 1. Create subscriber first (get MSISDN)
  const subscriberResponse = await subscriptionService.createSubscription(...)
  const allocatedMsisdn = subscriberResponse.msisdn
  
  // 2. Initialize dynamic services payment
  initResponse = await paymentService.initializeDynamicServicesPayment({
    msisdn: allocatedMsisdn,
    services: [...]
  })
}

// Line 258-277: COMBO BUNDLE FLOW (NEW)
else if (selectedPackage.isComboBundle) {
  initResponse = await paymentService.initializeComboPayment({
    productId: String(selectedPackage.productId),
    amount: selectedPackage.price,  // In RANDS
    msisdn: null
  })
}

// Line 278-292: PREPAID FLOW
else {
  initResponse = await paymentService.initializeTransaction({
    productId: String(selectedPackage.productId),
    msisdn: null
  })
}
```

---

## 🧪 Testing Each Flow

### Test Normal Initialize
```bash
curl -X POST 'https://limes-staging.up.railway.app/api/payment/paystack/initialize' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "productId": "7029225",
    "msisdn": null
  }'
```

### Test Dynamic Initialize
```bash
curl -X POST 'https://limes-staging.up.railway.app/api/payment/dynamic-services/initialize' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "msisdn": "27823456789",
    "services": [
      {
        "value": 5120,
        "definitionCode": "DATA",
        "expiryDate": "2026-02-28T23:59:59Z",
        "priceInCents": 5000
      }
    ]
  }'
```

### Test Combo Initialize
```bash
curl -X POST 'https://limes-staging.up.railway.app/api/payment/paystack/initialize-combo' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "productId": "COMBO_BUNDLE_001",
    "amount": 199.99,
    "msisdn": null
  }'
```

---

## ⚠️ Important Notes

1. **Combo Bundle Amount Format**
   - Always send in **RANDS**, not cents
   - Backend converts to cents (×100) for Paystack
   - Example: R199.99 → 19999 cents

2. **Security**
   - Normal flow: Backend controls amount (secure)
   - Dynamic flow: Amount from services array (validated on backend)
   - Combo flow: Amount from frontend (validated against expected range on backend)

3. **Error Handling**
   - All flows return same response format
   - Check `success` field before proceeding
   - Log errors for debugging

---

## 🔄 After Payment (All Flows)

After successful payment, all flows go through the same verification process:

1. **Verify payment** (`/payment/paystack/verify`)
2. **Create subscriber** (if not already created)
3. **Create order OR services** (depending on package type)
4. **Link transaction** to order/services
5. **Create recurring subscription** (if monthly plan)

See `handlePaymentVerification()` in ShippingModal.tsx for full implementation.
