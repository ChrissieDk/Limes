import type { Meta, StoryObj } from "@storybook/react-vite";
import Navbar from "./Navbar";

const meta = {
  title: "Auth/Navbar",
  component: Navbar,
  parameters: {},
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default state — no Firebase user logged in, shows "Sign In" button */
export const Default: Story = {};
