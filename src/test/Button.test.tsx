import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Button from "../modules/auth/components/Button";

describe("Button", () => {
  it("renders children as button text", () => {
    render(<Button>Sign Up</Button>);
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("applies primary variant styles by default", () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-[#ABFF63]");
  });

  it("applies secondary variant styles", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-neutral-800");
  });

  it("is full-width by default", () => {
    render(<Button>Wide</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("w-full");
  });

  it("removes full-width class when fullWidth is false", () => {
    render(<Button fullWidth={false}>Narrow</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).not.toContain("w-full");
  });

  it("applies disabled styles and attribute", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.className).toContain("disabled:opacity-50");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports native button type attribute", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("renders a disabled secondary variant correctly", () => {
    render(
      <Button variant="secondary" disabled>
        Both
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.className).toContain("bg-neutral-800");
    expect(btn.className).toContain("disabled:opacity-50");
  });
});
