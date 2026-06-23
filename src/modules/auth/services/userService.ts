import { apiClient } from "../../../config/api";
import type {
  User,
  CreateUserRequest,
  CreateUserResponse,
} from "../../../types";

// Simple in-memory cache: deduplicate concurrent / near-concurrent getCurrentUser calls.
// Multiple components (ProvisionedUserRoute, DashboardNavbar, useDashboardData)
// all call getCurrentUser() within the same render cycle.
// A short TTL prevents N network requests for the same data.
let getCurrentUserPromise: Promise<User> | null = null;
let getCurrentUserTimestamp = 0;
const GET_CURRENT_USER_CACHE_TTL_MS = 3_000;

async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get("/user");
  return response.data;
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    const now = Date.now();
    if (
      getCurrentUserPromise &&
      now - getCurrentUserTimestamp < GET_CURRENT_USER_CACHE_TTL_MS
    ) {
      return getCurrentUserPromise;
    }
    getCurrentUserTimestamp = now;
    getCurrentUserPromise = fetchCurrentUser().finally(() => {
      // Don't clear immediately — let concurrent callers within the TTL window reuse it.
      // The next call outside the window starts fresh.
    });
    return getCurrentUserPromise;
  },

  /** Clear the in-memory cache. Used after mutations (e.g. profile edit). */
  clearCurrentUserCache(): void {
    getCurrentUserPromise = null;
    getCurrentUserTimestamp = 0;
  },

  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put("/user", userData);
    return response.data;
  },

  async updateSimDescription(payload: {
    msisdn: string;
    simDescription: string;
  }): Promise<void> {
    await apiClient.patch("/user/sim-description", payload);
  },

  async registerUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await apiClient.post("/user/register", payload);
    return response.data;
  },

  async hasAccount(): Promise<boolean> {
    const response = await apiClient.get("/user/has-account");
    const data: unknown = response.data;

    if (typeof data === "boolean") {
      return data;
    }

    if (data && typeof data === "object") {
      const shaped = data as {
        hasPayload?: unknown;
        hasAccount?: unknown;
        value?: unknown;
      };

      if (typeof shaped.hasPayload === "boolean") {
        return shaped.hasPayload;
      }

      if (typeof shaped.hasAccount === "boolean") {
        return shaped.hasAccount;
      }

      if (typeof shaped.value === "boolean") {
        return shaped.value;
      }
    }

    return false;
  },
};
