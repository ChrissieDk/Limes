import type { Meta, StoryObj } from "@storybook/react-vite";
import { HelmetProvider } from "react-helmet-async";
import SEO from "./SEO";

const meta = {
  title: "Components/SEO",
  component: SEO,
  parameters: {},
  decorators: [
    (Story) => (
      <HelmetProvider>
        <Story />
      </HelmetProvider>
    ),
  ],
} satisfies Meta<typeof SEO>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Renders Helmet with title and meta tags for the current route.
 * Since MemoryRouter is set to "/" globally, it shows the home page SEO:
 * title "Limes — The Network Built Different", description, OG tags, canonical URL.
 */
export const Default: Story = {};
