import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TextField from "../modules/auth/components/TextField";

describe("TextField", () => {
  it("renders an input element", () => {
    render(<TextField />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with a label when provided", () => {
    render(<TextField label="Email address" />);
    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("renders without a label when not provided", () => {
    render(<TextField />);
    expect(screen.queryByText("Email address")).not.toBeInTheDocument();
  });

  it("renders a prefix element when provided", () => {
    render(<TextField prefix="+27" />);
    expect(screen.getByText("+27")).toBeInTheDocument();
  });

  it("shows error message when error prop is set", () => {
    render(<TextField error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("renders password input with toggle button", () => {
    render(<TextField type="password" label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
  });

  it("toggles password visibility when clicking the eye button", () => {
    render(<TextField type="password" label="Password" />);
    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
  });

  it("applies dark variant styles", () => {
    render(<TextField variant="dark" />);
    const wrapper = screen.getByRole("textbox").parentElement!;
    expect(wrapper.className).toContain("bg-white/5");
    expect(wrapper.className).toContain("text-white");
  });

  it("applies light variant by default", () => {
    render(<TextField />);
    const wrapper = screen.getByRole("textbox").parentElement!;
    expect(wrapper.className).toContain("bg-white");
  });

  it("applies error styling to the input wrapper", () => {
    render(<TextField error="Something went wrong" />);
    const wrapper = screen.getByRole("textbox").parentElement!;
    expect(wrapper.className).toContain("ring-red-500");
  });
});
