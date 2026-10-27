# Storybook service mocks

These mocks replace backend service modules via a Vite plugin in `.storybook/main.ts` (`viteFinal.resolveId`). App code is untouched.

| Mock file | Replaces | Behavior |
|---|---|---|
| `paymentService.ts` | `src/modules/payment/services/paymentService.ts` | `getSavedCards` is configurable per story via `parameters.paymentMock` (set by the `withPaymentMock` decorator in `src/test/withPaymentMock.tsx`): `savedCards` = array of cards, `[]`, or `'error'`; `delayMs` to hold the loading state. All other methods throw "not implemented". |
| `userCrmRicaServices.ts` | `userService`, `crmService`, `ricaService` | Every method logs a warning and resolves `null`, so components fall into empty/error states. |
| `subscriptionServices.ts` | `subscriptionService`, `dynamicServicesPaymentService` | Same stub behavior as above. |
| `analyticsService.ts` | `analyticsService` (`trackPurchase`, `trackBeginCheckout`, `trackEvent`) | Logs to the console instead of tracking. |

Firebase auth is not mocked — `onAuthStateChanged` reports logged-out, which is the state the auth-dependent stories assume.
