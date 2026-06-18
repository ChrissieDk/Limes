import type { Meta, StoryObj } from "@storybook/react-vite";
import { vi } from "vitest";

vi.mock("../services/userService", () => ({
  userService: { getCurrentUser: vi.fn() },
}));

vi.mock("../utils/userProvisioning", () => ({
  userHasProvisionedSim: vi.fn(),
}));

import ProvisionedUserRoute from "./ProvisionedUserRoute";
import { userService } from "../services/userService";
import { userHasProvisionedSim } from "../utils/userProvisioning";

const meta = {
  title: "Auth/ProvisionedUserRoute",
  component: ProvisionedUserRoute,
  parameters: {},
} satisfies Meta<typeof ProvisionedUserRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { children: null as any },
  render: () => (
    <div className="min-h-[300px] bg-neutral-900 flex items-center justify-center rounded-xl">
      <ProvisionedUserRoute>
        <div className="p-8 text-white text-center">
          <p className="font-grotesque text-lg font-semibold">
            ✅ You are provisioned
          </p>
        </div>
      </ProvisionedUserRoute>
    </div>
  ),
};

export const Allowed: Story = {
  args: { children: null as any },
  decorators: [
    (Story) => {
      vi.mocked(userService.getCurrentUser).mockResolvedValue({
        subscriber: { msisdns: [], packages: [] },
        packageType: "prepaid",
      } as any);
      vi.mocked(userHasProvisionedSim).mockReturnValue(true);
      return <Story />;
    },
  ],
  render: () => (
    <div className="min-h-[300px] bg-neutral-900 flex items-center justify-center rounded-xl">
      <ProvisionedUserRoute>
        <div className="p-8 text-white text-center">
          <p className="font-grotesque text-lg font-semibold">
            ✅ You are provisioned
          </p>
          <p className="text-neutral-400 mt-2">
            This content is behind the provisioned user guard.
          </p>
        </div>
      </ProvisionedUserRoute>
    </div>
  ),
};
