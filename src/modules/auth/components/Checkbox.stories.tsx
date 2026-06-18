import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import Checkbox from "./Checkbox";

const meta = {
  title: "Auth/Checkbox",
  component: Checkbox,
  args: {
    label: "I agree to the Terms & Conditions",
    onChange: fn(),
  },
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const WithRichLabel: Story = {
  args: {
    label: (
      <>
        I agree to the{" "}
        <a href="/terms" className="underline text-[#ABFF63]">
          Terms & Conditions
        </a>
      </>
    ),
  },
};
