import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge } from "./TransactionsComponents";

const meta = {
  title: "Dashboard/StatusBadge",
  component: StatusBadge,
  parameters: {
    design: {
      type: "figma",
      url: "",
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["success", "pending", "failed"],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    status: "success",
  },
};

export const Pending: Story = {
  args: {
    status: "pending",
  },
};

export const Failed: Story = {
  args: {
    status: "failed",
  },
};

export const AllVariants: Story = {
  args: { status: "success" },
  render: () => (
    <div className="flex flex-col gap-4 p-8 bg-neutral-900 rounded-xl">
      <div className="flex items-center gap-4">
        <StatusBadge status="success" />
        <StatusBadge status="pending" />
        <StatusBadge status="failed" />
      </div>
    </div>
  ),
};
