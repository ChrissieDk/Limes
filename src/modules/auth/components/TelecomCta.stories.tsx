import type { Meta, StoryObj } from "@storybook/react-vite";
import TelecomCta from "./TelecomCta";

const meta = {
  title: "Auth/TelecomCta",
  component: TelecomCta,
  parameters: {},
} satisfies Meta<typeof TelecomCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
