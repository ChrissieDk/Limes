import type { Decorator } from '@storybook/react-vite';

// Set `parameters.paymentMock` in a story to control the mocked paymentService
// (see .storybook/mocks/paymentService.ts).
export const withPaymentMock: Decorator = (Story, { parameters }) => {
  (window as unknown as { __PAYMENT_MOCK__?: unknown }).__PAYMENT_MOCK__ =
    (parameters as { paymentMock?: unknown }).paymentMock ?? {};
  return <Story />;
};
