import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert, Linking } from "react-native";
import OrderDetailScreen from "../../../src/app/(home)/order/[orderId]";
import { useAuth } from "../../../src/Providers/AuthProvider";
import * as ratings from "../../../src/lib/ratings";

const mockReplace = jest.fn();
const mockGetCached = jest.fn();
const mockSetCached = jest.fn();
const mockFetchOrderDetail = jest.fn();
const mockOpenURL = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock("../../../src/Providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../src/Providers/OrderDetailCacheProvider", () => ({
  useOrderDetailCache: () => ({
    getCached: mockGetCached,
    setCached: mockSetCached,
    fetchOrderDetail: mockFetchOrderDetail,
  }),
}));

jest.mock("../../../src/lib/ratings", () => ({
  fetchUserRestaurantReviews: jest.fn(),
  saveUserRestaurantReview: jest.fn(),
}));


const mockUseAuth = jest.mocked(useAuth);
const mockFetchUserRestaurantReviews = jest.mocked(ratings.fetchUserRestaurantReviews);
const mockSaveUserRestaurantReview = jest.mocked(ratings.saveUserRestaurantReview);

const mockAlert = jest.fn();

const orderDetailData = {
  restaurantId: "rest-1",
  restaurantName: "Pizza Palace",
  address: "123 Main St",
  lineItems: [
    { quantity: 2, price_at_time_of_purchase: 10.5, name: "Margherita" },
    { quantity: 1, price_at_time_of_purchase: 8, name: "Garlic Bread" },
  ],
};

