import type { Meta, StoryObj } from "@storybook/react-vite";
import Hero from "./Hero";

const meta = {
  title: "Auth/Hero",
  component: Hero,
  parameters: {},
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default state — no Firebase user logged in, CTA links to /signin */
export const Default: Story = {};
