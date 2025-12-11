# Paystack Payment Integration Guide - UPDATED

## Overview

Complete guide for integrating Paystack payments with the Limes API. This covers once-off payments, card tokenization, recurring subscriptions, and webhook handling.

**Last Updated:** December 2025  
**Status:** ✅ Frontend Fully Implemented | ⚠️ Backend Implementation Required

---

## Table of Contents

1. [Once-Off Payments](#once-off-payments)
2. [Tokenization (Save Cards)](#tokenization-save-cards)
3. [Recurring Subscriptions](#recurring-subscriptions)
4. [Webhooks](#webhooks)
5. [Frontend Implementation](#frontend-implementation)
6. [Testing](#testing)
7. [Configuration](#configuration)

---

# Once-Off Payments

## How It Works

1. **Initialize payment** with metadata (`productId`, `msisdn`) - Backend creates Paystack transaction
2. **User pays** via Paystack modal - Card details never touch your servers
3. **Verify payment** with `saveCard` flag - Order is **automatically created** from metadata
4. Done!

### Flow Diagram

```
Frontend                  Limes API                 Paystack
   │                         │                         │
   │  1. POST /initialize    │                         │
   │  (productId, msisdn)    │                         │
   │────────────────────────>│                         │
   │                         │  2. Create transaction  │
   │                         │────────────────────────>│
   │                         │  3. access_code         │
   │                         │<────────────────────────│
   │  4. { access_code }     │                         │
   │<────────────────────────│                         │
   │                         │                         │
   │  5. Open Paystack Modal │                         │
   │──────────────────────────────────────────────────>│
   │  6. User pays with card │                         │
   │<──────────────────────────────────────────────────│
   │                         │                         │
   │  7. POST /verify        │                         │
   │  (reference, saveCard)  │                         │
   │────────────────────────>│                         │
   │                         │  8. Verify transaction  │
   │                         │────────────────────────>│
   │                         │  9. Transaction details │
   │                         │<────────────────────────│
   │                         │ 10. Create MVNX order   │
   │                         │ 11. Store transaction   │
   │                         │ 12. Save card (if flag) │
   │  13. { success: true }  │                         │
   │<────────────────────────│                         │
```

---

## API Endpoints

### 1. Initialize Payment

Creates a payment transaction and returns an access code for Paystack.

**Endpoint:** `POST /api/payment/paystack/initialize`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "amount": 199.99,
  "metadata": {
    "productId": "7029225P",
    "msisdn": "27821234567",
    "productName": "Lite Plan",
    "customerName": "John Doe"
  }
}
```

**⚠️ CRITICAL - Required Metadata Fields:**
- `productId` - **REQUIRED** - Used to create order in MVNX
- `msisdn` - **REQUIRED** - Phone number for order activation
- `productName` - Optional - For display purposes
- `customerName` - Optional - For records

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/abc123xyz",
    "access_code": "abc123xyz",
    "reference": "ref_1234567890"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid request data"
}
```

---

### 2. Verify Payment

Verifies the payment and **automatically creates the order** from metadata sent during initialization.

**Endpoint:** `POST /api/payment/paystack/verify`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "reference": "ref_1234567890",
  "saveCard": true
}
```

**⚠️ Important Changes:**
- ✅ **No metadata needed** - Backend already has it from initialization
- ✅ **Simple `saveCard` flag** - No complex metadata duplication
- ✅ **Automatic order creation** - Backend uses stored metadata

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "cardSaved": true,
  "transaction": {
    "id": 123456789,
    "status": "success",
    "reference": "ref_1234567890",
    "amount": 19999,
    "currency": "ZAR",
    "paid_at": "2025-12-11T10:30:00.000Z",
    "channel": "card",
    "authorization": {
      "authorization_code": "AUTH_xxx",
      "card_type": "visa",
      "last4": "4081",
      "bank": "TEST BANK",
      "reusable": true
    },
    "customer": {
      "email": "user@example.com",
      "customer_code": "CUS_xxx"
    }
  }
}
```

**What Happens Automatically:**
1. ✅ Verifies payment with Paystack
2. ✅ Checks for duplicate transactions (by reference)
3. ✅ Retrieves metadata from initialization (productId, msisdn)
4. ✅ Creates order in MVNX system
5. ✅ Creates user_top_up record
6. ✅ Creates top_up_products record
7. ✅ Stores transaction with link to order
8. ✅ Saves card authorization (if saveCard=true)

---

## Frontend Implementation

### ShippingModal Component (Already Implemented ✅)

**Location:** `src/modules/auth/components/ShippingModal.tsx`

The ShippingModal handles the complete payment flow with correct metadata:

```typescript
// Step 1: Initialize with REQUIRED metadata
const initResponse = await paymentService.initializeTransaction({
  email: customerEmail,
  amount: packagePrice,
  metadata: {
    productId: selectedPackage.productId,  // ✅ REQUIRED
    msisdn: customerPhone,                  // ✅ REQUIRED (from phone input)
    productName: selectedPackage.name,      // Optional
    customerName: customerName,             // Optional
  }
})

// Step 2: Open Paystack modal with access_code
const popup = new PaystackPop()
popup.resumeTransaction(initResponse.data.access_code, {
  onSuccess: (transaction) => {
    // Step 3: Verify with saveCard flag
    handlePaymentVerification(transaction.reference)
  }
})

// Step 3: Verify payment (backend creates order automatically)
const verifyPayment = async (reference) => {
  const response = await paymentService.verifyPayment({
    reference: reference,
    saveCard: true  // ✅ Simple flag, no metadata duplication
  })
  
  if (response.success) {
    console.log('Payment verified, order created!')
    if (response.cardSaved) {
      console.log('Card saved for future payments')
    }
  }
}
```

**Key Points:**
- ✅ Uses correct metadata structure (productId + msisdn)
- ✅ Automatically saves cards (saveCard: true)
- ✅ No metadata duplication in verify call
- ✅ Backend handles order creation

---

# Tokenization (Save Cards)

## How It Works

1. **First payment:** Set `saveCard: true` in verify request
2. **Paystack returns** `authorization_code` (secure token)
3. **Backend stores** the token (NOT the actual card number)
4. **Future payments:** Charge using the token

**Security:**
- ✅ Only tokens stored, never card numbers
- ✅ PCI-DSS compliant
- ✅ Only `reusable: true` cards can be saved
- ✅ User can delete cards anytime

---

## API Endpoints

### 1. Get Saved Cards

List all saved cards for the current user.

**Endpoint:** `GET /api/payment/paystack/cards`

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Success Response (200):**
```json
[
  {
    "id": "uuid-1",
    "cardType": "visa",
    "last4": "4081",
    "expMonth": "12",
    "expYear": "2025",
    "bank": "TEST BANK",
    "brand": "visa",
    "isDefault": true
  },
  {
    "id": "uuid-2",
    "cardType": "mastercard",
    "last4": "5123",
    "expMonth": "06",
    "expYear": "2026",
    "bank": "ACCESS BANK",
    "brand": "mastercard",
    "isDefault": false
  }
]
```

---

### 2. Charge Saved Card

Charge a previously saved card without user input.

**Endpoint:** `POST /api/payment/paystack/charge`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "paymentMethodId": "uuid-1",
  "amount": 199.99,
  "metadata": {
    "productId": "7029225P",
    "msisdn": "27821234567"
  }
}
```

**⚠️ Note:** When charging saved cards, you still need to provide `productId` and `msisdn` for order creation.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Charge successful",
  "transaction": {
    "id": 987654321,
    "status": "success",
    "reference": "ref_9876543210",
    "amount": 19999,
    "currency": "ZAR",
    "paid_at": "2025-12-11T11:00:00.000Z",
    "channel": "card",
    "authorization": {
      "authorization_code": "AUTH_xxx",
      "card_type": "visa",
      "last4": "4081"
    }
  }
}
```

---

### 3. Delete Saved Card

Remove a saved card from the user's account.

**Endpoint:** `DELETE /api/payment/paystack/cards/{id}`

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment method deleted"
}
```

---

## Frontend Implementation

### SavedCards Component (Implemented ✅)

**Location:** `src/modules/payment/components/SavedCards.tsx`

Complete UI component for managing saved cards:

```tsx
import { SavedCards } from '@/modules/payment/components'

// Display saved cards only
<SavedCards />

// Display with charge functionality
<SavedCards 
  showChargeButton={true}
  chargeAmount={199.99}
  onCardSelected={(cardId) => {
    console.log('Payment successful')
  }}
/>
```

**Features:**
- ✅ Lists all saved cards
- ✅ Shows card details (type, last4, expiry, bank)
- ✅ Delete card functionality
- ✅ One-click charge functionality
- ✅ Dark theme styling

### Payment Methods Page (Implemented ✅)

**Location:** `src/modules/payment/pages/PaymentMethods.tsx`  
**Route:** `/dashboard/payment-methods`  
**Navigation:** Added to DashboardNavbar

Dedicated page for users to view and manage their saved payment methods.

---

# Recurring Subscriptions

## How It Works

1. **Create plan** on Paystack Dashboard (one-time setup)
2. **Map plan to product ID** in backend configuration
3. **Subscribe user** to plan using saved card
4. **Paystack auto-charges** monthly
5. **Webhooks notify** your API → New order created automatically

---

## Setup: Create Plan on Paystack

### Step 1: Create Plan on Paystack Dashboard

1. Go to [Paystack Dashboard → Plans](https://dashboard.paystack.com/plans)
2. Click "Create Plan"
3. Fill in:
   - **Name:** Monthly Lite Plan (descriptive name)
   - **Amount:** R199.99 (in Rands)
   - **Interval:** Monthly
   - **Description:** Monthly subscription for Lite Plan
4. Click **Create**
5. **Copy the Plan Code** (e.g., `PLN_abc123xyz`)

### Step 2: Map Plan Code to Product ID

**Backend Configuration:** Update mapping in backend:

```csharp
// Example: PaystackPlanConstants.cs
private static readonly Dictionary<string, string> ProductToPlanMap = new()
{
    { "7029225P", "PLN_abc123xyz" },      // Lite Plan
    { "7029226P", "PLN_def456uvw" },      // Standard Plan
    { "7029227P", "PLN_ghi789rst" }       // Premium Plan
};
```

**Why?**
- Frontend sends familiar `productId: "7029225P"`
- Backend maps it to Paystack plan code internally
- Simpler for frontend (no need to know Paystack plan codes)

---

## API Endpoints

### 1. Subscribe to Plan

Subscribe a user to a recurring plan using their saved card.

**Endpoint:** `POST /api/payment/paystack/subscribe`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "productId": "7029225P",
  "paymentMethodId": "uuid-1"
}
```

**How it works:**
1. Frontend sends `productId` (YOUR product ID)
2. Backend looks up mapping → finds `PLN_abc123xyz`
3. Backend calls Paystack API with plan code
4. Paystack creates subscription and charges card
5. Backend stores subscription with order link

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {
    "id": "uuid-3",
    "paystackSubscriptionCode": "SUB_xxx",
    "paystackPlanCode": "PLN_abc123xyz",
    "productId": "7029225P",
    "status": "active",
    "nextPaymentDate": "2025-01-11T00:00:00.000Z",
    "amountInRands": 199.99,
    "currency": "ZAR"
  }
}
```

---

### 2. Get Subscription Details

**Endpoint:** `GET /api/payment/paystack/subscription/{id}`

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Success Response (200):**
```json
{
  "id": "uuid-3",
  "paystackSubscriptionCode": "SUB_xxx",
  "paystackPlanCode": "PLN_abc123xyz",
  "productId": "7029225P",
  "status": "active",
  "nextPaymentDate": "2025-01-11T00:00:00.000Z",
  "amountInRands": 199.99,
  "currency": "ZAR",
  "createdAt": "2025-12-11T10:00:00.000Z",
  "cancelledAt": null
}
```

---

### 3. Cancel Subscription

**Endpoint:** `POST /api/payment/paystack/cancel-subscription`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "subscriptionCode": "SUB_xxx"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled"
}
```

---

## How Recurring Payments Work

### Monthly Flow

**Month 1 - User Subscribes:**
```
1. User makes first payment, card saved
2. POST /api/payment/paystack/subscribe { productId, paymentMethodId }
3. Backend maps productId → planCode
4. Paystack creates subscription
5. Paystack charges card immediately (first payment)
6. invoice.update webhook fires
7. Backend creates Order #1 (msisdn: 27821234567, productId: 7029225P)
8. Order activated in MVNX
9. Transaction stored
10. Subscription status: active, nextPaymentDate: 2025-01-11
```

**Month 2 - Auto Renewal:**
```
1. Paystack auto-charges card on billing date
2. invoice.update webhook fires
3. Backend retrieves subscription → gets productId and msisdn
4. Backend creates Order #2 (SAME msisdn & productId as Month 1)
5. Order activated in MVNX
6. Transaction stored
7. Subscription nextPaymentDate updated: 2025-02-11
```

**Month 3, 4, 5... - Continues:**
```
Same as Month 2 - New order created each month automatically
```

### The Key: Subscription → Order Linking

```
PaystackSubscription
     ├─ OrderId → First order created (contains msisdn & productId)
     ├─ ProductId → "7029225P"
     └─ Every month: Use ProductId + MSISDN from first order
                     to create new orders
```

**Database Records:**

| Month | Order | MSISDN | Product | Transaction | Channel |
|-------|-------|--------|---------|-------------|---------|
| 1 | Order #1 | 27821234567 | 7029225P | Txn #1 | card |
| 2 | Order #2 | 27821234567 | 7029225P | Txn #2 | subscription |
| 3 | Order #3 | 27821234567 | 7029225P | Txn #3 | subscription |

**Why This Design?**
- ✅ Complete audit trail
- ✅ Each month = new order + new transaction
- ✅ Easy reconciliation with Paystack
- ✅ Can cancel anytime

---

## Frontend Implementation

### SubscriptionManagement Component (Implemented ✅)

**Location:** `src/modules/payment/components/SubscriptionManagement.tsx`

```tsx
import { SubscriptionManagement } from '@/modules/payment/components'

// Create new subscription
<SubscriptionManagement 
  onSubscriptionCreated={(sub) => {
    console.log('Subscribed!', sub.nextPaymentDate)
  }}
/>

// View existing subscription
<SubscriptionManagement 
  subscriptionId="uuid-123"
  onSubscriptionCancelled={() => {
    console.log('Cancelled')
  }}
/>
```

**Features:**
- ✅ Create subscription from saved card
- ✅ View subscription details
- ✅ Display next payment date
- ✅ Cancel subscription
- ✅ Status badges (active, cancelled, past_due)

---

# Webhooks

Paystack sends webhook events to notify your API of payment events.

**Endpoint:** `POST /api/payment/paystack/webhook`

**Authentication:** None (uses signature verification)

---

## Events Handled

| Event | Description | Backend Action |
|-------|-------------|----------------|
| `charge.success` | One-time payment succeeded | Logged (already handled by verify) |
| `subscription.create` | Subscription created | Logged |
| `subscription.disable` | Subscription cancelled | Update status to "cancelled" |
| `invoice.update` | Recurring payment succeeded | **Create new order**, store transaction |
| `invoice.payment_failed` | Recurring payment failed | Update status to "past_due" |
| `charge.dispute.create` | Customer disputed charge | Log for review |

---

## Critical: invoice.update Event

This event is **essential** for recurring subscriptions. Without it, Month 2+ orders won't be created.

**What happens:**
1. Paystack charges card monthly
2. Sends `invoice.update` webhook
3. Backend extracts subscription code
4. Finds PaystackSubscription record
5. Gets productId and msisdn from linked order
6. **Creates new order to MVNX** (same product, same MSISDN)
7. Stores new transaction
8. Updates nextPaymentDate

**⚠️ Without this webhook:** Users pay monthly, but service doesn't activate!

---

## Setup Webhook URL

1. Go to [Paystack Dashboard → Webhooks](https://dashboard.paystack.com/settings/webhooks)
2. Add webhook URL: `https://limes-development.up.railway.app/api/payment/paystack/webhook`
3. Paystack sends test events to verify
4. Save

---

## Security

All webhooks verified using HMAC SHA-512:

```csharp
var signature = Request.Headers["x-paystack-signature"];
if (!VerifyWebhookSignature(signature, requestBody, secretKey)) {
    return BadRequest("Invalid signature");
}
```

**⚠️ Critical:** Never disable signature verification in production!

---

# Frontend Implementation Status

## ✅ Completed

| Component | Location | Status |
|-----------|----------|--------|
| ShippingModal | `src/modules/auth/components/ShippingModal.tsx` | ✅ Updated with correct metadata |
| SavedCards | `src/modules/payment/components/SavedCards.tsx` | ✅ Fully implemented |
| SubscriptionManagement | `src/modules/payment/components/SubscriptionManagement.tsx` | ✅ Fully implemented |
| PaymentMethods Page | `src/modules/payment/pages/PaymentMethods.tsx` | ✅ Created with routing |
| Payment Service | `src/modules/payment/services/paymentService.ts` | ✅ All endpoints added |
| Payment Types | `src/types/payment.ts` | ✅ All types defined |
| Navigation | `src/modules/auth/components/DashboardNavbar.tsx` | ✅ Payment Methods added |
| Routing | `src/App.tsx` | ✅ Route configured |
| Config | `src/config/paystack.ts` | ✅ Public key config |

## ⚠️ Backend Requirements

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/payment/paystack/initialize` | ✅ Deployed | Route fixed |
| `POST /api/payment/paystack/verify` | ⚠️ Verify | Needs testing |
| `GET /api/payment/paystack/cards` | ⚠️ Implement | May not exist |
| `POST /api/payment/paystack/charge` | ⚠️ Implement | May not exist |
| `DELETE /api/payment/paystack/cards/{id}` | ⚠️ Implement | May not exist |
| `POST /api/payment/paystack/subscribe` | ⚠️ Implement | May not exist |
| `GET /api/payment/paystack/subscription/{id}` | ⚠️ Implement | May not exist |
| `POST /api/payment/paystack/cancel-subscription` | ⚠️ Implement | May not exist |
| `POST /api/payment/paystack/webhook` | ⚠️ Implement | Critical for subscriptions |

---

# Testing

## Test Cards

| Card Number | Purpose | CVV | Expiry | PIN | OTP |
|-------------|---------|-----|--------|-----|-----|
| 4084 0840 8408 4081 | Success | 408 | Any future | 0000 | 123456 |
| 4084 0840 8408 4085 | Failed | 408 | Any future | 0000 | 123456 |
| 5060 6666 6666 6666 666 | Timeout | 123 | Any future | 1234 | - |

---

## Test Flow

### Once-Off Payment
1. Select package in dashboard
2. Enter details in ShippingModal
3. Click Pay
4. Use test card: 4084 0840 8408 4081
5. Enter PIN: 0000, OTP: 123456
6. Verify payment successful
7. Check card was saved (if enabled)
8. Verify order created in MVNX

### Saved Card Payment
1. Go to Payment Methods page
2. View saved cards
3. Click charge button
4. Verify payment processes instantly
5. Check order created

### Subscription
1. Make first payment, card saved
2. Create subscription with saved card
3. Check subscription status: active
4. Test webhook: Dashboard → Send test `invoice.update`
5. Verify new order created from webhook

---

# Configuration

## Environment Variables

### Frontend (.env)
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_a64167b519a4785577c679768f9b2927a835d714
```

### Backend (Railway)
```env
Paystack__PublicKey=pk_test_a64167b519a4785577c679768f9b2927a835d714
Paystack__SecretKey=sk_test_3efdef95a8022d4512ead40f2660429669e3f8f3
Paystack__BaseUrl=https://api.paystack.co
```

**Production:** Replace `_test_` keys with `_live_` keys

---

# Summary

## Key Changes from Original

| Before | After | Why |
|--------|-------|-----|
| Metadata sent in verify | `saveCard` flag only | No duplication, simpler |
| `packageId` in metadata | `productId` in metadata | Consistent naming |
| Optional `msisdn` | **Required** `msisdn` | Order creation needs it |
| `shippingAddress` in metadata | Removed | Not needed for orders |
| `planCode` in subscribe | `productId` in subscribe | Frontend doesn't need Paystack codes |
| No saved cards UI | SavedCards component | Complete card management |
| No subscription UI | SubscriptionManagement component | Complete subscription management |
| No payment methods page | Payment Methods page | Dedicated card management |

## Features Implemented

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Once-off payments | ✅ | ⚠️ | Frontend ready |
| Order creation | N/A | ⚠️ | Backend handles |
| Card saving | ✅ | ⚠️ | Frontend ready |
| Saved cards UI | ✅ | ⚠️ | Need backend endpoints |
| Charge saved card | ✅ | ⚠️ | Need backend endpoints |
| Subscriptions | ✅ | ⚠️ | Need backend endpoints |
| Webhooks | N/A | ⚠️ | Critical for subscriptions |

## API Endpoints Quick Reference

| Method | Endpoint | Frontend | Backend |
|--------|----------|----------|---------|
| POST | `/api/payment/paystack/initialize` | ✅ | ✅ |
| POST | `/api/payment/paystack/verify` | ✅ | ⚠️ |
| GET | `/api/payment/paystack/cards` | ✅ | ⚠️ |
| POST | `/api/payment/paystack/charge` | ✅ | ⚠️ |
| DELETE | `/api/payment/paystack/cards/{id}` | ✅ | ⚠️ |
| POST | `/api/payment/paystack/subscribe` | ✅ | ⚠️ |
| GET | `/api/payment/paystack/subscription/{id}` | ✅ | ⚠️ |
| POST | `/api/payment/paystack/cancel-subscription` | ✅ | ⚠️ |
| POST | `/api/payment/paystack/webhook` | N/A | ⚠️ |

## Critical Metadata Fields

**Initialize Payment:**
```json
{
  "email": "user@example.com",
  "amount": 199.99,
  "metadata": {
    "productId": "7029225P",      // ✅ REQUIRED
    "msisdn": "27821234567",       // ✅ REQUIRED
    "productName": "Lite Plan",    // Optional
    "customerName": "John Doe"     // Optional
  }
}
```

**Verify Payment:**
```json
{
  "reference": "ref_xxx",
  "saveCard": true                 // ✅ Simple flag
}
```

## Security Features

- ✅ Backend controls amount (client can't manipulate)
- ✅ No card details on your servers
- ✅ Only tokens stored (PCI-DSS compliant)
- ✅ Duplicate transaction prevention
- ✅ Webhook signature verification
- ✅ Firebase authentication required

---

**Frontend: 100% Complete ✅**  
**Backend: Implementation Required ⚠️**  
**Documentation: Fully Updated ✅**

**Ready for production once backend endpoints are confirmed!** 🚀
