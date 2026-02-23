import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";
import CartBar from "../../../src/components/menu/CartBar";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

describe("CartBar", () => {
  it("renders singular item label with formatted subtotal", () => {
    const { getByText } = render(
      React.createElement(CartBar, {
        itemCount: 1,
        subtotal: 5,
      })
    );

    expect(getByText("Cart: 1 item ($5.00)")).toBeTruthy();
  });

  it("renders plural item label and navigates to cart", () => {
    const { getByText } = render(
      React.createElement(CartBar, {
        itemCount: 3,
        subtotal: 12.345,
      })
    );

    expect(getByText("Cart: 3 items ($12.35)")).toBeTruthy();
    fireEvent.press(getByText("View Cart"));
    expect(router.push).toHaveBeenCalledWith("/cart");
  });
});
