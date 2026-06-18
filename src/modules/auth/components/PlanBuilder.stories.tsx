import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import PlanBuilder from "./PlanBuilder";

const meta = {
  title: "Auth/PlanBuilder",
  component: PlanBuilder,
  parameters: {},
  args: {
    onContinue: fn(),
    onBack: fn(),
  },
} satisfies Meta<typeof PlanBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
