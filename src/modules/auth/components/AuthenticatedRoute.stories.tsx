import type { Meta, StoryObj } from "@storybook/react-vite";
import { vi } from "vitest";

vi.mock("../../../config/firebase", () => {
  const mockOnAuthStateChanged = vi.fn();
  return {
    auth: { currentUser: null },
    onAuthStateChanged: mockOnAuthStateChanged,
  };
});

import AuthenticatedRoute from "./AuthenticatedRoute";
import { auth } from "../../../config/firebase";

const meta = {
  title: "Auth/AuthenticatedRoute",
  component: AuthenticatedRoute,
  parameters: {},
} satisfies Meta<typeof AuthenticatedRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
  args: { children: null as any },
  decorators: [
    (Story) => {
      // @ts-expect-error - mocking auth for story
      auth.currentUser = { uid: "test-user-123", email: "user@example.com" };
      return <Story />;
    },
  ],
  render: () => (
    <div className="p-8 bg-neutral-900 text-white rounded-xl text-center">
      <p className="font-grotesque text-lg font-semibold">
        ✅ You are authenticated
      </p>
      <p className="text-neutral-400 mt-2">
        This content is behind the route guard.
      </p>
    </div>
  ),
};

export const Unauthenticated: Story = {
  args: { children: null as any },
  decorators: [
    (Story) => {
      // @ts-expect-error - mocking auth for story
      auth.currentUser = null;
      return <Story />;
    },
  ],
  render: () => (
    <div className="p-8 bg-neutral-900 text-white rounded-xl text-center">
      <p className="text-neutral-400">Redirecting to /signin...</p>
    </div>
  ),
};
