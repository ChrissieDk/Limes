import type { Meta, StoryObj } from "@storybook/react-vite";
import Partners from "./Partners";

const meta = {
  title: "Auth/Partners",
  component: Partners,
  parameters: {},
} satisfies Meta<typeof Partners>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
