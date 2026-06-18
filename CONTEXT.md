# Limes — Domain Glossary

Precise definitions of all domain terms used in this codebase. No implementation details.

---

## Core Concepts

### SIM
A Subscriber Identity Module. The physical or eSIM chip that connects a device to the Limes network. Each SIM has a unique MSISDN (phone number) and ICCID (serial number).

### MSISDN
Mobile Station International Subscriber Directory Number. The phone number assigned to a SIM. Format: `27821234567` (E.164, no `+`). Stored and transmitted without formatting; displayed with spaces for readability. Normalization strips all non-digit characters.

### ICCID
Integrated Circuit Card Identifier. The unique serial number printed on a physical SIM card. Used during activation to link a physical SIM to a customer account.

### Prepaid
A pay-as-you-go model. Customers load airtime/data bundles manually via top-up. No recurring charges. No contract. Balances decrement with usage.

### Subscription (Contract)
A recurring billing model. Customers pay a fixed monthly amount for a bundle of services (data, voice, SMS, WhatsApp). Auto-renews unless cancelled. Also referred to as "contract" in the codebase, but "subscription" is the user-facing term.

### Plan
A specific combination of services (mobile data, airtime, SMS, voice minutes) at a specific price point. Plans can be fixed (e.g., "Limes99") or dynamic (customer builds their own allocation).

---

## Product Types

### Bundle
A one-time purchase of services. Examples: "R99 airtime + R31 FREE", "1GB data + R100 Airtime". Not recurring. Consumed until depleted.

### Combo Bundle
A subscription bundle combining multiple services (data + voice + SMS + WhatsApp) into a single monthly plan with a fixed price. The customer picks a pre-configured combo, not individual allocations.

### Dynamic Plan (Build Your Own)
A subscription where the customer allocates rands across service categories (data, airtime, SMS, voice, WhatsApp). The total determines the monthly price. Each rand buys a calculated amount of service based on pricing tables.

### Flex / Lite / 3-Month
Plan tiers displayed on the dashboard as colored cards. Flex = customizable, Lite = basic, 3-Month = discounted quarterly commitment.

---

## Service Types

| Code | User-Facing Name | Unit |
|------|-----------------|------|
| DATA | Mobile data | GB/MB |
| AIRTIME | Airtime | Rands |
| SMS | SMS messages | Count |
| VOICE | Voice minutes | Minutes |
| WHATSAPP | WhatsApp data | MB/GB |
| MMS | MMS messages | Count (not available) |

### GPA Credit
General Purpose Airtime credit. The monetary balance that can be used for calls, SMS, or data at standard rates. Displayed as "R{X}" or "{X} airtime".

---

## Business Processes

### RICA
Regulation of Interception of Communications and Provision of Communication-Related Information Act. South African law requiring SIM registration with ID document and proof of address. Implemented as a multi-step form: personal details → billing address → phone number → postal address → ID upload → proof-of-address upload.

### Porting (Number Porting)
Transferring an existing phone number from another network to Limes. The customer keeps their number. The process takes 24-48 hours. Implemented via USSD (`*140#`) and a PortNumberModal form.

### Top-Up
Purchasing additional airtime or data bundles for an existing prepaid SIM. Separate from subscription payments. Accessed via the TopUpModal, which supports both bundle purchases and dynamic service purchases.

### Activation
The process of linking a physical SIM (by ICCID) to a customer account and enabling network services. Takes up to 5 minutes. Status polled after submission.

---

## Payment Concepts

### Paystack
Third-party payment processor (Nigeria/South Africa). Handles card payments, saved cards, recurring billing, and refunds. Integrated via their inline popup (`react-paystack`) and REST API.

### Saved Card
A payment method stored on Paystack for future transactions. Identified by `paymentMethodId`. Can be charged without re-entering card details. Cards can be set as default.

### Transaction
A record of a payment event. Has a reference ID, amount (in rands and cents), status (success/pending/failed), channel (card/bank), and timestamp. Displayed in the transaction history table.

### Order
A purchase order created before payment. Contains product ID, MSISDN, and amount. Linked to a transaction after successful payment via `linkTransactionToOrder`. Separate from subscriptions.

### Dynamic Service Payment
A payment for one or more service allocations (data bundles, airtime, etc.) purchased together. Each service has a value, definition code, and expiry date (30 days from purchase).

---

## Customer Concepts

### Account Customer
The CRM record for a customer. Contains personal details (firstname, lastname, ID number), billing address, postal address, contact info. Created during the RICA/onboarding flow.

### Provisioned User
A customer who has completed SIM setup — they have at least one SIM with an ICCID linked to their account. Some dashboard tabs are locked for unprovisioned users. Checked via `userHasProvisionedSim()`.

### Display Name
The name shown in the dashboard navbar. Resolved from: CRM name → Firebase display name → email → fallback "Account". Cached in sessionStorage per user UID.

---

## Pricing

### Pricing Table (Rating Table)
A configuration mapping service types to price brackets. Each bracket defines: rand range → service value. Example: R1-R10 of data = 100MB per rand. Used by `getServiceDisplayValue()` and `convertRandsToServiceValue()`.

### Service Availability
Not all service types are available for all package types. Determined by whether pricing brackets exist for the (serviceType, packageType) combination. Checked via `isServiceAvailable()`.

---

## Codebase Terms

### Module
A top-level directory under `src/modules/` representing a domain boundary (auth, payment, subscription, catalog, crm, rica, warehouse, analytics). Each module contains its own components, services, hooks, utils, and pages.

### Service
A module within a domain that encapsulates API communication. Named `<domain>Service` (e.g., `paymentService`, `crmService`). Exposes async methods that call the API client and return typed responses.

### Hook
A React custom hook, prefixed with `use`. Encapsulates stateful logic (e.g., `useAuthState`, `useDashboardData`, `useTopUpData`). Lives in the module's `hooks/` or `components/` directory.

### Page
A top-level route component in a module's `pages/` directory. Corresponds to a URL path. Lazy-loaded in `App.tsx` via `React.lazy()`.
