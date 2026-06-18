import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// vi.mock factories cannot reference outer variables (hoisting).
// Define the mutable reference inside the factory.
vi.mock("../config/firebase", () => {
  const mockAuth = { currentUser: null };
  return { auth: mockAuth, __mockAuth: mockAuth };
});

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}));

import AuthenticatedRoute from "../modules/auth/components/AuthenticatedRoute";
import { onAuthStateChanged } from "firebase/auth";
import { auth, __mockAuth } from "../config/firebase";

const mockOnAuth = vi.mocked(onAuthStateChanged);
const mockAuth = __mockAuth as unknown as { currentUser: unknown };

function renderWithRouter(ui: React.ReactElement, { route = "/" } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

describe("AuthenticatedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it("redirects to /signin when user is null", async () => {
    mockOnAuth.mockImplementation((_auth, callback) => {
      callback(null);
      return vi.fn();
    });

    renderWithRouter(
      <AuthenticatedRoute>
        <div>Protected content</div>
      </AuthenticatedRoute>,
    );

    await waitFor(() => {
      expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    });
  });

  it("renders children when user is authenticated", async () => {
    mockAuth.currentUser = { uid: "123" };
    mockOnAuth.mockImplementation((_auth, callback) => {
      callback({ uid: "123" });
      return vi.fn();
    });

    renderWithRouter(
      <AuthenticatedRoute>
        <div>Protected content</div>
      </AuthenticatedRoute>,
    );

    await waitFor(() => {
      expect(screen.getByText("Protected content")).toBeInTheDocument();
    });
  });

  it("unsubscribes from auth changes on unmount", () => {
    const unsubscribe = vi.fn();
    mockOnAuth.mockReturnValue(unsubscribe);

    const { unmount } = renderWithRouter(
      <AuthenticatedRoute>
        <div>Content</div>
      </AuthenticatedRoute>,
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("renders immediately when auth.currentUser is set at mount", () => {
    mockAuth.currentUser = { uid: "456", email: "test@test.com" };
    mockOnAuth.mockReturnValue(vi.fn());

    renderWithRouter(
      <AuthenticatedRoute>
        <div>Instant content</div>
      </AuthenticatedRoute>,
    );

    expect(screen.getByText("Instant content")).toBeInTheDocument();
  });
});
