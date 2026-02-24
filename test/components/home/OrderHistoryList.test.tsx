import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import OrderHistoryList from "../../../src/components/home/OrderHistoryList";

const mockUseAuth = jest.fn();
const mockUseOrderDetailCache = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock("../../../src/Providers/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../../src/Providers/OrderDetailCacheProvider", () => ({
  useOrderDetailCache: () => mockUseOrderDetailCache(),
}));

const mockFrom = jest.fn();
jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe("OrderHistoryList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReset();
    mockUseOrderDetailCache.mockReturnValue({
      getCached: jest.fn(() => null),
      setCached: jest.fn(),
      fetchOrderDetail: jest.fn().mockResolvedValue({
        data: {
          restaurantName: "Test",
          address: null,
          lineItems: [],
        },
      }),
    });
  });

  it("shows loading state while fetching (no sign-in or empty message yet)", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });
    mockFrom.mockReturnValue({
      select: () => ({ eq: () => ({ order: () => new Promise<never>(() => undefined) }) }),
    });

    const { queryByText } = render(<OrderHistoryList />);
    expect(queryByText("No orders yet.")).toBeNull();
  });

  it("shows error message when fetch fails", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({
              data: null,
              error: { message: "Network error" },
            }),
        }),
      }),
    });

    const { getByText } = render(<OrderHistoryList />);
    await waitFor(() => {
      expect(getByText("Network error")).toBeTruthy();
    });
  });

  it("shows no orders yet when list is empty", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });
    mockFrom
      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }),
      });

    const { getByText } = render(<OrderHistoryList />);
    await waitFor(() => {
      expect(getByText("No orders yet.")).toBeTruthy();
    });
  });

  it("renders order cards and navigates when card is pressed", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: "order-1",
                    created_at: "2026-02-23T12:00:00Z",
                    total_amount: 18.66,
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "order_items") {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [{ order_id: "order-1", quantity: 2 }],
              error: null,
            }),
          }),
        };
      }
      return {};
    });

    const { getByText } = render(<OrderHistoryList />);
    await waitFor(() => {
      expect(getByText("Order ID: order-1")).toBeTruthy();
    });

    fireEvent.press(getByText("Order ID: order-1"));
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith("/(home)/order/order-1");
    });
  });
});
