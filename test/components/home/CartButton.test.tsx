import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";
import CartButton from "../../../src/components/home/CartButton";
import { useCart } from "../../../src/Providers/CartProvider";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("../../../src/Providers/CartProvider", () => ({
  useCart: jest.fn(),
}));

describe("CartButton", () => {
  it("renders cart count and navigates to cart on press", () => {
    const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
    mockUseCart.mockReturnValue({
      items: [],
      addItem: jest.fn(),
      incrementItem: jest.fn(),
      decrementItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      itemCount: 3,
      subtotal: 0,
    });

    const { getByText } = render(<CartButton />);
    fireEvent.press(getByText("Cart (3)"));

    expect(router.push).toHaveBeenCalledWith("/cart");
  });
});
