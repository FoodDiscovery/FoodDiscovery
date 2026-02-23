import { render, waitFor } from "@testing-library/react-native";
import CheckoutScreen from "../../../src/app/(home)/checkout";

const mockFrom = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@stripe/stripe-react-native", () => ({
  useStripe: () => ({
    initPaymentSheet: jest.fn(),
    presentPaymentSheet: jest.fn(),
  }),
}));

jest.mock("../../../src/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

jest.mock("../../../src/Providers/AuthProvider", () => ({
  useAuth: () => ({
    session: { user: { id: "user-1", email: "test@test.com" } },
  }),
}));

let mockCartItems: {
  key: string;
  restaurantId: string;
  restaurantName: string;
  itemId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}[] = [];

const mockClearCart = jest.fn();

jest.mock("../../../src/Providers/CartProvider", () => ({
  useCart: () => ({
    items: mockCartItems,
    subtotal: mockCartItems.reduce((s, i) => s + i.price * i.quantity, 0),
    itemCount: mockCartItems.reduce((s, i) => s + i.quantity, 0),
    clearCart: mockClearCart,
  }),
}));

describe("CheckoutScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartItems = [];
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
  });

  it("shows empty cart message when there are no items", () => {
    const { getByText } = render(<CheckoutScreen />);

    expect(getByText("Your cart is empty")).toBeTruthy();
    expect(getByText("Add items from a restaurant first.")).toBeTruthy();
  });

  it("renders line items grouped by restaurant", async () => {
    mockCartItems = [
      {
        key: "r1:1",
        restaurantId: "r1",
        restaurantName: "Pizza Palace",
        itemId: 1,
        name: "Margherita",
        price: 12.0,
        imageUrl: null,
        quantity: 2,
      },
    ];

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText("Pizza Palace")).toBeTruthy();
    });
    expect(getByText("2 × Margherita")).toBeTruthy();
    expect(getByText("$24.00")).toBeTruthy();
  });

  it("renders subtotal, tax, and total", async () => {
    mockCartItems = [
      {
        key: "r1:1",
        restaurantId: "r1",
        restaurantName: "Pizza Palace",
        itemId: 1,
        name: "Margherita",
        price: 10.0,
        imageUrl: null,
        quantity: 1,
      },
    ];

    const { getByText } = render(<CheckoutScreen />);

    const tax = (10.0 * 0.0975).toFixed(2);
    const total = (10.0 + 10.0 * 0.0975).toFixed(2);

    await waitFor(() => {
      expect(getByText(`Subtotal: $10.00`)).toBeTruthy();
    });
    expect(getByText(`Tax: $${tax}`)).toBeTruthy();
    expect(getByText(`Total: $${total}`)).toBeTruthy();
    expect(getByText(`Pay $${total}`)).toBeTruthy();
  });

  it("shows the Checkout title", () => {
    const { getByText } = render(<CheckoutScreen />);
    expect(getByText("Checkout")).toBeTruthy();
  });
});
