import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  docs: {
    defaultName: 'Overview',
  },
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  viteFinal: async (config) => {
    const mockDir = new URL('./mocks', import.meta.url).pathname;
    config.plugins = [
      ...(config.plugins ?? []),
      {
        name: 'limes-storybook-service-mocks',
        enforce: 'pre',
        resolveId(id) {
          if (id.includes('modules/payment/services/paymentService')) {
            return path.join(mockDir, 'paymentService.ts');
          }
          if (
            id.includes('modules/auth/services/userService') ||
            id.includes('modules/crm/services/crmService') ||
            id.includes('modules/rica/services/ricaService')
          ) {
            return path.join(mockDir, 'userCrmRicaServices.ts');
          }
          if (
            id.includes('modules/subscription/services/subscriptionService') ||
            id.includes('modules/payment/services/dynamicServicesPaymentService')
          ) {
            return path.join(mockDir, 'subscriptionServices.ts');
          }
          if (id.includes('modules/analytics/services/analyticsService')) {
            return path.join(mockDir, 'analyticsService.ts');
          }
          return null;
        },
      },
    ];
    return config;
  },
};

export default config;
