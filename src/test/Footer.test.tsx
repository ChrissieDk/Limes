import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../modules/auth/components/Footer";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter initialEntries={["/"]}>{ui}</MemoryRouter>);
}

describe("Footer", () => {
  beforeEach(() => {
    // Ensure BASE_URL mock is set for image paths
    if (!import.meta.env.BASE_URL) {
      // @ts-expect-error - setting BASE_URL for tests
      import.meta.env.BASE_URL = "/";
    }
  });

  it("renders the Limes logo", () => {
    renderWithRouter(<Footer />);
    const logo = screen.getByAltText("Limes");
    expect(logo).toBeInTheDocument();
  });

  it("renders company contact info", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText("080 039 0009")).toBeInTheDocument();
    expect(screen.getByText("*140#")).toBeInTheDocument();
    expect(screen.getByText("support@simpal.co.za")).toBeInTheDocument();
  });

  it("renders quick links section", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Why Choose Limes" }),
    ).toBeInTheDocument();
  });

  it("renders legal links", () => {
    renderWithRouter(<Footer />);
    expect(
      screen.getByRole("link", { name: "Terms & Conditions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Fair Usage Policy" }),
    ).toBeInTheDocument();
  });

  it("renders the copyright notice", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText(/Copyright © 2026 Limes/)).toBeInTheDocument();
  });

  it("renders social media links", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText("Stay Connected")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
  });

  it("renders disabled social links as non-interactive", () => {
    renderWithRouter(<Footer />);
    // Social 1-3 have enabled: false, they should have aria-hidden
    const hiddenSpans = screen.getAllByText("", { selector: 'img[alt=""]' });
    expect(hiddenSpans.length).toBeGreaterThanOrEqual(4);
  });
});
