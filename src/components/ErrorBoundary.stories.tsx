import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "@storybook/test";
import ErrorBoundary from "./ErrorBoundary";

function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("This is a test error for ErrorBoundary");
  }
  return <p className="text-white">All good, no error here.</p>;
}

const meta = {
  title: "Components/ErrorBoundary",
  component: ErrorBoundary,
  parameters: {
    design: {
      type: "figma",
      url: "",
    },
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultFallback: Story = {
  args: { children: null as any },
  render: () => (
    <ErrorBoundary>
      <ThrowingComponent />
    </ErrorBoundary>
  ),
};

export const CustomFallback: Story = {
  args: { children: null as any },
  render: () => (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h1 className="font-grotesque text-white text-xl font-bold">
              Custom Error UI
            </h1>
            <p className="font-manrope text-neutral-400 text-sm">
              This is a custom fallback for a specific section. The rest of the
              app still works.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#ABFF63] text-neutral-900 rounded-lg font-semibold hover:brightness-95 transition-all"
            >
              Try again
            </button>
          </div>
        </div>
      }
    >
      <ThrowingComponent />
    </ErrorBoundary>
  ),
};

export const NoError: Story = {
  args: { children: null as any },
  render: () => (
    <ErrorBoundary>
      <ThrowingComponent shouldThrow={false} />
    </ErrorBoundary>
  ),
};

export const RefreshInteraction: Story = {
  args: { children: null as any },
  render: () => (
    <ErrorBoundary>
      <ThrowingComponent />
    </ErrorBoundary>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Something went wrong")).toBeInTheDocument();
    await expect(
      canvas.getByText(
        "We've hit an unexpected error. Try refreshing the page.",
      ),
    ).toBeInTheDocument();
    const refreshButton = canvas.getByRole("button", { name: "Refresh page" });
    await expect(refreshButton).toBeInTheDocument();
  },
};
