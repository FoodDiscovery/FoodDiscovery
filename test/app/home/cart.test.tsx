import { fireEvent, render } from "@testing-library/react-native";
import CartScreen from "../../../src/app/(home)/cart";
import { router } from "expo-router";

const mockClearCart = jest.fn();
const mockIncrementItem = jest.fn();
const mockDecrementItem = jest.fn();
const mockRemoveItem = jest.fn();

let mockCartState = {
  items: [] as {
    key: string;
    name: string;
    restaurantName: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
  }[],
  incrementItem: mockIncrementItem,
  decrementItem: mockDecrementItem,
  removeItem: mockRemoveItem,
  clearCart: mockClearCart,
  itemCount: 0,
  subtotal: 0,
};

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../../../src/Providers/CartProvider", () => ({
  useCart: () => mockCartState,
}));

describe("CartScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartState = {
      items: [],
      incrementItem: mockIncrementItem,
      decrementItem: mockDecrementItem,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      itemCount: 0,
      subtotal: 0,
    };
  });

  it("shows empty cart message when cart has no items", () => {
    const { getByText } = render(<CartScreen />);

    expect(getByText("Your cart is empty")).toBeTruthy();
    expect(getByText("Add menu items from a restaurant page.")).toBeTruthy();
  });

  it("renders cart items with name, restaurant, and price", () => {
    mockCartState.items = [
      {
        key: "r1:1",
        name: "Margherita Pizza",
        restaurantName: "Pizza Palace",
        price: 12.99,
        quantity: 2,
        imageUrl: null,
      },
    ];
    mockCartState.itemCount = 2;
    mockCartState.subtotal = 25.98;

    const { getByText } = render(<CartScreen />);

    expect(getByText("Margherita Pizza")).toBeTruthy();
    expect(getByText("Pizza Palace")).toBeTruthy();
    expect(getByText("$12.99 each")).toBeTruthy();
    expect(getByText("Qty 2")).toBeTruthy();
  });

  it("shows summary with item count and subtotal", () => {
    mockCartState.items = [
      {
        key: "r1:1",
        name: "Burger",
        restaurantName: "Grill House",
        price: 9.5,
        quantity: 3,
        imageUrl: null,
      },
    ];
    mockCartState.itemCount = 3;
    mockCartState.subtotal = 28.5;

    const { getByText } = render(<CartScreen />);

    expect(getByText("3")).toBeTruthy();
    expect(getByText("$28.50")).toBeTruthy();
  });

  it("calls incrementItem when + is pressed", () => {
    mockCartState.items = [
      {
        key: "r1:1",
        name: "Taco",
        restaurantName: "Taco Bell",
        price: 3.0,
        quantity: 1,
        imageUrl: null,
      },
    ];
    mockCartState.itemCount = 1;
    mockCartState.subtotal = 3.0;

    const { getByText } = render(<CartScreen />);
    fireEvent.press(getByText("+"));

    expect(mockIncrementItem).toHaveBeenCalledWith("r1:1");
  });

  it("calls decrementItem when − is pressed", () => {
    mockCartState.items = [
      {
        key: "r1:1",
        name: "Taco",
        restaurantName: "Taco Bell",
        price: 3.0,
        quantity: 2,
        imageUrl: null,
      },
    ];
    mockCartState.itemCount = 2;
    mockCartState.subtotal = 6.0;

    const { getByText } = render(<CartScreen />);
    fireEvent.press(getByText("−"));

    expect(mockDecrementItem).toHaveBeenCalledWith("r1:1");
  });

  it("calls removeItem when Remove is pressed", () => {
    mockCartState.items = [
      {
        key: "r1:1",
        name: "Taco",
        restaurantName: "Taco Bell",
        price: 3.0,
        quantity: 1,
        imageUrl: null,
      },
    ];
    mockCartState.itemCount = 1;
    mockCartState.subtotal = 3.0;

    const { getByText } = render(<CartScreen />);
    fireEvent.press(getByText("Remove"));

    expect(mockRemoveItem).toHaveBeenCalledWith("r1:1");
  });

  it("calls clearCart when Clear cart is pressed", () => {
    mockCartState.items = [
      {
        key: "r1:1",
        name: "Taco",
        restaurantName: "Taco Bell",
        price: 3.0,
        quantity: 1,
        imageUrl: null,
      },
    ];
    mockCartState.itemCount = 1;
    mockCartState.subtotal = 3.0;

    const { getByText } = render(<CartScreen />);
    fireEvent.press(getByText("Clear cart"));

    expect(mockClearCart).toHaveBeenCalledTimes(1);
  });

  it("navigates to checkout when Check out is pressed", () => {
    mockCartState.items = [
      {
        key: "r1:1",
        name: "Taco",
        restaurantName: "Taco Bell",
        price: 3.0,
        quantity: 1,
        imageUrl: null,
      },
    ];
    mockCartState.itemCount = 1;
    mockCartState.subtotal = 3.0;

    const { getByText } = render(<CartScreen />);
    fireEvent.press(getByText("Check out"));

    expect(router.push).toHaveBeenCalledWith("/checkout");
  });

  it("navigates back when back button is pressed", () => {
    const { getByText } = render(<CartScreen />);
    fireEvent.press(getByText("←"));

    expect(router.back).toHaveBeenCalled();
  });
});
