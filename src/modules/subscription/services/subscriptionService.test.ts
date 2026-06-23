import { describe, it, expect, vi, beforeEach } from "vitest";
import { subscriptionService } from "./subscriptionService";
import { API_TIMEOUT_MS, API_TIMEOUT_SHORT_MS } from "../../../constants/api";

vi.mock("../../../config/api", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from "../../../config/api";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

describe("subscriptionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSubscription", () => {
    it("posts to /subscriber/create with timeout", async () => {
      const payload = { productId: "123", address: [] };
      const response = { detail: { msisdn: "27612345678" } };
      mockPost.mockResolvedValue({ data: response });

      const result = await subscriptionService.createSubscription(
        payload as any,
      );

      expect(mockPost).toHaveBeenCalledWith("/subscriber/create", payload, {
        timeout: API_TIMEOUT_MS,
      });
      expect(result).toEqual(response);
    });
  });

  describe("createOrder", () => {
    it("posts to /order/create with timeout", async () => {
      const payload = {
        products: [{ id: "123", amount: 100 }],
        msisdn: "27612345678",
      };
      const response = { orderId: "ord-1" };
      mockPost.mockResolvedValue({ data: response });

      const result = await subscriptionService.createOrder(payload);

      expect(mockPost).toHaveBeenCalledWith("/order/create", payload, {
        timeout: API_TIMEOUT_MS,
      });
      expect(result).toEqual(response);
    });
  });

  describe("getBalances", () => {
    it("fetches balances for MSISDN", async () => {
      const response = { data: { airtime: 100, data: 1024 } };
      mockGet.mockResolvedValue({ data: response });

      const result = await subscriptionService.getBalances("27612345678");

      expect(mockGet).toHaveBeenCalledWith("/subscriber/27612345678/balance", {
        signal: undefined,
      });
      expect(result).toEqual(response);
    });
  });

  describe("checkSimActive", () => {
    it("checks if SIM is active", async () => {
      const response = { isActive: true, msisdn: "27612345678" };
      mockGet.mockResolvedValue({ data: response });

      const result = await subscriptionService.checkSimActive("27612345678");

      expect(mockGet).toHaveBeenCalledWith("/subscriber/27612345678/is-active");
      expect(result).toEqual(response);
    });
  });

  describe("processPendingOrders", () => {
    it("processes pending orders for MSISDN", async () => {
      const response = { success: true, orders: [] };
      mockPost.mockResolvedValue({ data: response });

      const result =
        await subscriptionService.processPendingOrders("27612345678");

      expect(mockPost).toHaveBeenCalledWith(
        "/order/pending/27612345678/process",
        {},
        { timeout: API_TIMEOUT_MS },
      );
      expect(result).toEqual(response);
    });
  });

  describe("processPendingDynamicServices", () => {
    it("processes pending dynamic services for MSISDN", async () => {
      const response = { success: true, services: [] };
      mockPost.mockResolvedValue({ data: response });

      const result =
        await subscriptionService.processPendingDynamicServices("27612345678");

      expect(mockPost).toHaveBeenCalledWith(
        "/subscriber/27612345678/service/dynamic/pending/process",
        {},
        { timeout: API_TIMEOUT_MS },
      );
      expect(result).toEqual(response);
    });
  });

  describe("createDynamicServices", () => {
    it("creates dynamic services for MSISDN", async () => {
      const payload = { services: [{ definitionCode: "DATA", value: 1024 }] };
      const response = { results: [{ success: true, id: "svc-1" }] };
      mockPost.mockResolvedValue({ data: response });

      const result = await subscriptionService.createDynamicServices(
        "27612345678",
        payload as any,
      );

      expect(mockPost).toHaveBeenCalledWith(
        "/subscriber/27612345678/service/dynamic",
        payload,
        { timeout: API_TIMEOUT_MS },
      );
      expect(result).toEqual(response);
    });
  });

  describe("storePendingOrder", () => {
    it("stores pending order", async () => {
      const payload = {
        msisdn: "27612345678",
        productId: "123",
        productAmount: 100,
        paymentReference: "ref-1",
      };
      const response = { success: true, message: "Stored" };
      mockPost.mockResolvedValue({ data: response });

      const result = await subscriptionService.storePendingOrder(payload);

      expect(mockPost).toHaveBeenCalledWith("/order/pending", payload, {
        timeout: API_TIMEOUT_MS,
      });
      expect(result).toEqual(response);
    });
  });

  describe("portNumber", () => {
    it("ports number with encoded MSISDNs", async () => {
      mockPost.mockResolvedValue({ data: undefined });

      await subscriptionService.portNumber("27612345678", "27687654321");

      expect(mockPost).toHaveBeenCalledWith(
        `/subscriber/${encodeURIComponent("27612345678")}/swap/msisdn/${encodeURIComponent("27687654321")}?port=true`,
        {},
        { timeout: API_TIMEOUT_SHORT_MS },
      );
    });
  });

  describe("migrateToContract", () => {
    it("calls migrate endpoint with target SIM-package productId", async () => {
      mockPost.mockResolvedValue({ data: undefined });

      await subscriptionService.migrateToContract("27612345678", "7027225P");

      expect(mockPost).toHaveBeenCalledWith(
        `/subscriber/${encodeURIComponent("27612345678")}/product/${encodeURIComponent("7027225P")}/migrate`,
        {},
        { timeout: API_TIMEOUT_SHORT_MS },
      );
    });
  });

  describe("storePendingDynamicService", () => {
    it("stores pending dynamic service", async () => {
      const payload = {
        definitionCode: "DATA" as const,
        value: 1024,
        priceInCents: 10000,
        expiryDate: "2025-12-31",
        paymentReference: "ref-1",
      };
      const response = { success: true, message: "Stored" };
      mockPost.mockResolvedValue({ data: response });

      const result = await subscriptionService.storePendingDynamicService(
        "27612345678",
        payload,
      );

      expect(mockPost).toHaveBeenCalledWith(
        "/subscriber/27612345678/service/dynamic/pending",
        payload,
        { timeout: API_TIMEOUT_MS },
      );
      expect(result).toEqual(response);
    });
  });
});
