import type { Meta, StoryObj } from "@storybook/react-vite";
import { CurrentPlan } from "./CurrentPlanCard";
import { mockCurrentPlan } from "./dashboardMocks";

const meta = {
  title: "Dashboard/CurrentPlan",
  component: CurrentPlan,
  parameters: {
    design: {
      type: "figma",
      url: "",
    },
  },
} satisfies Meta<typeof CurrentPlan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    plan: mockCurrentPlan,
  },
};

export const ActiveSubscription: Story = {
  args: {
    plan: {
      ...mockCurrentPlan,
      hasActiveSubscription: true,
      isAutoRenewing: true,
      subscriptionStatus: "active",
      productId: "PROD-001",
      nextPaymentDate: "2026-07-18T00:00:00Z",
    },
  },
};

export const Pending: Story = {
  args: {
    plan: {
      name: "Flex Plan",
      mobileData: "20GB",
      messaging: "50 SMS",
      phone: "100 Min",
      price: 299.99,
      subscriptionStatus: "pending",
    },
  },
};

export const WithCustomClass: Story = {
  args: {
    plan: mockCurrentPlan,
    className: "max-w-md",
  },
};
