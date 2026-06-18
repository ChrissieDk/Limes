import type { Preview } from "@storybook/react-vite";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import "../src/index.css";

// Mock import.meta.env for image paths used in components
if (!import.meta.env.BASE_URL) {
  // @ts-expect-error - setting BASE_URL for Storybook
  import.meta.env.BASE_URL = "/";
}

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter initialEntries={["/"]}>
    <Story />
  </MemoryRouter>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    design: {
      type: "figma",
      // 👇 Replace with your Figma file URL (File > Share > Copy link)
      url: "https://www.figma.com/design/YOUR_FILE_KEY/Limes",
    },
  },
  decorators: [withRouter],
  tags: ["autodocs"],
};

export default preview;
