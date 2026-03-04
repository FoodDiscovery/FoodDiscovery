import { fireEvent, render } from "@testing-library/react-native";
import OwnerOrderReceiptScreen from "../../../src/app/(owner)/order/[orderId]";

const mockReplace = jest.fn();
const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

function makeQuery(resolveValue: unknown, useSingle = false) {
  const last = useSingle ? "single" : "maybeSingle";
  const chain = {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        [last]: jest.fn().mockResolvedValue(resolveValue),
      }),
    }),
  };
  return chain;
}

function makeOrdersQuery(resolveValue: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue(resolveValue),
          }),
        }),
      }),
    }),
  };
}

const completedOrder = {
  restaurant_id: "rest-1",
  order_number: 42,
  created_at: "2026-02-15T18:30:00.000Z",
  customer_id: "cust-1",
  profiles: { full_name: "Jane Doe" },
};

const orderItemsData = [
  {
    quantity: 2,
    price_at_time_of_purchase: 10.5,
    menu_items: [{ name: "Margherita" }],
  },
  {
    quantity: 1,
    price_at_time_of_purchase: 8,
    menu_items: [{ name: "Garlic Bread" }],
  },
];

describe("OwnerOrderReceiptScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ orderId: "order-123" });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "owner-1" } },
      error: null,
    });
  });

  function setupSuccessMocks(overrides?: {
    order?: Record<string, unknown>;
    location?: { address_text: string | null };
  }) {
    const order = overrides?.order ?? completedOrder;
    const locationData = overrides?.location ?? { address_text: "123 Main St" };

    let fromCallCount = 0;
    mockFrom.mockImplementation((table: string) => {
      fromCallCount++;
      if (table === "profiles") {
        return makeQuery({ data: { role: "owner" }, error: null }, true);
      }
      if (table === "restaurants") {
        if (fromCallCount <= 3) {
          return makeQuery({ data: { id: "rest-1" }, error: null });
        }
        return makeQuery({ data: { name: "Pizza Palace" }, error: null }, true);
      }
      if (table === "orders") {
        return makeOrdersQuery({ data: order, error: null });
      }
      if (table === "locations") {
        return makeQuery({ data: locationData, error: null });
      }
      if (table === "order_items") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: orderItemsData, error: null }),
          }),
        };
      }
      return makeQuery({ data: null, error: null });
    });
  }

  it("shows loading state initially", () => {
    mockGetUser.mockImplementation(
      () => new Promise(() => undefined)
    );
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return makeQuery({ data: { role: "owner" }, error: null }, true);
      }
      return makeQuery({ data: null, error: null });
    });

    const { getByText, unmount } = render(<OwnerOrderReceiptScreen />);
    expect(getByText("Loading receipt...")).toBeTruthy();
    unmount();
  });

  it("shows Not signed in when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "Not signed in" } });
    mockFrom.mockReturnValue(makeQuery({ data: null, error: null }));

    const { findByText } = render(<OwnerOrderReceiptScreen />);
    expect(await findByText("Not signed in.")).toBeTruthy();
  });

  it("shows Access denied when user is not owner", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return makeQuery({ data: { role: "customer" }, error: null }, true);
      }
      return makeQuery({ data: null, error: null });
    });

    const { findByText } = render(<OwnerOrderReceiptScreen />);
    expect(await findByText("Access denied.")).toBeTruthy();
  });

  it("shows Restaurant not found when owner has no restaurant", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return makeQuery({ data: { role: "owner" }, error: null }, true);
      }
      if (table === "restaurants") {
        return makeQuery({ data: null, error: null });
      }
      return makeQuery({ data: null, error: null });
    });

    const { findByText } = render(<OwnerOrderReceiptScreen />);
    expect(await findByText("Restaurant not found.")).toBeTruthy();
  });

  it("shows Order not found when order does not exist", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return makeQuery({ data: { role: "owner" }, error: null }, true);
      }
      if (table === "restaurants") {
        return makeQuery({ data: { id: "rest-1" }, error: null });
      }
      if (table === "orders") {
        return makeOrdersQuery({ data: null, error: { message: "Order not found" } });
      }
      return makeQuery({ data: null, error: null });
    });

    const { findByText } = render(<OwnerOrderReceiptScreen />);
    expect(await findByText(/Order not found/)).toBeTruthy();
  });

  it("renders order receipt with line items and totals", async () => {
    setupSuccessMocks();

    const { getByText, findByText } = render(<OwnerOrderReceiptScreen />);
    expect(await findByText("Order Receipt")).toBeTruthy();

    expect(getByText("Pizza Palace")).toBeTruthy();
    expect(getByText("Order #42")).toBeTruthy();
    expect(getByText("Customer: Jane D.")).toBeTruthy();
    expect(getByText("123 Main St")).toBeTruthy();
    expect(getByText("2 × Margherita")).toBeTruthy();
    expect(getByText("$21.00")).toBeTruthy();
    expect(getByText("1 × Garlic Bread")).toBeTruthy();
    expect(getByText("$8.00")).toBeTruthy();
    expect(getByText("Subtotal: $29.00")).toBeTruthy();
    expect(getByText(/Tax: \$/)).toBeTruthy();
    expect(getByText("Total Paid")).toBeTruthy();
  });

  it("navigates to analytics when Go back is pressed", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: {} });
    mockFrom.mockReturnValue(makeQuery({ data: null, error: null }));

    const { getByText, findByText } = render(<OwnerOrderReceiptScreen />);
    expect(await findByText("Not signed in.")).toBeTruthy();

    fireEvent.press(getByText("Go back"));
    expect(mockReplace).toHaveBeenCalledWith("/(owner)/analytics");
  });

  it("shows Guest when customer has no profile name", async () => {
    setupSuccessMocks({
      order: { ...completedOrder, profiles: { full_name: null } },
    });

    const { findByText } = render(<OwnerOrderReceiptScreen />);
    expect(await findByText("Customer: Guest")).toBeTruthy();
  });

  it("shows order id prefix when order_number is null", async () => {
    setupSuccessMocks({
      order: { ...completedOrder, order_number: null },
    });

    const { findByText } = render(<OwnerOrderReceiptScreen />);
    expect(await findByText(/Order order-12/)).toBeTruthy();
  });

  it("renders without address when location has no address", async () => {
    setupSuccessMocks({
      location: { address_text: null },
    });

    const { queryByText, findByText } = render(<OwnerOrderReceiptScreen />);
    expect(await findByText("Order Receipt")).toBeTruthy();
    expect(queryByText("123 Main St")).toBeNull();
  });
});
