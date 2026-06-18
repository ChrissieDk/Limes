import type { Meta, StoryObj } from "@storybook/react-vite";
import Packages from "./Packages";

const meta = {
  title: "Auth/Packages",
  component: Packages,
  parameters: {},
} satisfies Meta<typeof Packages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
