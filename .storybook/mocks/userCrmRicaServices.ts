// Generic Storybook stubs for backend service modules.
// Every method resolves to null so components fall into their empty/error
// states instead of crashing; paymentService has its own richer mock.

function createStub(name: string) {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'then') return undefined; // avoid accidental thenable behavior
        return async () => {
          console.warn(`[storybook mock] ${name}.${String(prop)} called — resolving null`);
          return null;
        };
      },
    },
  );
}

export const userService = createStub('userService');
export const crmService = createStub('crmService');
export const ricaService = createStub('ricaService');
