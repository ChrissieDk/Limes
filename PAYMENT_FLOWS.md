# Payment Initialization Flows

This document explains the different payment initialization flows in the Limes application.

---

## ⚠️ PAYMENT INITIALIZATION - UNIFIED ENDPOINT

### POST /api/payment/paystack/initialize

**ALL regular payment types now use this single unified endpoint.**

#### Request Body

```json
{
  "productId": "7027225P",
  "msisdn": "27821234567",  // or null for payment-first flow
  "amount": 15000           // REQUIRED - amount in CENTS (R150.00 = 15000)
}
```

#### Response

```json
{
  "success": true,
  "message": "Transaction initialized",
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "abc123def456",
    "reference": "ref_xyz789"
  }
}
```

#### Frontend Responsibilities

1. Calculate total price in Rands (package price + any addons)
2. Convert to cents using `toCents(rands)` utility
3. Send amount with productId and msisdn

#### Example Usage

```typescript
import { toCents } from '../../payment/utils/dynamicPricing'

// For a R150.00 package
await paymentService.initializeTransaction({
  productId: "7029225P",
  msisdn: null,              // Payment-first flow
  amount: toCents(150.00)    // Converts to 15000 cents
})
```

---

## 🔄 Flow Summary

| Flow | Used For | Endpoint | Amount Source | MSISDN Timing |
|------|----------|----------|---------------|---------------|
| **Unified** | Regular packages & combo bundles | `/payment/paystack/initialize` | Frontend (CENTS) | After payment |
| **Dynamic** | Contract dynamic plans | `/payment/dynamic-services/initialize` | Frontend (per service) | Before payment |

---

## 1️⃣ Unified Initialize - Regular Packages & Combo Bundles

### Use Case
Regular prepaid packages and combo bundles (all non-dynamic payment flows).

### Flow
```
1. Payment → 2. MSISDN Allocation → 3. Order Creation
```

### Frontend Request
```typescript
import { toCents } from '../../payment/utils/dynamicPricing'

await paymentService.initializeTransaction({
  productId: "7029225",           // Product ID
  msisdn: null,                   // Allocated AFTER payment
  amount: toCents(150.00)         // R150.00 in cents (15000)
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
  "msisdn": null,
  "amount": 15000
}
```

### Backend Logic
1. Use the amount provided by frontend (in cents)
2. Create Paystack transaction with this amount
3. Return `access_code` and `reference`

### Notes
- Frontend calculates and provides the amount in CENTS
- Used for both regular packages AND combo bundles (unified endpoint)
- MSISDN allocated after successful payment
- Frontend must validate price exists before calling

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

## 🔍 Key Differences

### Amount Control

| Flow | Who Controls Amount | Format | Source |
|------|---------------------|--------|--------|
| Unified | Frontend | **CENTS** | Frontend calculation |
| Dynamic | Frontend | Cents (per service) | User Allocation |

### MSISDN Timing

| Flow | MSISDN Allocation | Reason |
|------|------------------|--------|
| Unified | After payment | Payment-first flow |
| Dynamic | Before payment | Contract flow - lock MSISDN first |

---

## 📊 Implementation in ShippingModal.tsx

```typescript
// CONTRACT DYNAMIC PLANS
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

// COMBO BUNDLE FLOW - Uses unified endpoint
else if (selectedPackage.isComboBundle) {
  initResponse = await paymentService.initializeTransaction({
    productId: String(selectedPackage.productId),
    amount: toCents(selectedPackage.price),  // Convert R150 → 15000 cents
    msisdn: null
  })
}

// PREPAID FLOW - Uses unified endpoint
else {
  initResponse = await paymentService.initializeTransaction({
    productId: String(selectedPackage.productId),
    amount: toCents(selectedPackage.price),  // Convert R150 → 15000 cents
    msisdn: null
  })
}
```

---

## 🧪 Testing Each Flow

### Test Unified Initialize (Regular/Combo Packages)
```bash
curl -X POST 'https://limes-staging.up.railway.app/api/payment/paystack/initialize' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "productId": "7029225",
    "msisdn": null,
    "amount": 15000
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

---

## ⚠️ Important Notes

1. **Unified Endpoint Amount Format**
   - ALWAYS send amount in **CENTS**, not rands
   - Use `toCents(rands)` utility to convert
   - Example: R150.00 → toCents(150.00) → 15000 cents

2. **Security**
   - Unified flow: Frontend provides amount in cents (validated on backend)
   - Dynamic flow: Amount from services array (validated on backend)
   - All amounts are validated against expected ranges on backend

3. **Error Handling**
   - All flows return same response format
   - Check `success` field before proceeding
   - Log errors for debugging
   - Validate price exists before calling initialize

---

## 🔄 After Payment (All Flows)

After successful payment, all flows go through the same verification process:

1. **Verify payment** (`/payment/paystack/verify`)
2. **Create subscriber** (if not already created)
3. **Create order OR services** (depending on package type)
4. **Link transaction** to order/services
5. **Create recurring subscription** (if monthly plan)

See `handlePaymentVerification()` in ShippingModal.tsx for full implementation.
