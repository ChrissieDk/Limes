import { apiClient } from "../../../config/api";
import type {
  SearchAccountsQuery,
  SearchAccountsResponse,
  CreateAccountCustomerRequest,
  CreateAccountCustomerResponse,
  GetAccountCustomerResponse,
  UpdateCustomerRequest,
} from "../../../types";

// Short-TTL in-memory cache for getAccountCustomer.
// DashboardNavbar and useDashboardData both call this on mount.
let getAccountCustomerPromise: Promise<GetAccountCustomerResponse> | null =
  null;
let getAccountCustomerTimestamp = 0;
const GET_ACCOUNT_CUSTOMER_CACHE_TTL_MS = 3_000;

export const crmService = {
  async searchAccounts(
    params: SearchAccountsQuery,
  ): Promise<SearchAccountsResponse> {
    const response = await apiClient.get("/crm/search/accounts", { params });
    return response.data;
  },

  async createAccountCustomer(
    payload: CreateAccountCustomerRequest,
  ): Promise<CreateAccountCustomerResponse> {
    const response = await apiClient.post(
      "/crm/store/account/customer",
      payload,
    );
    return response.data;
  },

  async getAccountCustomer(): Promise<GetAccountCustomerResponse> {
    const now = Date.now();
    if (
      getAccountCustomerPromise &&
      now - getAccountCustomerTimestamp < GET_ACCOUNT_CUSTOMER_CACHE_TTL_MS
    ) {
      return getAccountCustomerPromise;
    }
    getAccountCustomerTimestamp = now;
    getAccountCustomerPromise = apiClient
      .get("/crm/account/customer")
      .then((res) => res.data);
    return getAccountCustomerPromise;
  },

  async updateCustomer(payload: UpdateCustomerRequest): Promise<void> {
    // Invalidate cache on mutation so the next read is fresh.
    getAccountCustomerPromise = null;
    getAccountCustomerTimestamp = 0;
    await apiClient.patch("/crm/update/customer", payload);
  },
};
