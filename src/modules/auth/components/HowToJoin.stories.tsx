import type { Meta, StoryObj } from "@storybook/react-vite";
import HowToJoin from "./HowToJoin";

const meta = {
  title: "Auth/HowToJoin",
  component: HowToJoin,
  parameters: {},
} satisfies Meta<typeof HowToJoin>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default state — no Firebase user logged in, CTAs link to /signin */
export const Default: Story = {};
