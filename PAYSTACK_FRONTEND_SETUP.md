# Paystack Frontend Integration - Setup Guide

This guide covers the complete Paystack integration in the Limes frontend application.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Features Implemented](#features-implemented)
3. [Components](#components)
4. [Usage Examples](#usage-examples)
5. [Testing](#testing)

---

## Environment Setup

### 1. Add Paystack Public Key

Create a `.env` file in the project root (if it doesn't exist):

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_a64167b519a4785577c679768f9b2927a835d714
```

**Get your keys:**
- Test mode: [Paystack Dashboard → Settings → API Keys & Webhooks](https://dashboard.paystack.com/settings/developer)
- Use `pk_test_` for development
- Use `pk_live_` for production

### 2. Verify Paystack Script

Ensure `index.html` includes the Paystack Inline script:

```html
<script src="https://js.paystack.co/v2/inline.js"></script>
```

---

## Features Implemented

### ✅ Once-Off Payments
- Secure server-side transaction initialization
- Backend controls amount (prevents client-side manipulation)
- Automatic order creation from metadata
- Duplicate transaction prevention

### ✅ Card Tokenization (Save Cards)
- Save cards for one-click future payments
- List all saved cards
- Delete saved cards
- PCI-DSS compliant (only tokens stored, never card numbers)

### ✅ Charge Saved Cards
- One-click payments without re-entering card details
- Automatic order creation

### ✅ Recurring Subscriptions
- Subscribe users to monthly plans
- Automatic recurring billing
- View subscription details
- Cancel subscriptions

---

## Components

### 1. ShippingModal (Payment Flow)

**Location:** `src/modules/auth/components/ShippingModal.tsx`

Handles the main payment flow:
1. Initialize transaction with backend
2. Open Paystack modal
3. Verify payment
4. Automatically saves card if enabled

**Key metadata fields (REQUIRED):**
- `productId` - Product/package ID
- `msisdn` - Phone number for order creation

### 2. SavedCards Component

**Location:** `src/modules/payment/components/SavedCards.tsx`

Manages saved payment methods:
- List all saved cards
- Charge a saved card
- Delete a saved card

**Usage:**

```tsx
import SavedCards from '@/modules/payment/components/SavedCards'

// Display saved cards only
<SavedCards />

// Display with charge button
<SavedCards 
  showChargeButton={true}
  chargeAmount={199.99}
  onCardSelected={(cardId) => console.log('Charged card:', cardId)}
/>
```

### 3. SubscriptionManagement Component

**Location:** `src/modules/payment/components/SubscriptionManagement.tsx`

Manages recurring subscriptions:
- Create subscription from saved card
- View subscription details
- Cancel subscription

**Usage:**

```tsx
import SubscriptionManagement from '@/modules/payment/components/SubscriptionManagement'

// Create new subscription
<SubscriptionManagement 
  onSubscriptionCreated={(sub) => console.log('Created:', sub)}
/>

// View existing subscription
<SubscriptionManagement 
  subscriptionId="uuid-123"
  onSubscriptionCancelled={() => console.log('Cancelled')}
/>
```

---

## Usage Examples

### Example 1: Once-Off Payment with Card Save

The `ShippingModal` handles this automatically. Just ensure correct metadata:

```tsx
<ShippingModal
  open={true}
  onClose={() => {}}
  selectedPackage={{
    productId: '7029225P',    // ← REQUIRED
    name: 'Lite Plan',
    price: 199.99,
    features: {}
  }}
  customerEmail="user@example.com"
  customerName="John Doe"
  customerPhone="27821234567"  // ← Used as msisdn (REQUIRED)
/>
```

### Example 2: Payment with Saved Card

```tsx
import { useState, useEffect } from 'react'
import SavedCards from '@/modules/payment/components/SavedCards'

const PaymentPage = () => {
  const handlePayment = (cardId: string) => {
    console.log('Payment successful with card:', cardId)
    // Redirect to success page
    window.location.href = '/payment-success'
  }

  return (
    <div>
      <h2>Pay R199.99</h2>
      <SavedCards 
        showChargeButton={true}
        chargeAmount={199.99}
        onCardSelected={handlePayment}
      />
    </div>
  )
}
```

### Example 3: Create Recurring Subscription

```tsx
import SubscriptionManagement from '@/modules/payment/components/SubscriptionManagement'

const SubscriptionPage = () => {
  const handleSubscriptionCreated = (subscription) => {
    console.log('Subscription created:', subscription)
    alert(`Subscribed! Next payment: ${subscription.nextPaymentDate}`)
  }

  return (
    <div>
      <h2>Subscribe to Monthly Plan</h2>
      <SubscriptionManagement 
        onSubscriptionCreated={handleSubscriptionCreated}
      />
    </div>
  )
}
```

### Example 4: Full Payment Flow Component

```tsx
import { useState } from 'react'
import ShippingModal from '@/modules/auth/components/ShippingModal'
import SavedCards from '@/modules/payment/components/SavedCards'

const CheckoutPage = ({ package }) => {
  const [showNewCardPayment, setShowNewCardPayment] = useState(false)
  const [showSavedCards, setShowSavedCards] = useState(true)

  return (
    <div className="space-y-6">
      <h1>Checkout - R{package.price}</h1>

      {/* Option 1: Pay with saved card */}
      {showSavedCards && (
        <div>
          <h2>Pay with Saved Card</h2>
          <SavedCards 
            showChargeButton={true}
            chargeAmount={package.price}
          />
        </div>
      )}

      {/* Option 2: Pay with new card */}
      <div>
        <button onClick={() => setShowNewCardPayment(true)}>
          Pay with New Card
        </button>
      </div>

      {/* New card payment modal */}
      <ShippingModal
        open={showNewCardPayment}
        onClose={() => setShowNewCardPayment(false)}
        selectedPackage={package}
        customerEmail="user@example.com"
        customerName="John Doe"
        customerPhone="27821234567"
      />
    </div>
  )
}
```

---

## Payment Service API

### Initialize Transaction

```typescript
import { paymentService } from '@/modules/payment/services/paymentService'

const response = await paymentService.initializeTransaction({
  email: 'user@example.com',
  amount: 199.99,
  metadata: {
    productId: '7029225P',      // REQUIRED
    msisdn: '27821234567',       // REQUIRED
    productName: 'Lite Plan',    // Optional
    customerName: 'John Doe',    // Optional
  }
})

// response.data.access_code - use for Paystack modal
```

### Verify Payment

```typescript
const response = await paymentService.verifyPayment({
  reference: 'ref_1234567890',
  saveCard: true  // Optional: save card for future use
})

if (response.success) {
  console.log('Payment verified!')
  if (response.cardSaved) {
    console.log('Card saved for future payments')
  }
}
```

### Get Saved Cards

```typescript
const cards = await paymentService.getSavedCards()

cards.forEach(card => {
  console.log(`${card.cardType} •••• ${card.last4}`)
})
```

### Charge Saved Card

```typescript
const response = await paymentService.chargeSavedCard({
  paymentMethodId: 'card-uuid-123',
  amount: 199.99,
  metadata: {
    productId: '7029225P',
    msisdn: '27821234567'
  }
})
```

### Create Subscription

```typescript
const response = await paymentService.subscribe({
  planCode: 'PLN_monthly_lite',
  paymentMethodId: 'card-uuid-123'
})

console.log('Next payment:', response.subscription.nextPaymentDate)
```

### Cancel Subscription

```typescript
await paymentService.cancelSubscription({
  subscriptionCode: 'SUB_xxx'
})
```

---

## Testing

### Test Cards (Paystack Test Mode)

| Card Number | CVV | PIN | OTP | Result |
|-------------|-----|-----|-----|--------|
| 4084 0840 8408 4081 | 408 | 0000 | 123456 | Success ✅ |
| 4084 0840 8408 4085 | 408 | 0000 | 123456 | Failed ❌ |
| 5060 6666 6666 6666 666 | 123 | 1234 | - | Timeout ⏱️ |

### Test Flow

1. **Initialize payment** with test amount (R10)
2. **Use test card** 4084 0840 8408 4081
3. **Enter PIN:** 0000
4. **Enter OTP:** 123456
5. **Verify** payment is successful
6. **Check** card is saved (if saveCard=true)
7. **Test charge** saved card
8. **Create subscription** with saved card

---

## Important Notes

### ⚠️ Required Metadata

When initializing payments, **ALWAYS** include:
- `productId` - Required for order creation
- `msisdn` - Required for order creation (phone number)

Without these fields, the backend cannot automatically create the order!

### ⚠️ Security

- ✅ Backend controls amount (frontend sends it, backend verifies it)
- ✅ Never handle raw card details (Paystack handles it)
- ✅ Only tokens stored (PCI-DSS compliant)
- ✅ Duplicate transaction prevention
- ✅ All requests require authentication

### ⚠️ Environment Variables

Make sure `.env` file has:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

**For production:**
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx
```

---

## File Structure

```
src/
├── modules/
│   ├── auth/
│   │   └── components/
│   │       └── ShippingModal.tsx          ← Main payment flow
│   └── payment/
│       ├── components/
│       │   ├── SavedCards.tsx             ← Card management
│       │   └── SubscriptionManagement.tsx ← Subscriptions
│       └── services/
│           └── paymentService.ts          ← API calls
├── types/
│   └── payment.ts                         ← TypeScript types
└── config/
    └── paystack.ts                        ← Paystack config
```

---

## Related Documentation

- [PAYSTACK_INTEGRATION.md](PAYSTACK_INTEGRATION.md) - Complete API reference
- Backend Paystack implementation docs on Railway

---

**Ready to accept payments!** 🚀
