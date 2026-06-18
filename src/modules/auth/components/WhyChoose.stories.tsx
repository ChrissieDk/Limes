import type { Meta, StoryObj } from "@storybook/react-vite";
import WhyChoose from "./WhyChoose";

const meta = {
  title: "Auth/WhyChoose",
  component: WhyChoose,
  parameters: {},
} satisfies Meta<typeof WhyChoose>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default state — renders with default allocation (data: R30, airtime: R15, sms: R10, voice: R0, whatsapp: R0). No Firebase user logged in, CTA links to /signin. */
export const Default: Story = {};
