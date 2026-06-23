import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SavedCards from "./SavedCards";
import { paymentService } from "../services/paymentService";
import type { SavedCard } from "../../../types/payment";

vi.mock("../services/paymentService", () => ({
  paymentService: {
    getSavedCards: vi.fn(),
    deleteSavedCard: vi.fn(),
    setDefaultCard: vi.fn(),
    chargeSavedCard: vi.fn(),
  },
}));

vi.mock("../../../lib/sentry-logger", () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../analytics/services/analyticsService", () => ({
  trackPurchase: vi.fn(),
}));

const mockCards: SavedCard[] = [
  {
    id: "card-1",
    cardType: "visa",
    last4: "4242",
    expMonth: "12",
    expYear: "2028",
    bank: "Test Bank",
    brand: "Visa",
    isDefault: true,
  },
  {
    id: "card-2",
    cardType: "mastercard",
    last4: "1234",
    expMonth: "06",
    expYear: "2027",
    bank: "Another Bank",
    brand: "Mastercard",
    isDefault: false,
  },
];

describe("SavedCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner on mount", () => {
    vi.mocked(paymentService.getSavedCards).mockReturnValue(
      new Promise(() => {}),
    );
    render(<SavedCards />);
    expect(screen.getByText("Loading saved cards...")).toBeInTheDocument();
    expect(
      screen.getByText("Loading saved cards...").previousElementSibling,
    ).toHaveClass("animate-spin");
  });

  it("renders cards when loaded successfully", async () => {
    vi.mocked(paymentService.getSavedCards).mockResolvedValue(mockCards);
    render(<SavedCards />);

    await waitFor(() => {
      expect(screen.getByText("4242")).toBeInTheDocument();
    });
    expect(screen.getByText("VISA")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("12/28")).toBeInTheDocument();
    expect(screen.getByText("06/27")).toBeInTheDocument();
  });

  it("shows empty state when no cards returned", async () => {
    vi.mocked(paymentService.getSavedCards).mockResolvedValue([]);
    render(<SavedCards />);

    await waitFor(() => {
      expect(screen.getByText("No saved cards")).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        "Save a card during your next payment for faster checkout",
      ),
    ).toBeInTheDocument();
  });

  it("shows error state when API call fails", async () => {
    vi.mocked(paymentService.getSavedCards).mockRejectedValue(
      new Error("Network error"),
    );
    render(<SavedCards />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("shows session expired message on 401", async () => {
    const err = { response: { status: 401 } };
    vi.mocked(paymentService.getSavedCards).mockRejectedValue(err);
    render(<SavedCards />);

    await waitFor(() => {
      expect(
        screen.getByText("Your session has expired. Please sign in again."),
      ).toBeInTheDocument();
    });
  });

  it("shows Try again button on error and retries", async () => {
    vi.mocked(paymentService.getSavedCards)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockCards);

    render(<SavedCards />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });

    const tryAgain = screen.getByText("Try again");
    expect(tryAgain).toBeInTheDocument();

    await userEvent.click(tryAgain);

    await waitFor(() => {
      expect(screen.getByText("4242")).toBeInTheDocument();
    });
    expect(paymentService.getSavedCards).toHaveBeenCalledTimes(2);
  });

  it("deduplicates cards with same last4-exp-bank", async () => {
    const duplicateCards: SavedCard[] = [
      { ...mockCards[0] },
      { ...mockCards[0], id: "card-1-dup" },
    ];
    vi.mocked(paymentService.getSavedCards).mockResolvedValue(duplicateCards);
    render(<SavedCards />);

    await waitFor(() => {
      // Brand and last4 rendered as separate elements in virtual card view
      expect(screen.getByText("VISA")).toBeInTheDocument();
      expect(screen.getAllByText("4242")).toHaveLength(1);
    });
  });

  describe("delete flow", () => {
    it("shows inline confirmation when delete is clicked", async () => {
      vi.mocked(paymentService.getSavedCards).mockResolvedValue(mockCards);
      render(<SavedCards />);

      await waitFor(() => {
        expect(screen.getByText("1234")).toBeInTheDocument();
      });

      // Find delete button (trash icon) for the non-default card
      const deleteButtons = screen.getAllByTitle("Delete card");
      expect(deleteButtons).toHaveLength(1);

      await userEvent.click(deleteButtons[0]);

      // Inline confirmation should appear
      expect(screen.getByText("Delete?")).toBeInTheDocument();
      expect(screen.getByText("Confirm")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("cancels delete when Cancel is clicked", async () => {
      vi.mocked(paymentService.getSavedCards).mockResolvedValue(mockCards);
      render(<SavedCards />);

      await waitFor(() => {
        expect(screen.getByText("1234")).toBeInTheDocument();
      });

      // Click delete to show confirmation
      await userEvent.click(screen.getByTitle("Delete card"));
      expect(screen.getByText("Delete?")).toBeInTheDocument();

      // Click cancel
      await userEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByText("Delete?")).not.toBeInTheDocument();
    });

    it("executes delete when Confirm is clicked and shows success", async () => {
      vi.mocked(paymentService.getSavedCards).mockResolvedValue(mockCards);
      vi.mocked(paymentService.deleteSavedCard).mockResolvedValue({
        success: true,
        message: "Deleted",
      });

      render(<SavedCards />);

      await waitFor(() => {
        expect(screen.getByText("1234")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTitle("Delete card"));
      await userEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(
          screen.getByText("Card deleted successfully"),
        ).toBeInTheDocument();
      });
      expect(paymentService.deleteSavedCard).toHaveBeenCalledWith("card-2");
      expect(screen.queryByText("1234")).not.toBeInTheDocument();
    });

    it("shows error when delete fails", async () => {
      vi.mocked(paymentService.getSavedCards).mockResolvedValue(mockCards);
      vi.mocked(paymentService.deleteSavedCard).mockRejectedValue(
        new Error("Server error"),
      );

      render(<SavedCards />);

      await waitFor(() => {
        expect(screen.getByText("1234")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTitle("Delete card"));
      await userEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("disables delete button for default card", async () => {
      vi.mocked(paymentService.getSavedCards).mockResolvedValue(mockCards);
      render(<SavedCards />);

      await waitFor(() => {
        expect(screen.getByText("4242")).toBeInTheDocument();
      });

      const defaultDeleteButton = screen.getAllByTitle(
        "Cannot delete default card - set another card as default first",
      );
      expect(defaultDeleteButton).toHaveLength(1);
      expect(defaultDeleteButton[0]).toBeDisabled();
    });
  });

  describe("set default flow", () => {
    it("sets default card when button is clicked", async () => {
      vi.mocked(paymentService.getSavedCards).mockResolvedValue(mockCards);
      vi.mocked(paymentService.setDefaultCard).mockResolvedValue({
        success: true,
        message: "Updated",
      });

      render(<SavedCards />);

      await waitFor(() => {
        expect(screen.getByText("1234")).toBeInTheDocument();
      });

      const setDefaultBtn = screen.getByTitle("Set as default payment method");
      expect(setDefaultBtn).toBeInTheDocument();

      await userEvent.click(setDefaultBtn);

      await waitFor(() => {
        expect(
          screen.getByText("Default card updated successfully"),
        ).toBeInTheDocument();
      });
      expect(paymentService.setDefaultCard).toHaveBeenCalledWith("card-2");
    });

    it("hides set default button for already-default card", async () => {
      vi.mocked(paymentService.getSavedCards).mockResolvedValue(mockCards);
      render(<SavedCards />);

      await waitFor(() => {
        expect(screen.getByText("4242")).toBeInTheDocument();
      });

      // Default card should not have "Set Default" button
      // Only the non-default Mastercard (1234) should show it
      const setDefaultButtons = screen.getAllByText("Set Default");
      expect(setDefaultButtons).toHaveLength(1);
    });
  });
});
