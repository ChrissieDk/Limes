import type { Meta, StoryObj } from "@storybook/react-vite";
import ApiDocsTeaser from "./ApiDocsTeaser";

const meta = {
  title: "Auth/ApiDocsTeaser",
  component: ApiDocsTeaser,
  parameters: {},
} satisfies Meta<typeof ApiDocsTeaser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
