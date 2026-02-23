import { Text, TouchableOpacity } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import CartProvider, { useCart } from "../../src/Providers/CartProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

function CartHarness() {
  const { items, addItem, incrementItem, decrementItem, removeItem, clearCart, itemCount, subtotal } =
    useCart();
  const key = items[0]?.key ?? "";

  return (
    <>
      <Text testID="count">{String(itemCount)}</Text>
      <Text testID="subtotal">{String(subtotal)}</Text>
      <Text testID="items">{String(items.length)}</Text>
      <TouchableOpacity
        onPress={() =>
          addItem({
            restaurantId: "r1",
            restaurantName: "Taco Town",
            itemId: 9,
            name: "Taco",
            price: 6,
            imageUrl: null,
          })
        }
      >
        <Text>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => incrementItem(key)}>
        <Text>Increment</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => decrementItem(key)}>
        <Text>Decrement</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeItem(key)}>
        <Text>Remove</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearCart}>
        <Text>Clear</Text>
      </TouchableOpacity>
    </>
  );
}

describe("CartProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(jest.fn());
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it("adds and updates cart totals through cart actions", async () => {
    const { getByText, getByTestId } = render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    fireEvent.press(getByText("Add"));
    await waitFor(() => {
      expect(getByTestId("count").props.children).toBe("1");
      expect(getByTestId("subtotal").props.children).toBe("6");
    });

    fireEvent.press(getByText("Increment"));
    await waitFor(() => {
      expect(getByTestId("count").props.children).toBe("2");
      expect(getByTestId("subtotal").props.children).toBe("12");
    });

    fireEvent.press(getByText("Decrement"));
    await waitFor(() => {
      expect(getByTestId("count").props.children).toBe("1");
    });

    fireEvent.press(getByText("Remove"));
    await waitFor(() => {
      expect(getByTestId("items").props.children).toBe("0");
      expect(getByTestId("subtotal").props.children).toBe("0");
    });

    fireEvent.press(getByText("Add"));
    fireEvent.press(getByText("Clear"));
    await waitFor(() => {
      expect(getByTestId("items").props.children).toBe("0");
    });

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it("increments quantity when adding an item that already exists", async () => {
    const { getByText, getByTestId } = render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    fireEvent.press(getByText("Add"));
    fireEvent.press(getByText("Add"));

    await waitFor(() => {
      expect(getByTestId("items").props.children).toBe("1");
      expect(getByTestId("count").props.children).toBe("2");
    });
  });

  it("hydrates cart from stored JSON array", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        {
          key: "r1:9",
          restaurantId: "r1",
          restaurantName: "Taco Town",
          itemId: 9,
          name: "Taco",
          price: 6,
          imageUrl: null,
          quantity: 2,
        },
      ])
    );

    const { getByTestId } = render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(getByTestId("items").props.children).toBe("1");
      expect(getByTestId("count").props.children).toBe("2");
      expect(getByTestId("subtotal").props.children).toBe("12");
    });
  });

  it("warns when stored cart JSON cannot be parsed", async () => {
    const warnSpy = jest.spyOn(console, "warn");
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("{not-json}");

    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        "Failed to load cart from storage:",
        expect.any(SyntaxError)
      );
    });
  });

  it("warns when persisting cart fails", async () => {
    const warnSpy = jest.spyOn(console, "warn");
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error("persist failed"));

    const { getByText } = render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.press(getByText("Add"));

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        "Failed to persist cart:",
        expect.any(Error)
      );
    });
  });

  it("throws when useCart is used outside provider", () => {
    const Broken = () => {
      useCart();
      return null;
    };

    expect(() => render(<Broken />)).toThrow("useCart must be used within CartProvider");
  });
});
