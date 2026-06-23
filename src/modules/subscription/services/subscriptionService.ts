import { apiClient } from "../../../config/api";
import { API_TIMEOUT_MS, API_TIMEOUT_SHORT_MS } from "../../../constants/api";
import type {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetBalancesResponse,
  CheckSimActiveResponse,
  ProcessPendingOrdersResponse,
  CreateDynamicServicesRequest,
  CreateDynamicServicesResponse,
} from "../../../types";

export const subscriptionService = {
  async createSubscription(
    payload: CreateSubscriptionRequest,
  ): Promise<CreateSubscriptionResponse> {
    const response = await apiClient.post("/subscriber/create", payload, {
      timeout: API_TIMEOUT_MS,
    });
    return response.data;
  },

  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await apiClient.post("/order/create", payload, {
      timeout: API_TIMEOUT_MS,
    });
    return response.data;
  },

  async getBalances(
    msisdn: string,
    options?: { signal?: AbortSignal },
  ): Promise<GetBalancesResponse> {
    const response = await apiClient.get(`/subscriber/${msisdn}/balance`, {
      signal: options?.signal,
    });
    return response.data;
  },

  async checkSimActive(msisdn: string): Promise<CheckSimActiveResponse> {
    const response = await apiClient.get(`/subscriber/${msisdn}/is-active`);
    return response.data;
  },

  async processPendingOrders(
    msisdn: string,
  ): Promise<ProcessPendingOrdersResponse> {
    const response = await apiClient.post(
      `/order/pending/${msisdn}/process`,
      {},
      {
        timeout: API_TIMEOUT_MS,
      },
    );
    return response.data;
  },

  async processPendingDynamicServices(
    msisdn: string,
  ): Promise<ProcessPendingOrdersResponse> {
    const response = await apiClient.post(
      `/subscriber/${msisdn}/service/dynamic/pending/process`,
      {},
      {
        timeout: API_TIMEOUT_MS,
      },
    );
    return response.data;
  },

  async createDynamicServices(
    msisdn: string,
    payload: CreateDynamicServicesRequest,
  ): Promise<CreateDynamicServicesResponse> {
    if (import.meta.env.DEV) {
      console.log("[Subscription] createDynamicServices request:", {
        msisdn,
        payload,
      });
    }
    const response = await apiClient.post(
      `/subscriber/${msisdn}/service/dynamic`,
      payload,
      {
        timeout: API_TIMEOUT_MS,
      },
    );
    return response.data;
  },

  async storePendingOrder(payload: {
    msisdn: string;
    productId: string;
    productAmount: number;
    paymentReference: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post("/order/pending", payload, {
      timeout: API_TIMEOUT_MS,
    });
    return response.data;
  },

  async portNumber(currentMsisdn: string, newMsisdn: string): Promise<void> {
    const encodedCurrent = encodeURIComponent(currentMsisdn);
    const encodedNew = encodeURIComponent(newMsisdn);
    await apiClient.post(
      `/subscriber/${encodedCurrent}/swap/msisdn/${encodedNew}?port=true`,
      {},
      { timeout: API_TIMEOUT_SHORT_MS },
    );
  },

  /**
   * Migrates a subscriber from their current product to a new product.
   * The backend only expects msisdn and productId in the route.
   *
   * For prepaid → contract migrations, productId should be the target
   * SIM-package ID ending in P (e.g. 7027225P for "has-sim" contract).
   *
   * BACKEND TODO: Expose `MsisdnData.packageType` ('prepaid' | 'contract')
   * on the user profile response so the frontend can reliably show / grey-out
   * the "Switch to Contract" button without guessing from productId.
   */
  async migrateToContract(msisdn: string, productId: string): Promise<void> {
    const encodedMsisdn = encodeURIComponent(msisdn);
    const encodedProduct = encodeURIComponent(productId);
    await apiClient.post(
      `/subscriber/${encodedMsisdn}/product/${encodedProduct}/migrate`,
      {},
      { timeout: API_TIMEOUT_SHORT_MS },
    );
  },

  async storePendingDynamicService(
    msisdn: string,
    payload: {
      definitionCode: "DATA" | "VOICE" | "SMS" | "WHATSAPP" | "GPA_CREDIT";
      value: number;
      priceInCents: number;
      expiryDate: string;
      paymentReference: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(
      `/subscriber/${msisdn}/service/dynamic/pending`,
      payload,
      {
        timeout: API_TIMEOUT_MS,
      },
    );
    return response.data;
  },
};
