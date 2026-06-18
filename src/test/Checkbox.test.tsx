import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkbox from "../modules/auth/components/Checkbox";

describe("Checkbox", () => {
  it("renders a checkbox input", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders the label text", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeInTheDocument();
  });

  it("renders a ReactNode label", () => {
    render(
      <Checkbox
        label={
          <span>
            I agree to the <a href="/terms">Terms</a>
          </span>
        }
      />,
    );
    expect(screen.getByText("I agree to the")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms" })).toBeInTheDocument();
  });

  it("is unchecked by default", () => {
    render(<Checkbox label="Option" />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("toggles checked state on click", async () => {
    render(<Checkbox label="Toggle me" />);
    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("calls onChange when toggled", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Change me" onChange={onChange} />);

    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("can be disabled", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Locked" disabled onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeDisabled();
    await userEvent.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports defaultChecked", () => {
    render(<Checkbox label="Pre-checked" defaultChecked />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
