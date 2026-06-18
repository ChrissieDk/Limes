import type { Meta, StoryObj } from "@storybook/react-vite";
import ReviewsMarquee from "./ReviewsMarquee";

const meta = {
  title: "Auth/ReviewsMarquee",
  component: ReviewsMarquee,
  parameters: {},
} satisfies Meta<typeof ReviewsMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
