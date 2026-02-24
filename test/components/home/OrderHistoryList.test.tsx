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

const mockFetchOrderList = jest.fn();
jest.mock("../../../src/Providers/OrderDetailCacheProvider", () => ({
  useOrderDetailCache: () => mockUseOrderDetailCache(),
}));

describe("OrderHistoryList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      fetchOrderList: mockFetchOrderList,
    });
  });

  it("shows loading state while fetching (no sign-in or empty message yet)", () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });
    mockFetchOrderList.mockReturnValue(new Promise<never>(() => undefined));

    const { queryByText } = render(<OrderHistoryList />);
    expect(queryByText("No orders yet.")).toBeNull();
  });

  it("shows error message when fetch fails", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });
    mockFetchOrderList.mockResolvedValue({ error: "Network error" });

    const { getByText } = render(<OrderHistoryList />);
    await waitFor(() => {
      expect(getByText("Network error")).toBeTruthy();
    });
  });

  it("shows no orders yet when list is empty", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });
    mockFetchOrderList.mockResolvedValue({ data: [] });

    const { getByText } = render(<OrderHistoryList />);
    await waitFor(() => {
      expect(getByText("No orders yet.")).toBeTruthy();
    });
  });

  it("renders order cards and navigates when card is pressed", async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    });
    mockFetchOrderList.mockResolvedValue({
      data: [
        {
          id: "order-1",
          date: "02/23/2026",
          totalPrice: 18.66,
          itemCount: 2,
        },
      ],
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
