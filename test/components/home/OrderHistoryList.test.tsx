import { render, waitFor } from "@testing-library/react-native";
import OrderHistoryList from "../../../src/components/home/OrderHistoryList";
import type { OrderHistoryItem } from "../../../src/components/home/OrderHistoryCard";

const mockUseAuth = jest.fn();
const mockFetchOrderList = jest.fn();
const mockFetchOrderDetail = jest.fn();
const mockGetCached = jest.fn();
const mockSetCached = jest.fn();
const mockRunFocusEffect = { current: true };

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (fn: () => void) => {
    if (mockRunFocusEffect.current) {
      mockRunFocusEffect.current = false;
      fn();
    }
  },
}));

jest.mock("../../../src/Providers/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../../src/Providers/OrderDetailCacheProvider", () => ({
  useOrderDetailCache: () => ({
    getCached: mockGetCached,
    setCached: mockSetCached,
    fetchOrderDetail: mockFetchOrderDetail,
    fetchOrderList: mockFetchOrderList,
  }),
}));

describe("OrderHistoryList", () => {
  beforeEach(() => {
    mockRunFocusEffect.current = true;
    mockUseAuth.mockReturnValue({ session: { user: { id: "user-1" } } });
    mockGetCached.mockReturnValue(null);
  });

  it("shows loading state while fetching orders", () => {
    mockFetchOrderList.mockImplementation(
      () => new Promise<void>(() => { /* never resolves */ })
    );

    const { queryByText } = render(<OrderHistoryList />);

    expect(mockFetchOrderList).toHaveBeenCalled();
    expect(queryByText("No orders yet.")).toBeNull();
    expect(queryByText("Failed to load orders")).toBeNull();
  });

  it("shows error message when fetch fails", async () => {
    mockFetchOrderList.mockResolvedValue({ error: "Failed to load orders" });

    const { getByText } = render(<OrderHistoryList />);

    await waitFor(() => {
      expect(getByText("Failed to load orders")).toBeTruthy();
    });
  });

  it("shows empty state when user has no orders", async () => {
    mockFetchOrderList.mockResolvedValue({ data: [] });

    const { getByText } = render(<OrderHistoryList />);

    await waitFor(() => {
      expect(getByText("No orders yet.")).toBeTruthy();
    });
  });

  it("shows filtered empty message when date range excludes all orders", async () => {
    const orders: OrderHistoryItem[] = [
      {
        id: "ord-1",
        date: "01/15/2026",
        createdAt: "2026-01-15T12:00:00Z",
        itemCount: 1,
        totalPrice: 10.0,
      },
    ];
    mockFetchOrderList.mockResolvedValue({ data: orders });

    const { getByText } = render(
      <OrderHistoryList startDate="2026-02-01" endDate="2026-02-28" />
    );

    await waitFor(() => {
      expect(getByText("No orders match those date filters.")).toBeTruthy();
    });
  });

  it("renders order list when fetch succeeds", async () => {
    const orders: OrderHistoryItem[] = [
      {
        id: "ord-1",
        date: "02/23/2026",
        createdAt: "2026-02-23T12:00:00Z",
        itemCount: 2,
        totalPrice: 18.66,
      },
    ];
    mockFetchOrderList.mockResolvedValue({ data: orders });

    const { getByText } = render(<OrderHistoryList />);

    await waitFor(() => {
      expect(getByText("$18.66")).toBeTruthy();
    });
  });

  it("filters orders by date range when startDate and endDate are provided", async () => {
    const orders: OrderHistoryItem[] = [
      {
        id: "ord-in-range",
        date: "02/15/2026",
        createdAt: "2026-02-15T12:00:00Z",
        itemCount: 1,
        totalPrice: 12.0,
      },
      {
        id: "ord-out-of-range",
        date: "01/10/2026",
        createdAt: "2026-01-10T12:00:00Z",
        itemCount: 1,
        totalPrice: 8.0,
      },
    ];
    mockFetchOrderList.mockResolvedValue({ data: orders });

    const { getByText, queryByText } = render(
      <OrderHistoryList startDate="2026-02-01" endDate="2026-02-28" />
    );

    await waitFor(() => {
      expect(getByText("$12.00")).toBeTruthy();
    });
    expect(queryByText("$8.00")).toBeNull();
  });
});
