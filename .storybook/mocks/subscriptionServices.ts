// Generic Storybook stubs for backend service modules (subscription/payment/analytics).
// Every method resolves to null so components fall into their empty/error states.

function createStub(name: string) {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'then') return undefined;
        return async () => {
          console.warn(`[storybook mock] ${name}.${String(prop)} called — resolving null`);
          return null;
        };
      },
    },
  );
}

export const subscriptionService = createStub('subscriptionService');
export const dynamicServicesPaymentService = createStub('dynamicServicesPaymentService');