describe("OrderDetailScreen (home)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, "openURL").mockImplementation(mockOpenURL);
    jest.spyOn(Alert, "alert").mockImplementation(mockAlert);
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
    } as ReturnType<typeof useAuth>);
    mockUseLocalSearchParams.mockReturnValue({ orderId: "order-123" });
    mockGetCached.mockReturnValue(null);
    mockFetchOrderDetail.mockResolvedValue({ data: orderDetailData });
    mockFetchUserRestaurantReviews.mockResolvedValue(new Map());
  });

  it("shows sign-in message when user is not signed in", () => {
    mockUseAuth.mockReturnValue({ session: null });
    const { getByText } = render(<OrderDetailScreen />);
    expect(getByText("Sign in to view order details.")).toBeTruthy();
  });

  it("shows loading state before order data is available", () => {
    mockFetchOrderDetail.mockImplementation(() => new Promise(() => undefined));
    const { queryByText } = render(<OrderDetailScreen />);
    expect(queryByText("Order details")).toBeNull();
    expect(queryByText("Pizza Palace")).toBeNull();
  });

  it("renders order details after fetch", async () => {
    const { getByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(getByText("Order details")).toBeTruthy();
    });
    expect(getByText("Pizza Palace")).toBeTruthy();
    expect(getByText("123 Main St")).toBeTruthy();
    expect(getByText("2 × Margherita")).toBeTruthy();
    expect(getByText("$21.00")).toBeTruthy();
    expect(getByText("1 × Garlic Bread")).toBeTruthy();
    expect(getByText("$8.00")).toBeTruthy();
    expect(getByText("Items: 3")).toBeTruthy();
    expect(getByText("Subtotal: $29.00")).toBeTruthy();
    expect(getByText(/Tax: \$/)).toBeTruthy();
    expect(getByText(/Total: \$/)).toBeTruthy();
    expect(getByText("Leave review")).toBeTruthy();
  });

  it("uses cached data when available", async () => {
    mockGetCached.mockReturnValue(orderDetailData);
    mockFetchOrderDetail.mockClear();

    const { getByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(getByText("Pizza Palace")).toBeTruthy();
    });
    expect(mockFetchOrderDetail).not.toHaveBeenCalled();
  });

  it("shows error and Go back when fetch fails", async () => {
    mockFetchOrderDetail.mockResolvedValue({ error: "Order not found." });

    const { getByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(getByText("Order not found.")).toBeTruthy();
    });
    const goBack = getByText("Go back");
    expect(goBack).toBeTruthy();
    fireEvent.press(goBack);
    expect(mockReplace).toHaveBeenCalledWith("/(home)/order-history");
  });

  it("opens maps when address is pressed", async () => {
    const { getByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(getByText("123 Main St")).toBeTruthy();
    });

    fireEvent.press(getByText("123 Main St"));
    expect(mockOpenURL).toHaveBeenCalled();
  });

  it("opens review modal when Leave review is pressed", async () => {
    const { getByRole } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(mockFetchOrderDetail).toHaveBeenCalled();
    });

    const reviewBtn = getByRole("button", { name: "Leave review" });
    fireEvent.press(reviewBtn);

    await waitFor(() => {
      expect(mockFetchUserRestaurantReviews).toHaveBeenCalledWith("user-1", ["rest-1"]);
    });
  });

  it("shows Edit review when user has existing review", async () => {
    mockFetchUserRestaurantReviews.mockResolvedValue(
      new Map([["rest-1", { restaurantId: "rest-1", rating: 4, reviewDescription: "Great!" }]])
    );

    const { getByRole } = render(<OrderDetailScreen />);

    await waitFor(() => {
      const editBtn = getByRole("button", { name: "Edit review" });
      expect(editBtn).toBeTruthy();
    });
  });

  it("submits review and shows success", async () => {
    mockSaveUserRestaurantReview.mockResolvedValue(undefined);

    const { getByRole, getByPlaceholderText, getByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(mockFetchOrderDetail).toHaveBeenCalled();
    });

    fireEvent.press(getByRole("button", { name: "Leave review" }));

    await waitFor(() => {
      expect(mockFetchUserRestaurantReviews).toHaveBeenCalled();
    });

    fireEvent.press(getByRole("button", { name: "Rate 4 stars" }));

    const input = getByPlaceholderText("Share your experience...");
    fireEvent.changeText(input, "Great pizza!");

    fireEvent.press(getByText("Submit"));

    await waitFor(() => {
      expect(mockSaveUserRestaurantReview).toHaveBeenCalledWith(
        "user-1",
        "rest-1",
        4,
        "Great pizza!"
      );
    });
    expect(mockAlert).toHaveBeenCalledWith("Saved", "Your review has been saved.");
  });

  it("shows rating required alert when submitting without rating", async () => {
    const { getByRole, getByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(mockFetchOrderDetail).toHaveBeenCalled();
    });

    fireEvent.press(getByRole("button", { name: "Leave review" }));

    await waitFor(() => {
      expect(mockFetchUserRestaurantReviews).toHaveBeenCalled();
    });

    fireEvent.press(getByText("Submit"));

    expect(mockAlert).toHaveBeenCalledWith("Rating required", "Please choose a star rating before submitting.");
    expect(mockSaveUserRestaurantReview).not.toHaveBeenCalled();
  });

  it("closes modal when Cancel is pressed", async () => {
    const { getByRole, getByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(mockFetchOrderDetail).toHaveBeenCalled();
    });

    fireEvent.press(getByRole("button", { name: "Leave review" }));

    await waitFor(() => {
      expect(getByText("Cancel")).toBeTruthy();
    });

    fireEvent.press(getByText("Cancel"));
    expect(mockSaveUserRestaurantReview).not.toHaveBeenCalled();
  });

  it("does not fetch when orderId is missing", () => {
    mockUseLocalSearchParams.mockReturnValue({ orderId: undefined });
    mockFetchOrderDetail.mockClear();

    render(<OrderDetailScreen />);

    expect(mockFetchOrderDetail).not.toHaveBeenCalled();
  });

  it("shows Save failed alert when saveUserRestaurantReview throws", async () => {
    mockSaveUserRestaurantReview.mockRejectedValue(new Error("Network error"));

    const { getByRole, getByPlaceholderText, getByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(mockFetchOrderDetail).toHaveBeenCalled();
    });

    fireEvent.press(getByRole("button", { name: "Leave review" }));
    await waitFor(() => {
      expect(mockFetchUserRestaurantReviews).toHaveBeenCalled();
    });

    fireEvent.press(getByRole("button", { name: "Rate 4 stars" }));
    fireEvent.changeText(getByPlaceholderText("Share your experience..."), "Bad service");
    fireEvent.press(getByText("Submit"));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("Save failed", "Network error");
    });
  });

  it("renders order without address and hides address link", async () => {
    mockFetchOrderDetail.mockResolvedValue({
      data: { ...orderDetailData, address: null },
    });

    const { getByText, queryByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(getByText("Pizza Palace")).toBeTruthy();
    });
    expect(queryByText("123 Main St")).toBeNull();
  });

  it("handles fetchUserRestaurantReviews error and resets review state", async () => {
    mockFetchUserRestaurantReviews.mockRejectedValue(new Error("Network error"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());

    const { getByRole, getByText, getByPlaceholderText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(getByText("Order details")).toBeTruthy();
    });
    fireEvent.press(getByRole("button", { name: "Leave review" }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load review for order detail",
        expect.any(Error)
      );
      expect(getByText("Leave a review")).toBeTruthy();
    });
    expect(getByText("Tap to rate")).toBeTruthy();
    expect(getByPlaceholderText("Share your experience...").props.value).toBe("");

    consoleErrorSpy.mockRestore();
  });

  it("shows Unable to review when restaurantId is missing and submit attempted", async () => {
    mockFetchOrderDetail.mockResolvedValue({
      data: { ...orderDetailData, restaurantId: undefined },
    });

    const { getByRole, getByText } = render(<OrderDetailScreen />);

    await waitFor(() => {
      expect(mockFetchOrderDetail).toHaveBeenCalled();
    });

    fireEvent.press(getByRole("button", { name: "Leave review" }));

    await waitFor(() => {
      expect(getByRole("button", { name: "Rate 4 stars" })).toBeTruthy();
    });

    fireEvent.press(getByRole("button", { name: "Rate 4 stars" }));
    fireEvent.press(getByText("Submit"));

    expect(mockAlert).toHaveBeenCalledWith(
      "Unable to review",
      "Missing restaurant information for this order."
    );
  });
});
